import type { UnlockedBadge } from "./types";
import { getAllInterests, getInterest } from "./interests";
import { getAllEntries, getEntriesForInterest } from "./timeEntries";
import { computeStreak } from "./streak";
import { evaluateBadges } from "./badges";
import { collectNewlyReached, type CheckpointStatus } from "./checkpoints";
import { getSettings } from "./settings";
import { polymathSummary } from "./gamification";
import { getFreezeState, earnFreezes } from "./freezes";
import { KEYS, readJSON, writeJSON } from "./storage";

export interface MutationResult {
  newBadges: UnlockedBadge[];
  newCheckpoints: CheckpointStatus[];
  levelUp?: number; // new polymath level, if it just increased
}

// Call after any time is logged/edited/removed. Recomputes the streak cache,
// evaluates badges, and collects newly-reached checkpoints for celebration.
export function recomputeAfterMutation(interestId?: string): MutationResult {
  const entries = getAllEntries();
  const interests = getAllInterests();
  const streak = computeStreak(entries, undefined, getFreezeState().frozenDates);
  writeJSON(KEYS.streak, streak);
  earnFreezes(streak.currentStreak);
  const { weekStartsOn } = getSettings();

  const newBadges = evaluateBadges(interests, entries, streak, weekStartsOn);

  let newCheckpoints: CheckpointStatus[] = [];
  if (interestId) {
    const interest = getInterest(interestId);
    if (interest) {
      newCheckpoints = collectNewlyReached(
        interest,
        getEntriesForInterest(interestId)
      );
    }
  }

  // Polymath level-up detection (compare against last-seen level).
  // Seed with the current level on first run (so pre-existing data doesn't
  // trigger a spurious level-up), then always persist so real jumps are caught.
  const level = polymathSummary(interests, entries).level;
  const lastLevel = readJSON<number>(KEYS.lastPolyLevel, level);
  const levelUp = level > lastLevel ? level : undefined;
  writeJSON(KEYS.lastPolyLevel, level);

  return { newBadges, newCheckpoints, levelUp };
}
