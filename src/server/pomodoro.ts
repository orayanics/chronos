import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { DbClient } from "#/db";

import { DEFAULT_SETTINGS } from "#/modules/pomodoro/constant";
import type {
	POMODORO_TYPE,
	PPomodoroInitialState,
	PSessionLog,
	PSettings,
	PTask,
} from "#/modules/pomodoro/schema";

const SETTINGS_ID = 1;
const SESSION_STATE_ID = 1;

const modeSchema = z.enum(["WORK", "SHORT", "LONG"]);

const settingsSchema = z.object({
	workMinutes: z.number().int().min(1),
	shortBreakMinutes: z.number().int().min(1),
	longBreakMinutes: z.number().int().min(1),
	cyclesBeforeLongBreak: z.number().int().min(1),
	autoStartBreaks: z.boolean(),
	autoStartPomodoros: z.boolean(),
});

const taskTextSchema = z.string().trim().min(1).max(200);

type PomodoroDbClient = Pick<
	DbClient,
	"settings" | "sessionState" | "sessionLog" | "task"
>;

function getNextModeFromCycle(
	currentMode: POMODORO_TYPE,
	cycleCount: number,
	cyclesBeforeLongBreak: number,
): POMODORO_TYPE {
	if (currentMode !== "WORK") return "WORK";
	return cycleCount >= cyclesBeforeLongBreak ? "LONG" : "SHORT";
}

function getNextCycleCount(
	currentMode: POMODORO_TYPE,
	currentCycleCount: number,
): number {
	if (currentMode === "WORK") return currentCycleCount + 1;
	if (currentMode === "LONG") return 0;
	return currentCycleCount;
}

function mapSettings(record: {
	workMinutes: number;
	shortBreakMinutes: number;
	longBreakMinutes: number;
	cyclesBeforeLongBreak: number;
	autoStartBreaks: boolean;
	autoStartPomodoros: boolean;
}): PSettings {
	return {
		workMinutes: record.workMinutes,
		shortBreakMinutes: record.shortBreakMinutes,
		longBreakMinutes: record.longBreakMinutes,
		cyclesBeforeLongBreak: record.cyclesBeforeLongBreak,
		autoStartBreaks: record.autoStartBreaks,
		autoStartPomodoros: record.autoStartPomodoros,
	};
}

function mapTask(record: {
	id: number;
	text: string;
	completed: boolean;
}): PTask {
	return {
		id: record.id,
		text: record.text,
		completed: record.completed,
	};
}

function mapLog(record: {
	id: number;
	type: POMODORO_TYPE;
	duration: number;
	completedAt: Date;
}): PSessionLog {
	return {
		id: record.id,
		type: record.type,
		duration: record.duration,
		completedAt: record.completedAt.getTime(),
	};
}

function mapSession(record: {
	startedAt: number;
	currentMode: POMODORO_TYPE;
	pomodorosCompleted: number;
	shortBreaksCompleted: number;
	longBreaksCompleted: number;
	currentCycleCount: number;
	logs: Array<{
		id: number;
		type: POMODORO_TYPE;
		duration: number;
		completedAt: Date;
	}>;
	tasks: Array<{
		id: number;
		text: string;
		completed: boolean;
	}>;
}) {
	return {
		mode: record.currentMode,
		session: {
			startedAt: record.startedAt,
			pomodorosCompleted: record.pomodorosCompleted,
			shortBreaksCompleted: record.shortBreaksCompleted,
			longBreaksCompleted: record.longBreaksCompleted,
			currentCycleCount: record.currentCycleCount,
			logs: record.logs.map(mapLog),
			tasks: record.tasks.map(mapTask),
		},
	};
}

async function ensureSettingsRecord(db: PomodoroDbClient) {
	return db.settings.upsert({
		where: { id: SETTINGS_ID },
		update: {},
		create: {
			id: SETTINGS_ID,
			...DEFAULT_SETTINGS,
		},
	});
}

async function ensureSessionStateRecord(db: PomodoroDbClient) {
	return db.sessionState.upsert({
		where: { id: SESSION_STATE_ID },
		update: {},
		create: {
			id: SESSION_STATE_ID,
			startedAt: Date.now(),
			currentMode: "WORK",
			pomodorosCompleted: 0,
			shortBreaksCompleted: 0,
			longBreaksCompleted: 0,
			currentCycleCount: 0,
		},
	});
}

async function readSessionStateRecord(db: PomodoroDbClient) {
	return db.sessionState.findUniqueOrThrow({
		where: { id: SESSION_STATE_ID },
		include: {
			logs: {
				orderBy: { completedAt: "asc" },
			},
			tasks: {
				orderBy: { id: "asc" },
			},
		},
	});
}

async function getPomodoroState(db: PomodoroDbClient) {
	const settingsRecord = await ensureSettingsRecord(db);
	await ensureSessionStateRecord(db);
	const sessionRecord = await readSessionStateRecord(db);

	const state = mapSession(sessionRecord);
	return {
		settings: mapSettings(settingsRecord),
		session: state.session,
		mode: state.mode,
	} satisfies PPomodoroInitialState;
}

