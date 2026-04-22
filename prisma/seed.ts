import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({
	url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

const SETTINGS_ID = 1;
const SESSION_STATE_ID = 1;

async function main() {
	console.log("Seeding pomodoro defaults...");

	await prisma.settings.upsert({
		where: { id: SETTINGS_ID },
		update: {},
		create: {
			id: SETTINGS_ID,
			workMinutes: 25,
			shortBreakMinutes: 5,
			longBreakMinutes: 15,
			cyclesBeforeLongBreak: 4,
			autoStartBreaks: false,
			autoStartPomodoros: false,
		},
	});

	await prisma.sessionState.upsert({
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

	console.log("Pomodoro defaults are ready.");
}

main()
	.catch((error) => {
		console.error("Error seeding database:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
