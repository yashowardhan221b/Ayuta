// Generic, SSR-safe localStorage helpers. Every lib module reads/writes through here.

export const KEYS = {
  interests: "ayuta_interests",
  entries: "ayuta_entries",
  checkpointOverrides: "ayuta_checkpoint_overrides",
  checkpointSeen: "ayuta_checkpoint_seen",
  activeTimer: "ayuta_active_timer",
  streak: "ayuta_streak",
  badges: "ayuta_badges",
  settings: "ayuta_settings",
  lastPolyLevel: "ayuta_last_poly_level",
  schemaVersion: "ayuta_schema_version",
} as const;

export const SCHEMA_VERSION = 1;

const isBrowser = () => typeof window !== "undefined";

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently, app stays usable
  }
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

// A cheap unique id — no external dependency needed.
export function uid(prefix = ""): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}${Date.now().toString(36)}${rnd}`;
}

// Lets client components re-read after a mutation happens elsewhere on the page.
export function notifyDataChanged(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event("ayuta:data-changed"));
}
