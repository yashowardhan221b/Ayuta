import type { Stage } from "@/lib/gamification";

const STAGE_STYLE: Record<string, string> = {
  novice: "text-muted border-border bg-surface",
  advanced_beginner: "text-sky-300 border-sky-800 bg-sky-950/40",
  competent: "text-emerald-300 border-emerald-800 bg-emerald-950/40",
  proficient: "text-violet-300 border-violet-800 bg-violet-950/40",
  expert: "text-gold border-yellow-800 bg-yellow-950/40",
};

export default function StageBadge({
  stage,
  size = "md",
}: {
  stage: Stage;
  size?: "sm" | "md";
}) {
  const cls = STAGE_STYLE[stage.key] ?? STAGE_STYLE.novice;
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${pad} ${cls}`}
    >
      {stage.name}
    </span>
  );
}
