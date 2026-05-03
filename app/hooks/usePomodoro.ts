"use client";
import { openDB, type DBSchema } from "idb";
import { useEffect, useRef, useState } from "react";

import {
  createNewSessionState,
  DEFAULT_SETTINGS,
  getDefaultState,
} from "../constants/pomodoro";
import type {
  CurrentPomodoroRecord,
  InitialState,
  POMODORO_TYPE,
  SessionState,
  Settings,
  Task,
} from "../types/tpomodoro";

const DB_NAME = "chronos-db";
const DB_VERSION = 2;
const CURRENT_STATE_KEY = "current";

type LegacySessionState = SessionState & {
  long_coiunt?: number;
};

interface ChronosDB extends DBSchema {
  sessions: {
    key: number;
    value: SessionState;
  };
  appState: {
    key: string;
    value: CurrentPomodoroRecord;
  };
}

function normalizeSession(session: Partial<LegacySessionState> | undefined) {
  const fallback = createNewSessionState();

  return {
    ...fallback,
    ...session,
    startedAt: session?.startedAt ?? fallback.startedAt,
    long_count: session?.long_count ?? session?.long_coiunt ?? 0,
    logs: session?.logs ?? [],
    tasks: session?.tasks ?? [],
  } satisfies SessionState;
}

function normalizeState(state: Partial<InitialState> | undefined): InitialState {
  const fallback = getDefaultState();

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...state?.settings,
    },
    session: normalizeSession(state?.session),
    mode: state?.mode ?? fallback.mode,
  };
}

async function getDatabase() {
  return openDB<ChronosDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("appState")) {
        db.createObjectStore("appState", { keyPath: "key" });
      }
    },
  });
}

async function persistCurrentState(state: InitialState) {
  const db = await getDatabase();

  await db.put("appState", {
    key: CURRENT_STATE_KEY,
    state,
  });
}

async function persistSessionHistory(session: SessionState) {
  const db = await getDatabase();
  await db.put("sessions", session);
}

async function deleteStoredSession(sessionId: number) {
  const db = await getDatabase();
  await db.delete("sessions", sessionId);
}

function sortSessions(sessions: SessionState[]) {
  return [...sessions].sort((a, b) => b.startedAt - a.startedAt);
}

