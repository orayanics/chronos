import type {
  POMODORO_TYPE,
  InitialState,
  SessionState,
  Settings,
} from "../types/tpomodoro";

export const TYPES = ["WORK", "SHORT_BREAK", "LONG_BREAK"] as POMODORO_TYPE[];

export const DEFAULT_SETTINGS: Settings = {
  WORK: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
  CYCLES_BEFORE_LONG_BREAK: 4,
  AUTO_START_BREAK: false,
  AUTO_START_WORK: false,
};

export const LABEL_MAP: Record<POMODORO_TYPE, string> = {
  WORK: "FOCUS",
  SHORT_BREAK: "SHORT",
  LONG_BREAK: "LONG",
};

export const LABEL_FRIENDLY_MAP: Record<POMODORO_TYPE, string> = {
  WORK: "Time to Focus!",
  SHORT_BREAK: "Take a short break",
  LONG_BREAK: "Take a long break",
};

export function createNewSessionState(): SessionState {
  return {
    id: Date.now(),
    startedAt: Date.now(),
    pomodoro_count: 0,
    short_count: 0,
    long_count: 0,
    currentCycleCount: 0,
    logs: [],
    tasks: [],
  };
}

// Default values
export function getDefaultState(): InitialState {
  return {
    settings: DEFAULT_SETTINGS,
    session: createNewSessionState(),
    mode: "WORK",
  };
}

export const DEFAULT_SESSION_STATE: SessionState = getDefaultState().session;
