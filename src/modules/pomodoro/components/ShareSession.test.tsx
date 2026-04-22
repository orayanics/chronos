// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PSessionState } from "../schema";
import ShareSession from "./ShareSession";

const { exportElementAsPng } = vi.hoisted(() => ({
	exportElementAsPng: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../share", async () => {
	const actual = await vi.importActual<typeof import("../share")>("../share");
	return {
		...actual,
		exportElementAsPng,
	};
});

function makeSession(
	overrides: Partial<PSessionState> = {},
): PSessionState {
	return {
		startedAt: Date.UTC(2026, 3, 20, 8, 0, 0),
		pomodorosCompleted: 2,
		shortBreaksCompleted: 1,
		longBreaksCompleted: 0,
		currentCycleCount: 2,
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
				duration: 25,
				completedAt: Date.UTC(2026, 3, 20, 9, 0, 0),
			},
		],
		tasks: [],
		...overrides,
	};
}

describe("ShareSession", () => {
	afterEach(() => {
		cleanup();
	});

	it("exports the preview as a png with the expected filename", async () => {
		exportElementAsPng.mockClear();

		render(
			<ShareSession isOpen onClose={vi.fn()} session={makeSession()} />,
		);

		fireEvent.click(screen.getByRole("button", { name: "Save PNG" }));

		expect(exportElementAsPng).toHaveBeenCalledWith(
			expect.any(HTMLDivElement),
			"chronos-session-2026-04-20.png",
		);
	});
});
