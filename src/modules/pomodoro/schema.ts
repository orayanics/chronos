export type POMODORO_TYPE = "WORK" | "SHORT" | "LONG";

export interface PSessionLog {
	id: number;
	type: POMODORO_TYPE;
	duration: number; // in exact integer, no rounded & double
	completedAt: number;
}

export interface PTask {
	id: number;
	text: string;
	completed: boolean;
}

export interface PSettings {
	workMinutes: number;
	shortBreakMinutes: number;
	longBreakMinutes: number;
	cyclesBeforeLongBreak: number;
	autoStartBreaks: boolean;
	autoStartPomodoros: boolean;
}

export interface PSessionState {
	startedAt: number;
	pomodorosCompleted: number;
	shortBreaksCompleted: number;
	longBreaksCompleted: number;
	currentCycleCount: number;
	logs: PSessionLog[];
	tasks: PTask[];
}

export interface PPomodoroInitialState {
	settings: PSettings;
	session: PSessionState;
	mode: POMODORO_TYPE;
}
