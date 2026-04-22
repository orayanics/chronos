// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PSessionState, PSettings } from "#/modules/pomodoro/schema";
import { PomodoroApp } from "./index";

const { usePomodoroMock } = vi.hoisted(() => ({
	usePomodoroMock: vi.fn(),
}));

vi.mock("#/modules/pomodoro/usePomodoro", () => ({
	default: usePomodoroMock,
}));

function makeSettings(): PSettings {
	return {
		workMinutes: 25,
		shortBreakMinutes: 5,
		longBreakMinutes: 15,
		cyclesBeforeLongBreak: 4,
		autoStartBreaks: false,
		autoStartPomodoros: false,
	};
}

function makeSession(
	overrides: Partial<PSessionState> = {},
): PSessionState {
	return {
		startedAt: Date.UTC(2026, 3, 20, 8, 0, 0),
		pomodorosCompleted: 0,
		shortBreaksCompleted: 0,
		longBreaksCompleted: 0,
		currentCycleCount: 0,
		logs: [],
		tasks: [],
		...overrides,
	};
}

function makeHookState(session: PSessionState) {
	return {
		settings: makeSettings(),
		session,
		time: { hours: 0, minutes: 25, seconds: 0 },
		mode: "WORK" as const,
		isRunning: false,
		showSettings: false,
		setSession: vi.fn(),
		setSettings: vi.fn(),
		setShowSettings: vi.fn(),
		handleRestart: vi.fn(),
		handleSkip: vi.fn(),
		addTask: vi.fn(),
		toggleTask: vi.fn(),
		deleteTask: vi.fn(),
		updateTask: vi.fn(),
		resume: vi.fn(),
		pause: vi.fn(),
		restart: vi.fn(),
		switchMode: vi.fn(),
	};
}

describe("PomodoroApp share flow", () => {
	beforeEach(() => {
		usePomodoroMock.mockReset();
	});

	afterEach(() => {
		cleanup();
	});

	it("disables Share Session when there is no completed focus log", () => {
		usePomodoroMock.mockReturnValue(makeHookState(makeSession()));

		render(<PomodoroApp />);

		expect(screen.getByRole("button", { name: "Share Session" })).toHaveProperty(
			"disabled",
			true,
		);
	});

	it("opens the share preview for a completed session", () => {
		usePomodoroMock.mockReturnValue(
			makeHookState(
				makeSession({
					pomodorosCompleted: 2,
					logs: [
						{
							id: "work-1",
							type: "WORK",
							duration: 25,
							completedAt: Date.UTC(2026, 3, 20, 8, 25, 0),
						},
					],
				}),
			),
		);

		render(<PomodoroApp />);

		fireEvent.click(screen.getByRole("button", { name: "Share Session" }));

		expect(screen.getByText("Save PNG")).toBeTruthy();
		expect(screen.getByText("Session Focus")).toBeTruthy();
	});
});
