"use client";

import { useRef, useState } from "react";
import type { DataBundle } from "@/lib/types";
import {
  downloadBundle,
  parseBundle,
  applyBundle,
  ImportError,
  type ImportMode,
} from "@/lib/exportImport";
import { recomputeAfterMutation } from "@/lib/sync";

export default function ImportExportPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<DataBundle | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setMsg("");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const bundle = parseBundle(String(reader.result));
        setPending(bundle);
      } catch (err) {
        setError(
          err instanceof ImportError ? err.message : "Couldn't read that file."
        );
      }
    };
    reader.readAsText(file);
    // reset so the same file can be picked again
    e.target.value = "";
  };

  const doImport = (mode: ImportMode) => {
    if (!pending) return;
    applyBundle(pending, mode);
    recomputeAfterMutation();
    setPending(null);
    setMsg(
      mode === "replace"
        ? "Data replaced from backup."
        : "Backup merged into your data."
    );
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 space-y-3">
      <div>
        <h2 className="text-sm font-semibold">Backup & restore</h2>
        <p className="text-xs text-muted mt-0.5">
          Your data lives only in this browser. Export a file to back it up or
          move it to another device.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={downloadBundle}
          className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-medium text-white min-h-[44px]"
        >
          ⬇ Export backup
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm min-h-[44px]"
        >
          ⬆ Import backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onFile}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-wrong">{error}</p>}
      {msg && <p className="text-sm text-correct">{msg}</p>}

      {pending && (
        <div className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm space-y-2">
          <p>
            Loaded a backup with {pending.interests.length} interests and{" "}
            {pending.entries.length} sessions. How should it be applied?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => doImport("merge")}
              className="flex-1 rounded-lg bg-accent py-2 text-sm text-white min-h-[40px]"
            >
              Merge with current
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Replace ALL current data with this backup? This can't be undone."
                  )
                )
                  doImport("replace");
              }}
              className="flex-1 rounded-lg border border-wrong/50 text-wrong py-2 text-sm min-h-[40px]"
            >
              Replace everything
            </button>
            <button
              onClick={() => setPending(null)}
              className="rounded-lg border border-border px-3 text-sm text-muted min-h-[40px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
