import type { Settings } from "./types";
import { KEYS, readJSON, writeJSON, notifyDataChanged } from "./storage";

export const DEFAULT_SETTINGS: Settings = {
  weekStartsOn: 1,
  defaultTargetHours: 10000,
  soundEnabled: false,
  hapticsEnabled: true,
  dailyGoalMinutes: 30,
};

export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(KEYS.settings, {}) };
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...patch };
  writeJSON(KEYS.settings, next);
  notifyDataChanged();
  return next;
}
