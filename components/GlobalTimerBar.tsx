"use client";

import { useEffect, useState } from "react";
import { useHydrated, useLiveData } from "@/lib/hooks";
import {
  getActiveTimer,
  stopTimer,
  cancelTimer,
  pauseTimer,
  resumeTimer,
  isPaused,
  elapsedMs,
} from "@/lib/timer";
import { feedback } from "@/lib/feedback";
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
  const paused = isPaused(timer);
  const totalSec = Math.floor(elapsedMs(timer, now) / 1000);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;
  const clock = `${hh > 0 ? `${hh}:` : ""}${String(mm).padStart(hh > 0 ? 2 : 1, "0")}:${String(
    ss
  ).padStart(2, "0")}`;

  const togglePause = () => {
    if (paused) resumeTimer();
    else pauseTimer();
    feedback("tap", 10);
    refresh();
  };

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
      className="sticky top-0 z-30 border-b bg-bg2/80 backdrop-blur-xl"
      style={{
        borderColor: interest ? `${interest.color}66` : undefined,
        boxShadow: interest ? `0 6px 24px -12px ${interest.color}` : undefined,
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-3">
        <span className="relative text-xl" aria-hidden>
          {interest?.icon ?? "⏱️"}
          <span
            className={`absolute -top-0.5 -right-1 h-2 w-2 rounded-full ${
              paused ? "opacity-40" : "pulse-ring"
            }`}
            style={{ background: interest?.color ?? "var(--accent)" }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">
            {interest?.name ?? "Timing…"}
          </div>
          <div className="text-xs text-muted">
            {paused
              ? "Paused"
              : timer.deliberate
              ? "Deliberate practice"
              : "In session"}
          </div>
        </div>
        <div
          className="font-mono text-lg tabular-nums"
          style={{ color: paused ? "var(--text-muted)" : interest?.color }}
        >
          {clock}
        </div>
        <button
          onClick={togglePause}
          className="rounded-lg border border-border-strong px-3 py-1.5 text-sm font-semibold min-h-[36px]"
          style={{ color: interest?.color }}
          title={paused ? "Resume" : "Pause"}
        >
          {paused ? "▶" : "❚❚"}
        </button>
        <button
          onClick={handleStop}
          className="rounded-xl bg-cta-grad px-4 py-1.5 text-sm font-semibold text-white min-h-[36px] shadow-glow"
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
