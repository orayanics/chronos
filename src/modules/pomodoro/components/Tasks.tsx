import { useState } from "react";
import type { PTask } from "../schema";

interface TasksProps {
	tasks?: PTask[] | null;
	onAdd: (text: string) => void | Promise<void>;
	onToggle: (id: number) => void | Promise<void>;
	onDelete: (id: number) => void | Promise<void>;
	onUpdate: (id: number, text: string) => void | Promise<void>;
}

export default function Tasks({
	tasks,
	onAdd,
	onToggle,
	onDelete,
	onUpdate,
}: TasksProps) {
	const [input, setInput] = useState("");
	const [editId, setEditId] = useState<number | null>(null);
	const [editText, setEditText] = useState("");

	const commit = () => {
		if (input.trim()) {
			void onAdd(input.trim());
			setInput("");
		}
	};

	const commitEdit = (id: number) => {
		if (editText.trim()) {
			void onUpdate(id, editText.trim());
		}
		setEditId(null);
		setEditText("");
	};

	const data = tasks ?? [];
	const remaining = data.filter((t) => !t.completed).length;

	return (
		<div className="space-y-4">
			<div className="pb-4 space-y-2">
				<p className="text-center text-xs text-primary/60">
					TASKS — {remaining} remaining
				</p>

				<div className="flex gap-2">
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && commit()}
						placeholder="Add a task..."
						className="border border-primary/60 w-full p-2 rounded-lg shadow-sm focus:outline-1"
					/>
					<button
						type="button"
						onClick={commit}
						className="cursor-pointer shadow rounded-lg border p-2
					transition bg-primary text-white hover:inset-shadow-secondary/20 hover:inset-shadow-sm"
					>
						+
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				{data.map((task) => (
					<div key={task.id} className="flex gap-1 items-center">
						<input
							type="checkbox"
							checked={task.completed}
							onChange={() => {
								void onToggle(task.id);
							}}
						/>

						{editId === task.id ? (
							<input
								value={editText}
								onChange={(e) => setEditText(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") commitEdit(task.id);
									if (e.key === "Escape") {
										setEditId(null);
										setEditText("");
									}
								}}
								onBlur={() => commitEdit(task.id)}
								className="flex-1 border rounded-lg text-xs p-1"
							/>
						) : (
							<button
								type="button"
								onDoubleClick={() => {
									setEditId(task.id);
									setEditText(task.text);
								}}
								title="Double-click to edit"
								className="w-full break-all truncate text-left pl-2 text-xs cursor-text"
								style={{
									textDecoration: task.completed ? "line-through" : "none",
									color: task.completed ? "#6b7280" : "#111827",
								}}
							>
								{task.text}
							</button>
						)}

						<button
							type="button"
							onClick={() => {
								void onDelete(task.id);
							}}
							className="cursor-pointer shadow rounded-lg border px-2 py-1
					transition bg-primary text-white hover:inset-shadow-secondary/20 hover:inset-shadow-sm"
						>
							X
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