export function usePomodoro() {
  const [state, setState] = useState<InitialState>(getDefaultState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const sessionInHistoryRef = useRef(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const db = await getDatabase();
        const savedCurrentState = await db.get("appState", CURRENT_STATE_KEY);

        if (savedCurrentState?.state) {
          const normalizedState = normalizeState(savedCurrentState.state);
          const allSessions = sortSessions(
            (await db.getAll("sessions")).map((session) => normalizeSession(session)),
          );
          const savedSession = allSessions.find(
            (session) => session.id === normalizedState.session.id,
          );

          setSessions(allSessions);
          sessionInHistoryRef.current = Boolean(savedSession);
          setState(normalizedState);
          return;
        }

        const allSessions = sortSessions(
          (await db.getAll("sessions")).map((session) => normalizeSession(session)),
        );

        if (allSessions.length > 0) {
          const latestSession = allSessions[0];

          const normalizedState = normalizeState({ session: latestSession });
          setSessions(allSessions);
          sessionInHistoryRef.current = true;
          setState(normalizedState);
          await persistCurrentState(normalizedState);
          return;
        }

        const defaultState = getDefaultState();
        setSessions([]);
        sessionInHistoryRef.current = false;
        setState(defaultState);
        await persistCurrentState(defaultState);
      } catch (error) {
        console.error("Failed to load Pomodoro state from indexedDB:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const saveState = async () => {
      try {
        await persistCurrentState(state);

        if (sessionInHistoryRef.current) {
          await persistSessionHistory(state.session);
          setSessions((current) =>
            sortSessions(
              [
                ...current.filter((session) => session.id !== state.session.id),
                state.session,
              ].map((session) => normalizeSession(session)),
            ),
          );
        }
      } catch (error) {
        console.error("Failed to save Pomodoro state to indexedDB:", error);
      }
    };

    saveState();
  }, [isLoaded, state]);

  function updateType(type: POMODORO_TYPE) {
    setState((prev) => ({ ...prev, mode: type }));
  }

  function updateSettings<K extends keyof Settings>(key: K, value: Settings[K]) {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  }

  function addTask(text: string) {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const nextTask: Task = {
      id: Date.now(),
      text: trimmedText,
      completed: false,
    };

    setState((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        tasks: [...prev.session.tasks, nextTask],
      },
    }));
  }

  function toggleTask(taskId: number) {
    setState((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        tasks: prev.session.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      },
    }));
  }

  function deleteTask(taskId: number) {
    setState((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        tasks: prev.session.tasks.filter((task) => task.id !== taskId),
      },
    }));
  }

  function completeCurrentMode() {
    setState((prev) => {
      const nextSession = {
        ...prev.session,
        logs: [
          ...prev.session.logs,
          {
            id: Date.now(),
            type: prev.mode,
            duration: prev.settings[prev.mode],
            completedAt: Date.now(),
          },
        ],
      };

      let nextMode: POMODORO_TYPE = prev.mode;

      if (prev.mode === "WORK") {
        const nextCycleCount = nextSession.currentCycleCount + 1;
        nextSession.pomodoro_count += 1;
        nextSession.currentCycleCount = nextCycleCount;
        nextMode =
          nextCycleCount >= prev.settings.CYCLES_BEFORE_LONG_BREAK
            ? "LONG_BREAK"
            : "SHORT_BREAK";
      } else if (prev.mode === "SHORT_BREAK") {
        nextSession.short_count += 1;
        nextMode = "WORK";
      } else {
        nextSession.long_count += 1;
        nextSession.currentCycleCount = 0;
        nextMode = "WORK";
      }

      return {
        ...prev,
        session: nextSession,
        mode: nextMode,
      };
    });
  }

  async function createSession() {
    const nextSession = createNewSessionState();
    const nextState = {
      ...state,
      session: nextSession,
      mode: "WORK" as POMODORO_TYPE,
    };

    try {
      await persistSessionHistory(nextSession);
      sessionInHistoryRef.current = true;
      setSessions((current) => sortSessions([nextSession, ...current]));
      setState(nextState);
    } catch (error) {
      console.error("Failed to create a new Pomodoro session:", error);
    }
  }

  function selectSession(sessionId: number) {
    const selectedSession = sessions.find((session) => session.id === sessionId);
    if (!selectedSession) return;

    sessionInHistoryRef.current = true;
    setState((prev) => ({
      ...prev,
      session: selectedSession,
      mode: "WORK",
    }));
  }

  async function deleteSession(sessionId: number) {
    try {
      await deleteStoredSession(sessionId);

      const remainingSessions = sessions.filter((session) => session.id !== sessionId);
      const normalizedSessions = sortSessions(remainingSessions);
      setSessions(normalizedSessions);

      if (state.session.id !== sessionId) {
        return;
      }

      if (normalizedSessions.length > 0) {
        sessionInHistoryRef.current = true;
        setState((prev) => ({
          ...prev,
          session: normalizedSessions[0],
          mode: "WORK",
        }));
        return;
      }

      sessionInHistoryRef.current = false;
      setState((prev) => ({
        ...prev,
        session: createNewSessionState(),
        mode: "WORK",
      }));
    } catch (error) {
      console.error("Failed to delete Pomodoro session:", error);
    }
  }

  return {
    addTask,
    deleteSession,
    deleteTask,
    state,
    isLoaded,
    sessions,
    setState,
    selectSession,
    toggleTask,
    createSession,
    completeCurrentMode,
    updateSettings,
    updateType,
  };
}
