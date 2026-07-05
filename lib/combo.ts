// Streak combo tiers — a motivational multiplier that grows with the streak.
// Purely derived from the current streak (never stored), so it can't drift.

export interface ComboTier {
  multiplier: number;
  label: string;
  color: string;
}

export function comboTier(streak: number): ComboTier {
  if (streak >= 30) return { multiplier: 3, label: "🔥 On fire", color: "var(--flame-3)" };
  if (streak >= 14) return { multiplier: 2, label: "⚡ Blazing", color: "var(--flame-2)" };
  if (streak >= 7) return { multiplier: 1.5, label: "✨ Hot streak", color: "var(--gold)" };
  if (streak >= 3) return { multiplier: 1.2, label: "Warming up", color: "var(--accent-2)" };
  return { multiplier: 1, label: "", color: "var(--text-muted)" };
}

// Days until the next combo tier (for a "keep going" nudge). null at max.
export function daysToNextTier(streak: number): { days: number; next: number } | null {
  const thresholds = [3, 7, 14, 30];
  for (const t of thresholds) {
    if (streak < t) return { days: t - streak, next: t };
  }
  return null;
}
