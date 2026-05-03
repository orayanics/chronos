export type POMODORO_TYPE = "WORK" | "SHORT_BREAK" | "LONG_BREAK";

export interface Log {
  id: number;
  type: POMODORO_TYPE;
  duration: number;
  completedAt: number;
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export interface Settings {
  WORK: number;
  SHORT_BREAK: number;
  LONG_BREAK: number;
  CYCLES_BEFORE_LONG_BREAK: number;
  AUTO_START_BREAK: boolean;
  AUTO_START_WORK: boolean;
}

export interface SessionState {
  id: number; // unique identifier for the session
  startedAt: number; // timestamp when the session started
  pomodoro_count: number;
  short_count: number;
  long_count: number;
  currentCycleCount: number; // counts how many pomodoros have been completed in the current cycle (resets after a long break)
  logs: Log[]; // logs of completed pomodoros and breaks in this session
  tasks: Task[]; // tasks for this session
}

export interface InitialState {
  settings: Settings;
  session: SessionState;
  mode: POMODORO_TYPE;
}

export interface CurrentPomodoroRecord {
  key: "current";
  state: InitialState;
}
