import type { Interest, PathId } from "./types";
import { KEYS, readJSON, writeJSON, uid, notifyDataChanged } from "./storage";
import { getPreset } from "./paths";

export function getAllInterests(): Interest[] {
  return readJSON<Interest[]>(KEYS.interests, []);
}

export function getInterest(id: string): Interest | undefined {
  return getAllInterests().find((i) => i.id === id);
}

export function getActiveInterests(): Interest[] {
  return getAllInterests()
    .filter((i) => !i.archivedAt)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getArchivedInterests(): Interest[] {
  return getAllInterests().filter((i) => i.archivedAt);
}

function persist(interests: Interest[]): void {
  writeJSON(KEYS.interests, interests);
  notifyDataChanged();
}

export interface NewInterestInput {
  name: string;
  icon: string;
  color: string;
  pathId: PathId;
  targetHours: number;
  category?: string;
}

export function createInterest(input: NewInterestInput): Interest {
  const now = new Date().toISOString();
  const interest: Interest = {
    id: uid("int_"),
    name: input.name.trim(),
    icon: input.icon,
    color: input.color,
    pathId: input.pathId,
    targetHours: Math.max(1, Math.round(input.targetHours)),
    category: input.category?.trim() || undefined,
    createdAt: now,
    archivedAt: null,
    pathHistory: [
      { pathId: input.pathId, targetHours: input.targetHours, changedAt: now },
    ],
  };
  persist([...getAllInterests(), interest]);
  return interest;
}

export function updateInterest(
  id: string,
  patch: Partial<Pick<Interest, "name" | "icon" | "color" | "category">>
): void {
  const interests = getAllInterests().map((i) =>
    i.id === id
      ? {
          ...i,
          ...patch,
          name: patch.name?.trim() ?? i.name,
          category:
            patch.category !== undefined
              ? patch.category.trim() || undefined
              : i.category,
        }
      : i
  );
  persist(interests);
}

// Promote (or change) an interest's Path. Hours are never touched — they carry over.
export function promoteInterest(
  id: string,
  pathId: PathId,
  customHours?: number
): void {
  const preset = getPreset(pathId);
  const targetHours =
    pathId === "custom"
      ? Math.max(1, Math.round(customHours ?? 0))
      : preset?.targetHours ?? customHours ?? 0;
  const now = new Date().toISOString();
  const interests = getAllInterests().map((i) =>
    i.id === id
      ? {
          ...i,
          pathId,
          targetHours,
          pathHistory: [...i.pathHistory, { pathId, targetHours, changedAt: now }],
        }
      : i
  );
  persist(interests);
}

export function archiveInterest(id: string): void {
  const interests = getAllInterests().map((i) =>
    i.id === id ? { ...i, archivedAt: new Date().toISOString() } : i
  );
  persist(interests);
}

export function unarchiveInterest(id: string): void {
  const interests = getAllInterests().map((i) =>
    i.id === id ? { ...i, archivedAt: null } : i
  );
  persist(interests);
}

// Hard delete — also caller's responsibility to clear the interest's entries.
export function deleteInterest(id: string): void {
  persist(getAllInterests().filter((i) => i.id !== id));
}
