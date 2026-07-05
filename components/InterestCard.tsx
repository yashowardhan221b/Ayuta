"use client";

import Link from "next/link";
import type { InterestSummary } from "@/lib/summary";
import { formatHours } from "@/lib/gamification";
import { pathLabel } from "@/lib/paths";
import MasteryRing from "./MasteryRing";
import StageBadge from "./StageBadge";
import StartTimerButton from "./StartTimerButton";

export default function InterestCard({ summary }: { summary: InterestSummary }) {
  const { interest, totalHours, mastery, stage, next } = summary;
  const nextText = next
    ? next.metric === "hours"
      ? `${next.label} · ${formatHours(Math.max(0, next.threshold - next.current))} to go`
      : `${next.label} · ${Math.max(0, next.threshold - Math.floor(next.current))} days to go`
    : "All checkpoints cleared 🎉";

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
      <Link href={`/interests/${interest.id}`} className="flex items-center gap-3">
        <MasteryRing pct={mastery} size={64} stroke={6} color={interest.color}>
          <span className="text-lg">{interest.icon}</span>
        </MasteryRing>
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{interest.name}</div>
          <div className="text-xs text-muted">
            {formatHours(totalHours)} / {formatHours(interest.targetHours)} ·{" "}
            {pathLabel(interest)}
          </div>
          <div className="mt-1">
            <StageBadge stage={stage} size="sm" />
          </div>
        </div>
      </Link>

      <div className="text-xs text-muted flex items-center gap-1.5">
        <span className={next?.kind === "major" ? "text-major" : "text-mini"}>
          {next?.kind === "major" ? "🏆" : "✨"}
        </span>
        <span className="truncate">{nextText}</span>
      </div>

      <StartTimerButton interestId={interest.id} label="Start" className="w-full" />
    </div>
  );
}
