import type { Interest, PathId } from "./types";

export interface PathPreset {
  id: Exclude<PathId, "custom">;
  name: string;
  targetHours: number;
  blurbKey: string;
  tagline: string;
  icon: string;
}

export const PATH_PRESETS: PathPreset[] = [
  {
    id: "dabble",
    name: "Dabble",
    targetHours: 20,
    blurbKey: "first20",
    tagline: "Get good enough",
    icon: "🌱",
  },
  {
    id: "hobbyist",
    name: "Hobbyist",
    targetHours: 100,
    blurbKey: "hobby",
    tagline: "A real hobby",
    icon: "🎨",
  },
  {
    id: "serious",
    name: "Serious",
    targetHours: 1000,
    blurbKey: "serious",
    tagline: "Genuine competence",
    icon: "⚙️",
  },
  {
    id: "mastery",
    name: "Mastery",
    targetHours: 10000,
    blurbKey: "tenK",
    tagline: "Top of the field",
    icon: "🏔️",
  },
];

// Ordered from smallest to largest for "promote to the next tier" logic.
const PRESET_ORDER: PathPreset["id"][] = [
  "dabble",
  "hobbyist",
  "serious",
  "mastery",
];

export function getPreset(pathId: PathId): PathPreset | undefined {
  return PATH_PRESETS.find((p) => p.id === pathId);
}

export function pathLabel(interest: Pick<Interest, "pathId" | "targetHours">): string {
  const preset = getPreset(interest.pathId);
  if (preset) return preset.name;
  return "Custom";
}

// The next preset up from the current target, if any (for the promote prompt).
export function nextPreset(interest: Pick<Interest, "pathId" | "targetHours">):
  | PathPreset
  | undefined {
  if (interest.pathId !== "custom") {
    const idx = PRESET_ORDER.indexOf(interest.pathId as PathPreset["id"]);
    if (idx >= 0 && idx < PRESET_ORDER.length - 1) {
      return getPreset(PRESET_ORDER[idx + 1]);
    }
    return undefined;
  }
  // Custom path: suggest the first preset whose target exceeds the current one.
  return PATH_PRESETS.find((p) => p.targetHours > interest.targetHours);
}
