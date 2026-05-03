"use client";
import { useState } from "react";

import Countdown from "./_components/Countdown";
import Settings from "./_components/Settings";
import ShareSession from "./_components/Share";
import Sessions from "./_components/Sessions";
import Tasks from "./_components/Tasks";
import { canShareSession } from "./hooks/useShare";
import { usePomodoro } from "./hooks/usePomodoro";

export default function Home() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    state,
    isLoaded,
    completeCurrentMode,
    createSession,
    deleteSession,
    deleteTask,
    updateSettings,
    updateType,
    addTask,
    sessions,
    selectSession,
    toggleTask,
  } = usePomodoro();

  return (
    <div className="mx-auto space-y-6 w-full max-w-4xl px-4 py-8">
      <nav className="flex justify-between">
        <p>chronos</p>

        <button
          className="cursor-pointer"
          type="button"
          onClick={() => setIsSettingsOpen((v) => !v)}
        >
          {isSettingsOpen ? "CLOSE" : "SETTINGS"}
        </button>
      </nav>

      {isLoaded ? (
        <>
          <Countdown
            key={state.session.id}
            canShareSession={canShareSession(state.session)}
            onShareSession={() => setIsShareOpen(true)}
            state={state}
            completeCurrentMode={completeCurrentMode}
            createSession={createSession}
            updateType={updateType}
          />
          <Settings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={state.settings}
            updateSettings={updateSettings}
          />
          <Sessions
            currentSessionId={state.session.id}
            deleteSession={deleteSession}
            selectSession={selectSession}
            sessions={sessions}
          />
          <ShareSession
            isOpen={isShareOpen}
            session={state.session}
            onClose={() => setIsShareOpen(false)}
          />
        </>
      ) : (
        <p>Loading Pomodoro...</p>
      )}

      <Tasks
        addTask={addTask}
        deleteTask={deleteTask}
        tasks={state.session.tasks}
        toggleTask={toggleTask}
      />
    </div>
  );
}
