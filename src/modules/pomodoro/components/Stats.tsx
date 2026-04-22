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
		<div className="space-y-4">
			<p className="text-center uppercase tracking-wide text-primary/60">
				STATS
			</p>
			<div className="flex gap-2">
				<div
					className="rounded-lg h-24 w-26 bg-sage text-center
				shadow-sm shadow-emerald-900 inset-shadow-sm inset-shadow-emerald-900 
				flex flex-col justify-center items-center
				text-secondary"
				>
					<p className="font-bold tabular-nums text-3xl text-shadow-lg text-emerald-200">
						{pomodoros}
					</p>
					<p className="text-xs">focus</p>
				</div>

				<div
					className="rounded-lg h-24 w-26 bg-gold text-center
				shadow-sm shadow-amber-900 inset-shadow-sm inset-shadow-amber-900/60 
				flex flex-col justify-center items-center
				text-secondary"
				>
					<p className="font-bold tabular-nums text-3xl text-shadow-lg text-amber-200">
						{shortBreaks}
					</p>
					<p className="text-xs">short</p>
				</div>

				<div
					className="rounded-lg h-24 w-26 bg-pinkish text-center
				shadow-sm shadow-rose-900 inset-shadow-sm inset-shadow-rose-900/60
				flex flex-col justify-center items-center
				text-secondary"
				>
					<p className="font-bold tabular-nums text-3xl text-shadow-lg text-rose-200">
						{longBreaks}
					</p>
					<p className="text-xs">long</p>
				</div>
			</div>

			{data.length > 0 && (
				<div
					className="rounded-lg p-4 bg-primary/5
				shadow-sm shadow-primary/20 inset-shadow-sm inset-shadow-primary/20"
				>
					<p className="text-sm text-center text-primary/80">
						You've been focused for {formatTime(total)}
					</p>
				</div>
			)}
		</div>
	);
}
