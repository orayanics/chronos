import { createFileRoute } from "@tanstack/react-router";

import {
	Logs,
	Settings,
	Stats,
	Tasks,
	Timer,
} from "#/modules/pomodoro/components";

import { DEFAULT_SESSION, LABEL_MAP, TYPES } from "#/modules/pomodoro/constant";
import usePomodoro from "#/modules/pomodoro/usePomodoro";
import { duration, expiry, saveState } from "#/modules/pomodoro/util";

export const Route = createFileRoute("/pomodoro/")({
	component: RouteComponent,
});

function PomodoroApp() {
	const {
		settings,
		session,
		time,
		mode,
		isRunning,
		showSettings,
		setSession,
		setSettings,
		setShowSettings,
		handleRestart,
		handleSkip,
		addTask,
		toggleTask,
		deleteTask,
		updateTask,
		resume,
		pause,
		restart,
		switchMode,
	} = usePomodoro();
	const { hours, minutes, seconds } = time;
	return (
		<div className="max-w-md md:max-w-4xl w-full min-h-screen mx-auto p-4">
			<div className="flex justify-between items-center">
				<p className="text-lg font-bold">CHRONOS</p>

				<button type="button" onClick={() => setShowSettings((v) => !v)}>
					{showSettings ? "CLOSE" : "SETTINGS"}
				</button>
			</div>

			<div className="flex flex-col justify-center items-center gap-2">
				<Timer hours={hours} minutes={minutes} seconds={seconds} mode={mode} />

				<div className="flex gap-2">
					<button
						className={`cursor-pointer px-3 py-1 rounded-lg text-sm bg-primary text-secondary shadow-sm shadow-primary/40 hover:shadow-primary/60 transition-shadow`}
						type="button"
						onClick={handleRestart}
					>
						Reset
					</button>

					<button
						type="button"
						onClick={isRunning ? pause : resume}
						className={`cursor-pointer px-3 py-1 rounded-lg text-sm shadow-sm
							${
								isRunning
									? "bg-pinkish text-white shadow-rose-900 hover:inset-shadow-sm hover:inset-shadow-rose-900/60"
									: "bg-sage text-white shadow-emerald-900 hover:inset-shadow-sm hover:inset-shadow-emerald-900/60"
							}`}
					>
						{isRunning ? "Pause" : "Start"}
					</button>

					<button
						className={`cursor-pointer px-3 py-1 rounded-lg text-sm bg-primary text-secondary shadow-sm shadow-primary/40 hover:shadow-primary/60 transition-shadow`}
						type="button"
						onClick={handleSkip}
					>
						Skip
					</button>
				</div>

				<div className="space-y-2">
					<p className="text-center text-xs text-primary/60">MODE</p>
					<div className="space-x-2">
						{TYPES.map((m) => (
							<button
								key={m}
								type="button"
								onClick={() => switchMode(m)}
								className={`shadow-sm px-2 py-1 text-sm rounded-lg transition-colors cursor-pointer
								${m === "WORK" && "shadow-pinkish/40 bg-pinkish/20 border-pinkish text-pinkish hover:inset-shadow-sm hover:inset-shadow-pinkish/40"}
								${m === "SHORT" && "shadow-gold/40 bg-gold/20 border-gold text-gold hover:inset-shadow-sm hover:inset-shadow-gold/40"}
								${m === "LONG" && "shadow-sage/40 bg-sage/20 border-sage text-sage hover:inset-shadow-sm hover:inset-shadow-sage/40"}`}
							>
								{LABEL_MAP[m]}
							</button>
						))}
					</div>
				</div>

				<Stats
					pomodoros={session.pomodorosCompleted}
					shortBreaks={session.shortBreaksCompleted}
					longBreaks={session.longBreaksCompleted}
					total={session.logs}
				/>
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem",
					padding: "1.25rem",
					overflowY: "auto",
				}}
			>
				<Tasks
					tasks={session.tasks}
					onAdd={addTask}
					onToggle={toggleTask}
					onDelete={deleteTask}
					onUpdate={updateTask}
				/>
				<Logs logs={session.logs} />
			</div>

			<Settings
				isOpen={showSettings}
				onClose={() => setShowSettings(false)}
				settings={settings}
				onChange={(s) => {
					setSettings(s);
					// TODO: Decide final behavior for UX
					// Reset timer when settings change
					const expiryT = expiry(duration(mode, s));
					restart(expiryT, false);
				}}
				onClearSession={() => {
					setSession(DEFAULT_SESSION);
					saveState("session", DEFAULT_SESSION);
				}}
			/>
		</div>
	);
}

function RouteComponent() {
	return <PomodoroApp />;
}
