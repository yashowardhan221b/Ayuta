import type { DataBundle } from "./types";
import {
  KEYS,
  SCHEMA_VERSION,
  readJSON,
  writeJSON,
  notifyDataChanged,
} from "./storage";
import { getLocalDateString } from "./streak";

export function exportBundle(): DataBundle {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    interests: readJSON(KEYS.interests, []),
    entries: readJSON(KEYS.entries, []),
    checkpointOverrides: readJSON(KEYS.checkpointOverrides, {}),
    checkpointSeen: readJSON(KEYS.checkpointSeen, []),
    streak: readJSON(KEYS.streak, null),
    badges: readJSON(KEYS.badges, []),
    settings: readJSON(KEYS.settings, null),
    freezes: readJSON(KEYS.freezes, null),
  };
}

export function exportFilename(): string {
  return `ayuta-backup-${getLocalDateString()}.json`;
}

export function downloadBundle(): void {
  const data = JSON.stringify(exportBundle(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFilename();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export class ImportError extends Error {}

// Validates shape before touching storage, so a bad file never half-overwrites data.
export function parseBundle(raw: string): DataBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ImportError("That file isn't valid JSON.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new ImportError("Unexpected file format.");
  }
  const b = parsed as Partial<DataBundle>;
  if (typeof b.schemaVersion !== "number") {
    throw new ImportError("This doesn't look like an Ayuta backup file.");
  }
  if (!Array.isArray(b.interests) || !Array.isArray(b.entries)) {
    throw new ImportError("Backup is missing its interests or entries.");
  }
  if (b.schemaVersion > SCHEMA_VERSION) {
    throw new ImportError(
      "This backup was made by a newer version of Ayuta. Update the app first."
    );
  }
  return {
    schemaVersion: b.schemaVersion,
    exportedAt: b.exportedAt ?? new Date().toISOString(),
    interests: b.interests,
    entries: b.entries,
    checkpointOverrides: b.checkpointOverrides ?? {},
    checkpointSeen: b.checkpointSeen ?? [],
    streak: b.streak ?? null,
    badges: b.badges ?? [],
    settings: b.settings ?? null,
  };
}

export type ImportMode = "replace" | "merge";

function mergeById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const map = new Map(a.map((x) => [x.id, x]));
  for (const x of b) map.set(x.id, x);
  return [...map.values()];
}

export function applyBundle(bundle: DataBundle, mode: ImportMode): void {
  if (mode === "replace") {
    writeJSON(KEYS.interests, bundle.interests);
    writeJSON(KEYS.entries, bundle.entries);
    writeJSON(KEYS.checkpointOverrides, bundle.checkpointOverrides);
    writeJSON(KEYS.checkpointSeen, bundle.checkpointSeen);
    if (bundle.streak) writeJSON(KEYS.streak, bundle.streak);
    writeJSON(KEYS.badges, bundle.badges);
    if (bundle.settings) writeJSON(KEYS.settings, bundle.settings);
    if (bundle.freezes) writeJSON(KEYS.freezes, bundle.freezes);
  } else {
    const curInterests = readJSON<{ id: string }[]>(KEYS.interests, []);
    const curEntries = readJSON<{ id: string }[]>(KEYS.entries, []);
    writeJSON(
      KEYS.interests,
      mergeById(curInterests as never[], bundle.interests as never[])
    );
    writeJSON(
      KEYS.entries,
      mergeById(curEntries as never[], bundle.entries as never[])
    );
    // Overrides / seen / badges: shallow merge, union.
    const curOverrides = readJSON<Record<string, unknown[]>>(
      KEYS.checkpointOverrides,
      {}
    );
    writeJSON(KEYS.checkpointOverrides, {
      ...curOverrides,
      ...bundle.checkpointOverrides,
    });
    const curSeen = readJSON<string[]>(KEYS.checkpointSeen, []);
    writeJSON(KEYS.checkpointSeen, [
      ...new Set([...curSeen, ...bundle.checkpointSeen]),
    ]);
    const curBadges = readJSON<{ badgeId: string; interestId?: string }[]>(
      KEYS.badges,
      []
    );
    const badgeKey = (x: { badgeId: string; interestId?: string }) =>
      x.interestId ? `${x.badgeId}:${x.interestId}` : x.badgeId;
    const seenBadge = new Set(curBadges.map(badgeKey));
    const mergedBadges = [...curBadges];
    for (const bd of bundle.badges) {
      if (!seenBadge.has(badgeKey(bd))) mergedBadges.push(bd);
    }
    writeJSON(KEYS.badges, mergedBadges);
  }
  writeJSON(KEYS.schemaVersion, SCHEMA_VERSION);
  notifyDataChanged();
}
