"use client";

import { useEffect, useState } from "react";
import { useHydrated, useLiveData } from "@/lib/hooks";
import { getActiveTimer, stopTimer, cancelTimer, elapsedMinutes } from "@/lib/timer";
import { getInterest } from "@/lib/interests";
import ConfirmSessionModal, { type PendingSession } from "./ConfirmSessionModal";

export default function GlobalTimerBar() {
  const hydrated = useHydrated();
  const [timer, refresh] = useLiveData(() => getActiveTimer());
  const [now, setNow] = useState<number>(Date.now());
  const [pending, setPending] = useState<PendingSession | null>(null);

  // Tick for display only — correctness comes from the persisted startedAt.
  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Server HTML has no timer — render nothing until hydration to avoid a mismatch.
  if (!hydrated) return null;

  if (!timer) {
    return pending ? (
      <ConfirmSessionModal
        key={pending.startedAt ?? "p"}
        session={pending}
        onDone={() => {
          setPending(null);
          refresh();
        }}
      />
    ) : null;
  }

  const interest = getInterest(timer.interestId);
  const mins = elapsedMinutes(timer, now);
  const secs = Math.floor(((now - new Date(timer.startedAt).getTime()) / 1000) % 60);
  const hh = Math.floor(mins / 60);
  const mm = Math.floor(mins % 60);
  const clock = `${hh > 0 ? `${hh}:` : ""}${String(mm).padStart(hh > 0 ? 2 : 1, "0")}:${String(
    secs
  ).padStart(2, "0")}`;

  const handleStop = () => {
    const stopped = stopTimer();
    refresh();
    if (stopped) {
      setPending({
        interestId: stopped.interestId,
        interestName: interest?.name ?? "Session",
        rawMinutes: stopped.rawMinutes,
        startedAt: stopped.startedAt,
        endedAt: stopped.endedAt,
        note: stopped.note,
        deliberate: stopped.deliberate,
      });
    }
  };

  const handleCancel = () => {
    cancelTimer();
    refresh();
  };

  return (
    <div
      className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur"
      style={{ borderColor: interest ? `${interest.color}55` : undefined }}
    >
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-3">
        <span className="text-xl" aria-hidden>
          {interest?.icon ?? "⏱️"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">
            {interest?.name ?? "Timing…"}
          </div>
          <div className="text-xs text-muted">
            {timer.deliberate ? "Deliberate practice" : "In session"}
          </div>
        </div>
        <div
          className="font-mono text-lg tabular-nums"
          style={{ color: interest?.color }}
        >
          {clock}
        </div>
        <button
          onClick={handleStop}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white min-h-[36px]"
        >
          Stop
        </button>
        <button
          onClick={handleCancel}
          className="rounded-lg border border-border px-2 py-1.5 text-xs text-muted hover:text-wrong min-h-[36px]"
          title="Discard without saving"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
