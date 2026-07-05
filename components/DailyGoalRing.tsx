"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import MasteryRing from "./MasteryRing";
import type { DailyGoal } from "@/lib/dailyGoal";

export default function DailyGoalRing({ goal }: { goal: DailyGoal }) {
  return (
    <Link href="/settings" className="block">
      <motion.div
        whileTap={{ scale: 0.96 }}
        className="rounded-3xl glass p-4 flex items-center gap-4"
      >
        <MasteryRing
          pct={goal.pct}
          size={72}
          stroke={8}
          color={goal.done ? "var(--cta-1)" : "var(--accent)"}
        >
          <span className="text-xl">{goal.done ? "✅" : "🎯"}</span>
        </MasteryRing>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted font-bold">
            Today&apos;s goal
          </div>
          <div className="text-lg font-bold tabnums">
            {Math.round(goal.minutes)} / {goal.goal} min
          </div>
          <div className="text-xs text-dim">
            {goal.done
              ? "Goal smashed — see you tomorrow 🎉"
              : `${Math.max(0, goal.goal - Math.round(goal.minutes))} min to go · tap to adjust`}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
