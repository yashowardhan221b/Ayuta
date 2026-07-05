import type { Interest, TimeEntry } from "./types";
import {
  masteryPct,
  getStage,
  levelProgress,
  type Stage,
  type LevelProgress,
} from "./gamification";
import {
  getCheckpointStatuses,
  getNextCheckpoint,
  type CheckpointStatus,
} from "./checkpoints";

export interface InterestSummary {
  interest: Interest;
  totalHours: number;
  mastery: number;
  stage: Stage;
  level: LevelProgress;
  next?: CheckpointStatus;
  reachedCount: number;
  totalCheckpoints: number;
}

export function buildInterestSummary(
  interest: Interest,
  interestEntries: TimeEntry[]
): InterestSummary {
  const totalHours =
    interestEntries.reduce((s, e) => s + e.durationMinutes, 0) / 60;
  const statuses = getCheckpointStatuses(interest, interestEntries);
  return {
    interest,
    totalHours,
    mastery: masteryPct(totalHours, interest.targetHours),
    stage: getStage(totalHours, interest.targetHours),
    level: levelProgress(totalHours),
    next: getNextCheckpoint(statuses),
    reachedCount: statuses.filter((s) => s.reached).length,
    totalCheckpoints: statuses.length,
  };
}
