import type { Interest, TimeEntry } from "./types";
import { getLocalDateString } from "./streak";

// ---- Mastery % (relative to the interest's chosen Path target) ----
export function masteryPct(totalHours: number, targetHours: number): number {
  if (targetHours <= 0) return 0;
  return Math.min(100, Math.round((totalHours / targetHours) * 1000) / 10);
}

// ---- Dreyfus 5-stage model, scaled to the target ----
export interface Stage {
  key: string;
  name: string;
  minPct: number; // inclusive lower bound as % of target
}

export const STAGES: Stage[] = [
  { key: "novice", name: "Novice", minPct: 0 },
  { key: "advanced_beginner", name: "Advanced Beginner", minPct: 10 },
  { key: "competent", name: "Competent", minPct: 30 },
  { key: "proficient", name: "Proficient", minPct: 60 },
  { key: "expert", name: "Expert", minPct: 100 },
];

export function getStage(totalHours: number, targetHours: number): Stage {
  const pct = targetHours > 0 ? (totalHours / targetHours) * 100 : 0;
  let current = STAGES[0];
  for (const s of STAGES) {
    if (pct >= s.minPct) current = s;
  }
  return current;
}

// ---- XP / level (always recomputed from hours, never stored) ----
// 1 hour = 100 XP. Cumulative XP to reach level L = 25 * L * (L + 1),
// so each level costs 50 XP more than the last: fast early, slower later.
export function xpFromHours(hours: number): number {
  return Math.round(hours * 100);
}

export function levelFromXp(xp: number): number {
  if (xp <= 0) return 0;
  return Math.floor((-1 + Math.sqrt(1 + (8 * xp) / 50)) / 2);
}

export function xpForLevel(level: number): number {
  return 25 * level * (level + 1);
}

export interface LevelProgress {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForNext: number;
  percent: number; // 0-100 progress toward next level
}

export function levelProgress(hours: number): LevelProgress {
  const xp = xpFromHours(hours);
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const xpForNext = 50 * (level + 1);
  const xpIntoLevel = xp - base;
  const percent =
    xpForNext > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100)) : 0;
  return { level, xp, xpIntoLevel, xpForNext, percent };
}

// ---- Aggregate "Polymath Score" across ALL interests (incl. archived) ----
export interface PolymathSummary {
  totalHours: number;
  totalXp: number;
  level: number;
  pathsCompleted: number; // interests at >= 100% of their target
  activePursuits: number;
}

export function polymathSummary(
  interests: Interest[],
  entries: TimeEntry[]
): PolymathSummary {
  const minutesByInterest = new Map<string, number>();
  for (const e of entries) {
    minutesByInterest.set(
      e.interestId,
      (minutesByInterest.get(e.interestId) ?? 0) + e.durationMinutes
    );
  }
  const totalMinutes = entries.reduce((s, e) => s + e.durationMinutes, 0);
  const totalHours = totalMinutes / 60;

  let pathsCompleted = 0;
  for (const i of interests) {
    const hrs = (minutesByInterest.get(i.id) ?? 0) / 60;
    if (i.targetHours > 0 && hrs >= i.targetHours) pathsCompleted += 1;
  }

  return {
    totalHours,
    totalXp: xpFromHours(totalHours),
    level: levelFromXp(xpFromHours(totalHours)),
    pathsCompleted,
    activePursuits: interests.filter((i) => !i.archivedAt).length,
  };
}

// ---- Projected time to target at recent pace ----
// Uses a trailing 28-day window to estimate a weekly pace.
export interface Projection {
  weeklyPaceHours: number;
  remainingHours: number;
  weeksToTarget: number | null; // null when there isn't enough recent activity
  etaLabel: string;
}

export function projectTimeToTarget(
  entries: TimeEntry[],
  totalHours: number,
  targetHours: number,
  today: string = getLocalDateString()
): Projection {
  const remainingHours = Math.max(0, targetHours - totalHours);

  const [ty, tm, td] = today.split("-").map(Number);
  const cutoff = new Date(ty, tm - 1, td);
  cutoff.setDate(cutoff.getDate() - 27);

  let windowMinutes = 0;
  for (const e of entries) {
    const [ey, em, ed] = e.date.split("-").map(Number);
    const date = new Date(ey, em - 1, ed);
    if (date >= cutoff) windowMinutes += e.durationMinutes;
  }
  const weeklyPaceHours = windowMinutes / 60 / 4; // 28 days ≈ 4 weeks

  if (remainingHours <= 0) {
    return {
      weeklyPaceHours,
      remainingHours: 0,
      weeksToTarget: 0,
      etaLabel: "Target reached 🎉",
    };
  }
  if (weeklyPaceHours <= 0) {
    return {
      weeklyPaceHours: 0,
      remainingHours,
      weeksToTarget: null,
      etaLabel: "Log a few sessions to see a projection",
    };
  }

  const weeks = remainingHours / weeklyPaceHours;
  return {
    weeklyPaceHours,
    remainingHours,
    weeksToTarget: weeks,
    etaLabel: formatEta(weeks),
  };
}

function formatEta(weeks: number): string {
  if (weeks < 1) return "Less than a week to go at this pace";
  if (weeks < 8) return `~${Math.round(weeks)} weeks at this pace`;
  const months = weeks / 4.345;
  if (months < 18) return `~${Math.round(months)} months at this pace`;
  const years = weeks / 52;
  return `~${years.toFixed(1)} years at this pace`;
}

export function formatHours(hours: number): string {
  if (hours >= 100) return `${Math.round(hours)}h`;
  if (hours >= 10) return `${hours.toFixed(0)}h`;
  return `${hours.toFixed(1)}h`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
