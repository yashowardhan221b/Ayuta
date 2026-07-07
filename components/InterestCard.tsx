"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { InterestSummary } from "@/lib/summary";
import { formatHours } from "@/lib/gamification";
import { pathLabel } from "@/lib/paths";
import { withAlpha } from "@/lib/colors";
import MasteryRing from "./MasteryRing";
import StageBadge from "./StageBadge";
import StartTimerButton from "./StartTimerButton";
import { PursuitIcon } from "./icons";

export default function InterestCard({ summary }: { summary: InterestSummary }) {
  const { interest, totalHours, mastery, stage, next } = summary;
  const nextText = next
    ? next.metric === "hours"
      ? `${next.label} · ${formatHours(Math.max(0, next.threshold - next.current))} to go`
      : `${next.label} · ${Math.max(0, next.threshold - Math.floor(next.current))} days to go`
    : "All checkpoints cleared 🎉";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="rounded-2xl glass p-4 flex flex-col gap-3 relative overflow-hidden"
      style={{ boxShadow: `0 10px 30px -12px ${withAlpha(interest.color, 0.5)}` }}
    >
      {/* colored corner glow */}
      <div
        className="absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl opacity-40 pointer-events-none"
        style={{ background: interest.color }}
      />

      <Link
        href={`/interests/${interest.id}`}
        className="flex items-center gap-3 relative"
      >
        <MasteryRing pct={mastery} size={64} stroke={6} color={interest.color}>
          <PursuitIcon icon={interest.icon} size={22} />
        </MasteryRing>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{interest.name}</div>
          <div className="text-xs text-muted tabnums">
            {formatHours(totalHours)} / {formatHours(interest.targetHours)} ·{" "}
            {pathLabel(interest)}
          </div>
          <div className="mt-1.5">
            <StageBadge stage={stage} size="sm" />
          </div>
        </div>
      </Link>

      <div className="text-xs text-muted flex items-center gap-1.5 relative">
        <span className={next?.kind === "major" ? "text-major" : "text-mini"}>
          {next?.kind === "major" ? "🏆" : "✨"}
        </span>
        <span className="truncate">{nextText}</span>
      </div>

      <StartTimerButton interestId={interest.id} label="Start" className="w-full" />
    </motion.div>
  );
}
