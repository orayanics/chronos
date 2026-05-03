"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import { LABEL_FRIENDLY_MAP, LABEL_MAP, TYPES } from "../constants/pomodoro";
import type { InitialState, POMODORO_TYPE } from "../types/tpomodoro";
import styles from "./Countdown.module.css";

type Status = "running" | "stopped" | "finished";
type TimeParts = {
  hours: number;
  minutes: number;
  seconds: number;
};

type CountdownProps = {
  canShareSession: boolean;
  onShareSession: () => void;
  state: InitialState;
  completeCurrentMode: () => void;
  createSession: () => Promise<void>;
  updateType: (type: POMODORO_TYPE) => void;
};

function fromTotalSeconds(totalSeconds: number): TimeParts {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
}

function toTotalSeconds({ hours, minutes, seconds }: TimeParts) {
  return hours * 3600 + minutes * 60 + seconds;
}

function getModeDuration(
  mode: POMODORO_TYPE,
  minutes: InitialState["settings"],
) {
  return fromTotalSeconds(minutes[mode] * 60);
}

export default function Countdown({
  canShareSession,
  onShareSession,
  state,
  completeCurrentMode,
  createSession,
  updateType,
}: CountdownProps) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingSecondsRef = useRef<number | null>(null);
  const shouldAutoStartNextRef = useRef(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("stopped");

  function clearTimer() {
    if (!timerRef.current) return;

    clearInterval(timerRef.current);
    timerRef.current = null;
  }

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
    [completeCurrentMode, state.mode, state.settings],
  );

  function handleStart() {
    startTimer(
      remainingSeconds ??
        toTotalSeconds(getModeDuration(state.mode, state.settings)),
    );
  }

  function handleStop() {
    clearTimer();
    shouldAutoStartNextRef.current = false;
    setStatus("stopped");
  }

  function handleReset() {
    clearTimer();
    shouldAutoStartNextRef.current = false;
    remainingSecondsRef.current = null;
    setRemainingSeconds(null);
    setStatus("stopped");
  }

  function handleModeSelect(type: POMODORO_TYPE) {
    if (status === "running") return;

    updateType(type);
    shouldAutoStartNextRef.current = false;
    remainingSecondsRef.current = null;
    setRemainingSeconds(null);
    setStatus("stopped");
  }

  async function handleNewSession() {
    clearTimer();
    shouldAutoStartNextRef.current = false;
    remainingSecondsRef.current = null;
    setRemainingSeconds(null);
    setStatus("stopped");
    await createSession();
  }

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!shouldAutoStartNextRef.current || status !== "finished") return;

    shouldAutoStartNextRef.current = false;

    const timer = window.setTimeout(() => {
      startTimer(toTotalSeconds(getModeDuration(state.mode, state.settings)));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [startTimer, state.mode, state.settings, status]);

  const isRunning = status === "running";
  const time = fromTotalSeconds(
    remainingSeconds ??
      toTotalSeconds(getModeDuration(state.mode, state.settings)),
  );
  const activeModeClass = {
    WORK: styles["btn-work"],
    SHORT_BREAK: styles["btn-short"],
    LONG_BREAK: styles["btn-long"],
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleModeSelect(type)}
            disabled={isRunning}
            className={`${styles.btn} ${activeModeClass[type]} ${
              state.mode === type ? styles["btn-active"] : ""
            }`}
          >
            {LABEL_MAP[type]}
          </button>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium">{LABEL_FRIENDLY_MAP[state.mode]}</p>
        <div className="space-x-2">
          <input
            type="number"
            value={time.hours}
            readOnly
            className={styles["input-time"]}
          />
          <span>:</span>
          <input
            type="number"
            value={time.minutes}
            readOnly
            className={styles["input-time"]}
          />
          <span>:</span>
          <input
            type="number"
            value={time.seconds}
            readOnly
            className={styles["input-time"]}
          />
        </div>
      </div>

      <div className="text-sm">
        <p>Session #{state.session.id}</p>
        <p>
          Focus: {state.session.pomodoro_count} | Short:{" "}
          {state.session.short_count} | Long: {state.session.long_count}
        </p>
      </div>

      <div className="space-x-2">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className={`${styles["btn-default"]} ${styles["btn-running"]}`}
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className={`${styles["btn-default"]} ${styles["btn-paused"]}`}
        >
          Pause
        </button>
        <button onClick={handleReset} className={styles["btn-default"]}>
          Reset
        </button>
        <button
          onClick={onShareSession}
          disabled={!canShareSession}
          className={styles["btn-default"]}
        >
          Share Session
        </button>
        <button onClick={handleNewSession} className={styles["btn-default"]}>
          New session
        </button>
      </div>
    </div>
  );
}
