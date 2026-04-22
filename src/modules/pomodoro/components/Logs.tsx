import type { PSessionLog } from "../schema";
import { pad } from "../util";

interface LogsProps {
	logs: PSessionLog[];
}

export default function Logs({ logs }: LogsProps) {
	if (!logs || logs.length === 0) return null;
	return (
		<>
			<button type="button" className="fixed inset-0 bg-black/30 z-20" />

			<div
				className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out transform translate-y-0 bg-white p-6 rounded-t-lg shadow-lg mb-0`}
			>
				<p>Logs</p>
				<div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
					{[...logs].reverse().map((log) => {
						const ts = new Date(log.completedAt);
						const label =
							log.type === "WORK"
								? "FOCUS"
								: log.type === "SHORT"
									? "SHORT"
									: "LONG";
						return (
							<div key={log.id} className="flex justify-between">
								<div>
									<p>
										{label}
										<span className="text-primary/60 ms-4">
											{log.duration}m
										</span>
									</p>
								</div>
								<span>
									{pad(ts.getHours())}:{pad(ts.getMinutes())}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
}
