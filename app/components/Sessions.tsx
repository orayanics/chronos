"use client";
import type { SessionState } from "../types/tpomodoro";
import { formatSessionDate } from "../utils/time";

interface SessionsProps {
  currentSessionId: number;
  deleteSession: (sessionId: number) => void;
  selectSession: (sessionId: number) => void;
  sessions: SessionState[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Sessions({
  currentSessionId,
  deleteSession,
  selectSession,
  sessions,
  isOpen,
  onClose,
}: SessionsProps) {
  return (
    <>
      <button
        type="button"
        className={`${isOpen ? "bg-blur" : "backdrop-blur-none bg-none"} transition-all`}
        onClick={onClose}
      />

      <section
        className={`pull-up max-h-[86vh] space-y-2 ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <h2 className="text-lg font-semibold">Sessions</h2>

        {sessions.length === 0 ? (
          <p className="text-sm text-primary/60">No saved sessions yet.</p>
        ) : (
          <ul className="max-h-100 overflow-y-auto space-y-2 pr-1">
            {sessions.map((session) => {
              const isCurrent = session.id === currentSessionId;

              return (
                <li
                  key={session.id}
                  className={`${isCurrent ? "session-current" : "bg-white"} session-item`}
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
                    className="btn"
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
