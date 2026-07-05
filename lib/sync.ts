import type { UnlockedBadge } from "./types";
import { getAllInterests, getInterest } from "./interests";
import { getAllEntries, getEntriesForInterest } from "./timeEntries";
import { refreshStreakCache } from "./streak";
import { evaluateBadges } from "./badges";
import { collectNewlyReached, type CheckpointStatus } from "./checkpoints";
import { getSettings } from "./settings";

export interface MutationResult {
  newBadges: UnlockedBadge[];
  newCheckpoints: CheckpointStatus[];
}

// Call after any time is logged/edited/removed. Recomputes the streak cache,
// evaluates badges, and collects newly-reached checkpoints for celebration.
export function recomputeAfterMutation(interestId?: string): MutationResult {
  const entries = getAllEntries();
  const interests = getAllInterests();
  const streak = refreshStreakCache(entries);
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

  return { newBadges, newCheckpoints };
}
