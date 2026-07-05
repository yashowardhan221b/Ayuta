import { getSettings } from "./settings";

// ---- Haptics ----
export function haptic(pattern: number | number[] = 12): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (!getSettings().hapticsEnabled) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* noop */
  }
}

// ---- Synthesized sound (Web Audio, no asset files) ----
let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.06
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  g.gain.setValueAtTime(0.0001, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.02);
}

export type SoundName = "tap" | "log" | "checkpoint" | "levelup" | "badge";

export function playSound(name: SoundName): void {
  if (!getSettings().soundEnabled) return;
  const ac = audio();
  if (!ac) return;
  switch (name) {
    case "tap":
      tone(ac, 520, 0, 0.08, "triangle", 0.04);
      break;
    case "log":
      tone(ac, 660, 0, 0.1, "sine");
      tone(ac, 880, 0.06, 0.12, "sine");
      break;
    case "checkpoint":
      tone(ac, 659, 0, 0.12, "sine");
      tone(ac, 988, 0.09, 0.16, "sine");
      break;
    case "badge":
      tone(ac, 784, 0, 0.12, "triangle");
      tone(ac, 1047, 0.1, 0.16, "triangle");
      break;
    case "levelup":
      [523, 659, 784, 1047].forEach((f, i) =>
        tone(ac, f, i * 0.08, 0.18, "sine", 0.07)
      );
      break;
  }
}

// Fired on positive actions: haptic + sound together.
export function feedback(sound: SoundName, pattern: number | number[] = 12): void {
  haptic(pattern);
  playSound(sound);
}
