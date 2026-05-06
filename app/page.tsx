"use client";

import { useState } from "react";

import Countdown from "./components/Countdown";
import Sessions from "./components/Sessions";
import Tasks from "./components/Tasks";
import ShareSession from "./components/Share";
import Settings from "./components/Settings";

import { canShareSession } from "./hooks/useShare";
import { usePomodoro } from "./hooks/usePomodoro";

import Footer from "./components/Footer";

export default function Home() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);

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
    <>
      <div className="relative h-svh">
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
              isOpen={isSessionsOpen}
              onClose={() => setIsSessionsOpen(false)}
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
          isOpen={isTasksOpen}
          onClose={() => setIsTasksOpen(false)}
        />
      </div>

      <Footer
        setIsSettingsOpen={setIsSettingsOpen}
        setIsSessionsOpen={setIsSessionsOpen}
        setIsTasksOpen={setIsTasksOpen}
      />
    </>
  );
}