export const getPomodoroInitialState = createServerFn({
	method: "GET",
}).handler(async () => {
	const { prisma } = await import("#/db");
	return getPomodoroState(prisma);
});

export const updatePomodoroSettings = createServerFn({
	method: "POST",
})
	.inputValidator(settingsSchema)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db");
		const record = await prisma.settings.upsert({
			where: { id: SETTINGS_ID },
			update: data,
			create: {
				id: SETTINGS_ID,
				...data,
			},
		});

		return mapSettings(record);
	});

export const updatePomodoroMode = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			mode: modeSchema,
		}),
	)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db");
		const record = await prisma.sessionState.upsert({
			where: { id: SESSION_STATE_ID },
			update: {
				currentMode: data.mode,
			},
			create: {
				id: SESSION_STATE_ID,
				startedAt: Date.now(),
				currentMode: data.mode,
				pomodorosCompleted: 0,
				shortBreaksCompleted: 0,
				longBreaksCompleted: 0,
				currentCycleCount: 0,
			},
		});

		return {
			mode: record.currentMode,
		} as const;
	});

export const completePomodoroInterval = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			mode: modeSchema,
			durationMinutes: z.number().int().min(1),
		}),
	)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db");
		return prisma.$transaction(async (tx) => {
			const settingsRecord = await ensureSettingsRecord(tx);
			const sessionRecord = await ensureSessionStateRecord(tx);
			const nextCycleCount = getNextCycleCount(
				data.mode,
				sessionRecord.currentCycleCount,
			);
			const nextMode = getNextModeFromCycle(
				data.mode,
				nextCycleCount,
				settingsRecord.cyclesBeforeLongBreak,
			);

			await tx.sessionLog.create({
				data: {
					type: data.mode,
					duration: data.durationMinutes,
					completedAt: new Date(),
					sessionStateId: SESSION_STATE_ID,
				},
			});

			await tx.sessionState.update({
				where: { id: SESSION_STATE_ID },
				data: {
					currentMode: nextMode,
					pomodorosCompleted:
						data.mode === "WORK" ? { increment: 1 } : undefined,
					shortBreaksCompleted:
						data.mode === "SHORT" ? { increment: 1 } : undefined,
					longBreaksCompleted:
						data.mode === "LONG" ? { increment: 1 } : undefined,
					currentCycleCount: nextCycleCount,
				},
			});

			const nextState = await getPomodoroState(tx);
			return {
				session: nextState.session,
				mode: nextState.mode,
			} as const;
		});
	});

export const addPomodoroTask = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			text: taskTextSchema,
		}),
	)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db");
		return prisma.$transaction(async (tx) => {
			await ensureSessionStateRecord(tx);
			await tx.task.create({
				data: {
					text: data.text,
					completed: false,
					sessionStateId: SESSION_STATE_ID,
				},
			});

			const state = await getPomodoroState(tx);
			return state.session;
		});
	});

export const togglePomodoroTask = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			taskId: z.number().int().positive(),
		}),
	)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db");
		return prisma.$transaction(async (tx) => {
			const task = await tx.task.findUniqueOrThrow({
				where: { id: data.taskId },
			});

			await tx.task.update({
				where: { id: data.taskId },
				data: {
					completed: !task.completed,
				},
			});

			const state = await getPomodoroState(tx);
			return state.session;
		});
	});

export const updatePomodoroTask = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			taskId: z.number().int().positive(),
			text: taskTextSchema,
		}),
	)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db");
		return prisma.$transaction(async (tx) => {
			await tx.task.update({
				where: { id: data.taskId },
				data: {
					text: data.text,
				},
			});

			const state = await getPomodoroState(tx);
			return state.session;
		});
	});

export const deletePomodoroTask = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			taskId: z.number().int().positive(),
		}),
	)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db");
		return prisma.$transaction(async (tx) => {
			await tx.task.delete({
				where: { id: data.taskId },
			});

			const state = await getPomodoroState(tx);
			return state.session;
		});
	});

export const clearPomodoroSession = createServerFn({
	method: "POST",
}).handler(async () => {
	const { prisma } = await import("#/db");
	return prisma.$transaction(async (tx) => {
		await ensureSessionStateRecord(tx);
		await tx.sessionLog.deleteMany({
			where: { sessionStateId: SESSION_STATE_ID },
		});
		await tx.task.deleteMany({
			where: { sessionStateId: SESSION_STATE_ID },
		});
		await tx.sessionState.update({
			where: { id: SESSION_STATE_ID },
			data: {
				startedAt: Date.now(),
				currentMode: "WORK",
				pomodorosCompleted: 0,
				shortBreaksCompleted: 0,
				longBreaksCompleted: 0,
				currentCycleCount: 0,
			},
		});

		const state = await getPomodoroState(tx);
		return {
			session: state.session,
			mode: state.mode,
		} as const;
	});
});
