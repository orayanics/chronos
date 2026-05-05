import type { Log } from "@/app/types/tpomodoro";
import { formatLogTime } from "@/app/utils/time";

interface LogsProps {
  logs: Log[];
}

export default function Logs({ logs }: LogsProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-primary/60">No completed logs yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {logs
        .slice()
        .sort((left, right) => right.completedAt - left.completedAt)
        .map((log) => (
          <li
            key={log.id}
            className="flex items-center justify-between rounded-xl border border-primary/10 px-3 py-2 text-sm"
          >
            <span>
              {log.type} • {log.duration} min
            </span>
            <span className="text-primary/60">
              {formatLogTime(log.completedAt)}
            </span>
          </li>
        ))}
    </ul>
  );
}
