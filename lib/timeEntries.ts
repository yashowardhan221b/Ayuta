import type { TimeEntry, TimeEntrySource } from "./types";
import { KEYS, readJSON, writeJSON, uid, notifyDataChanged } from "./storage";
import { getLocalDateString } from "./streak";

export function getAllEntries(): TimeEntry[] {
  return readJSON<TimeEntry[]>(KEYS.entries, []);
}

function persist(entries: TimeEntry[]): void {
  writeJSON(KEYS.entries, entries);
  notifyDataChanged();
}

export function getEntriesForInterest(interestId: string): TimeEntry[] {
  return getAllEntries()
    .filter((e) => e.interestId === interestId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTotalMinutesForInterest(interestId: string): number {
  return getAllEntries()
    .filter((e) => e.interestId === interestId)
    .reduce((sum, e) => sum + e.durationMinutes, 0);
}

export function getTotalHoursForInterest(interestId: string): number {
  return getTotalMinutesForInterest(interestId) / 60;
}

export interface NewEntryInput {
  interestId: string;
  durationMinutes: number;
  source: TimeEntrySource;
  date?: string; // "YYYY-MM-DD" local; defaults to today
  startedAt?: string | null;
  endedAt?: string | null;
  deliberate?: boolean;
  note?: string;
}

export function createEntry(input: NewEntryInput): TimeEntry {
  const now = new Date().toISOString();
  const entry: TimeEntry = {
    id: uid("ent_"),
    interestId: input.interestId,
    date: input.date ?? getLocalDateString(),
    startedAt: input.startedAt ?? null,
    endedAt: input.endedAt ?? null,
    durationMinutes: Math.max(0, Math.round(input.durationMinutes)),
    source: input.source,
    deliberate: input.deliberate,
    note: input.note?.trim() || undefined,
    createdAt: now,
  };
  persist([...getAllEntries(), entry]);
  return entry;
}

export function updateEntry(
  id: string,
  patch: Partial<Pick<TimeEntry, "durationMinutes" | "date" | "note" | "deliberate">>
): void {
  const entries = getAllEntries().map((e) =>
    e.id === id
      ? {
          ...e,
          ...patch,
          durationMinutes:
            patch.durationMinutes !== undefined
              ? Math.max(0, Math.round(patch.durationMinutes))
              : e.durationMinutes,
          note:
            patch.note !== undefined ? patch.note.trim() || undefined : e.note,
        }
      : e
  );
  persist(entries);
}

export function deleteEntry(id: string): void {
  persist(getAllEntries().filter((e) => e.id !== id));
}

export function deleteEntriesForInterest(interestId: string): void {
  persist(getAllEntries().filter((e) => e.interestId !== interestId));
}
