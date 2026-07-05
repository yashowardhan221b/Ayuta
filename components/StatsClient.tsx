"use client";

import { useHydrated, useLiveData } from "@/lib/hooks";
import { getAllInterests } from "@/lib/interests";
import { getAllEntries } from "@/lib/timeEntries";
import { computeStreak, getLocalDateString, distinctActiveDays } from "@/lib/streak";
import { formatHours, polymathSummary } from "@/lib/gamification";
import StatTile from "./StatTile";
import EmptyState from "./EmptyState";

export default function StatsClient() {
  const hydrated = useHydrated();
  const [data] = useLiveData(() => ({
    interests: getAllInterests(),
    entries: getAllEntries(),
  }));

  if (!hydrated) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse" />;
  }

  const { interests, entries } = data;
  if (entries.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No stats yet"
        body="Once you start logging time, your trends and breakdowns show up here."
        ctaHref="/log"
        ctaLabel="Log your first session"
      />
    );
  }

  const totalMinutes = entries.reduce((s, e) => s + e.durationMinutes, 0);
  const deliberateMinutes = entries
    .filter((e) => e.deliberate)
    .reduce((s, e) => s + e.durationMinutes, 0);
  const deliberatePct =
    totalMinutes > 0 ? Math.round((deliberateMinutes / totalMinutes) * 100) : 0;
  const streak = computeStreak(entries);
  const poly = polymathSummary(interests, entries);

  // Hours per interest (active + archived), sorted.
  const minutesById = new Map<string, number>();
  for (const e of entries) {
    minutesById.set(e.interestId, (minutesById.get(e.interestId) ?? 0) + e.durationMinutes);
  }
  const perInterest = interests
    .map((i) => ({ interest: i, hours: (minutesById.get(i.id) ?? 0) / 60 }))
    .filter((x) => x.hours > 0)
    .sort((a, b) => b.hours - a.hours);
  const maxHours = Math.max(...perInterest.map((x) => x.hours), 1);

  // Weekly trend — last 8 weeks (Mon-based).
  const weeks = buildWeeklyTrend(entries, 8);
  const maxWeek = Math.max(...weeks.map((w) => w.hours), 0.1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Your stats</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatTile label="Total time" value={formatHours(totalMinutes / 60)} />
        <StatTile label="Sessions" value={entries.length} />
        <StatTile label="Active days" value={distinctActiveDays(entries)} />
        <StatTile
          label="Deliberate"
          value={`${deliberatePct}%`}
          accent="var(--accent)"
        />
        <StatTile label="Polymath lvl" value={poly.level} />
        <StatTile label="Paths done" value={poly.pathsCompleted} />
        <StatTile label="Streak" value={`🔥 ${streak.currentStreak}`} />
        <StatTile label="Best streak" value={streak.longestStreak} />
      </div>

      {/* Weekly trend */}
      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted mb-3">
          Last 8 weeks
        </h2>
        <div className="flex items-end gap-2 h-32">
          {weeks.map((w) => (
            <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t bg-accent/70"
                  style={{ height: `${(w.hours / maxWeek) * 100}%` }}
                  title={`${formatHours(w.hours)}`}
                />
              </div>
              <div className="text-[10px] text-dim">{w.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Hours by interest */}
      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted mb-3">By interest</h2>
        <div className="space-y-2.5">
          {perInterest.map(({ interest, hours }) => (
            <div key={interest.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="truncate">
                  {interest.icon} {interest.name}
                  {interest.archivedAt && (
                    <span className="text-dim"> · archived</span>
                  )}
                </span>
                <span className="text-muted tabular-nums">
                  {formatHours(hours)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(hours / maxHours) * 100}%`,
                    background: interest.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function buildWeeklyTrend(
  entries: { date: string; durationMinutes: number }[],
  numWeeks: number
): { label: string; hours: number }[] {
  const today = new Date();
  const monday = new Date(today);
  const dow = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - dow); // this week's Monday

  const buckets: { start: string; label: string; minutes: number }[] = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const start = new Date(monday);
    start.setDate(start.getDate() - i * 7);
    const label = `${start.getMonth() + 1}/${start.getDate()}`;
    buckets.push({ start: getLocalDateString(start), label, minutes: 0 });
  }

  for (const e of entries) {
    for (let b = buckets.length - 1; b >= 0; b--) {
      if (e.date >= buckets[b].start) {
        buckets[b].minutes += e.durationMinutes;
        break;
      }
    }
  }
  return buckets.map((b) => ({ label: b.label, hours: b.minutes / 60 }));
}
