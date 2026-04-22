import type { POMODORO_TYPE, PSessionState, PSettings } from "./schema";

export const TYPES = ["WORK", "SHORT", "LONG"] as POMODORO_TYPE[];

export const DEFAULT_SETTINGS: PSettings = {
	workMinutes: 25,
	shortBreakMinutes: 5,
	longBreakMinutes: 15,
	cyclesBeforeLongBreak: 4,
	autoStartBreaks: false,
	autoStartPomodoros: false,
};

export const DEFAULT_SESSION: PSessionState = {
	pomodorosCompleted: 0,
	shortBreaksCompleted: 0,
	longBreaksCompleted: 0,
	currentCycleCount: 0,
	logs: [],
	tasks: [],
};

export const ACCENT: Record<POMODORO_TYPE, string> = {
	WORK: "#e8621a",
	SHORT: "#3daa80",
	LONG: "#4a82c4",
};

export const LABEL_MAP: Record<POMODORO_TYPE, string> = {
	WORK: "FOCUS",
	SHORT: "SHORT BREAK",
	LONG: "LONG BREAK ",
};
