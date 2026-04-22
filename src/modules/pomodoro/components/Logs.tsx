import type { PSessionLog } from "../schema";
import { pad } from "../util";

interface LogsProps {
	logs: PSessionLog[];
}

export default function Logs({ logs }: LogsProps) {
	if (logs.length === 0) return null;
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div
				style={{
					fontSize: "0.6rem",
					letterSpacing: "0.2em",
					paddingBottom: "0.25rem",
				}}
			>
				LOG
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 0,
					maxHeight: 180,
					overflowY: "auto",
				}}
			>
				{[...logs].reverse().map((log) => {
					const ts = new Date(log.completedAt);
					const label =
						log.type === "WORK"
							? "FOCUS"
							: log.type === "SHORT"
								? "SHORT"
								: "LONG";
					return (
						<div
							key={log.id}
							style={{
								display: "flex",
								justifyContent: "space-between",
								padding: "0.22rem 0",
								fontSize: "0.62rem",
							}}
						>
							<span style={{ width: 40 }}>{label}</span>
							<span style={{ color: "#8a8680" }}>{log.duration}m</span>
							<span>
								{pad(ts.getHours())}:{pad(ts.getMinutes())}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
