import type { POMODORO_TYPE, PSessionLog, PSettings } from "./schema";

export function duration(mode: POMODORO_TYPE, s: PSettings): number {
	if (mode === "WORK") return s.workMinutes;
	if (mode === "SHORT") return s.shortBreakMinutes;
	return s.longBreakMinutes;
}

// TODO: Accomodate seconds
// Current behavior: only calculates expiry time in minutes using * 60
// Must implement UI for seconds
export function expiry(minutes: number): Date {
	const d = new Date();
	d.setSeconds(d.getSeconds() + minutes * 60);
	return d;
}

export function pad(n: number) {
	return String(n).padStart(2, "0");
}

export function formatTime(logs: PSessionLog[]): string {
	const totalMinutes = logs
		.filter((log) => log.type === "WORK")
		.reduce((sum, log) => sum + log.duration, 0);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
	if (hours > 0) return `${hours}h`;
	return `${minutes}m`;
}

export function isAutoStart(mode: POMODORO_TYPE, settings: PSettings): boolean {
	const isWork = mode === "WORK";
	const autoStart = isWork
		? settings.autoStartPomodoros
		: settings.autoStartBreaks;
	return autoStart;
}

// localStorage helpers
export const loadState = <T>(key: string, defaultValue: T): T => {
	const stored = localStorage.getItem(key);
	return stored ? JSON.parse(stored) : defaultValue;
};

export const saveState = <T>(key: string, value: T): void => {
	localStorage.setItem(key, JSON.stringify(value));
};
