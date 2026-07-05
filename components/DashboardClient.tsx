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
import AnimatedNumber from "./AnimatedNumber";
import DailyGoalRing from "./DailyGoalRing";
import OnboardingFlow from "./OnboardingFlow";

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
    <div className="space-y-6">
      <Header />

      {/* Polymath hero */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative rounded-3xl glass-raised p-6 overflow-hidden"
      >
        <div
          className="absolute -top-16 -left-10 h-48 w-48 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: "var(--accent-2)" }}
        />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.25em] text-accent-2 font-bold">
            Polymath Level
          </div>
          <div className="flex items-end gap-3 mt-1">
            <AnimatedNumber
              value={poly.level}
              className="text-6xl font-black gradient-text leading-none"
            />
            <div className="text-sm text-muted mb-2 tabnums">
              <AnimatedNumber value={poly.totalHours} decimals={1} suffix="h" />{" "}
              logged all-time
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {combo.multiplier > 1 && (
              <span
                className="text-[11px] font-bold rounded-full px-2.5 py-1"
                style={{
                  color: combo.color,
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${combo.color}`,
                }}
              >
                {combo.label} · {combo.multiplier}× combo
              </span>
            )}
            {freezes > 0 && (
              <span
                className="text-[11px] font-bold rounded-full px-2.5 py-1 text-mini"
                style={{ background: "rgba(56,189,248,0.12)", border: "1px solid var(--mini)" }}
                title="Streak freezes protect your streak if you miss a day"
              >
                ❄️ {freezes} freeze{freezes > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <HeroStat
              label="Day streak"
              value={
                <span className="inline-flex items-center gap-1">
                  {streak.currentStreak > 0 && <span className="flame">🔥</span>}
                  <AnimatedNumber value={streak.currentStreak} />
                </span>
              }
              accent="var(--flame-2)"
            />
            <HeroStat
              label="Paths done"
              value={<AnimatedNumber value={poly.pathsCompleted} />}
              accent="var(--gold)"
            />
            <HeroStat
              label="Pursuits"
              value={<AnimatedNumber value={poly.activePursuits} />}
              accent="var(--accent-2)"
            />
          </div>

          {atRisk && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-xs text-gold flex items-center gap-1.5"
            >
              <span className="flame">🔥</span>
              Your {streak.currentStreak}-day streak is alive — log anything today
              to keep it.
            </motion.div>
          )}
        </div>
      </motion.section>

      <DailyGoalRing goal={goal} />

      {/* Interests */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
            Your pursuits
          </h2>
          <Link href="/new" className="text-sm text-accent-2 font-semibold">
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

function HeroStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-black/20 border border-border px-3 py-2.5 text-center">
      <div className="text-xl font-black tabnums" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-[11px] text-muted mt-0.5">{label}</div>
    </div>
  );
}

function Header() {
  return (
    <div className="pt-1">
      <h1 className="text-2xl font-black tracking-tight md:hidden">
        <span className="gradient-text">Ayuta</span>{" "}
        <span className="text-dim text-base font-normal">अयुत</span>
      </h1>
      <p className="text-sm text-muted md:mt-1">
        Every hour counts toward mastery. Keep the deposits visible.
      </p>
    </div>
  );
}
