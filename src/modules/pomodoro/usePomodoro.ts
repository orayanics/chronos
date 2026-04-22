import { useEffect, useRef, useState } from "react";
import pkg from "react-timer-hook";

const { useTimer } = pkg;

import {
	createDefaultSession,
	DEFAULT_SETTINGS,
} from "#/modules/pomodoro/constant";
import type {
	POMODORO_TYPE,
	PPomodoroInitialState,
	PSessionLog,
	PSessionState,
	PSettings,
} from "#/modules/pomodoro/schema";
import {
	duration,
	expiry,
	getClockTimeFromMinutes,
	isAutoStart,
	loadState,
	normalizeSessionState,
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

export default function usePomodoro(initialState?: PPomodoroInitialState) {
	// const logSession = useServerFn(logPSession);
	const initialStateRef = useRef<PPomodoroInitialState>(
		initialState ?? {
			settings: DEFAULT_SETTINGS,
			session: createDefaultSession(),
			mode: "WORK",
		},
	);
	const [settings, setSettings] = useState<PSettings>(
		initialStateRef.current.settings,
	);
	const [session, setSession] = useState<PSessionState>(() =>
		normalizeSessionState(
			initialStateRef.current.session,
			initialStateRef.current.session.startedAt,
		),
	);
	const [mode, setMode] = useState<POMODORO_TYPE>(initialStateRef.current.mode);
	const [showSettings, setShowSettings] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);
	const [isTimerReady, setIsTimerReady] = useState(false);

	useEffect(() => {
		const resolvedInitialState = initialStateRef.current;
		const nextSettings = loadState("settings", resolvedInitialState.settings);
		const nextSession = normalizeSessionState(
			loadState<Partial<PSessionState> | null>(
				"session",
				resolvedInitialState.session,
			),
			resolvedInitialState.session.startedAt,
		);
		const nextMode = loadState<POMODORO_TYPE>(
			"mode",
			resolvedInitialState.mode,
		);

		setSettings(nextSettings);
		setSession(nextSession);
		setMode(nextMode);
		setHasMounted(true);
	}, []);

	// Persist whenever state changes
	useEffect(() => {
		if (!hasMounted) return;
		saveState("settings", settings);
	}, [hasMounted, settings]);
	useEffect(() => {
		if (!hasMounted) return;
		saveState("session", session);
	}, [hasMounted, session]);
	useEffect(() => {
		if (!hasMounted) return;
		saveState("mode", mode);
	}, [hasMounted, mode]);

	// Refs to avoid stale closures inside onExpire
	const modeRef = useRef(mode);
	const settingsRef = useRef(settings);
	const sessionRef = useRef(session);
	modeRef.current = mode;
	settingsRef.current = settings;
	sessionRef.current = session;

	/** Stable ref so onExpire can call restart without capturing a stale copy. */
	const restartRef = useRef<(d: Date, autoStart?: boolean) => void>(() => {});

	const { hours, seconds, minutes, isRunning, pause, resume, restart } =
		useTimer({
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
						logs: Array.isArray(prev.logs)
							? [...prev.logs, logEntry]
							: [logEntry],
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

	const restoredTimerRef = useRef(false);

	useEffect(() => {
		if (!hasMounted || restoredTimerRef.current) return;

		restoredTimerRef.current = true;
		restart(expiry(duration(mode, settings)), false);
		setIsTimerReady(true);
	}, [hasMounted, mode, restart, settings]);

	const fallbackTime = getClockTimeFromMinutes(duration(mode, settings));

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
				...(Array.isArray(prev.tasks) ? prev.tasks : []),
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
			tasks: Array.isArray(prev.tasks)
				? prev.tasks.map((t) =>
						t.id === id ? { ...t, completed: !t.completed } : t,
					)
				: [],
		}));

	const deleteTask = (id: string) =>
		setSession((prev) => ({
			...prev,
			tasks: Array.isArray(prev.tasks)
				? prev.tasks.filter((t) => t.id !== id)
				: [],
		}));

	const updateTask = (id: string, text: string) =>
		setSession((prev) => ({
			...prev,
			tasks: Array.isArray(prev.tasks)
				? prev.tasks.map((t) => (t.id === id ? { ...t, text } : t))
				: [],
		}));

	return {
		mode,
		settings,
		session,
		showSettings,
		time: isTimerReady ? { hours, minutes, seconds } : fallbackTime,
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
