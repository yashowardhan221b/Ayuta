"use client";

import { useLiveData } from "@/lib/hooks";
import { getActiveTimer, startTimer } from "@/lib/timer";

export default function StartTimerButton({
  interestId,
  className = "",
  label = "Start timer",
  compact = false,
}: {
  interestId: string;
  className?: string;
  label?: string;
  compact?: boolean;
}) {
  const [active, refresh] = useLiveData(() => getActiveTimer());
  const runningThis = active?.interestId === interestId;
  const runningOther = active && active.interestId !== interestId;

  const onClick = () => {
    if (runningThis) return;
    if (runningOther) {
      const ok = window.confirm(
        "A timer is already running for another interest. Starting this one will discard that session. Continue?"
      );
      if (!ok) return;
    }
    startTimer(interestId);
    refresh();
  };

  return (
    <button
      onClick={onClick}
      disabled={runningThis}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium min-h-[40px] transition-colors ${
        runningThis
          ? "bg-raised text-muted cursor-default"
          : "bg-accent text-white hover:opacity-90"
      } ${compact ? "px-3" : "px-4 py-2"} ${className}`}
    >
      {runningThis ? "⏱️ Running…" : `▶ ${label}`}
    </button>
  );
}
