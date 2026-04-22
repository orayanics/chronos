import type {
	POMODORO_TYPE,
	PSessionLog,
	PSessionState,
	PSettings,
} from "./schema";

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

export function getClockTimeFromMinutes(totalMinutes: number) {
	const totalSeconds = Math.max(0, Math.floor(totalMinutes * 60));

	return {
		hours: Math.floor(totalSeconds / 3600),
		minutes: Math.floor((totalSeconds % 3600) / 60),
		seconds: totalSeconds % 60,
	};
}

export function formatTime(logs: PSessionLog[]): string {
	const totalMinutes = getTotalFocusMinutes(logs);
	const totalRounded = Math.round(totalMinutes * 100) / 100;
	const hours = Math.floor(totalRounded / 60);
	const minutes = totalRounded % 60;
	if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
	if (hours > 0) return `${hours}h`;
	return `${minutes}m`;
}

export function getTotalFocusMinutes(logs: PSessionLog[]): number {
	return logs
		.filter((log) => log.type === "WORK")
		.reduce((sum, log) => {
			const dur =
				typeof log.duration === "string"
					? parseFloat(log.duration)
					: Number(log.duration);
			return sum + (Number.isNaN(dur) ? 0 : dur);
		}, 0);
}

export function hasCompletedWorkLog(logs: PSessionLog[]): boolean {
	return logs.some((log) => log.type === "WORK");
}

export function formatSessionDate(timestamp: number): string {
	return new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(timestamp);
}

export function getSessionDateToken(timestamp: number): string {
	return new Date(timestamp).toISOString().slice(0, 10);
}

export function normalizeSessionState(
	session: Partial<PSessionState> | null | undefined,
	fallbackStartedAt = Date.now(),
): PSessionState {
	const logs = Array.isArray(session?.logs) ? session.logs : [];
	const tasks = Array.isArray(session?.tasks) ? session.tasks : [];
	const firstWorkCompletedAt = logs
		.filter(
			(log): log is PSessionLog =>
				Boolean(log) &&
				log.type === "WORK" &&
				typeof log.completedAt === "number" &&
				Number.isFinite(log.completedAt),
		)
		.reduce<number | null>(
			(earliest, log) =>
				earliest === null
					? log.completedAt
					: Math.min(earliest, log.completedAt),
			null,
		);

	return {
		startedAt:
			typeof session?.startedAt === "number" &&
			Number.isFinite(session.startedAt)
				? session.startedAt
				: (firstWorkCompletedAt ?? fallbackStartedAt),
		pomodorosCompleted:
			typeof session?.pomodorosCompleted === "number"
				? session.pomodorosCompleted
				: 0,
		shortBreaksCompleted:
			typeof session?.shortBreaksCompleted === "number"
				? session.shortBreaksCompleted
				: 0,
		longBreaksCompleted:
			typeof session?.longBreaksCompleted === "number"
				? session.longBreaksCompleted
				: 0,
		currentCycleCount:
			typeof session?.currentCycleCount === "number"
				? session.currentCycleCount
				: 0,
		logs,
		tasks,
	};
}

export function isAutoStart(mode: POMODORO_TYPE, settings: PSettings): boolean {
	const isWork = mode === "WORK";
	const autoStart = isWork
		? settings.autoStartPomodoros
		: settings.autoStartBreaks;
	return autoStart;
}
