import { useEffect, useState } from "react";

import { getDatabase } from "@/app/hooks/usePomodoro";
import type { SessionState } from "@/app/types/tpomodoro";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_STREAK_DAYS = 3;

export interface StreakDay {
  date: Date;
  dateKey: string;
  sessionCount: number;
  sessions: SessionState[];
}

interface StreakData {
  sessionDays: StreakDay[];
  streakDays: Date[];
}

function toStartOfDay(value: number) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function mapSessionsToSessionDays(sessions: SessionState[]) {
  const days = new Map<string, StreakDay>();

  sessions.forEach((session) => {
    const sessionDateKeys = new Set<string>();

    session.logs.forEach((log) => {
      const date = toStartOfDay(log.completedAt);
      const dateKey = toDateKey(date);
      const existingDay = days.get(dateKey);

      if (existingDay) {
        existingDay.sessionCount += 1;
        if (!sessionDateKeys.has(dateKey)) {
          existingDay.sessions.push(session);
          sessionDateKeys.add(dateKey);
        }
        return;
      }

      days.set(dateKey, {
        date,
        dateKey,
        sessionCount: 1,
        sessions: [session],
      });
      sessionDateKeys.add(dateKey);
    });
  });

  return [...days.values()]
    .map((day) => ({
      ...day,
      sessions: [...day.sessions].sort((left, right) => right.startedAt - left.startedAt),
    }))
    .sort((left, right) => left.date.getTime() - right.date.getTime());
}

function getStreakDates(sessionDays: StreakDay[]) {
  const streakDates: Date[] = [];
  let run: StreakDay[] = [];

  sessionDays.forEach((day, index) => {
    if (index === 0) {
      run = [day];
      return;
    }

    const previousDay = sessionDays[index - 1];
    const diffInDays =
      (day.date.getTime() - previousDay.date.getTime()) / MS_PER_DAY;

    if (diffInDays === 1) {
      run.push(day);
    } else {
      if (run.length >= MIN_STREAK_DAYS) {
        streakDates.push(...run.map((entry) => entry.date));
      }

      run = [day];
    }
  });

  if (run.length >= MIN_STREAK_DAYS) {
    streakDates.push(...run.map((entry) => entry.date));
  }

  return streakDates;
}

export default function useStreak() {
  const [data, setData] = useState<StreakData>({
    sessionDays: [],
    streakDays: [],
  });

  useEffect(() => {
    async function fetchData() {
      const db = await getDatabase();
      const sessions = await db.getAll("sessions");
      const sessionDays = mapSessionsToSessionDays(sessions);

      setData({
        sessionDays,
        streakDays: getStreakDates(sessionDays),
      });
    }

    fetchData();
  }, []);

  return data;
}
