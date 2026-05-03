import type { Log } from "../types/tpomodoro";

export function formatSessionDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

export function formatTime(logs: Log[]): string {
  const totalMinutes = getTotalFocusMinutes(logs);
  const totalRounded = Math.round(totalMinutes * 100) / 100;
  const hours = Math.floor(totalRounded / 60);
  const minutes = totalRounded % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export function getSessionDateToken(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function hasCompletedWorkLog(logs: Log[]): boolean {
  return logs.some((log) => log.type === "WORK");
}

export function getTotalFocusMinutes(logs: Log[]): number {
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
