// Lazy wrapper around canvas-confetti so it never runs during SSR.
type ConfettiFn = (opts: Record<string, unknown>) => void;

let loader: Promise<ConfettiFn | null> | null = null;
function getConfetti(): Promise<ConfettiFn | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!loader) {
    loader = import("canvas-confetti")
      .then((m) => m.default as unknown as ConfettiFn)
      .catch(() => null);
  }
  return loader;
}

const ACCENTS = ["#7c5cff", "#22d3ee", "#f65fb8", "#a3e635", "#fbbf24"];

// A quick celebratory burst — used for checkpoints / badges.
export async function burst(colors: string[] = ACCENTS): Promise<void> {
  const confetti = await getConfetti();
  if (!confetti) return;
  confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 42,
    origin: { y: 0.28 },
    colors,
    disableForReducedMotion: true,
    scalar: 0.9,
  });
}

// A bigger, two-sided cannon — used for level-ups / path completion.
export async function bigCelebration(colors: string[] = ACCENTS): Promise<void> {
  const confetti = await getConfetti();
  if (!confetti) return;
  const shots = [
    { angle: 60, origin: { x: 0, y: 0.7 } },
    { angle: 120, origin: { x: 1, y: 0.7 } },
  ];
  shots.forEach((s) =>
    confetti({
      particleCount: 120,
      spread: 75,
      startVelocity: 55,
      colors,
      disableForReducedMotion: true,
      ...s,
    })
  );
}
