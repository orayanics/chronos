import type { PSessionLog } from "../schema";
import { formatTime } from "../util";

interface StatsProps {
	pomodoros: number;
	shortBreaks: number;
	longBreaks: number;
	total: PSessionLog[];
}

export default function Stats({
	pomodoros,
	shortBreaks,
	longBreaks,
	total,
}: StatsProps) {
	const data = total ?? [];
	return (
		<div>
			<p className="text-center uppercase tracking-wide text-primary/60">
				Current Session
			</p>
			<div
				className="flex gap-2
            [&>p]:text-sm"
			>
				<p className="text-emerald-600">
					FOCUS <span className="text-black">{pomodoros}</span>
				</p>
				<p className="text-sky-600">
					SHORT <span className="text-black">{shortBreaks}</span>
				</p>
				<p className="text-amber-600">
					LONG <span className="text-black">{longBreaks}</span>
				</p>
				{data.length > 0 && (
					<p>
						{"| "}TOTAL <span>{formatTime(total)} </span>
					</p>
				)}
			</div>
		</div>
	);
}
