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
      <section className="rounded-2xl border border-border bg-surface p-4 space-y-4">
        <h2 className="text-sm font-semibold">Preferences</h2>
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
