import type { TimeEntry } from "./types";
import { KEYS, readJSON, writeJSON } from "./storage";
import { getSettings } from "./settings";
import { getLocalDateString } from "./streak";

export interface DailyGoal {
  minutes: number;
  goal: number;
  pct: number;
  done: boolean;
}

export function minutesToday(
  entries: TimeEntry[],
  today: string = getLocalDateString()
): number {
  return entries
    .filter((e) => e.date === today)
    .reduce((s, e) => s + e.durationMinutes, 0);
}

export function dailyGoal(
  entries: TimeEntry[],
  today: string = getLocalDateString()
): DailyGoal {
  const goal = Math.max(1, getSettings().dailyGoalMinutes ?? 30);
  const minutes = minutesToday(entries, today);
  return {
    minutes,
    goal,
    pct: Math.min(100, (minutes / goal) * 100),
    done: minutes >= goal,
  };
}

// Fire the daily-goal celebration at most once per local day.
export function shouldCelebrateDailyGoal(
  entries: TimeEntry[],
  today: string = getLocalDateString()
): boolean {
  if (!dailyGoal(entries, today).done) return false;
  return readJSON<string>(KEYS.dailyGoalDate, "") !== today;
}

export function markDailyGoalCelebrated(today: string = getLocalDateString()): void {
  writeJSON(KEYS.dailyGoalDate, today);
}
