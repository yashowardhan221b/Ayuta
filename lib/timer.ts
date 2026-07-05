import type { ActiveTimer } from "./types";
import { KEYS, readJSON, writeJSON, removeKey, notifyDataChanged } from "./storage";

export function getActiveTimer(): ActiveTimer | null {
  return readJSON<ActiveTimer | null>(KEYS.activeTimer, null);
}

export interface StartTimerOpts {
  note?: string;
  deliberate?: boolean;
}

export function startTimer(interestId: string, opts: StartTimerOpts = {}): ActiveTimer {
  const timer: ActiveTimer = {
    interestId,
    startedAt: new Date().toISOString(),
    note: opts.note,
    deliberate: opts.deliberate,
  };
  writeJSON(KEYS.activeTimer, timer);
  notifyDataChanged();
  return timer;
}

// Elapsed minutes computed purely from the persisted anchor timestamp — correct
// after any refresh or tab close/reopen, since no interval state is stored.
export function elapsedMinutes(timer: ActiveTimer, now: number = Date.now()): number {
  const start = new Date(timer.startedAt).getTime();
  return Math.max(0, (now - start) / 60000);
}

export interface StoppedTimer {
  interestId: string;
  startedAt: string;
  endedAt: string;
  rawMinutes: number;
  note?: string;
  deliberate?: boolean;
}

// Stops the clock and returns the raw session WITHOUT writing a TimeEntry — the
// confirm step (ConfirmSessionModal) is the single place an entry is written.
export function stopTimer(): StoppedTimer | null {
  const timer = getActiveTimer();
  if (!timer) return null;
  const endedAt = new Date().toISOString();
  const rawMinutes = elapsedMinutes(timer, new Date(endedAt).getTime());
  removeKey(KEYS.activeTimer);
  notifyDataChanged();
  return {
    interestId: timer.interestId,
    startedAt: timer.startedAt,
    endedAt,
    rawMinutes,
    note: timer.note,
    deliberate: timer.deliberate,
  };
}

export function cancelTimer(): void {
  removeKey(KEYS.activeTimer);
  notifyDataChanged();
}

// Anything longer than this prompts the "did you really practice this long?" guard.
export const LONG_SESSION_MINUTES = 180;
export const LONG_SESSION_CAP_MINUTES = 240;
