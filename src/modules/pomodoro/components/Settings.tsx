import type { PSettings } from "../schema";

interface SettingsProps {
	settings: PSettings;
	onChange: (settings: PSettings) => void;
	onClearSession: () => void;
	isOpen: boolean;
	onClose: () => void;
}

const Field = ({
	label,
	settingKey,
	settings,
	onChange,
}: {
	label: string;
	settingKey: keyof Pick<
		PSettings,
		| "workMinutes"
		| "shortBreakMinutes"
		| "longBreakMinutes"
		| "cyclesBeforeLongBreak"
	>;
	settings: PSettings;
	onChange: (settings: PSettings) => void;
}) => {
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor="input" className="text-xs" key={settingKey}>
				{label}
			</label>
			<input
				className="shadow border border-primary/20 p-2 rounded-lg"
				type="number"
				min={0}
				value={settings[settingKey]}
				onChange={(e) =>
					// onChange({ ...settings, [settingKey]: Math.max(1, +e.target.value) })
					onChange({ ...settings, [settingKey]: e.target.value })
				}
			/>
		</div>
	);
};

const Toggle = ({
	label,
	settingKey,
	settings,
	onChange,
}: {
	label: string;
	settingKey: keyof PSettings;
	settings: PSettings;
	onChange: (settings: PSettings) => void;
}) => {
	const isToggled = settings[settingKey];

	return (
		<div className="flex flex-col gap-1">
			<p className="text-xs" key={settingKey}>
				{label}
			</p>
			<button
				type="button"
				className={`cursor-pointer shadow rounded-lg border p-2
					transition
					${isToggled ? "bg-primary text-white hover:inset-shadow-secondary/20 hover:inset-shadow-sm " : "border-primary/20 hover:inset-shadow-primary/20 hover:inset-shadow-sm "}`}
				onClick={() =>
					onChange({ ...settings, [settingKey]: !settings[settingKey] })
				}
			>
				{settings[settingKey] ? "ON" : "OFF"}
			</button>
		</div>
	);
};

export default function Settings({
	settings,
	onChange,
	onClearSession,
	isOpen,
	onClose,
}: SettingsProps) {
	return (
		<>
			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 bg-black/30 z-20"
					onClick={onClose}
				/>
			)}

			<div
				className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out transform ${
					isOpen ? "translate-y-0" : "translate-y-full"
				} bg-white p-6 rounded-t-lg shadow-lg`}
			>
				<p>Session Settings</p>
				<div className="space-y-2 py-4">
					<Field
						label="Focus Time (minutes)"
						settingKey="workMinutes"
						settings={settings}
						onChange={onChange}
					/>
					<Field
						label="Short Break Time (minutes)"
						settingKey="shortBreakMinutes"
						settings={settings}
						onChange={onChange}
					/>
					<Field
						label="Long Break Time (minutes)"
						settingKey="longBreakMinutes"
						settings={settings}
						onChange={onChange}
					/>
					<Field
						label="Sessions Until Long Break"
						settingKey="cyclesBeforeLongBreak"
						settings={settings}
						onChange={onChange}
					/>
					<Toggle
						label="Auto Start Breaks"
						settingKey="autoStartBreaks"
						settings={settings}
						onChange={onChange}
					/>
					<Toggle
						label="Auto Start Pomodoro"
						settingKey="autoStartPomodoros"
						settings={settings}
						onChange={onChange}
					/>
				</div>

				<button
					type="button"
					onClick={onClearSession}
					className="w-full py-2 bg-rose-400 text-white rounded-lg
					shadow-sm shadow-rose-900
					hover:inset-shadow-sm hover:inset-shadow-rose-900/60
					hover:text-shadow-lg cursor-pointer
					transition"
				>
					Clear Sessions
				</button>
			</div>
		</>
	);
}
