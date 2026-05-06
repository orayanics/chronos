"use client";
import type { SubmitEvent } from "react";
import { useState } from "react";

import type { Task } from "../types/tpomodoro";

interface TasksProps {
  addTask: (text: string) => void;
  deleteTask: (taskId: number) => void;
  tasks: Task[];
  toggleTask: (taskId: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Tasks({
  addTask,
  deleteTask,
  tasks,
  toggleTask,
  isOpen,
  onClose,
}: TasksProps) {
  const [draft, setDraft] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;

    addTask(draft);
    setDraft("");
  }

  return (
    <>
      <button
        type="button"
        className={`${isOpen ? "bg-blur" : "backdrop-blur-none bg-none"}`}
        onClick={onClose}
      />

      <section
        className={`pull-up max-h-[86vh] space-y-2 ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <h2 className="text-lg font-semibold">Tasks</h2>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a task for this session"
            className="input w-full"
          />
          <button type="submit" className="btn-default">
            Add
          </button>
        </form>

        {tasks.length === 0 ? (
          <p className="text-sm text-primary/60">
            No tasks yet for this session.
          </p>
        ) : (
          <ul className="max-h-100 overflow-y-auto space-y-2 pr-1">
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
                  <span
                    className={task.completed ? "line-through opacity-60" : ""}
                  >
                    {task.text}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="cursor-pointer py-2 text-xs"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
