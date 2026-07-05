// Curated palette for interests — picked to be distinct on a dark background.
export const INTEREST_COLORS: string[] = [
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#F97316", // orange
  "#10B981", // emerald
  "#EAB308", // gold
  "#06B6D4", // cyan
  "#F43F5E", // rose
  "#84CC16", // lime
  "#A855F7", // purple
  "#14B8A6", // teal
  "#F59E0B", // amber
];

export function randomColor(): string {
  return INTEREST_COLORS[Math.floor(Math.random() * INTEREST_COLORS.length)];
}

// A translucent version of a hex color, for soft backgrounds/fills.
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
