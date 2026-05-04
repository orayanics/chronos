"use client";

import { LABEL_MAP, TYPES } from "../constants/pomodoro";
import { useCountdown } from "../hooks/useCountdown";
import type { InitialState, POMODORO_TYPE } from "../types/tpomodoro";
import styles from "./Countdown.module.css";
import Stats from "./Stats";

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

function formatTwoDigits(value: number) {
  return String(value).padStart(2, "0");
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
  const {
    displaySeconds,
    isRunning,
    handleModeSelect,
    handleNewSession,
    handleReset,
    handleStart,
    handleStop,
  } = useCountdown({
    state,
    completeCurrentMode,
    createSession,
    updateType,
  });
  const time = fromTotalSeconds(
    displaySeconds ??
      toTotalSeconds(getModeDuration(state.mode, state.settings)),
  );
  const activeModeClass = {
    WORK: styles["btn-work"],
    SHORT_BREAK: styles["btn-short"],
    LONG_BREAK: styles["btn-long"],
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto flex justify-center gap-2">
        {TYPES.map((type) => (
          <button
            type="button"
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

      <div className="flex flex-col justify-center items-center">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formatTwoDigits(time.hours)}
            readOnly
            className={styles["input-time"]}
          />

          <p>:</p>
          <input
            type="text"
            value={formatTwoDigits(time.minutes)}
            readOnly
            className={styles["input-time"]}
          />
          <p>:</p>

          <input
            type="text"
            value={formatTwoDigits(time.seconds)}
            readOnly
            className={styles["input-time"]}
          />
        </div>
      </div>

      <Stats
        total={state.session.logs}
        pomodoros={state.session.pomodoro_count}
        shortBreaks={state.session.short_count}
        longBreaks={state.session.long_count}
      />

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={isRunning}
          className={`${styles["btn-default"]} ${styles["btn-running"]}`}
        >
          Start
        </button>
        <button
          type="button"
          onClick={handleStop}
          disabled={!isRunning}
          className={`${styles["btn-default"]} ${styles["btn-paused"]}`}
        >
          Pause
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={styles["btn-default"]}
        >
          Reset{" "}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onShareSession}
          disabled={!canShareSession}
          className={styles["btn-default"]}
        >
          Share Session
        </button>
        <button
          type="button"
          onClick={handleNewSession}
          className={styles["btn-default"]}
        >
          New session
        </button>
      </div>
    </div>
  );
}
