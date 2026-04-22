import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";

import {
	createDefaultSession,
	DEFAULT_SETTINGS,
} from "#/modules/pomodoro/constant";
import type { PPomodoroInitialState } from "#/modules/pomodoro/schema";

// Log Pomodoro Session into DB
export const logPSession = createServerFn({ method: "POST" }).handler(
	async () => {},
);

export const getPomodoroInitialState = createServerFn({
	method: "GET",
}).handler(
	async () =>
		({
			settings: DEFAULT_SETTINGS,
			session: createDefaultSession(),
			mode: "WORK",
		}) satisfies PPomodoroInitialState,
);
