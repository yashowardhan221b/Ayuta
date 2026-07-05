"use client";

import type { PathId } from "@/lib/types";
import { PATH_PRESETS } from "@/lib/paths";
import { getFramework } from "@/lib/frameworks";
import { formatHours } from "@/lib/gamification";

export default function PathPicker({
  pathId,
  customHours,
  onChange,
  minHours = 1,
}: {
  pathId: PathId;
  customHours: number;
  onChange: (pathId: PathId, customHours: number) => void;
  minHours?: number;
}) {
  return (
    <div className="space-y-2">
      {PATH_PRESETS.map((p) => {
        const fw = getFramework(p.blurbKey);
        const active = pathId === p.id;
        const disabled = p.targetHours < minHours;
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(p.id, p.targetHours)}
            className={`w-full text-left rounded-xl border p-3 transition-colors ${
              active
                ? "border-accent bg-accent/10"
                : "border-border bg-surface hover:border-dim"
            } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {p.icon} {p.name}{" "}
                <span className="text-muted font-normal">· {p.tagline}</span>
              </div>
              <div className="text-sm text-muted tabular-nums">
                {formatHours(p.targetHours)}
              </div>
            </div>
            {fw && (
              <p className="text-xs text-dim mt-1 leading-snug">
                {fw.title} — {fw.source}
              </p>
            )}
          </button>
        );
      })}

      {/* Custom */}
      <div
        className={`rounded-xl border p-3 ${
          pathId === "custom" ? "border-accent bg-accent/10" : "border-border bg-surface"
        }`}
      >
        <button
          type="button"
          onClick={() => onChange("custom", customHours || 50)}
          className="font-medium"
        >
          🎯 Custom target
        </button>
        {pathId === "custom" && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={minHours}
              value={customHours}
              onChange={(e) =>
                onChange("custom", Math.max(minHours, Number(e.target.value)))
              }
              className="w-28 rounded-lg bg-raised border border-border px-3 py-2 text-text min-h-[44px]"
            />
            <span className="text-sm text-muted">hours to your goal</span>
          </div>
        )}
      </div>
    </div>
  );
}
