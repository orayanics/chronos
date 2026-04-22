import { useRef, useState } from "react";

import type { PSessionState } from "../schema";
import { exportElementAsPng, getShareSessionData } from "../share";

interface ShareSessionProps {
	isOpen: boolean;
	session: PSessionState;
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
					className="fixed inset-0 z-20 bg-black/30 backdrop-blur-xs mb-0"
					onClick={onClose}
				/>
			)}
			<div
				className={`w-100 absolute inset-0 left-0 right-0 top-0 mx-auto my-auto
			z-30 flex items-center justify-center mb-0 transition-opacity duration-300 ease-in-out
			${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
			>
				<div className="max-w-md rounded-lg bg-secondary p-10 space-y-4">
					<div className="text-center">
						<p className="text-xs uppercase tracking-[0.3em] text-primary/50">
							Share Session
						</p>
						<p className="text-sm text-primary/75">
							Save your Chronos recap as a PNG card.
						</p>
					</div>

					<div className="overflow-x-auto pb-2">
						<div
							ref={cardRef}
							className="mx-auto relative h-142 w-[320px] overflow-hidden
							border-2 border-secondary shadow-sm
							rounded-lg bg-secondary text-primary/75 text-shadow-lg"
						>
							<div className="absolute inset-0 bg-primary/10 blur-3xl" />
							<div className="absolute inset-0 h-36 w-36 bg-sage blur-3xl" />
							<div className="absolute -right-10 top-24 h-36 w-36 rounded-full bg-pinkish blur-3xl" />
							<div className="absolute -left-12 bottom-18 h-40 w-40 rounded-full bg-gold blur-3xl" />

							<div className="relative flex h-full flex-col justify-between p-7">
								<div>
									<p className="text-lg uppercase mb-6 tracking-widest">
										Chronos
									</p>
									<div className="space-y-2">
										<p className="text-sm uppercase tracking-widest">
											Session Focus
										</p>
										<p className="text-6xl font-bold leading-none">
											{shareData.focusLabel}
										</p>
										<p className="max-w-56 text-sm">
											minutes of focused work for this session!
										</p>
									</div>
								</div>

								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-3">
										<div>
											<p className="text-xs uppercase">Cycles</p>
											<p className="mt-3 text-4xl font-bold">
												{shareData.cycleCount}
											</p>
										</div>

										<div>
											<p className="text-xs uppercase">Date</p>
											<p className="mt-3 text-2xl font-bold leading-tight">
												{shareData.sessionDateLabel}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{!error ? (
						<p className="text-center text-sm text-red-400">{error}</p>
					) : null}

					<div className="gap-4 flex justify-center">
						<button
							type="button"
							onClick={handleDownload}
							disabled={isSaving}
							className="cursor-pointer rounded-lg bg-primary px-4 py-3 text-sm text-secondary shadow-sm shadow-primary/30 transition hover:shadow-primary/45 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSaving ? "Saving..." : "Save PNG"}
						</button>

						<button
							type="button"
							onClick={onClose}
							className="cursor-pointer rounded-lg border border-primary/15 px-4 py-3 text-sm text-primary/75 transition hover:bg-primary/5"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
