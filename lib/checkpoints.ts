import type { Checkpoint, CheckpointOverride, Interest, TimeEntry } from "./types";
import { KEYS, readJSON, writeJSON, uid, notifyDataChanged } from "./storage";
import { distinctActiveDays } from "./streak";

const MAJOR_STAGES: { key: string; label: string; pct: number }[] = [
  { key: "advanced_beginner", label: "Advanced Beginner", pct: 10 },
  { key: "competent", label: "Competent", pct: 30 },
  { key: "proficient", label: "Proficient", pct: 60 },
  { key: "expert", label: "Expert", pct: 100 },
];

// % of target used for the frequent "mini" hour checkpoints (majors excluded).
const MINI_PCTS = [20, 40, 50, 70, 80, 90];

const HABIT_DAYS: { days: number; label: string }[] = [
  { days: 7, label: "7-day habit" },
  { days: 21, label: "21-day habit" },
  { days: 66, label: "66-day habit" },
  { days: 90, label: "90-day habit" },
];

function roundHours(h: number): number {
  return Math.round(h * 10) / 10;
}

// Pure: derive the default checkpoint ladder from an interest's target.
export function generateCheckpoints(
  interest: Pick<Interest, "targetHours">
): Checkpoint[] {
  const t = interest.targetHours;
  const cps: Checkpoint[] = [];
  const usedHourThresholds = new Set<number>();

  const addHours = (cp: Checkpoint) => {
    if (usedHourThresholds.has(cp.threshold)) return;
    usedHourThresholds.add(cp.threshold);
    cps.push(cp);
  };

  // Early quick wins.
  addHours({
    id: "mini-h-first",
    kind: "mini",
    metric: "hours",
    threshold: 0.0001,
    label: "First session",
  });
  addHours({
    id: "mini-h-1",
    kind: "mini",
    metric: "hours",
    threshold: 1,
    label: "First hour",
  });

  // Major Dreyfus stages.
  for (const s of MAJOR_STAGES) {
    addHours({
      id: `major-${s.key}`,
      kind: "major",
      metric: "hours",
      threshold: roundHours((t * s.pct) / 100),
      label: s.label,
      blurbKey: "dreyfus",
    });
  }

  // Mini hour milestones between the majors.
  for (const pct of MINI_PCTS) {
    addHours({
      id: `mini-h-${pct}`,
      kind: "mini",
      metric: "hours",
      threshold: roundHours((t * pct) / 100),
      label: `${pct}% there`,
    });
  }

  // Habit day checkpoints (consistency of showing up).
  for (const h of HABIT_DAYS) {
    cps.push({
      id: `habit-d-${h.days}`,
      kind: "mini",
      metric: "days",
      threshold: h.days,
      label: h.label,
      blurbKey: "habit",
    });
  }

  return cps;
}

// ---- Overrides persistence ----
type OverrideMap = Record<string, CheckpointOverride[]>;

export function getAllOverrides(): OverrideMap {
  return readJSON<OverrideMap>(KEYS.checkpointOverrides, {});
}

export function getOverrides(interestId: string): CheckpointOverride[] {
  return getAllOverrides()[interestId] ?? [];
}

function persistOverrides(map: OverrideMap): void {
  writeJSON(KEYS.checkpointOverrides, map);
  notifyDataChanged();
}

export function upsertOverride(
  interestId: string,
  override: CheckpointOverride
): void {
  const map = getAllOverrides();
  const list = map[interestId] ?? [];
  const idx = list.findIndex((o) => o.id === override.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...override };
  else list.push(override);
  map[interestId] = list;
  persistOverrides(map);
}

export function addCustomCheckpoint(
  interestId: string,
  cp: Omit<Checkpoint, "id">
): void {
  const id = uid("cp_");
  upsertOverride(interestId, { id, custom: { ...cp, id } });
}

export function removeOverride(interestId: string, id: string): void {
  const map = getAllOverrides();
  map[interestId] = (map[interestId] ?? []).filter((o) => o.id !== id);
  persistOverrides(map);
}

// Merge generated defaults with the user's overrides.
export function getCheckpoints(interest: Interest): Checkpoint[] {
  const overrides = getOverrides(interest.id);
  const overrideById = new Map(overrides.map((o) => [o.id, o]));
  const base = generateCheckpoints(interest);

  const merged: Checkpoint[] = [];
  for (const cp of base) {
    const o = overrideById.get(cp.id);
    if (o?.disabled) continue;
    merged.push({
      ...cp,
      label: o?.label ?? cp.label,
      threshold: o?.threshold ?? cp.threshold,
    });
  }
  // Custom, user-added checkpoints.
  for (const o of overrides) {
    if (o.custom && !o.disabled && !base.some((b) => b.id === o.id)) {
      merged.push(o.custom);
    }
  }

  return merged.sort((a, b) => {
    if (a.metric !== b.metric) return a.metric === "hours" ? -1 : 1;
    return a.threshold - b.threshold;
  });
}

// ---- Reached state (derived from data) ----
export interface CheckpointStatus extends Checkpoint {
  reached: boolean;
  current: number; // current hours or days toward this checkpoint
}

export function getCheckpointStatuses(
  interest: Interest,
  interestEntries: TimeEntry[]
): CheckpointStatus[] {
  const totalHours =
    interestEntries.reduce((s, e) => s + e.durationMinutes, 0) / 60;
  const days = distinctActiveDays(interestEntries);
  return getCheckpoints(interest).map((cp) => {
    const current = cp.metric === "hours" ? totalHours : days;
    return { ...cp, current, reached: current >= cp.threshold };
  });
}

export function getNextCheckpoint(
  statuses: CheckpointStatus[]
): CheckpointStatus | undefined {
  const upcomingHours = statuses
    .filter((s) => s.metric === "hours" && !s.reached)
    .sort((a, b) => a.threshold - b.threshold);
  if (upcomingHours.length) return upcomingHours[0];
  const upcomingDays = statuses
    .filter((s) => s.metric === "days" && !s.reached)
    .sort((a, b) => a.threshold - b.threshold);
  return upcomingDays[0];
}

// ---- "Seen" tracking so a reached checkpoint is celebrated exactly once ----
function seenKey(interestId: string, checkpointId: string): string {
  return `${interestId}:${checkpointId}`;
}

export function getSeen(): string[] {
  return readJSON<string[]>(KEYS.checkpointSeen, []);
}

// Returns newly-reached checkpoints not yet celebrated, and marks them seen.
export function collectNewlyReached(
  interest: Interest,
  interestEntries: TimeEntry[]
): CheckpointStatus[] {
  const statuses = getCheckpointStatuses(interest, interestEntries);
  const seen = new Set(getSeen());
  const fresh: CheckpointStatus[] = [];
  for (const s of statuses) {
    const key = seenKey(interest.id, s.id);
    if (s.reached && !seen.has(key)) {
      fresh.push(s);
      seen.add(key);
    }
  }
  if (fresh.length) writeJSON(KEYS.checkpointSeen, [...seen]);
  return fresh;
}
