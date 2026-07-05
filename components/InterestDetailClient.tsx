"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHydrated, useLiveData } from "@/lib/hooks";
import {
  getInterest,
  archiveInterest,
  unarchiveInterest,
  deleteInterest,
} from "@/lib/interests";
import { getEntriesForInterest, deleteEntriesForInterest } from "@/lib/timeEntries";
import {
  masteryPct,
  getStage,
  levelProgress,
  projectTimeToTarget,
  formatHours,
} from "@/lib/gamification";
import { pathLabel, nextPreset } from "@/lib/paths";
import MasteryRing from "./MasteryRing";
import StageBadge from "./StageBadge";
import XPBar from "./XPBar";
import CheckpointLadder from "./CheckpointLadder";
import CalendarHeatmap from "./CalendarHeatmap";
import SessionLogList from "./SessionLogList";
import StartTimerButton from "./StartTimerButton";
import PromotePathModal from "./PromotePathModal";

// In-memory guard so the auto promote-prompt fires at most once per session.
const autoPrompted = new Set<string>();

export default function InterestDetailClient({ id }: { id: string }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const [promoteOpen, setPromoteOpen] = useState(false);

  const [data, refresh] = useLiveData(
    () => ({
      interest: getInterest(id),
      entries: getEntriesForInterest(id),
    }),
    [id]
  );

  const interest = data.interest;
  const entries = data.entries;
  const totalHours = entries.reduce((s, e) => s + e.durationMinutes, 0) / 60;
  const completed = interest ? totalHours >= interest.targetHours : false;
  const canPromote = interest ? !!nextPreset(interest) : false;

  // Auto-prompt to promote once when a Path is completed.
  const promoteKey = `${id}:${interest?.targetHours}`;
  useEffect(() => {
    if (completed && canPromote && !autoPrompted.has(promoteKey)) {
      autoPrompted.add(promoteKey);
      setPromoteOpen(true);
    }
  }, [completed, canPromote, promoteKey]);

  if (!hydrated) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse" />;
  }

  if (!interest) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">This interest doesn&apos;t exist.</p>
        <Link href="/" className="text-accent">
          ← Back home
        </Link>
      </div>
    );
  }

  const mastery = masteryPct(totalHours, interest.targetHours);
  const stage = getStage(totalHours, interest.targetHours);
  const level = levelProgress(totalHours);
  const projection = projectTimeToTarget(entries, totalHours, interest.targetHours);

  const remove = () => {
    if (
      !window.confirm(
        `Delete "${interest.name}" and all its logged time? This can't be undone.`
      )
    )
      return;
    deleteEntriesForInterest(interest.id);
    deleteInterest(interest.id);
    router.push("/");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted">
          ← Back
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/interests/${interest.id}/edit`} className="text-muted">
            Edit
          </Link>
          {interest.archivedAt ? (
            <button
              onClick={() => {
                unarchiveInterest(interest.id);
                refresh();
              }}
              className="text-accent"
            >
              Unarchive
            </button>
          ) : (
            <button
              onClick={() => {
                archiveInterest(interest.id);
                refresh();
              }}
              className="text-muted"
            >
              Archive
            </button>
          )}
          <button onClick={remove} className="text-muted hover:text-wrong">
            Delete
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="flex items-center gap-5">
        <MasteryRing pct={mastery} size={120} stroke={10} color={interest.color}>
          <div className="text-2xl">{interest.icon}</div>
          <div className="text-sm font-semibold">{mastery}%</div>
        </MasteryRing>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold truncate">{interest.name}</h1>
          <div className="text-sm text-muted">
            {formatHours(totalHours)} / {formatHours(interest.targetHours)}
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <StageBadge stage={stage} />
            <button
              onClick={() => setPromoteOpen(true)}
              className="text-xs rounded-full border border-border px-2.5 py-1 text-muted hover:text-text"
            >
              {pathLabel(interest)} ↗
            </button>
          </div>
        </div>
      </section>

      {completed && canPromote && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm flex items-center justify-between gap-3">
          <span>🎉 You&apos;ve completed this Path!</span>
          <button
            onClick={() => setPromoteOpen(true)}
            className="rounded-lg bg-accent px-3 py-1.5 text-white text-xs font-medium min-h-[36px]"
          >
            Aim higher
          </button>
        </div>
      )}

      <XPBar progress={level} color={interest.color} />

      <div className="text-sm text-muted">📈 {projection.etaLabel}</div>

      <div className="flex gap-2">
        <StartTimerButton
          interestId={interest.id}
          label="Start timer"
          className="flex-1"
        />
        <Link
          href={`/log?interest=${interest.id}`}
          className="flex-1 rounded-lg border border-border py-2 text-sm text-center min-h-[40px] flex items-center justify-center"
        >
          ✍️ Log past time
        </Link>
      </div>

      <section className="rounded-2xl glass p-4">
        <CheckpointLadder
          interest={interest}
          entries={entries}
          onChange={refresh}
        />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-muted mb-3">Activity</h3>
        <CalendarHeatmap entries={entries} color={interest.color} />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-muted mb-1">Sessions</h3>
        <SessionLogList
          entries={entries}
          interestId={interest.id}
          onChange={refresh}
        />
      </section>

      <PromotePathModal
        interest={interest}
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        onChanged={refresh}
      />
    </div>
  );
}
