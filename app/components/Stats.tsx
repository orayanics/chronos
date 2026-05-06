import type { Log } from "../types/tpomodoro";
import { formatTime } from "../utils/time";

interface StatsProps {
  pomodoros: number;
  shortBreaks: number;
  longBreaks: number;
  total: Log[];
}

export default function Stats({
  pomodoros,
  shortBreaks,
  longBreaks,
  total,
}: StatsProps) {
  const data = total ?? [];
  return (
    <div className="space-y-2 w-full">
      <p className="text-center text-xs text-primary/60">CURRENT SESSION</p>
      <div className="grid grid-cols-3 gap-2">
        <div
          className="rounded-lg p-2 bg-sage text-center
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
          className="rounded-lg p-2 bg-gold text-center
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
          className="rounded-lg p-2 bg-pinkish text-center
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
          className="rounded-lg p-2 bg-primary/5
				shadow-sm shadow-primary/20 inset-shadow-sm inset-shadow-primary/20"
        >
          <p className="text-sm text-center text-primary/80">
            Focused for {formatTime(total)}
          </p>
        </div>
      )}
    </div>
  );
}
