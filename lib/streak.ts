import type { StreakState, TimeEntry } from "./types";
import { KEYS, readJSON, writeJSON } from "./storage";

// LOCAL date string — deliberately NOT toISOString(), which uses UTC and would
// miscount a session logged near local midnight in a non-UTC timezone.
export function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftDate(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return getLocalDateString(dt);
}

// Derive the streak fresh from the data every time. This is robust to backdated
// manual entries, which would corrupt an incrementally-bumped counter.
// `frozenDates` are days bridged by a streak freeze — counted as active.
export function computeStreak(
  entries: TimeEntry[],
  today: string = getLocalDateString(),
  frozenDates: string[] = []
): StreakState {
  const activeDays = new Set([...entries.map((e) => e.date), ...frozenDates]);

  // Longest run anywhere in history.
  let longest = 0;
  if (activeDays.size > 0) {
    const sorted = [...activeDays].sort();
    let run = 1;
    longest = 1;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === shiftDate(sorted[i - 1], 1)) {
        run += 1;
      } else {
        run = 1;
      }
      if (run > longest) longest = run;
    }
  }

  // Current streak: walk back from today (or yesterday if today is empty but
  // yesterday was active — the streak is alive, just at risk).
  let cursor = today;
  if (!activeDays.has(cursor)) {
    const yesterday = shiftDate(today, -1);
    if (activeDays.has(yesterday)) {
      cursor = yesterday;
    } else {
      return { lastActiveDate: cursor, currentStreak: 0, longestStreak: longest };
    }
  }
  let current = 0;
  while (activeDays.has(cursor)) {
    current += 1;
    cursor = shiftDate(cursor, -1);
  }

  return {
    lastActiveDate: [...activeDays].sort().pop() ?? today,
    currentStreak: current,
    longestStreak: Math.max(longest, current),
  };
}

// True when there's still a streak to protect but nothing logged today yet.
export function isStreakAtRisk(
  entries: TimeEntry[],
  today: string = getLocalDateString(),
  frozenDates: string[] = []
): boolean {
  const activeDays = new Set([...entries.map((e) => e.date), ...frozenDates]);
  return !activeDays.has(today) && activeDays.has(shiftDate(today, -1));
}

export { shiftDate };

// Days fully skipped between the most recent active day and today (exclusive).
export function missedDaysBeforeToday(
  entries: TimeEntry[],
  today: string = getLocalDateString(),
  frozenDates: string[] = []
): string[] {
  const active = new Set([...entries.map((e) => e.date), ...frozenDates]);
  if (active.size === 0) return [];
  const past = [...active].filter((d) => d < today).sort();
  const lastActive = past.pop();
  if (!lastActive) return [];
  const missed: string[] = [];
  let cursor = shiftDate(lastActive, 1);
  while (cursor < today) {
    if (!active.has(cursor)) missed.push(cursor);
    cursor = shiftDate(cursor, 1);
  }
  return missed;
}

// Recompute and cache the streak (cache is convenience only, never source of truth).
export function refreshStreakCache(entries: TimeEntry[]): StreakState {
  const streak = computeStreak(entries);
  writeJSON(KEYS.streak, streak);
  return streak;
}

export function getCachedStreak(): StreakState {
  return readJSON<StreakState>(KEYS.streak, {
    lastActiveDate: getLocalDateString(),
    currentStreak: 0,
    longestStreak: 0,
  });
}

// Count of distinct local days on which any of the given entries were logged.
export function distinctActiveDays(entries: TimeEntry[]): number {
  return new Set(entries.map((e) => e.date)).size;
}
