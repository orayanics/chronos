"use client";
import type { Settings as SettingsState } from "../types/tpomodoro";

type SettingsProps = {
  settings: SettingsState;
  updateSettings: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
  isOpen: boolean;
  onClose: () => void;
};

function clampNumber(value: string, minimum = 1) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return minimum;
  }

  return Math.max(minimum, Math.floor(numericValue));
}

export default function Settings({
  settings,
  updateSettings,
  isOpen,
  onClose,
}: SettingsProps) {
  return (
    <>
      <button
        type="button"
        className={`${isOpen ? "bg-blur" : "bg-none backdrop-blur-none"}`}
        onClick={onClose}
      />

      <section
        className={`pull-up space-y-2 ${isOpen ? "translate-y-0" : "translate-y-full"} backdrop-blur-lg`}
      >
        <div className="border-b border-gray-300 pb-3">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-gray-600">Time is computed by minutes.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-label">Work</span>
            <input
              type="number"
              min="1"
              value={settings.WORK}
              onChange={(e) =>
                updateSettings("WORK", clampNumber(e.target.value))
              }
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-label">Short Break</span>
            <input
              type="number"
              min="1"
              value={settings.SHORT_BREAK}
              onChange={(e) =>
                updateSettings("SHORT_BREAK", clampNumber(e.target.value))
              }
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-label">Long Break</span>
            <input
              type="number"
              min="1"
              value={settings.LONG_BREAK}
              onChange={(e) =>
                updateSettings("LONG_BREAK", clampNumber(e.target.value))
              }
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-label">Cycles before long break</span>
            <input
              type="number"
              min="1"
              value={settings.CYCLES_BEFORE_LONG_BREAK}
              onChange={(e) =>
                updateSettings(
                  "CYCLES_BEFORE_LONG_BREAK",
                  clampNumber(e.target.value),
                )
              }
              className="input"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.AUTO_START_BREAK}
              onChange={(e) =>
                updateSettings("AUTO_START_BREAK", e.target.checked)
              }
              className="checkbox"
            />
            <span>Auto start break</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.AUTO_START_WORK}
              onChange={(e) =>
                updateSettings("AUTO_START_WORK", e.target.checked)
              }
              className="checkbox"
            />
            <span>Auto start work</span>
          </label>
        </div>
      </section>
    </>
  );
}
