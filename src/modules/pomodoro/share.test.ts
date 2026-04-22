import { describe, expect, it, vi } from "vitest";

import { createDefaultSession } from "./constant";
import { getShareSessionData } from "./share";
import type { PSessionState } from "./schema";
import { normalizeSessionState } from "./util";

function makeSession(
	overrides: Partial<PSessionState> = {},
): PSessionState {
	return {
		startedAt: Date.UTC(2026, 3, 20, 8, 0, 0),
		pomodorosCompleted: 3,
		shortBreaksCompleted: 2,
		longBreaksCompleted: 0,
		currentCycleCount: 3,
		logs: [
			{
				id: 1,
				type: "WORK",
				duration: 25,
				completedAt: Date.UTC(2026, 3, 20, 8, 25, 0),
			},
			{
				id: 2,
				type: "WORK",
				duration: 40,
				completedAt: Date.UTC(2026, 3, 20, 9, 15, 0),
			},
		],
		tasks: [],
		...overrides,
	};
}

describe("normalizeSessionState", () => {
	it("backfills startedAt from the earliest completed focus log", () => {
		const session = normalizeSessionState({
			pomodorosCompleted: 2,
			logs: [
				{
					id: 1,
					type: "SHORT",
					duration: 5,
					completedAt: 300,
				},
				{
					id: 2,
					type: "WORK",
					duration: 25,
					completedAt: 200,
				},
				{
					id: 3,
					type: "WORK",
					duration: 25,
					completedAt: 100,
				},
			],
			tasks: [],
		});

		expect(session.startedAt).toBe(100);
	});

	it("falls back to the provided timestamp when there are no completed focus logs", () => {
		const session = normalizeSessionState(
			{
				logs: [],
				tasks: [],
			},
			999,
		);

		expect(session.startedAt).toBe(999);
	});
});

describe("createDefaultSession", () => {
	it("creates a fresh startedAt timestamp for resets", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-04-20T08:00:00.000Z"));
		const firstSession = createDefaultSession();

		vi.setSystemTime(new Date("2026-04-20T09:00:00.000Z"));
		const nextSession = createDefaultSession();

		expect(nextSession.startedAt).toBeGreaterThan(firstSession.startedAt);
		vi.useRealTimers();
	});
});

describe("getShareSessionData", () => {
	it("builds focus time, cycle count, and date from the current session", () => {
		const shareData = getShareSessionData(makeSession());

		expect(shareData).toEqual({
			cycleCount: 3,
			focusLabel: "1h 5m",
			sessionDateLabel: "Apr 20, 2026",
			sessionDateToken: "2026-04-20",
		});
	});

	it("returns null when the session has no completed focus logs", () => {
		const shareData = getShareSessionData(
			makeSession({
				logs: [
					{
						id: 1,
						type: "SHORT",
						duration: 5,
						completedAt: Date.UTC(2026, 3, 20, 8, 30, 0),
					},
				],
				pomodorosCompleted: 0,
			}),
		);

		expect(shareData).toBeNull();
	});
});
