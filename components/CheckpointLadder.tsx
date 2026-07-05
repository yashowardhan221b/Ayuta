"use client";

import { useState } from "react";
import type { Interest, TimeEntry } from "@/lib/types";
import {
  getCheckpointStatuses,
  getNextCheckpoint,
  upsertOverride,
  addCustomCheckpoint,
  type CheckpointStatus,
} from "@/lib/checkpoints";
import { formatHours } from "@/lib/gamification";
import Modal from "./Modal";

export default function CheckpointLadder({
  interest,
  entries,
  onChange,
}: {
  interest: Interest;
  entries: TimeEntry[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const statuses = getCheckpointStatuses(interest, entries);
  const next = getNextCheckpoint(statuses);
  const hours = statuses.filter((s) => s.metric === "hours");
  const days = statuses.filter((s) => s.metric === "days");

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted">Checkpoints</h3>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-accent min-h-[32px]"
        >
          Edit
        </button>
      </div>

      <ol className="relative border-l border-border ml-2 space-y-3">
        {hours.map((s) => {
          const isNext = next?.id === s.id;
          return (
            <li key={s.id} className="ml-4">
              <span
                className="absolute -left-[7px] h-3.5 w-3.5 rounded-full border"
                style={{
                  background: s.reached
                    ? s.kind === "major"
                      ? "var(--major)"
                      : "var(--mini)"
                    : "var(--bg)",
                  borderColor: s.reached
                    ? "transparent"
                    : isNext
                    ? "var(--accent)"
                    : "var(--border)",
                }}
              />
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className={s.reached ? "" : "text-muted"}>
                    {s.kind === "major" ? "🏆 " : ""}
                    {s.label}
                  </span>
                  {isNext && (
                    <span className="ml-2 text-[10px] text-accent uppercase">
                      next
                    </span>
                  )}
                </div>
                <div className="text-xs text-dim tabular-nums">
                  {formatHours(s.threshold)}
                </div>
              </div>
              {isNext && (
                <div className="text-xs text-dim mt-0.5">
                  {formatHours(Math.max(0, s.threshold - s.current))} to go
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {days.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-muted mb-2">Consistency</div>
          <div className="flex flex-wrap gap-2">
            {days.map((s) => (
              <span
                key={s.id}
                className={`text-xs rounded-full border px-2.5 py-1 ${
                  s.reached
                    ? "border-mini/50 text-mini bg-mini/10"
                    : "border-border text-dim"
                }`}
                title={`${Math.floor(s.current)} / ${s.threshold} active days`}
              >
                {s.reached ? "✓ " : ""}
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <CheckpointEditor
          interest={interest}
          statuses={statuses}
          onClose={() => setEditing(false)}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function CheckpointEditor({
  interest,
  statuses,
  onClose,
  onChange,
}: {
  interest: Interest;
  statuses: CheckpointStatus[];
  onClose: () => void;
  onChange: () => void;
}) {
  const [customLabel, setCustomLabel] = useState("");
  const [customHours, setCustomHours] = useState(10);

  const rename = (id: string, label: string) => {
    upsertOverride(interest.id, { id, label });
    onChange();
  };
  const retarget = (id: string, threshold: number) => {
    upsertOverride(interest.id, { id, threshold });
    onChange();
  };
  const toggle = (id: string, disabled: boolean) => {
    upsertOverride(interest.id, { id, disabled });
    onChange();
  };
  const addCustom = () => {
    if (!customLabel.trim()) return;
    addCustomCheckpoint(interest.id, {
      kind: "mini",
      metric: "hours",
      threshold: Math.max(0.1, customHours),
      label: customLabel.trim(),
    });
    setCustomLabel("");
    setCustomHours(10);
    onChange();
  };

  return (
    <Modal open onClose={onClose} title="Edit checkpoints">
      <p className="text-xs text-dim mb-3">
        Rename, move, or hide any checkpoint. Hour checkpoints only.
      </p>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {statuses
          .filter((s) => s.metric === "hours")
          .map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <input
                defaultValue={s.label}
                onBlur={(e) => rename(s.id, e.target.value)}
                className="flex-1 rounded-md bg-raised border border-border px-2 py-1.5 text-sm min-h-[38px]"
              />
              <input
                type="number"
                defaultValue={s.threshold}
                min={0}
                step={0.5}
                onBlur={(e) => retarget(s.id, Number(e.target.value))}
                className="w-16 rounded-md bg-raised border border-border px-2 py-1.5 text-sm min-h-[38px]"
              />
              <button
                onClick={() => toggle(s.id, true)}
                className="text-xs text-dim hover:text-wrong px-1"
                title="Hide this checkpoint"
              >
                Hide
              </button>
            </div>
          ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-sm font-medium mb-2">Add your own</div>
        <div className="flex items-center gap-2">
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. First recital"
            className="flex-1 rounded-md bg-raised border border-border px-2 py-1.5 text-sm min-h-[38px]"
          />
          <input
            type="number"
            value={customHours}
            min={0.1}
            step={0.5}
            onChange={(e) => setCustomHours(Number(e.target.value))}
            className="w-16 rounded-md bg-raised border border-border px-2 py-1.5 text-sm min-h-[38px]"
          />
          <button
            onClick={addCustom}
            className="rounded-md bg-accent px-3 py-1.5 text-sm text-white min-h-[38px]"
          >
            Add
          </button>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-5 rounded-lg border border-border py-2.5 text-sm min-h-[44px]"
      >
        Done
      </button>
    </Modal>
  );
}
