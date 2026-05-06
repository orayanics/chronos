"use client";

import { LABEL_FRIENDLY_MAP, LABEL_MAP, TYPES } from "../constants/pomodoro";
import { useCountdown } from "../hooks/useCountdown";
import type { InitialState, POMODORO_TYPE } from "../types/tpomodoro";
import styles from "./Countdown.module.css";
import TopoMap from "./TopoMap";

import {
  AiFillPlayCircle,
  AiFillPauseCircle,
  AiOutlineReload,
} from "react-icons/ai";

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
  const totalDurationSeconds = toTotalSeconds(
    getModeDuration(state.mode, state.settings),
  );
  const remainingSeconds = displaySeconds ?? totalDurationSeconds;
  const time = fromTotalSeconds(remainingSeconds);
  const progress = Math.min(
    1,
    Math.max(0, 1 - remainingSeconds / totalDurationSeconds),
  );
  const activeModeClass = {
    WORK: "btn-work",
    SHORT_BREAK: "btn-short",
    LONG_BREAK: "btn-long",
  };
  const actionIcons = {
    START: <AiFillPlayCircle size={32} />,
    PAUSE: <AiFillPauseCircle size={20} />,
    RESET: <AiOutlineReload size={20} />,
  };
  const modeLabelClass = {
    WORK: "text-focus",
    SHORT_BREAK: "text-short-break",
    LONG_BREAK: "text-long-break",
  };
  // const totalDurationSeconds = toTotalSeconds(
  //   getModeDuration(state.mode, state.settings),
  // );

  // const progress = Math.max(totalDurationSeconds - displaySeconds, 0);

  return (
    <div className="h-svh flex flex-col justify-center items-center gap-4">
      <TopoMap mode={state.mode} progress={progress} />
      <div className={`text-message ${modeLabelClass[state.mode]}`}>
        {LABEL_FRIENDLY_MAP[state.mode]}
      </div>
      <div className="mx-auto flex justify-center gap-2">
        {TYPES.map((type) => (
          <button
            type="button"
            key={type}
            onClick={() => handleModeSelect(type)}
            disabled={isRunning}
            className={`btn ${activeModeClass[type]} ${
              state.mode === type ? "btn-active" : "btn-inactive"
            }`}
          >
            {LABEL_MAP[type]}
          </button>
        ))}
      </div>

      <div className="flex flex-col justify-center items-center my-2">
        <div className="flex items-center">
          {time.hours > 0 && (
            <>
              <span className={styles["input-time"]}>
                {formatTwoDigits(time.hours)}
              </span>
              <p className="text-5xl font-bold">:</p>
            </>
          )}

          <span className={styles["input-time"]}>
            {formatTwoDigits(time.minutes)}
          </span>
          <p className="text-5xl font-bold">:</p>

          <span className={styles["input-time"]}>
            {formatTwoDigits(time.seconds)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleStop}
          disabled={!isRunning}
          className="btn-default"
        >
          {actionIcons.PAUSE}
        </button>
        <button
          type="button"
          onClick={handleStart}
          disabled={isRunning}
          className="btn-default btn-running"
        >
          {actionIcons.START}
        </button>
        <button type="button" onClick={handleReset} className="btn-default">
          {actionIcons.RESET}
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={onShareSession}
            disabled={!canShareSession}
            className="btn-default text-xs!"
          >
            <p>Share</p>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleNewSession}
            className="btn-default text-xs!"
          >
            <p>New</p>
          </button>
        </div>
      </div>
    </div>
  );
}
