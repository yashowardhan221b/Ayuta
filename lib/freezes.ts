import type { TimeEntry } from "./types";
import { KEYS, readJSON, writeJSON, notifyDataChanged } from "./storage";
import { computeStreak, missedDaysBeforeToday, getLocalDateString } from "./streak";

export interface FreezeState {
  available: number;
  frozenDates: string[];
  claimedMilestone: number; // highest 7-day milestone that granted a freeze
}

const MAX_FREEZES = 3;
const DEFAULT: FreezeState = {
  available: 0,
  frozenDates: [],
  claimedMilestone: 0,
};

export function getFreezeState(): FreezeState {
  return { ...DEFAULT, ...readJSON<Partial<FreezeState>>(KEYS.freezes, {}) };
}

function persist(state: FreezeState): void {
  writeJSON(KEYS.freezes, state);
}

// Grant one freeze for each newly-crossed 7-day streak milestone (capped).
export function earnFreezes(currentStreak: number): FreezeState {
  const state = getFreezeState();
  const milestone = Math.floor(currentStreak / 7) * 7;
  if (milestone > state.claimedMilestone) {
    const newMilestones = (milestone - state.claimedMilestone) / 7;
    state.available = Math.min(MAX_FREEZES, state.available + newMilestones);
    state.claimedMilestone = milestone;
    persist(state);
  }
  return state;
}

// Auto-bridge fully-missed days with available freezes, but only if the whole
// gap can be covered (a partial cover wouldn't save the streak anyway).
export function applyAutoFreeze(
  entries: TimeEntry[],
  today: string = getLocalDateString()
): { applied: string[]; state: FreezeState } {
  const state = getFreezeState();
  const missed = missedDaysBeforeToday(entries, today, state.frozenDates);
  if (missed.length === 0 || missed.length > state.available) {
    return { applied: [], state };
  }
  state.frozenDates = [...new Set([...state.frozenDates, ...missed])];
  state.available -= missed.length;
  persist(state);
  notifyDataChanged();
  return { applied: missed, state };
}

// Streak that accounts for frozen days.
export function streakWithFreezes(
  entries: TimeEntry[],
  today: string = getLocalDateString()
) {
  return computeStreak(entries, today, getFreezeState().frozenDates);
}
