import { useEffect, useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import { DEFAULT_SESSION, DEFAULT_SETTINGS } from "#/modules/pomodoro/constant";
import type {
	POMODORO_TYPE,
	PSessionLog,
	PSessionState,
	PSettings,
} from "#/modules/pomodoro/schema";
import {
	duration,
	expiry,
	isAutoStart,
	loadState,
	saveState,
} from "#/modules/pomodoro/util";

function getNextModeFromCycle(
	currentMode: POMODORO_TYPE,
	cycleCount: number,
	cyclesBeforeLongBreak: number,
): POMODORO_TYPE {
	if (currentMode !== "WORK") return "WORK";
	return cycleCount >= cyclesBeforeLongBreak ? "LONG" : "SHORT";
}

function getNextCycleCount(
	currentMode: POMODORO_TYPE,
	currentCycleCount: number,
): number {
	if (currentMode === "WORK") return currentCycleCount + 1;
	if (currentMode === "LONG") return 0;
	return currentCycleCount;
}

export default function usePomodoro() {
	// const logSession = useServerFn(logPSession);
	const [settings, setSettings] = useState<PSettings>(() =>
		loadState("settings", DEFAULT_SETTINGS),
	);
	const [session, setSession] = useState<PSessionState>(() =>
		loadState("session", DEFAULT_SESSION),
	);
	const [mode, setMode] = useState<POMODORO_TYPE>(() =>
		loadState<POMODORO_TYPE>("mode", "WORK"),
	);
	const [showSettings, setShowSettings] = useState(false);

	// Persist whenever state changes
	useEffect(() => {
		saveState("settings", settings);
	}, [settings]);
	useEffect(() => {
		saveState("session", session);
	}, [session]);
	useEffect(() => {
		saveState("mode", mode);
	}, [mode]);

	// Refs to avoid stale closures inside onExpire
	const modeRef = useRef(mode);
	const settingsRef = useRef(settings);
	const sessionRef = useRef(session);
	modeRef.current = mode;
	settingsRef.current = settings;
	sessionRef.current = session;

	/** Stable ref so onExpire can call restart without capturing a stale copy. */
	const restartRef = useRef<(d: Date, autoStart?: boolean) => void>(() => {});

	const { seconds, minutes, isRunning, pause, resume, restart } = useTimer({
		expiryTimestamp: expiry(duration(mode, settings)),
		autoStart: false,
		onExpire() {
			const currentMode = modeRef.current;
			const s = settingsRef.current;
			const currentSession = sessionRef.current;

			// Save: completed interval
			const durationMinutes = duration(currentMode, s);
			const logEntry: PSessionLog = {
				id: crypto.randomUUID(),
				type: currentMode,
				duration: durationMinutes,
				completedAt: Date.now(),
			};

			// Increment on work completion; reset to 0 after a long break.
			const nextCycleCount = getNextCycleCount(
				currentMode,
				currentSession.currentCycleCount,
			);

			setSession((prev) => {
				const updated: PSessionState = {
					...prev,
					pomodorosCompleted:
						currentMode === "WORK"
							? prev.pomodorosCompleted + 1
							: prev.pomodorosCompleted,
					shortBreaksCompleted:
						currentMode === "SHORT"
							? prev.shortBreaksCompleted + 1
							: prev.shortBreaksCompleted,
					longBreaksCompleted:
						currentMode === "LONG"
							? prev.longBreaksCompleted + 1
							: prev.longBreaksCompleted,
					currentCycleCount: nextCycleCount,
					logs: [...prev.logs, logEntry],
				};
				return updated;
			});

			const nextMode = getNextModeFromCycle(
				currentMode,
				nextCycleCount,
				s.cyclesBeforeLongBreak,
			);

			setMode(nextMode);
			const nextExpiry = expiry(duration(nextMode, s));

			const autoStart = isAutoStart(nextMode, s);

			// react-timer-hook calls this.pause() on the Timer instance immediately
			// after onExpire() returns, killing any interval restart() started
			// synchronously. Defer past that pause() with setTimeout(0).
			setTimeout(() => restartRef.current(nextExpiry, autoStart), 0);
			// TODO: Sync to server
		},
	});

	// Keep restartRef current after each render
	restartRef.current = restart;

	const handleRestart = () => {
		const expiryT = expiry(duration(mode, settings));
		restart(expiryT, false);
	};

	const handleSkip = () => {
		pause();
		const cycleForTransition =
			mode === "WORK"
				? session.currentCycleCount + 1
				: session.currentCycleCount;
		const nextMode = getNextModeFromCycle(
			mode,
			cycleForTransition,
			settings.cyclesBeforeLongBreak,
		);
		setMode(nextMode);
		const expiryT = expiry(duration(nextMode, settings));
		restart(expiryT, false);
	};

	const switchMode = (m: POMODORO_TYPE) => {
		pause();
		setMode(m);
		const expiryT = expiry(duration(m, settings));
		restart(expiryT, false);
	};

	const addTask = (text: string) =>
		setSession((prev) => ({
			...prev,
			tasks: [
				...prev.tasks,
				{
					id: crypto.randomUUID(),
					text,
					completed: false,
					createdAt: Date.now(),
				},
			],
		}));

	const toggleTask = (id: string) =>
		setSession((prev) => ({
			...prev,
			tasks: prev.tasks.map((t) =>
				t.id === id ? { ...t, completed: !t.completed } : t,
			),
		}));

	const deleteTask = (id: string) =>
		setSession((prev) => ({
			...prev,
			tasks: prev.tasks.filter((t) => t.id !== id),
		}));

	const updateTask = (id: string, text: string) =>
		setSession((prev) => ({
			...prev,
			tasks: prev.tasks.map((t) => (t.id === id ? { ...t, text } : t)),
		}));

	return {
		mode,
		settings,
		session,
		showSettings,
		time: { minutes, seconds },
		isRunning,
		switchMode,
		handleRestart,
		handleSkip,
		addTask,
		toggleTask,
		deleteTask,
		updateTask,
		setSettings,
		setShowSettings,
		resume,
		pause,
		setSession,
		restart,
	};
}
