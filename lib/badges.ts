import type { Interest, StreakState, TimeEntry, UnlockedBadge } from "./types";
import { KEYS, readJSON, writeJSON, notifyDataChanged } from "./storage";
import { getLocalDateString } from "./streak";

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  perInterest: boolean;
  category: "milestone" | "streak" | "polymath" | "path";
}

export const BADGE_CATALOG: BadgeDef[] = [
  { id: "first_step", name: "First Step", icon: "👣", description: "Log your very first session.", perInterest: false, category: "milestone" },
  { id: "hour_one", name: "Hour One", icon: "⏱️", description: "Reach 1 hour on a single interest.", perInterest: true, category: "milestone" },
  { id: "perspiration", name: "Perspiration", icon: "💧", description: "Reach 10 hours on a single interest.", perInterest: true, category: "milestone" },
  { id: "century", name: "Century", icon: "💯", description: "Reach 100 hours on a single interest.", perInterest: true, category: "milestone" },
  { id: "grinder", name: "Grinder", icon: "⛏️", description: "Reach 1,000 hours on a single interest.", perInterest: true, category: "milestone" },
  { id: "ten_thousand", name: "Ten Thousand Hours", icon: "🏔️", description: "Reach 10,000 hours on a single interest.", perInterest: true, category: "milestone" },

  { id: "path_dabble", name: "Dabbler", icon: "🌱", description: "Complete a Dabble path (reach its target).", perInterest: true, category: "path" },
  { id: "path_hobbyist", name: "Hobbyist", icon: "🎨", description: "Complete a Hobbyist path.", perInterest: true, category: "path" },
  { id: "path_serious", name: "Committed", icon: "⚙️", description: "Complete a Serious path.", perInterest: true, category: "path" },
  { id: "path_mastery", name: "Master", icon: "👑", description: "Complete a Mastery path.", perInterest: true, category: "path" },

  { id: "week_warrior", name: "Week Warrior", icon: "🔥", description: "Hold a 7-day streak.", perInterest: false, category: "streak" },
  { id: "monthly_devotion", name: "Monthly Devotion", icon: "🌙", description: "Hold a 30-day streak.", perInterest: false, category: "streak" },
  { id: "centurion", name: "Centurion", icon: "🛡️", description: "Hold a 100-day streak.", perInterest: false, category: "streak" },
  { id: "iron_will", name: "Iron Will", icon: "⚔️", description: "Hold a 365-day streak.", perInterest: false, category: "streak" },

  { id: "polymath_bronze", name: "Polymath (Bronze)", icon: "🥉", description: "Log time across 3 interests in one week.", perInterest: false, category: "polymath" },
  { id: "polymath_silver", name: "Polymath (Silver)", icon: "🥈", description: "Log time across 5 interests in one week.", perInterest: false, category: "polymath" },
  { id: "polymath_gold", name: "Polymath (Gold)", icon: "🥇", description: "Log time across 8 interests in one week.", perInterest: false, category: "polymath" },
  { id: "comeback", name: "Comeback", icon: "🔄", description: "Return to an interest after a 14+ day break.", perInterest: false, category: "polymath" },
  { id: "renaissance", name: "Renaissance", icon: "🎭", description: "Keep 5+ active interests each with at least 1 hour.", perInterest: false, category: "polymath" },
];

export function getBadgeDef(id: string): BadgeDef | undefined {
  return BADGE_CATALOG.find((b) => b.id === id);
}

function weekStartKey(dateStr: string, weekStartsOn: 0 | 1): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay(); // 0=Sun..6=Sat
  const diff = (day - weekStartsOn + 7) % 7;
  dt.setDate(dt.getDate() - diff);
  return getLocalDateString(dt);
}

