import type { MutationResult } from "./sync";
import { getBadgeDef } from "./badges";
import { burst, bigCelebration } from "./confetti";
import { playSound, haptic } from "./feedback";

export interface CelebrationItem {
  icon: string;
  title: string;
  subtitle: string;
  tone?: "mini" | "major" | "badge";
}

export function celebrate(items: CelebrationItem[]): void {
  if (typeof window === "undefined" || items.length === 0) return;
  window.dispatchEvent(
    new CustomEvent<CelebrationItem[]>("ayuta:celebrate", { detail: items })
  );
}

export function fireLevelUp(level: number): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<number>("ayuta:levelup", { detail: level })
  );
  void bigCelebration();
  playSound("levelup");
  haptic([18, 40, 18]);
}

// Turn the result of recomputeAfterMutation into toasts, confetti and sound.
export function celebrateMutation(result: MutationResult): void {
  const items: CelebrationItem[] = [];
  let hadMajor = false;

  for (const cp of result.newCheckpoints) {
    const major = cp.kind === "major";
    hadMajor = hadMajor || major;
    items.push({
      icon: major ? "🏆" : "✨",
      title: cp.label,
      subtitle: major ? "Major checkpoint!" : "Checkpoint reached",
      tone: major ? "major" : "mini",
    });
  }
  for (const b of result.newBadges) {
    const def = getBadgeDef(b.badgeId);
    if (def) {
      if (def.category === "path") hadMajor = true;
      items.push({
        icon: def.icon,
        title: def.name,
        subtitle: "Badge unlocked!",
        tone: "badge",
      });
    }
  }

  if (items.length > 0) {
    celebrate(items);
    playSound(result.newBadges.length ? "badge" : "checkpoint");
    haptic(hadMajor ? [12, 30, 12] : 14);
    void (hadMajor ? bigCelebration() : burst());
  }

  if (result.levelUp) fireLevelUp(result.levelUp);
}
