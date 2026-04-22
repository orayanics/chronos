import type { PSettings } from "../schema";

interface SettingsProps {
	settings: PSettings;
	onChange: (settings: PSettings) => void;
	onClearSession: () => void;
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
		<div>
			<label htmlFor="input">{label}</label>
			<input
				type="number"
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
	return (
		<div>
			<label
				key={settingKey}
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "0.35rem",
					fontSize: "0.6rem",
					letterSpacing: "0.18em",
				}}
			>
				{label}
				<button
					type="button"
					onClick={() =>
						onChange({ ...settings, [settingKey]: !settings[settingKey] })
					}
				>
					{settings[settingKey] ? "ON" : "OFF"}
				</button>
			</label>
		</div>
	);
};

export default function Settings({
	settings,
	onChange,
	onClearSession,
}: SettingsProps) {
	return (
		<div>
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
			<button type="button" onClick={onClearSession}>
				Clear Sessions
			</button>
		</div>
	);
}
