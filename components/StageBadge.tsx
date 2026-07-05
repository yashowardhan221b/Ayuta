import type { Stage } from "@/lib/gamification";

const STAGE_STYLE: Record<string, { text: string; glow: string; bg: string }> = {
  novice: { text: "#9aa0b6", glow: "rgba(154,160,182,0.25)", bg: "rgba(154,160,182,0.1)" },
  advanced_beginner: { text: "#38bdf8", glow: "rgba(56,189,248,0.35)", bg: "rgba(56,189,248,0.12)" },
  competent: { text: "#34d399", glow: "rgba(52,211,153,0.35)", bg: "rgba(52,211,153,0.12)" },
  proficient: { text: "#c084fc", glow: "rgba(192,132,252,0.4)", bg: "rgba(192,132,252,0.14)" },
  expert: { text: "#fbbf24", glow: "rgba(251,191,36,0.45)", bg: "rgba(251,191,36,0.14)" },
};

export default function StageBadge({
  stage,
  size = "md",
}: {
  stage: Stage;
  size?: "sm" | "md";
}) {
  const s = STAGE_STYLE[stage.key] ?? STAGE_STYLE.novice;
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${pad}`}
      style={{
        color: s.text,
        background: s.bg,
        border: `1px solid ${s.glow}`,
        boxShadow: `0 0 12px -2px ${s.glow}`,
      }}
    >
      {stage.name}
    </span>
  );
}
