"use client";

import { useMemo, useState } from "react";
import Modal from "./Modal";
import { createEntry } from "@/lib/timeEntries";
import { recomputeAfterMutation } from "@/lib/sync";
import { celebrateMutation } from "@/lib/celebrate";
import { formatDuration } from "@/lib/gamification";
import {
  LONG_SESSION_MINUTES,
  LONG_SESSION_CAP_MINUTES,
} from "@/lib/timer";

export interface PendingSession {
  interestId: string;
  interestName: string;
  rawMinutes: number;
  startedAt: string | null;
  endedAt: string | null;
  note?: string;
  deliberate?: boolean;
}

export default function ConfirmSessionModal({
  session,
  onDone,
}: {
  session: PendingSession | null;
  onDone: (saved: boolean) => void;
}) {
  const isLong = (session?.rawMinutes ?? 0) > LONG_SESSION_MINUTES;
  const suggested = useMemo(() => {
    if (!session) return 0;
    const base = isLong
      ? Math.min(session.rawMinutes, LONG_SESSION_CAP_MINUTES)
      : session.rawMinutes;
    return Math.round(base);
  }, [session, isLong]);

  // The parent remounts this via a per-session `key`, so initial state is fresh.
  const [minutes, setMinutes] = useState<number>(suggested);
  const [deliberate, setDeliberate] = useState<boolean>(
    session?.deliberate ?? true
  );
  const [note, setNote] = useState<string>(session?.note ?? "");

  if (!session) return null;

  const save = () => {
    createEntry({
      interestId: session.interestId,
      durationMinutes: minutes,
      source: "timer",
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      deliberate,
      note: note || undefined,
    });
    const result = recomputeAfterMutation(session.interestId);
    celebrateMutation(result);
    onDone(true);
  };

  return (
    <Modal open={true} onClose={() => onDone(false)} title="Save this session?">
      <p className="text-sm text-muted mb-4">
        {session.interestName}
      </p>

      {isLong && (
        <div className="mb-4 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm">
          ⚠️ The timer ran for{" "}
          <strong>{formatDuration(Math.round(session.rawMinutes))}</strong>. That
          is a long stretch — did you leave it running? We&apos;ve suggested a
          capped {formatDuration(LONG_SESSION_CAP_MINUTES)}. Adjust it to the time
          you actually practiced.
        </div>
      )}

      <label className="block text-sm text-muted mb-1">Minutes practiced</label>
      <input
        type="number"
        min={0}
        value={minutes}
        onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
        className="w-full rounded-lg bg-raised border border-border px-3 py-2 mb-1 text-text min-h-[44px]"
      />
      <p className="text-xs text-dim mb-4">
        = {formatDuration(minutes)}
        {isLong && (
          <> · raw elapsed was {formatDuration(Math.round(session.rawMinutes))}</>
        )}
      </p>

      <label className="flex items-center gap-2 mb-4 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={deliberate}
          onChange={(e) => setDeliberate(e.target.checked)}
          className="h-4 w-4 accent-[color:var(--accent)]"
        />
        This was focused, deliberate practice
      </label>

      <label className="block text-sm text-muted mb-1">Note (optional)</label>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What did you work on?"
        className="w-full rounded-lg bg-raised border border-border px-3 py-2 mb-5 text-text min-h-[44px]"
      />

      <div className="flex gap-2">
        <button
          onClick={() => onDone(false)}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted hover:text-text min-h-[44px]"
        >
          Discard
        </button>
        <button
          onClick={save}
          className="flex-1 rounded-xl bg-accent-grad py-2.5 text-sm font-semibold text-white min-h-[44px] shadow-glow active:scale-[0.98] transition-transform"
        >
          Save session
        </button>
      </div>
    </Modal>
  );
}
