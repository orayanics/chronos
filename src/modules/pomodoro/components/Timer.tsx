import { LABEL_MAP } from "../constant";
import type { POMODORO_TYPE } from "../schema";
import { pad } from "../util";

interface TimerProps {
	hours: number;
	minutes: number;
	seconds: number;
	mode: POMODORO_TYPE;
}

export default function Timer({ hours, minutes, seconds, mode }: TimerProps) {
	return (
		<div style={{ textAlign: "center" }}>
			<div
				style={{
					fontSize: "0.65rem",
					letterSpacing: "0.3em",
					marginBottom: "0.75rem",
				}}
			>
				{LABEL_MAP[mode]}
			</div>
			<div
				style={{
					fontSize: "clamp(4.5rem, 13vw, 8.5rem)",
					fontWeight: 700,
					lineHeight: 1,
					letterSpacing: "-0.03em",
				}}
			>
				{pad(hours)}
				<span style={{ opacity: 0.3 }}>:</span>
				{pad(minutes)}
				<span style={{ opacity: 0.3 }}>:</span>
				{pad(seconds)}
			</div>
		</div>
	);
}
