"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import type { POMODORO_TYPE } from "../types/tpomodoro";

type TopoMapProps = {
  mode: POMODORO_TYPE;
  progress: number;
};

function normalizeSvgMarkup(markup: string) {
  return markup
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/g, "")
    .replace(
      /<svg\b/,
      '<svg class="topo-map-svg" preserveAspectRatio="xMidYMid slice"',
    )
    .trim();
}

export default function TopoMap({ mode, progress }: TopoMapProps) {
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const baseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSvg = async () => {
      try {
        const response = await fetch("/topo-map.svg");
        const text = await response.text();

        if (isMounted) {
          setSvgMarkup(normalizeSvgMarkup(text));
        }
      } catch (error) {
        console.error("Failed to load topo map SVG:", error);
      }
    };

    loadSvg();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!svgMarkup) return;

    if (baseRef.current) {
      baseRef.current.innerHTML = svgMarkup;
    }
  }, [svgMarkup]);

  if (!svgMarkup) {
    return null;
  }

  return (
    <div className="topo-map-wrap" aria-hidden="true" data-mode={mode}>
      <div
        ref={baseRef}
        className="topo-map"
        style={{ "--topo-progress": progress } as CSSProperties}
      />
    </div>
  );
}
