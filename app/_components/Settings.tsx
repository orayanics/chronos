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
      {isOpen && (
        <button
          type="button"
          className={`${isOpen ? "bg-blur" : "backdrop-blur-none"} transition-all`}
          onClick={onClose}
        />
      )}

      <section
        className={`pull-up ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <h2 className="text-lg font-semibold">Settings</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span>Work minutes</span>
            <input
              type="number"
              min="1"
              value={settings.WORK}
              onChange={(e) =>
                updateSettings("WORK", clampNumber(e.target.value))
              }
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>Short break minutes</span>
            <input
              type="number"
              min="1"
              value={settings.SHORT_BREAK}
              onChange={(e) =>
                updateSettings("SHORT_BREAK", clampNumber(e.target.value))
              }
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>Long break minutes</span>
            <input
              type="number"
              min="1"
              value={settings.LONG_BREAK}
              onChange={(e) =>
                updateSettings("LONG_BREAK", clampNumber(e.target.value))
              }
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>Cycles before long break</span>
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
              className="rounded border border-gray-300 px-3 py-2"
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
            />
            <span>Auto start work</span>
          </label>
        </div>
      </section>
    </>
  );
}
