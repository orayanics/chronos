import { useEffect, useRef, useState } from "react";

import { POMODORO_TYPE } from "../types/tpomodoro";

interface Props {
  progress: number;
  max: number;
  size?: number; // px, default 120
  stroke?: number; // px, default 10
  children?: React.ReactNode;
  mode: POMODORO_TYPE;
}

export function ProgressCircle({
  progress,
  max,
  size = 120,
  stroke = 10,
  mode,
  children,
}: Props) {
  const resetDurationMs = 450;
  const [displayedProgress, setDisplayedProgress] = useState(progress);
  const [displayedMode, setDisplayedMode] = useState(mode);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousModeRef = useRef(mode);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const modeChanged = previousModeRef.current !== mode;

    if (modeChanged && displayedProgress > 0 && progress === 0) {
      setDisplayedProgress(0);

      timeoutRef.current = setTimeout(() => {
        setDisplayedMode(mode);
        timeoutRef.current = null;
      }, resetDurationMs);
    } else {
      setDisplayedMode(mode);
      setDisplayedProgress(progress);
    }

    previousModeRef.current = mode;

    return () => {
      if (!timeoutRef.current) return;

      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [displayedProgress, mode, progress]);

  const pct =
    max > 0 ? Math.min(Math.max((displayedProgress / max) * 100, 0), 100) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const trackColor = "rgba(55,138,221,0.12)";

  const modeColors: Record<POMODORO_TYPE, string> = {
    WORK: "stroke-pinkish",
    SHORT_BREAK: "stroke-gold",
    LONG_BREAK: "stroke-sage",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className={`${modeColors[displayedMode]} transition-colors duration-500`}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          transition: `stroke-dashoffset ${resetDurationMs}ms cubic-bezier(0.4,0,0.2,1)`,
        }}
      />
      <foreignObject
        x={stroke}
        y={stroke}
        width={size - stroke * 2}
        height={size - stroke * 2}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}
