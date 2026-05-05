"use client";

import { useState } from "react";
import {
  DayButton as DayPickerDayButton,
  DayPicker,
  type DayButtonProps,
} from "react-day-picker";
import { FaFire, FaTrophy } from "react-icons/fa";
import "react-day-picker/dist/style.css";

import { formatTime, isSameDay } from "@/app/utils/time";

import useStreak from "./useStreak";
import { Badge } from "./Badge";

function StreakDayButton(props: DayButtonProps) {
  const { children, className, modifiers, ...buttonProps } = props;

  return (
    <DayPickerDayButton
      {...buttonProps}
      className={`${className ?? ""} streak-day-button`.trim()}
      modifiers={modifiers}
    >
      {modifiers.streak ? (
        <FaFire className="streak-day-icon" aria-hidden="true" />
      ) : null}

      {modifiers.hasSession && !modifiers.streak ? (
        <div
          className="w-2 h-2 bg-gold animate-pulse rounded-full"
          aria-hidden="true"
        />
      ) : null}
      <p>{children}</p>
    </DayPickerDayButton>
  );
}

export default function Page() {
  const [selected, setSelected] = useState<Date>();
  const { sessionDays, streakDays } = useStreak();

  const selectedDay = selected
    ? sessionDays.find((day) => isSameDay(day.date, selected))
    : undefined;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border">
          <DayPicker
            animate
            mode="single"
            selected={selected}
            onSelect={setSelected}
            components={{
              DayButton: StreakDayButton,
            }}
            modifiers={{
              hasSession: sessionDays.map((day) => day.date),
              streak: streakDays,
            }}
            modifiersClassNames={{
              hasSession: "streak-has-session",
              streak: "streak-qualified",
            }}
          />
        </div>

        <div
          className="rounded-lg shadow-sm shadow-pinkish
          flex flex-col items-center justify-center
          bg-primary text-pinkish relative h-100"
        >
          {/* TODO: Animate flame and trophy */}
          <FaFire
            aria-hidden="true"
            className="text-primary! text-5xl
            absolute z-1 top-2/5 left-1/2 -translate-x-1/2 -translate-y-1/2
            animate-pulse"
          />
          <FaTrophy aria-hidden="true" className="text-9xl relative" />
          <p>You&apos;re on a </p>
          <p>{streakDays.length} day streak!</p>
        </div>
      </div>

      <div className="bg-white">
        {selectedDay ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xl font-semibold">
                {selectedDay.date.toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-primary/70">
                {selectedDay.sessions.length} session/s on this day
              </p>
            </div>

            <div className="space-y-4">
              {selectedDay.sessions.map((session) => (
                <article key={session.id} className="space-y-4 border p-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2 text-sm text-primary/70">
                      <Badge type="FOCUS" label={session.pomodoro_count} />
                      <Badge type="SHORT" label={session.short_count} />
                      <Badge type="LONG" label={session.long_count} />
                      <Badge type="TIME" label={formatTime(session.logs)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center border rounded-lg py-4">
                      <p className="text-xs">You listed</p>
                      <p>{session.tasks.length}</p>
                      <p className="text-sm font-semibold">Tasks</p>
                    </div>

                    <div className="text-center border rounded-lg py-4">
                      <p className="text-xs">You worked through</p>
                      <p>{session.logs.length}</p>
                      <p className="text-sm font-semibold">Phases</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div>You don&apos;t have any sessions on this day!</div>
        )}
      </div>
    </div>
  );
}
