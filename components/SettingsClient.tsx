"use client";

import Link from "next/link";
import { useHydrated, useLiveData } from "@/lib/hooks";
import { getSettings, updateSettings } from "@/lib/settings";
import {
  getArchivedInterests,
  unarchiveInterest,
  deleteInterest,
} from "@/lib/interests";
import { deleteEntriesForInterest, getTotalHoursForInterest } from "@/lib/timeEntries";
import { recomputeAfterMutation } from "@/lib/sync";
import { formatHours } from "@/lib/gamification";
import { feedback, haptic } from "@/lib/feedback";
import ImportExportPanel from "./ImportExportPanel";

export default function SettingsClient() {
  const hydrated = useHydrated();
  const [data, refresh] = useLiveData(() => ({
    settings: getSettings(),
    archived: getArchivedInterests(),
  }));

  if (!hydrated) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse" />;
  }

  const { settings, archived } = data;

  const removeForever = (id: string, name: string) => {
    if (!window.confirm(`Permanently delete "${name}" and its logged time?`))
      return;
    deleteEntriesForInterest(id);
    deleteInterest(id);
    recomputeAfterMutation();
    refresh();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <ImportExportPanel />

      {/* Preferences */}
      <section className="rounded-2xl glass p-4 space-y-4">
        <h2 className="text-sm font-semibold">Preferences</h2>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Daily goal</span>
            <span className="text-sm text-muted tabnums">
              {settings.dailyGoalMinutes ?? 30} min
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 60, 90].map((m) => (
              <button
                key={m}
                onClick={() => {
                  updateSettings({ dailyGoalMinutes: m });
                  haptic(10);
                  refresh();
                }}
                className={`rounded-lg py-2 text-sm font-semibold border ${
                  (settings.dailyGoalMinutes ?? 30) === m
                    ? "border-accent bg-accent/15 text-text"
                    : "border-border text-muted"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Week starts on</span>
          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            {([1, 0] as const).map((d) => (
              <button
                key={d}
                onClick={() => {
                  updateSettings({ weekStartsOn: d });
                  refresh();
                }}
                className={`px-3 py-1.5 min-h-[36px] ${
                  settings.weekStartsOn === d
                    ? "bg-accent text-white"
                    : "text-muted"
                }`}
              >
                {d === 1 ? "Monday" : "Sunday"}
              </button>
            ))}
          </div>
        </div>

        <Toggle
          label="Sound effects"
          hint="Subtle blips on wins and level-ups"
          on={settings.soundEnabled}
          onToggle={() => {
            const next = !settings.soundEnabled;
            updateSettings({ soundEnabled: next });
            if (next) feedback("levelup", 12);
            refresh();
          }}
        />
        <Toggle
          label="Haptics"
          hint="Vibration on key actions (mobile)"
          on={settings.hapticsEnabled}
          onToggle={() => {
            updateSettings({ hapticsEnabled: !settings.hapticsEnabled });
            haptic(20);
            refresh();
          }}
        />
      </section>

      {/* Archived */}
      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold mb-3">
          Archived interests{" "}
          <span className="text-dim font-normal">({archived.length})</span>
        </h2>
        {archived.length === 0 ? (
          <p className="text-sm text-dim">
            Nothing archived. Archiving an interest hides it from your dashboard
            but keeps all its history.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {archived.map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-2.5">
                <span className="text-lg">{i.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{i.name}</div>
                  <div className="text-xs text-dim">
                    {formatHours(getTotalHoursForInterest(i.id))} logged
                  </div>
                </div>
                <button
                  onClick={() => {
                    unarchiveInterest(i.id);
                    refresh();
                  }}
                  className="text-xs text-accent px-2 min-h-[36px]"
                >
                  Restore
                </button>
                <button
                  onClick={() => removeForever(i.id, i.name)}
                  className="text-xs text-muted hover:text-wrong px-1 min-h-[36px]"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-dim text-center">
        <Link href="/ideas" className="text-accent">
          The ideas behind Ayuta
        </Link>{" "}
        · अयुत · ten thousand
      </p>
    </div>
  );
}

function Toggle({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm">{label}</div>
        {hint && <div className="text-xs text-dim">{hint}</div>}
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        className="relative h-7 w-12 rounded-full transition-colors shrink-0"
        style={{ background: on ? "var(--accent)" : "rgba(255,255,255,0.12)" }}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: on ? "26px" : "4px" }}
        />
      </button>
    </div>
  );
}
