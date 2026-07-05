import type { LevelProgress } from "@/lib/gamification";
import ProgressBar from "./ProgressBar";

export default function XPBar({
  progress,
  color = "var(--accent)",
}: {
  progress: LevelProgress;
  color?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-bold text-text flex items-center gap-1.5">
          <span
            className="grid place-items-center h-5 w-5 rounded-md text-[10px] font-black"
            style={{ background: color, color: "#0a0a0a" }}
          >
            {progress.level}
          </span>
          Level {progress.level}
        </span>
        <span className="text-muted tabnums">
          {progress.xpIntoLevel} / {progress.xpForNext} XP
        </span>
      </div>
      <ProgressBar percent={progress.percent} color={color} glow shimmer />
    </div>
  );
}
