"use client";

import { useState } from "react";
import type { TimeEntry } from "@/lib/types";
import { updateEntry, deleteEntry } from "@/lib/timeEntries";
import { recomputeAfterMutation } from "@/lib/sync";
import { formatDuration } from "@/lib/gamification";
import Modal from "./Modal";

function prettyDate(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SessionLogList({
  entries,
  interestId,
  onChange,
}: {
  entries: TimeEntry[];
  interestId: string;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editNote, setEditNote] = useState("");

  if (entries.length === 0) {
    return (
      <p className="text-sm text-dim">
        No sessions yet. Start a timer or log time to see them here.
      </p>
    );
  }

  const openEdit = (e: TimeEntry) => {
    setEditing(e);
    setEditMinutes(e.durationMinutes);
    setEditNote(e.note ?? "");
  };

  const saveEdit = () => {
    if (!editing) return;
    updateEntry(editing.id, { durationMinutes: editMinutes, note: editNote });
    recomputeAfterMutation(interestId);
    setEditing(null);
    onChange();
  };

  const remove = (id: string) => {
    if (!window.confirm("Delete this session?")) return;
    deleteEntry(id);
    recomputeAfterMutation(interestId);
    onChange();
  };

  return (
    <div className="divide-y divide-border">
      {entries.map((e) => (
        <div key={e.id} className="flex items-center gap-3 py-2.5">
          <span className="text-sm" title={e.source === "timer" ? "Timer" : "Manual"}>
            {e.source === "timer" ? "⏱️" : "✍️"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm">
              {formatDuration(e.durationMinutes)}
              {e.deliberate && (
                <span className="ml-2 text-[10px] text-accent">● deliberate</span>
              )}
            </div>
            <div className="text-xs text-dim truncate">
              {prettyDate(e.date)}
              {e.note ? ` · ${e.note}` : ""}
            </div>
          </div>
          <button
            onClick={() => openEdit(e)}
            className="text-xs text-muted hover:text-text px-2 min-h-[36px]"
          >
            Edit
          </button>
          <button
            onClick={() => remove(e.id)}
            className="text-xs text-muted hover:text-wrong px-1 min-h-[36px]"
            aria-label="Delete"
          >
            ✕
          </button>
        </div>
      ))}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit session">
        <label className="block text-sm text-muted mb-1">Minutes</label>
        <input
          type="number"
          min={0}
          value={editMinutes}
          onChange={(e) => setEditMinutes(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-lg bg-raised border border-border px-3 py-2 mb-3 text-text min-h-[44px]"
        />
        <label className="block text-sm text-muted mb-1">Note</label>
        <input
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
          className="w-full rounded-lg bg-raised border border-border px-3 py-2 mb-4 text-text min-h-[44px]"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(null)}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-medium text-white min-h-[44px]"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}
