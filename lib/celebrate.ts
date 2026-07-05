import type { MutationResult } from "./sync";
import { getBadgeDef } from "./badges";

export interface CelebrationItem {
  icon: string;
  title: string;
  subtitle: string;
}

export function celebrate(items: CelebrationItem[]): void {
  if (typeof window === "undefined" || items.length === 0) return;
  window.dispatchEvent(
    new CustomEvent<CelebrationItem[]>("ayuta:celebrate", { detail: items })
  );
}

// Turn the result of recomputeAfterMutation into celebration toasts.
export function celebrateMutation(result: MutationResult): void {
  const items: CelebrationItem[] = [];
  for (const cp of result.newCheckpoints) {
    items.push({
      icon: cp.kind === "major" ? "🏆" : "✨",
      title: cp.label,
      subtitle: cp.kind === "major" ? "Major checkpoint reached!" : "Checkpoint reached",
    });
  }
  for (const b of result.newBadges) {
    const def = getBadgeDef(b.badgeId);
    if (def) {
      items.push({ icon: def.icon, title: def.name, subtitle: "Badge unlocked!" });
    }
  }
  celebrate(items);
}
