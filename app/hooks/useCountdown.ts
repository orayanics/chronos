"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { InitialState, POMODORO_TYPE } from "../types/tpomodoro";

type Status = "running" | "stopped" | "finished";

type UseCountdownParams = {
	state: InitialState;
	completeCurrentMode: () => void;
	createSession: () => Promise<void>;
	updateType: (type: POMODORO_TYPE) => void;
};

function toTotalSeconds(
	mode: POMODORO_TYPE,
	settings: InitialState["settings"],
) {
	return settings[mode] * 60;
}

export function useCountdown({
	state,
	completeCurrentMode,
	createSession,
	updateType,
}: UseCountdownParams) {
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const remainingSecondsRef = useRef<number | null>(null);
	const shouldAutoStartNextRef = useRef(false);
	const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
	const [status, setStatus] = useState<Status>("stopped");

	const clearTimer = useCallback(() => {
		if (!timerRef.current) return;

		clearInterval(timerRef.current);
		timerRef.current = null;
	}, []);

	const startTimer = useCallback(
		(nextRemainingSeconds: number) => {
			if (timerRef.current || nextRemainingSeconds <= 0) return;

			remainingSecondsRef.current = nextRemainingSeconds;
			setRemainingSeconds(nextRemainingSeconds);
			setStatus("running");

			timerRef.current = setInterval(() => {
				const currentTotalSeconds =
					remainingSecondsRef.current ?? nextRemainingSeconds;

				if (currentTotalSeconds <= 1) {
					clearTimer();
					remainingSecondsRef.current = null;
					setRemainingSeconds(null);
					setStatus("finished");
					shouldAutoStartNextRef.current =
						state.mode === "WORK"
							? state.settings.AUTO_START_BREAK
							: state.settings.AUTO_START_WORK;
					completeCurrentMode();
					return;
				}

				const nextValue = currentTotalSeconds - 1;
				remainingSecondsRef.current = nextValue;
				setRemainingSeconds(nextValue);
			}, 1000);
		},
		[clearTimer, completeCurrentMode, state.mode, state.settings],
	);

	const handleStart = useCallback(() => {
		startTimer(remainingSeconds ?? toTotalSeconds(state.mode, state.settings));
	}, [remainingSeconds, startTimer, state.mode, state.settings]);

	const handleStop = useCallback(() => {
		clearTimer();
		shouldAutoStartNextRef.current = false;
		setStatus("stopped");
	}, [clearTimer]);

	const handleReset = useCallback(() => {
		clearTimer();
		shouldAutoStartNextRef.current = false;
		remainingSecondsRef.current = null;
		setRemainingSeconds(null);
		setStatus("stopped");
	}, [clearTimer]);

	const handleModeSelect = useCallback(
		(type: POMODORO_TYPE) => {
			if (status === "running") return;

			updateType(type);
			shouldAutoStartNextRef.current = false;
			remainingSecondsRef.current = null;
			setRemainingSeconds(null);
			setStatus("stopped");
		},
		[status, updateType],
	);

	const handleNewSession = useCallback(async () => {
		clearTimer();
		shouldAutoStartNextRef.current = false;
		remainingSecondsRef.current = null;
		setRemainingSeconds(null);
		setStatus("stopped");
		await createSession();
	}, [clearTimer, createSession]);

	useEffect(() => clearTimer, [clearTimer]);

	useEffect(() => {
		if (!shouldAutoStartNextRef.current || status !== "finished") return;

		shouldAutoStartNextRef.current = false;

		const timer = window.setTimeout(() => {
			startTimer(toTotalSeconds(state.mode, state.settings));
		}, 0);

		return () => window.clearTimeout(timer);
	}, [startTimer, state.mode, state.settings, status]);

	const isRunning = status === "running";
	const displaySeconds =
		remainingSeconds ?? toTotalSeconds(state.mode, state.settings);

	return {
		displaySeconds,
		isRunning,
		handleModeSelect,
		handleNewSession,
		handleReset,
		handleStart,
		handleStop,
	};
}
