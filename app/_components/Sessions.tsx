"use client";
import type { SessionState } from "../types/tpomodoro";
import { formatSessionDate } from "../utils/time";

interface SessionsProps {
  currentSessionId: number;
  deleteSession: (sessionId: number) => void;
  selectSession: (sessionId: number) => void;
  sessions: SessionState[];
}

export default function Sessions({
  currentSessionId,
  deleteSession,
  selectSession,
  sessions,
}: SessionsProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Sessions</h2>

      {sessions.length === 0 ? (
        <p className="text-sm text-primary/60">No saved sessions yet.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((session) => {
            const isCurrent = session.id === currentSessionId;

            return (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 rounded border border-gray-200 px-3 py-3"
              >
                <button
                  type="button"
                  onClick={() => selectSession(session.id)}
                  className="flex-1 cursor-pointer text-left"
                >
                  <p className="font-medium">
                    {isCurrent ? "Current session" : "Open session"}
                  </p>
                  <p className="text-sm text-primary/65">
                    {formatSessionDate(session.startedAt)} • Focus{" "}
                    {session.pomodoro_count} • Tasks {session.tasks.length}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => deleteSession(session.id)}
                  className="cursor-pointer text-sm text-primary/60 transition hover:text-primary"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
