"use client";

import { useLiveData } from "@/lib/hooks";
import { getActiveTimer, startTimer } from "@/lib/timer";
import Pressable from "./Pressable";

export default function StartTimerButton({
  interestId,
  className = "",
  label = "Start timer",
}: {
  interestId: string;
  className?: string;
  label?: string;
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
    <Pressable
      onClick={onClick}
      disabled={runningThis}
      sound={runningThis ? null : "tap"}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-bold uppercase tracking-wide min-h-[44px] px-4 transition-colors ${
        runningThis
          ? "bg-raised text-muted"
          : "bg-cta-grad text-white shadow-cta"
      } ${className}`}
    >
      {runningThis ? "⏱️ Running…" : `▶ ${label}`}
    </Pressable>
  );
}
