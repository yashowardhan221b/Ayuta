"use client";

import Link from "next/link";
import { useHydrated, useLiveData } from "@/lib/hooks";
import { getAllInterests } from "@/lib/interests";
import { getAllEntries } from "@/lib/timeEntries";
import { getUnlockedBadges, BADGE_CATALOG, getBadgeDef } from "@/lib/badges";
import { getSettings, updateSettings } from "@/lib/settings";
import { polymathSummary, formatHours, getStage } from "@/lib/gamification";
import { streakWithFreezes } from "@/lib/freezes";
import { getLocalDateString } from "@/lib/streak";
import { withAlpha } from "@/lib/colors";
import AnimatedNumber from "./AnimatedNumber";
import StageBadge from "./StageBadge";
import EmptyState from "./EmptyState";

const HOUR_MILESTONES = [
  { h: 10, label: "First 10 hours", icon: "🌱" },
  { h: 100, label: "A hundred hours", icon: "🎨" },
  { h: 1000, label: "A thousand hours", icon: "⚙️" },
  { h: 10000, label: "Ten thousand hours", icon: "👑" },
];

export default function ProfileClient() {
  const hydrated = useHydrated();
  const [data, refresh] = useLiveData(() => ({
    interests: getAllInterests(),
    entries: getAllEntries(),
    badges: getUnlockedBadges(),
    settings: getSettings(),
  }));

  if (!hydrated) return <div className="h-64 rounded-3xl glass animate-pulse" />;

  const { interests, entries, badges, settings } = data;
  if (entries.length === 0 && interests.length === 0) {
    return (
      <EmptyState
        icon="🦋"
        title="No profile yet"
        body="Add a pursuit and log some time — your identity, milestones, and trophies will grow here."
        ctaHref="/new"
        ctaLabel="+ Add a pursuit"
      />
    );
  }

  const poly = polymathSummary(interests, entries);
  const streak = streakWithFreezes(entries);
  const since = earliestDate(entries);
  const unlockedCount = BADGE_CATALOG.filter((d) =>
    badges.some((b) => b.badgeId === d.id)
  ).length;

  const minutesById = new Map<string, number>();
  for (const e of entries)
    minutesById.set(e.interestId, (minutesById.get(e.interestId) ?? 0) + e.durationMinutes);
  const activePursuits = interests
    .filter((i) => !i.archivedAt && (minutesById.get(i.id) ?? 0) > 0)
    .map((i) => ({ i, hours: (minutesById.get(i.id) ?? 0) / 60 }))
    .sort((a, b) => b.hours - a.hours);

  const recentBadges = [...badges]
    .sort((a, b) => (b.unlockedAt || "").localeCompare(a.unlockedAt || ""))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Identity */}
      <section className="rounded-3xl glass-raised p-5 flex items-center gap-4">
        <div
          className="h-16 w-16 rounded-2xl grid place-items-center overflow-hidden shrink-0"
          style={{ background: withAlpha("#f97316", 0.18) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/monarch-4.webp" alt="" className="h-full w-full object-contain p-1.5" />
        </div>
        <div className="min-w-0 flex-1">
          <input
            value={settings.displayName ?? ""}
            onChange={(e) => {
              updateSettings({ displayName: e.target.value });
              refresh();
            }}
            placeholder="Polymath"
            aria-label="Display name"
            className="w-full bg-transparent text-xl font-black tracking-tight outline-none placeholder:text-dim"
          />
          <div className="text-xs text-muted">
            Level {poly.level} · {formatHours(poly.totalHours)} lifetime
            {since && <> · since {since}</>}
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Day streak" value={`🔥 ${streak.currentStreak}`} />
        <Stat label="Longest" value={streak.longestStreak} />
        <Stat label="Trophies" value={`${unlockedCount}/${BADGE_CATALOG.length}`} />
      </div>

      {/* Hour milestones */}
      <section className="rounded-2xl glass p-4">
        <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">
          The 10,000-hour road
        </h2>
        <ol className="relative border-l border-border ml-2 space-y-3">
          {HOUR_MILESTONES.map((m) => {
            const reached = poly.totalHours >= m.h;
            const isNext = !reached && poly.totalHours < m.h &&
              !HOUR_MILESTONES.some((x) => x.h < m.h && poly.totalHours < x.h);
            return (
              <li key={m.h} className="ml-4">
                <span
                  className={`absolute -left-[7px] h-3.5 w-3.5 rounded-full ${isNext ? "pulse-ring" : ""}`}
                  style={{
                    background: reached ? "var(--accent)" : "var(--bg)",
                    border: reached ? "none" : "1px solid var(--border)",
                    boxShadow: reached ? "0 0 8px var(--accent)" : undefined,
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${reached ? "" : "text-muted"}`}>
                    {m.icon} {m.label}
                  </span>
                  <span className="text-xs text-dim tabnums">
                    {reached ? "✓" : `${formatHours(Math.max(0, m.h - poly.totalHours))} to go`}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Mastery per pursuit */}
      {activePursuits.length > 0 && (
        <section className="rounded-2xl glass p-4">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">
            Mastery
          </h2>
          <div className="space-y-2.5">
            {activePursuits.map(({ i, hours }) => (
              <Link key={i.id} href={`/interests/${i.id}`} className="flex items-center gap-2.5">
                <span className="text-lg">{i.icon}</span>
                <span className="flex-1 truncate text-sm">{i.name}</span>
                <StageBadge stage={getStage(hours, i.targetHours)} size="sm" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trophies */}
      <section className="rounded-2xl glass p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
            Trophies
          </h2>
          <Link href="/achievements" className="text-xs text-accent">
            See all →
          </Link>
        </div>
        {recentBadges.length === 0 ? (
          <p className="text-sm text-dim">No trophies yet — keep logging to unlock them.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recentBadges.map((b, idx) => {
              const def = getBadgeDef(b.badgeId);
              if (!def) return null;
              return (
                <div
                  key={idx}
                  title={def.name}
                  className="h-11 w-11 rounded-xl grid place-items-center text-xl border border-gold/40 bg-gold/5"
                >
                  {def.icon}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass px-3 py-2.5 text-center">
      <div className="text-lg font-black tabnums">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
      <div className="text-[11px] text-muted mt-0.5">{label}</div>
    </div>
  );
}

function earliestDate(entries: { date: string }[]): string | null {
  if (entries.length === 0) return null;
  const min = entries.map((e) => e.date).sort()[0];
  const [y, m] = min.split("-").map(Number);
  const today = getLocalDateString();
  if (min > today) return null;
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
