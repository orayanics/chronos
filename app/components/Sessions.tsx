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
        className={`${isOpen ? "bg-blur" : "backdrop-blur-none bg-none"}`}
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
                    <p className="font-semibold uppercase text-xs tracking-widest mb-2">
                      {isCurrent ? "Current session" : "Open session"}
                    </p>

                    <div className="font-bold uppercase">
                      <p>{formatSessionDate(session.startedAt)}</p>
                    </div>

                    <div className="flex gap-4">
                      <p
                        className={`${isCurrent ? "session-focus" : ""} text-xs`}
                      >
                        Focus <span>{session.pomodoro_count}</span>
                      </p>
                      <p
                        className={`${isCurrent ? "session-tasks" : ""} text-xs`}
                      >
                        Tasks <span>{session.tasks.length}</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    className="btn-default text-xs"
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
