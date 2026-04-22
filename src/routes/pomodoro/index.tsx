import { createFileRoute } from "@tanstack/react-router";

import {
	Logs,
	Settings,
	Stats,
	Tasks,
	Timer,
} from "#/modules/pomodoro/components";

import { DEFAULT_SESSION, TYPES } from "#/modules/pomodoro/constant";
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
				<p className="text-lg font-bold">POMODORO</p>

				<button type="button" onClick={() => setShowSettings((v) => !v)}>
					{showSettings ? "CLOSE" : "SETTINGS"}
				</button>
			</div>

			<div className="flex flex-col justify-center items-center gap-2">
				<Timer hours={hours} minutes={minutes} seconds={seconds} mode={mode} />

				{/* Controls */}
				<div className="flex gap-2">
					<button
						className="btn btn-outline btn-sm"
						type="button"
						onClick={handleRestart}
					>
						Reset
					</button>

					<button type="button" onClick={isRunning ? pause : resume}>
						{isRunning ? "Puase" : "Start"}
					</button>

					<button type="button" onClick={handleSkip}>
						Skip
					</button>
				</div>

				<div style={{ display: "flex", gap: "0.4rem" }}>
					{TYPES.map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => switchMode(m)}
							style={{
								cursor: "pointer",
								padding: "0.25rem 0.65rem",
								fontSize: "0.58rem",
								letterSpacing: "0.18em",
								fontFamily: "inherit",
							}}
						>
							{m === "WORK" ? "FOCUS" : m === "SHORT" ? "SHORT" : "LONG"}
						</button>
					))}
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

			{showSettings && (
				<Settings
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
			)}
		</div>
	);
}

function RouteComponent() {
	return <PomodoroApp />;
}
