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
      <div className="flex items-center justify-between text-xs text-muted mb-1">
        <span className="font-medium text-text">Level {progress.level}</span>
        <span>
          {progress.xpIntoLevel} / {progress.xpForNext} XP
        </span>
      </div>
      <ProgressBar percent={progress.percent} color={color} />
    </div>
  );
}
