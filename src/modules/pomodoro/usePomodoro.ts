import { useServerFn } from "@tanstack/react-start";
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
	PSessionState,
	PSettings,
} from "#/modules/pomodoro/schema";
import {
	duration,
	expiry,
	getClockTimeFromMinutes,
	isAutoStart,
	normalizeSessionState,
} from "#/modules/pomodoro/util";
import {
	addPomodoroTask,
	clearPomodoroSession,
	completePomodoroInterval,
	deletePomodoroTask,
	togglePomodoroTask,
	updatePomodoroMode,
	updatePomodoroSettings,
	updatePomodoroTask,
} from "#/server/pomodoro";

function getNextModeFromCycle(
	currentMode: POMODORO_TYPE,
	cycleCount: number,
	cyclesBeforeLongBreak: number,
): POMODORO_TYPE {
	if (currentMode !== "WORK") return "WORK";
	return cycleCount >= cyclesBeforeLongBreak ? "LONG" : "SHORT";
}

export default function usePomodoro(initialState?: PPomodoroInitialState) {
	const initialStateRef = useRef<PPomodoroInitialState>(
		initialState ?? {
			settings: DEFAULT_SETTINGS,
			session: createDefaultSession(),
			mode: "WORK",
		},
	);

	const persistSettings = useServerFn(updatePomodoroSettings);
	const persistMode = useServerFn(updatePomodoroMode);
	const persistCompletedInterval = useServerFn(completePomodoroInterval);
	const persistAddedTask = useServerFn(addPomodoroTask);
	const persistToggledTask = useServerFn(togglePomodoroTask);
	const persistUpdatedTask = useServerFn(updatePomodoroTask);
	const persistDeletedTask = useServerFn(deletePomodoroTask);
	const persistClearedSession = useServerFn(clearPomodoroSession);

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
	const [isTimerReady, setIsTimerReady] = useState(false);

	const modeRef = useRef(mode);
	const settingsRef = useRef(settings);
	const sessionRef = useRef(session);
	modeRef.current = mode;
	settingsRef.current = settings;
	sessionRef.current = session;

	const restartRef = useRef<(d: Date, autoStart?: boolean) => void>(() => {});

	const { hours, seconds, minutes, isRunning, pause, resume, restart } =
		useTimer({
			expiryTimestamp: expiry(duration(mode, settings)),
			autoStart: false,
			onExpire() {
				void (async () => {
					const currentMode = modeRef.current;
					const currentSettings = settingsRef.current;
					const result = await persistCompletedInterval({
						data: {
							mode: currentMode,
							durationMinutes: duration(currentMode, currentSettings),
						},
					});

					setSession(
						normalizeSessionState(result.session, result.session.startedAt),
					);
					setMode(result.mode);

					const nextExpiry = expiry(duration(result.mode, currentSettings));
					const autoStart = isAutoStart(result.mode, currentSettings);

					setTimeout(() => restartRef.current(nextExpiry, autoStart), 0);
				})();
			},
		});

	restartRef.current = restart;

	const restoredTimerRef = useRef(false);

	useEffect(() => {
		if (restoredTimerRef.current) return;

		restoredTimerRef.current = true;
		restart(expiry(duration(mode, settings)), false);
		setIsTimerReady(true);
	}, [mode, restart, settings]);

	const fallbackTime = getClockTimeFromMinutes(duration(mode, settings));

	const handleRestart = () => {
		restart(expiry(duration(modeRef.current, settingsRef.current)), false);
	};

	const handleSkip = async () => {
		pause();
		const currentMode = modeRef.current;
		const currentSession = sessionRef.current;
		const currentSettings = settingsRef.current;
		const cycleForTransition =
			currentMode === "WORK"
				? currentSession.currentCycleCount + 1
				: currentSession.currentCycleCount;
		const nextMode = getNextModeFromCycle(
			currentMode,
			cycleForTransition,
			currentSettings.cyclesBeforeLongBreak,
		);
		const result = await persistMode({
			data: {
				mode: nextMode,
			},
		});

		setMode(result.mode);
		restart(expiry(duration(result.mode, currentSettings)), false);
	};

	const switchMode = async (nextMode: POMODORO_TYPE) => {
		pause();
		const currentSettings = settingsRef.current;
		const result = await persistMode({
			data: {
				mode: nextMode,
			},
		});

		setMode(result.mode);
		restart(expiry(duration(result.mode, currentSettings)), false);
	};

	const addTask = async (text: string) => {
		const nextSession = await persistAddedTask({
			data: {
				text,
			},
		});

		setSession(normalizeSessionState(nextSession, nextSession.startedAt));
	};

	const toggleTask = async (taskId: number) => {
		const nextSession = await persistToggledTask({
			data: {
				taskId,
			},
		});

		setSession(normalizeSessionState(nextSession, nextSession.startedAt));
	};

	const deleteTask = async (taskId: number) => {
		const nextSession = await persistDeletedTask({
			data: {
				taskId,
			},
		});

		setSession(normalizeSessionState(nextSession, nextSession.startedAt));
	};

	const updateTask = async (taskId: number, text: string) => {
		const nextSession = await persistUpdatedTask({
			data: {
				taskId,
				text,
			},
		});

		setSession(normalizeSessionState(nextSession, nextSession.startedAt));
	};

	const saveSettings = async (nextSettings: PSettings) => {
		setSettings(nextSettings);
		restart(expiry(duration(modeRef.current, nextSettings)), false);

		const persistedSettings = await persistSettings({
			data: nextSettings,
		});

		setSettings(persistedSettings);
	};

	const clearSession = async () => {
		pause();
		const result = await persistClearedSession();
		const currentSettings = settingsRef.current;

		setSession(normalizeSessionState(result.session, result.session.startedAt));
		setMode(result.mode);
		restart(expiry(duration(result.mode, currentSettings)), false);
	};

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
		updateSettings: saveSettings,
		clearSession,
		setShowSettings,
		resume,
		pause,
	};
}
