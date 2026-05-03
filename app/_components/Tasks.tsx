"use client";
import { useState, type FormEvent } from "react";

import type { Task } from "../types/tpomodoro";

interface TasksProps {
  addTask: (text: string) => void;
  deleteTask: (taskId: number) => void;
  tasks: Task[];
  toggleTask: (taskId: number) => void;
}

export default function Tasks({
  addTask,
  deleteTask,
  tasks,
  toggleTask,
}: TasksProps) {
  const [draft, setDraft] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;

    addTask(draft);
    setDraft("");
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Tasks</h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a task for this session"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-secondary"
        >
          Add
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-sm text-primary/60">No tasks yet for this session.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 rounded border border-gray-200 px-3 py-2"
            >
              <label className="flex flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={task.completed ? "line-through opacity-60" : ""}>
                  {task.text}
                </span>
              </label>

              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="cursor-pointer text-sm text-primary/60 transition hover:text-primary"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
