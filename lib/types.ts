// ---- Core domain types for Ayuta ----

export type PathId = "dabble" | "hobbyist" | "serious" | "mastery" | "custom";

export interface PathChange {
  pathId: PathId;
  targetHours: number;
  changedAt: string; // ISO
}

export interface Interest {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // hex
  pathId: PathId;
  targetHours: number; // from preset (20/100/1000/10000) or custom
  category?: string;
  createdAt: string; // ISO
  archivedAt: string | null; // archive preserves history
  pathHistory: PathChange[]; // record of promotions
}

export type TimeEntrySource = "timer" | "manual";

export interface TimeEntry {
  id: string;
  interestId: string;
  date: string; // "YYYY-MM-DD" LOCAL date this session counts toward
  startedAt: string | null; // ISO; null for pure manual entries
  endedAt: string | null;
  durationMinutes: number; // authoritative value used everywhere
  source: TimeEntrySource;
  deliberate?: boolean; // Ericsson: was this focused/deliberate practice?
  note?: string;
  createdAt: string; // when the record was written
}

export type CheckpointKind = "mini" | "major";
export type CheckpointMetric = "hours" | "days";

export interface Checkpoint {
  id: string; // stable, e.g. "major-competent" / "mini-h-50" / "habit-d-66"
  kind: CheckpointKind;
  metric: CheckpointMetric; // hours logged, or distinct active days
  threshold: number; // hours or days
  label: string;
  blurbKey?: string; // link into lib/frameworks.ts
}

export interface CheckpointOverride {
  id: string; // matches a generated Checkpoint id, or a new custom id
  label?: string;
  threshold?: number;
  disabled?: boolean;
  custom?: Checkpoint; // fully user-defined checkpoint
}

export interface ActiveTimer {
  interestId: string;
  startedAt: string; // ISO — original start (recorded on the entry)
  runningSince: string | null; // ISO — when the current run began; null = paused
  accumulatedMs: number; // elapsed time banked before the current run
  note?: string;
  deliberate?: boolean;
}

export interface StreakState {
  lastActiveDate: string; // "YYYY-MM-DD" local — cache
  currentStreak: number;
  longestStreak: number;
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string; // ISO
  interestId?: string;
}

export interface Settings {
  weekStartsOn: 0 | 1; // 0=Sun, 1=Mon
  defaultTargetHours: number;
  dailyGoalMinutes?: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reduceEffects?: boolean;
  displayName?: string;
}

// Shape of a full export / import bundle.
export interface DataBundle {
  schemaVersion: number;
  exportedAt: string;
  interests: Interest[];
  entries: TimeEntry[];
  checkpointOverrides: Record<string, CheckpointOverride[]>;
  checkpointSeen: string[];
  streak: StreakState | null;
  badges: UnlockedBadge[];
  settings: Settings | null;
  freezes?: unknown;
}
