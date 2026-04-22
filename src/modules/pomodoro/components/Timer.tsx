import { LABEL_FRIENDLY_MAP } from "../constant";
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
		<div className="text-center my-10">
			<div className="text-6xl md:text-[120px] font-bold tabular-nums">
				<p className="font-normal text-center text-xs text-primary/60">
					{LABEL_FRIENDLY_MAP[mode]}
				</p>
				{pad(hours)}
				<span className="opacity-80">:</span>
				{pad(minutes)}
				<span className="opacity-80">:</span>
				{pad(seconds)}
			</div>
		</div>
	);
}
