import type { ActiveTimer } from "./types";
import { KEYS, readJSON, writeJSON, removeKey, notifyDataChanged } from "./storage";

// Normalise older timer records (pre pause/resume) to the current shape.
function normalize(raw: ActiveTimer | null): ActiveTimer | null {
  if (!raw) return null;
  if (typeof raw.accumulatedMs === "number" && raw.runningSince !== undefined) {
    return raw;
  }
  return {
    interestId: raw.interestId,
    startedAt: raw.startedAt,
    runningSince: raw.startedAt, // treat legacy timer as running since its start
    accumulatedMs: 0,
    note: raw.note,
    deliberate: raw.deliberate,
  };
}

export function getActiveTimer(): ActiveTimer | null {
  return normalize(readJSON<ActiveTimer | null>(KEYS.activeTimer, null));
}

export interface StartTimerOpts {
  note?: string;
  deliberate?: boolean;
}

export function startTimer(interestId: string, opts: StartTimerOpts = {}): ActiveTimer {
  const nowISO = new Date().toISOString();
  const timer: ActiveTimer = {
    interestId,
    startedAt: nowISO,
    runningSince: nowISO,
    accumulatedMs: 0,
    note: opts.note,
    deliberate: opts.deliberate,
  };
  writeJSON(KEYS.activeTimer, timer);
  notifyDataChanged();
  return timer;
}

export function isPaused(timer: ActiveTimer): boolean {
  return timer.runningSince === null;
}

// Elapsed ms from banked time + the current run — correct after any refresh,
// since only timestamps are persisted (no interval state).
export function elapsedMs(timer: ActiveTimer, now: number = Date.now()): number {
  const running = timer.runningSince ? now - new Date(timer.runningSince).getTime() : 0;
  return Math.max(0, timer.accumulatedMs + Math.max(0, running));
}

export function elapsedMinutes(timer: ActiveTimer, now: number = Date.now()): number {
  return elapsedMs(timer, now) / 60000;
}

export function pauseTimer(): void {
  const timer = getActiveTimer();
  if (!timer || timer.runningSince === null) return;
  const banked = elapsedMs(timer);
  writeJSON(KEYS.activeTimer, {
    ...timer,
    accumulatedMs: banked,
    runningSince: null,
  });
  notifyDataChanged();
}

export function resumeTimer(): void {
  const timer = getActiveTimer();
  if (!timer || timer.runningSince !== null) return;
  writeJSON(KEYS.activeTimer, {
    ...timer,
    runningSince: new Date().toISOString(),
  });
  notifyDataChanged();
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
