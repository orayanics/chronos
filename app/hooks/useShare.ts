import { toBlob } from "html-to-image";
import type { SessionState } from "../types/tpomodoro";

import {
  formatSessionDate,
  formatTime,
  getSessionDateToken,
  hasCompletedWorkLog,
} from "../utils/time";

export interface ShareSessionData {
  cycleCount: number;
  tasksCompleted: number;
  focusLabel: string;
  sessionDateLabel: string;
  sessionDateToken: string;
}

export function canShareSession(session: SessionState): boolean {
  return hasCompletedWorkLog(session.logs);
}

export function getShareSessionData(
  session: SessionState,
): ShareSessionData | null {
  if (!canShareSession(session)) return null;

  return {
    cycleCount: session.currentCycleCount,
    tasksCompleted: session.tasks.filter((t) => t.completed).length,
    focusLabel: formatTime(session.logs),
    sessionDateLabel: formatSessionDate(session.startedAt),
    sessionDateToken: getSessionDateToken(session.startedAt),
  };
}

function getElementExportSize(element: HTMLElement) {
  const computedStyles = window.getComputedStyle(element);
  const width = Math.round(
    element.offsetWidth ||
      element.clientWidth ||
      Number.parseFloat(computedStyles.width),
  );
  const height = Math.round(
    element.offsetHeight ||
      element.clientHeight ||
      Number.parseFloat(computedStyles.height),
  );

  if (!width || !height) {
    throw new Error("Unable to determine share card size");
  }

  return { width, height };
}

function createExportNode(element: HTMLElement, width: number, height: number) {
  const clone = element.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    throw new Error("Unable to clone share card");
  }

  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.maxWidth = "none";
  clone.style.maxHeight = "none";
  clone.style.margin = "0";
  clone.style.transform = "none";

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "0";
  wrapper.style.top = "0";
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.opacity = "0";
  wrapper.style.pointerEvents = "none";
  wrapper.style.overflow = "hidden";
  wrapper.style.zIndex = "-1";
  wrapper.appendChild(clone);

  return { wrapper, clone };
}

export async function exportElementAsPng(
  element: HTMLElement,
  fileName: string,
): Promise<void> {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const { width, height } = getElementExportSize(element);
  const { wrapper, clone } = createExportNode(element, width, height);
  document.body.appendChild(wrapper);

  try {
    const blob = await toBlob(clone, {
      cacheBust: true,
      width,
      height,
      canvasWidth: width * 2,
      canvasHeight: height * 2,
      pixelRatio: 1,
      skipAutoScale: true,
    });
    if (!blob) throw new Error("Unable to create image file");

    const downloadUrl = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.click();
    } finally {
      URL.revokeObjectURL(downloadUrl);
    }
  } finally {
    wrapper.remove();
  }
}
