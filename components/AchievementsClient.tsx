"use client";

import { useHydrated, useLiveData } from "@/lib/hooks";
import { BADGE_CATALOG, getUnlockedBadges, type BadgeDef } from "@/lib/badges";
import BadgeCard from "./BadgeCard";

const CATEGORY_LABEL: Record<BadgeDef["category"], string> = {
  milestone: "Milestones",
  path: "Paths",
  streak: "Streaks",
  polymath: "Polymath",
};

export default function AchievementsClient() {
  const hydrated = useHydrated();
  const [unlocked] = useLiveData(() => getUnlockedBadges());

  if (!hydrated) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse" />;
  }

  const countByBadge = new Map<string, number>();
  for (const b of unlocked) {
    countByBadge.set(b.badgeId, (countByBadge.get(b.badgeId) ?? 0) + 1);
  }

  const totalUnlocked = BADGE_CATALOG.filter((d) =>
    countByBadge.has(d.id)
  ).length;

  const categories: BadgeDef["category"][] = [
    "milestone",
    "path",
    "streak",
    "polymath",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Achievements</h1>
        <p className="text-sm text-muted">
          {totalUnlocked} of {BADGE_CATALOG.length} unlocked
        </p>
      </div>

      {categories.map((cat) => {
        const defs = BADGE_CATALOG.filter((d) => d.category === cat);
        return (
          <section key={cat}>
            <h2 className="text-sm font-semibold text-muted mb-3">
              {CATEGORY_LABEL[cat]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {defs.map((def) => (
                <BadgeCard
                  key={def.id}
                  def={def}
                  unlocked={countByBadge.has(def.id)}
                  count={countByBadge.get(def.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
