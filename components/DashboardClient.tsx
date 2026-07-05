"use client";

import Link from "next/link";
import { useLiveData, useHydrated } from "@/lib/hooks";
import {
  getActiveInterests,
  getArchivedInterests,
  getAllInterests,
} from "@/lib/interests";
import { getAllEntries } from "@/lib/timeEntries";
import { polymathSummary, formatHours } from "@/lib/gamification";
import { computeStreak, isStreakAtRisk } from "@/lib/streak";
import { buildInterestSummary } from "@/lib/summary";
import InterestCard from "./InterestCard";
import StatTile from "./StatTile";
import EmptyState from "./EmptyState";

export default function DashboardClient() {
  const hydrated = useHydrated();
  const [data] = useLiveData(() => ({
    active: getActiveInterests(),
    all: getAllInterests(),
    archivedCount: getArchivedInterests().length,
    entries: getAllEntries(),
  }));

  if (!hydrated) {
    return <div className="h-40 rounded-2xl bg-surface animate-pulse" />;
  }

  const { active, all, archivedCount, entries } = data;
  // Aggregate score counts ALL interests (incl. archived) — cumulative investment.
  const poly = polymathSummary(all, entries);
  const streak = computeStreak(entries);
  const atRisk = isStreakAtRisk(entries);

  const entriesByInterest = new Map<string, typeof entries>();
  for (const e of entries) {
    if (!entriesByInterest.has(e.interestId)) entriesByInterest.set(e.interestId, []);
    entriesByInterest.get(e.interestId)!.push(e);
  }

  if (active.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          icon="🌱"
          title="Start your first pursuit"
          body="Pick something you want to get better at — an instrument, a language, code, anything. Choose how far you want to take it, and start logging the hours."
          ctaHref="/new"
          ctaLabel="+ Add an interest"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* Polymath hero */}
      <section className="rounded-2xl border border-border bg-gradient-to-b from-raised to-surface p-5">
        <div className="text-xs uppercase tracking-wide text-muted">
          Polymath Level
        </div>
        <div className="flex items-end gap-3">
          <div className="text-5xl font-bold tabular-nums">{poly.level}</div>
          <div className="text-sm text-muted mb-1.5">
            {formatHours(poly.totalHours)} logged all-time
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatTile
            label="Day streak"
            value={`🔥 ${streak.currentStreak}`}
            accent="var(--gold)"
          />
          <StatTile label="Paths done" value={poly.pathsCompleted} />
          <StatTile label="Active pursuits" value={poly.activePursuits} />
        </div>
        {atRisk && (
          <div className="mt-3 text-xs text-gold">
            🔥 Your {streak.currentStreak}-day streak is alive but you haven&apos;t
            logged today — a few minutes keeps it going.
          </div>
        )}
      </section>

      {/* Interests */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted">Your pursuits</h2>
          <Link href="/new" className="text-sm text-accent">
            + Add
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {active.map((interest) => (
            <InterestCard
              key={interest.id}
              summary={buildInterestSummary(
                interest,
                entriesByInterest.get(interest.id) ?? []
              )}
            />
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

function Header() {
  return (
    <div className="pt-1">
      <h1 className="text-2xl font-bold tracking-tight md:hidden">
        Ayuta <span className="text-dim text-base font-normal">अयुत</span>
      </h1>
      <p className="text-sm text-muted md:mt-1">
        Every hour counts toward mastery. Keep the deposits visible.
      </p>
    </div>
  );
}
