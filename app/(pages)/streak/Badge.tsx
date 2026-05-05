import type { ReactNode } from "react";

type BADGE_TYPE = "FOCUS" | "SHORT" | "LONG" | "TIME";

const BADGE_COLORS: Record<BADGE_TYPE, string> = {
  FOCUS: "bg-pinkish/20 border-1 border-pinkish/40 shadow-sm shadow-pinkish/30",
  SHORT: "bg-gold/20 border-1 border-gold/40 shadow-sm shadow-gold/30",
  LONG: "bg-sage/20 border-1 border-sage/40 shadow-sm shadow-sage/30",
  TIME: "bg-primary/20 border-1 border-primary/40 shadow-sm shadow-primary/40",
};

const BADGE_TEXT_COLORS: Record<BADGE_TYPE, string> = {
  FOCUS: "text-pinkish",
  SHORT: "text-gold",
  LONG: "text-sage",
  TIME: "text-primary",
};

const BADGE_LABELS: Record<BADGE_TYPE, string> = {
  FOCUS: "Focus",
  SHORT: "Short Break",
  LONG: "Long Break",
  TIME: "Time Focused",
};

interface BadgeProps {
  type: BADGE_TYPE;
  label: string | ReactNode;
}

export function Badge({ type, label }: BadgeProps) {
  const colorClass = BADGE_COLORS[type];
  const textColorClass = BADGE_TEXT_COLORS[type];

  return (
    <div
      className={`
    rounded-lg text-xs px-3 py-1 ${textColorClass} ${colorClass}`}
    >
      {BADGE_LABELS[type]} <span className="font-bold">{label}</span>
    </div>
  );
}
