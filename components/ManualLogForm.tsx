"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHydrated } from "@/lib/hooks";
import { getActiveInterests } from "@/lib/interests";
import { createEntry } from "@/lib/timeEntries";
import { recomputeAfterMutation } from "@/lib/sync";
import { celebrateMutation } from "@/lib/celebrate";
import { getLocalDateString } from "@/lib/streak";
import EmptyState from "./EmptyState";

export default function ManualLogForm({
  initialInterestId,
}: {
  initialInterestId?: string;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const interests = hydrated ? getActiveInterests() : [];

  const [interestId, setInterestId] = useState(
    initialInterestId ?? ""
  );
  const [date, setDate] = useState(getLocalDateString());
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [deliberate, setDeliberate] = useState(true);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  if (!hydrated) {
    return <div className="h-40 rounded-2xl bg-surface animate-pulse" />;
  }

  if (interests.length === 0) {
    return (
      <EmptyState
        icon="🌱"
        title="No interests yet"
        body="Add an interest first, then you can log time against it."
        ctaHref="/new"
        ctaLabel="+ Add an interest"
      />
    );
  }

  const effectiveId = interestId || interests[0].id;

  const submit = () => {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes <= 0) {
      setError("Enter a duration greater than zero.");
      return;
    }
    createEntry({
      interestId: effectiveId,
      durationMinutes: totalMinutes,
      source: "manual",
      date,
      deliberate,
      note: note || undefined,
    });
    const result = recomputeAfterMutation(effectiveId);
    celebrateMutation(result);
    setSavedMsg("Logged! 🎉");
    setTimeout(() => router.push(`/interests/${effectiveId}`), 500);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm text-muted mb-1">Interest</label>
        <select
          value={effectiveId}
          onChange={(e) => setInterestId(e.target.value)}
          className="w-full rounded-lg bg-raised border border-border px-3 py-2 text-text min-h-[44px]"
        >
          {interests.map((i) => (
            <option key={i.id} value={i.id}>
              {i.icon.startsWith("ayuta:") ? i.name : `${i.icon} ${i.name}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Date</label>
        <input
          type="date"
          value={date}
          max={getLocalDateString()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg bg-raised border border-border px-3 py-2 text-text min-h-[44px]"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">How long?</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              value={hours}
              onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
              className="w-20 rounded-lg bg-raised border border-border px-3 py-2 text-text min-h-[44px]"
            />
            <span className="text-sm text-muted">h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
              className="w-20 rounded-lg bg-raised border border-border px-3 py-2 text-text min-h-[44px]"
            />
            <span className="text-sm text-muted">m</span>
          </div>
        </div>
        {error && <p className="text-xs text-wrong mt-1">{error}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={deliberate}
          onChange={(e) => setDeliberate(e.target.checked)}
          className="h-4 w-4 accent-[color:var(--accent)]"
        />
        This was focused, deliberate practice
      </label>

      <div>
        <label className="block text-sm text-muted mb-1">
          Note <span className="text-dim">(optional)</span>
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you work on?"
          className="w-full rounded-lg bg-raised border border-border px-3 py-2 text-text min-h-[44px]"
        />
      </div>

      <button
        onClick={submit}
        className="w-full rounded-full bg-cta-grad py-3.5 font-bold uppercase tracking-wide text-white min-h-[52px] shadow-cta active:translate-y-1 active:shadow-none transition-all"
      >
        {savedMsg || "Log time"}
      </button>
    </div>
  );
}
