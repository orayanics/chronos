import { useRef, useState } from "react";
import type { SessionState } from "../types/tpomodoro";
import { exportElementAsPng, getShareSessionData } from "../hooks/useShare";

interface ShareSessionProps {
  isOpen: boolean;
  session: SessionState;
  onClose: () => void;
}

export default function ShareSession({
  isOpen,
  session,
  onClose,
}: ShareSessionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const shareData = getShareSessionData(session);

  if (!shareData) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsSaving(true);
    setError("");

    try {
      await exportElementAsPng(
        cardRef.current,
        `chronos-session-${shareData.sessionDateToken}.png`,
      );
    } catch {
      setError("Could not generate the share image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-xs mb-0"
          onClick={onClose}
        />
      )}

      <div
        className={`w-100 absolute inset-0 left-0 right-0 top-0 mx-auto my-auto
			z-30 flex items-center justify-center mb-0 transition-opacity duration-300 ease-in-out
			${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="max-w-md bg-white p-4 space-y-4">
          <div className="overflow-x-auto pb-2">
            <div
              ref={cardRef}
              className="mx-auto relative h-[80svh] w-[320px] overflow-hidden
							border-2 border-secondary
							bg-secondary text-primary/75"
            >
              <div className="absolute inset-0 bg-primary/15 blur-3xl" />
              <div className="absolute inset-0 h-50 w-50 bg-sage blur-3xl" />
              <div className="absolute -right-10 top-24 h-70 w-60 rounded-full bg-pinkish blur-3xl" />
              <div className="absolute left-10 -bottom-10 h-60 w-70 rounded-full bg-gold blur-3xl" />
              <div
                className={`absolute inset-0 z-0 mx-auto left-0 -right-18 text-right
              text-primary text-[32rem] leading-none
              ${isOpen ? "animate-spin-up" : ""}`}
              >
                *
              </div>

              <div className="relative flex h-full flex-col justify-between p-7">
                <div className="text-secondary">
                  <p className="font-black text-3xl uppercase mb-6">Chronos</p>
                  <div>
                    <p className="font-semibold text-sm uppercase tracking-widest">
                      Session Focus
                    </p>
                    <p className="text-8xl font-bold leading-none">
                      {shareData.focusLabel}
                    </p>
                  </div>

                  <p className="font-semibold mt-10 -mb-4">STATS</p>
                  <div className="grid grid-cols-2 text-secondary">
                    <div>
                      <p className="mt-3 text-7xl font-bold">
                        {shareData.cycleCount}
                      </p>
                      <p className="text-sm uppercase font-bold">Cycles</p>
                    </div>

                    <div>
                      <p className="mt-3 text-7xl font-bold">
                        {shareData.tasksCompleted}
                      </p>
                      <p className="text-sm uppercase font-bold">Tasks</p>
                    </div>
                  </div>
                </div>

                <div className="text-secondary">
                  <p className="text-xs uppercase">Date</p>
                  <p className="text-2xl font-bold leading-tight">
                    {shareData.sessionDateLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <p className="text-center text-sm text-red-400">{error}</p>
          ) : null}

          <div className="gap-2 flex justify-center">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isSaving}
              className="btn btn-work"
            >
              {isSaving ? "Saving" : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-default text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