// Recompute the full set of earned badge keys from current data.
function computeEarnedKeys(
  interests: Interest[],
  entries: TimeEntry[],
  streak: StreakState,
  weekStartsOn: 0 | 1
): Set<string> {
  const keys = new Set<string>();
  if (entries.length > 0) keys.add("first_step");

  // Per-interest hour totals.
  const minutesById = new Map<string, number>();
  for (const e of entries) {
    minutesById.set(
      e.interestId,
      (minutesById.get(e.interestId) ?? 0) + e.durationMinutes
    );
  }

  const HOUR_BADGES: [number, string][] = [
    [1, "hour_one"],
    [10, "perspiration"],
    [100, "century"],
    [1000, "grinder"],
    [10000, "ten_thousand"],
  ];

  for (const i of interests) {
    const hrs = (minutesById.get(i.id) ?? 0) / 60;
    for (const [thr, id] of HOUR_BADGES) {
      if (hrs >= thr) keys.add(`${id}:${i.id}`);
    }
    // Path completion.
    if (i.targetHours > 0 && hrs >= i.targetHours) {
      const pathBadge: Record<string, string> = {
        dabble: "path_dabble",
        hobbyist: "path_hobbyist",
        serious: "path_serious",
        mastery: "path_mastery",
      };
      const id = pathBadge[i.pathId];
      if (id) keys.add(`${id}:${i.id}`);
    }
  }

  // Streak badges (by longest ever, so they stay earned).
  const best = streak.longestStreak;
  if (best >= 7) keys.add("week_warrior");
  if (best >= 30) keys.add("monthly_devotion");
  if (best >= 100) keys.add("centurion");
  if (best >= 365) keys.add("iron_will");

  // Polymath weekly: max distinct interests in any single week.
  const weekInterests = new Map<string, Set<string>>();
  for (const e of entries) {
    const wk = weekStartKey(e.date, weekStartsOn);
    if (!weekInterests.has(wk)) weekInterests.set(wk, new Set());
    weekInterests.get(wk)!.add(e.interestId);
  }
  let maxPerWeek = 0;
  for (const s of weekInterests.values()) maxPerWeek = Math.max(maxPerWeek, s.size);
  if (maxPerWeek >= 3) keys.add("polymath_bronze");
  if (maxPerWeek >= 5) keys.add("polymath_silver");
  if (maxPerWeek >= 8) keys.add("polymath_gold");

  // Comeback: a 14+ day gap between consecutive sessions on the same interest.
  const byInterestDates = new Map<string, string[]>();
  for (const e of entries) {
    if (!byInterestDates.has(e.interestId)) byInterestDates.set(e.interestId, []);
    byInterestDates.get(e.interestId)!.push(e.date);
  }
  for (const dates of byInterestDates.values()) {
    const sorted = [...new Set(dates)].sort();
    for (let i = 1; i < sorted.length; i++) {
      if (daysBetween(sorted[i - 1], sorted[i]) >= 14) {
        keys.add("comeback");
        break;
      }
    }
  }

  // Renaissance: 5+ active interests each with >= 1 hour.
  const activeWithHour = interests.filter(
    (i) => !i.archivedAt && (minutesById.get(i.id) ?? 0) / 60 >= 1
  ).length;
  if (activeWithHour >= 5) keys.add("renaissance");

  return keys;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((db - da) / 86400000);
}

export function getUnlockedBadges(): UnlockedBadge[] {
  return readJSON<UnlockedBadge[]>(KEYS.badges, []);
}

// Idempotent: appends only genuinely-new unlocks. Returns the newly unlocked ones.
export function evaluateBadges(
  interests: Interest[],
  entries: TimeEntry[],
  streak: StreakState,
  weekStartsOn: 0 | 1 = 1
): UnlockedBadge[] {
  const earned = computeEarnedKeys(interests, entries, streak, weekStartsOn);
  const stored = getUnlockedBadges();
  const storedKeys = new Set(
    stored.map((b) => (b.interestId ? `${b.badgeId}:${b.interestId}` : b.badgeId))
  );

  const now = new Date().toISOString();
  const fresh: UnlockedBadge[] = [];
  for (const key of earned) {
    if (storedKeys.has(key)) continue;
    const [badgeId, interestId] = key.split(":");
    fresh.push({ badgeId, interestId, unlockedAt: now });
  }
  if (fresh.length) {
    writeJSON(KEYS.badges, [...stored, ...fresh]);
    notifyDataChanged();
  }
  return fresh;
}
