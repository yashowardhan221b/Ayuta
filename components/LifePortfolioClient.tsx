"use client";

import Link from "next/link";
import { useHydrated, useLiveData } from "@/lib/hooks";
import { getAllInterests } from "@/lib/interests";
import { getAllEntries } from "@/lib/timeEntries";
import { polymathSummary, formatHours, getStage } from "@/lib/gamification";
import { distinctActiveDays, getLocalDateString } from "@/lib/streak";
import { withAlpha } from "@/lib/colors";
import { pathLabel } from "@/lib/paths";
import type { Interest, TimeEntry } from "@/lib/types";
import AnimatedNumber from "./AnimatedNumber";
import StatTile from "./StatTile";
import EmptyState from "./EmptyState";
import { PursuitIcon } from "./icons";

export default function LifePortfolioClient() {
  const hydrated = useHydrated();
  const [data] = useLiveData(() => ({
    interests: getAllInterests(),
    entries: getAllEntries(),
  }));

  if (!hydrated) return <div className="h-64 rounded-3xl glass animate-pulse" />;

  const { interests, entries } = data;
  if (entries.length === 0) {
    return (
      <EmptyState
        icon="🦋"
        title="Your portfolio is waiting"
        body="Every hour you log is an investment in who you're becoming. Start tracking and watch your life's work take shape here."
        ctaHref="/log"
        ctaLabel="Log your first hour"
      />
    );
  }

  const poly = polymathSummary(interests, entries);
  const minutesById = new Map<string, number>();
  for (const e of entries)
    minutesById.set(e.interestId, (minutesById.get(e.interestId) ?? 0) + e.durationMinutes);

  const slices = interests
    .map((i) => ({ interest: i, hours: (minutesById.get(i.id) ?? 0) / 60 }))
    .filter((s) => s.hours > 0)
    .sort((a, b) => b.hours - a.hours);
  const totalH = poly.totalHours || 1;

  const activeDays = distinctActiveDays(entries);
  const deliberateMin = entries.filter((e) => e.deliberate).reduce((s, e) => s + e.durationMinutes, 0);
  const totalMin = entries.reduce((s, e) => s + e.durationMinutes, 0);
  const deliberatePct = totalMin ? Math.round((deliberateMin / totalMin) * 100) : 0;
  const perWeek = weeklyPace(entries);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Life Portfolio</h1>
        <p className="text-sm text-muted">The life you&apos;re building, in hours.</p>
      </div>

      {/* Lifetime hero */}
      <section className="rounded-3xl glass-raised p-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.24em] text-accent font-bold">
          Lifetime invested
        </div>
        <div className="mt-1">
          <AnimatedNumber
            value={poly.totalHours}
            decimals={1}
            className="text-6xl font-black gradient-text leading-none"
          />
          <span className="text-2xl font-black gradient-text">h</span>
        </div>
        <p className="text-xs text-muted mt-2">
          across {slices.length} {slices.length === 1 ? "pursuit" : "pursuits"} ·
          Polymath level {poly.level}
        </p>
      </section>

      {/* Allocation donut */}
      <section className="rounded-2xl glass p-4">
        <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">
          Where your time goes
        </h2>
        <div className="flex items-center gap-5">
          <Donut slices={slices} total={totalH} />
          <div className="flex-1 min-w-0 space-y-1.5">
            {slices.slice(0, 6).map(({ interest, hours }) => (
              <div key={interest.id} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: interest.color }}
                />
                <span className="truncate flex-1 inline-flex items-center gap-1.5">
                  <PursuitIcon icon={interest.icon} size={16} /> {interest.name}
                </span>
                <span className="text-muted tabnums">
                  {Math.round((hours / totalH) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cumulative growth */}
      <section className="rounded-2xl glass p-4">
        <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">
          Hours accumulated
        </h2>
        <GrowthChart entries={entries} />
      </section>

      {/* Who you're becoming */}
      <section className="rounded-2xl glass p-4">
        <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">
          Who you&apos;re becoming
        </h2>
        <div className="space-y-3">
          {slices.slice(0, 4).map(({ interest, hours }) => {
            const stage = getStage(hours, interest.targetHours);
            return (
              <Link
                key={interest.id}
                href={`/interests/${interest.id}`}
                className="flex items-center gap-3"
              >
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
                  style={{ background: withAlpha(interest.color, 0.18) }}
                >
                  <PursuitIcon icon={interest.icon} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">
                    {stage.name} {interest.name}
                  </div>
                  <div className="text-xs text-muted">
                    {formatHours(hours)} · {pathLabel(interest)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Insight tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatTile label="Active days" value={activeDays} />
        <StatTile label="Per week" value={formatHours(perWeek)} accent="var(--accent)" />
        <StatTile label="Deliberate" value={`${deliberatePct}%`} accent="var(--gold)" />
        <StatTile label="Paths done" value={poly.pathsCompleted} accent="var(--correct)" />
      </div>

      <Link
        href="/stats"
        className="block text-center text-xs text-dim hover:text-muted"
      >
        See detailed statistics →
      </Link>
    </div>
  );
}

function Donut({
  slices,
  total,
}: {
  slices: { interest: Interest; hours: number }[];
  total: number;
}) {
  const size = 150, stroke = 26, r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      {slices.map(({ interest, hours }) => {
        const frac = hours / total;
        const len = frac * C;
        const el = (
          <circle
            key={interest.id}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={interest.color}
            strokeWidth={stroke}
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-offset}
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

function buildCumulative(entries: TimeEntry[]): { x: number; y: number }[] {
  const byDate = new Map<string, number>();
  for (const e of entries)
    byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.durationMinutes);
  const dates = [...byDate.keys()].sort();
  if (dates.length === 0) return [];
  const first = parseLocal(dates[0]);
  const last = parseLocal(getLocalDateString());
  const span = Math.max(1, (last - first) / 86400000);
  let cum = 0;
  const pts = dates.map((d) => {
    cum += byDate.get(d)! / 60;
    return { x: (parseLocal(d) - first) / 86400000 / span, y: cum };
  });
  // ensure it starts at 0 and ends at today
  pts.unshift({ x: 0, y: 0 });
  return pts;
}

function GrowthChart({ entries }: { entries: TimeEntry[] }) {
  const pts = buildCumulative(entries);
  const W = 320, H = 110, pad = 4;
  const maxY = Math.max(...pts.map((p) => p.y), 1);
  const X = (x: number) => pad + x * (W - pad * 2);
  const Y = (y: number) => H - pad - (y / maxY) * (H - pad * 2);
  const line = pts.map((p, i) => `${i ? "L" : "M"} ${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(" ");
  const area = `${line} L ${X(pts[pts.length - 1].x).toFixed(1)} ${H - pad} L ${X(0)} ${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 110 }}>
      <defs>
        <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#growthFill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={X(pts[pts.length - 1].x)} cy={Y(pts[pts.length - 1].y)} r={4} fill="var(--gold)" />
    </svg>
  );
}

function parseLocal(d: string): number {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).getTime();
}

function weeklyPace(entries: TimeEntry[]): number {
  const today = parseLocal(getLocalDateString());
  const cutoff = today - 27 * 86400000;
  const min = entries
    .filter((e) => parseLocal(e.date) >= cutoff)
    .reduce((s, e) => s + e.durationMinutes, 0);
  return min / 60 / 4;
}
