"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLiveData, useHydrated } from "@/lib/hooks";
import {
  getActiveInterests,
  getArchivedInterests,
  getAllInterests,
} from "@/lib/interests";
import { getAllEntries } from "@/lib/timeEntries";
import { polymathSummary } from "@/lib/gamification";
import { isStreakAtRisk } from "@/lib/streak";
import { streakWithFreezes, applyAutoFreeze, getFreezeState } from "@/lib/freezes";
import { comboTier } from "@/lib/combo";
import {
  dailyGoal,
  shouldCelebrateDailyGoal,
  markDailyGoalCelebrated,
} from "@/lib/dailyGoal";
import { celebrate } from "@/lib/celebrate";
import { burst } from "@/lib/confetti";
import { playSound, haptic } from "@/lib/feedback";
import { buildInterestSummary } from "@/lib/summary";
import InterestCard from "./InterestCard";
import OnboardingFlow from "./OnboardingFlow";
import OctopusHero from "./OctopusHero";

export default function DashboardClient() {
  const hydrated = useHydrated();
  const [data, refresh] = useLiveData(() => ({
    active: getActiveInterests(),
    all: getAllInterests(),
    archivedCount: getArchivedInterests().length,
    entries: getAllEntries(),
  }));

  // On load: auto-bridge missed days with freezes, and fire the daily-goal
  // celebration once per day when the target is hit.
  useEffect(() => {
    if (!hydrated) return;
    const entries = getAllEntries();
    const { applied } = applyAutoFreeze(entries);
    if (applied.length) refresh();
    if (shouldCelebrateDailyGoal(entries)) {
      markDailyGoalCelebrated();
      celebrate([
        {
          icon: "🎯",
          title: "Daily goal complete!",
          subtitle: "Nice work today",
          tone: "badge",
        },
      ]);
      void burst(["#58cc02", "#34d399", "#ffd21e"]);
      playSound("levelup");
      haptic([12, 30, 12]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) {
    return <div className="h-56 rounded-3xl glass animate-pulse" />;
  }

  const { active, all, archivedCount, entries } = data;
  const poly = polymathSummary(all, entries);
  const streak = streakWithFreezes(entries);
  const atRisk = isStreakAtRisk(entries, undefined, getFreezeState().frozenDates);
  const combo = comboTier(streak.currentStreak);
  const freezes = getFreezeState().available;
  const goal = dailyGoal(entries);

  const entriesByInterest = new Map<string, typeof entries>();
  for (const e of entries) {
    if (!entriesByInterest.has(e.interestId)) entriesByInterest.set(e.interestId, []);
    entriesByInterest.get(e.interestId)!.push(e);
  }

  if (active.length === 0) {
    return <OnboardingFlow />;
  }

  return (
    <div className="space-y-5">
      <OctopusHero
        level={poly.level}
        totalHours={poly.totalHours}
        streakDays={streak.currentStreak}
        atRisk={atRisk}
        combo={combo}
        freezes={freezes}
        goal={goal}
      />

      {/* Interests */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
              Your pursuits
            </h2>
            <p className="text-[11px] text-dim mt-0.5">
              {poly.activePursuits} active · {poly.pathsCompleted} paths complete
            </p>
          </div>
          <Link href="/new" className="text-sm text-accent font-semibold">
            + Add
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {active.map((interest, i) => (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: "spring", stiffness: 300, damping: 26 }}
            >
              <InterestCard
                summary={buildInterestSummary(
                  interest,
                  entriesByInterest.get(interest.id) ?? []
                )}
              />
            </motion.div>
          ))}
        </div>
        {archivedCount > 0 && (
          <Link
            href="/settings"
            className="mt-3 inline-block text-xs text-dim hover:text-muted"
          >
            {archivedCount} archived — manage in Settings
          </Link>
        )}
      </section>
    </div>
  );
}

