import { useState } from "react";
import type { PTask } from "../schema";

interface TasksProps {
	tasks: PTask[];
	onAdd: (text: string) => void;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
	onUpdate: (id: string, text: string) => void;
}

export default function Tasks({
	tasks,
	onAdd,
	onToggle,
	onDelete,
	onUpdate,
}: TasksProps) {
	const [input, setInput] = useState("");
	const [editId, setEditId] = useState<string | null>(null);
	const [editText, setEditText] = useState("");

	const commit = () => {
		if (input.trim()) {
			onAdd(input.trim());
			setInput("");
		}
	};

	const commitEdit = (id: string) => {
		if (editText.trim()) onUpdate(id, editText.trim());
		setEditId(null);
		setEditText("");
	};

	const remaining = tasks.filter((t) => !t.completed).length;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
			<div
				style={{
					fontSize: "0.6rem",
					letterSpacing: "0.2em",
					paddingBottom: "0.25rem",
				}}
			>
				TASKS — {remaining} remaining
			</div>

			{/* Add input */}
			<div style={{ display: "flex", gap: "0.4rem" }}>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && commit()}
					placeholder="Add a task..."
					style={{
						flex: 1,
						padding: "0.45rem 0.65rem",
						fontSize: "0.72rem",
						fontFamily: "inherit",
						outline: "none",
					}}
				/>
				<button type="button" onClick={commit}>
					+
				</button>
			</div>

			{/* List */}
			<div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
				{tasks.map((task) => (
					<div
						key={task.id}
						style={{
							display: "flex",
							alignItems: "flex-start",
							gap: "0.5rem",
							padding: "0.5rem 0.6rem",
						}}
					>
						{/* Checkbox */}
						<button
							type="button"
							onClick={() => onToggle(task.id)}
							style={{
								flexShrink: 0,
								width: 13,
								height: 13,
								marginTop: 2,
								cursor: "pointer",
								padding: 0,
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
								style={{
									flex: 1,
									background: "transparent",
									border: "none",
									fontSize: "0.72rem",
									fontFamily: "inherit",
									outline: "none",
								}}
							/>
						) : (
							<button
								type="button"
								onDoubleClick={() => {
									setEditId(task.id);
									setEditText(task.text);
								}}
								title="Double-click to edit"
								style={{
									flex: 1,
									fontSize: "0.72rem",
									lineHeight: 1.5,
									textDecoration: task.completed ? "line-through" : "none",
									cursor: "text",
									wordBreak: "break-word",
								}}
							>
								{task.text}
							</button>
						)}

						<button
							type="button"
							onClick={() => onDelete(task.id)}
							style={{
								flexShrink: 0,
								background: "none",
								border: "none",
								cursor: "pointer",
								fontSize: "0.8rem",
								padding: 0,
								lineHeight: 1,
							}}
						>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
