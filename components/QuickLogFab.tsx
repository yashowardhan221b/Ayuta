"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useHydrated, useLiveData } from "@/lib/hooks";
import { getActiveInterests } from "@/lib/interests";
import { getActiveTimer } from "@/lib/timer";
import { createEntry } from "@/lib/timeEntries";
import { recomputeAfterMutation } from "@/lib/sync";
import { celebrateMutation } from "@/lib/celebrate";
import { haptic, feedback } from "@/lib/feedback";
import { formatDuration } from "@/lib/gamification";
import Modal from "./Modal";

const QUICK = [15, 30, 45, 60];

export default function QuickLogFab() {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [interestId, setInterestId] = useState<string>("");
  const [minutes, setMinutes] = useState(30);
  const [data] = useLiveData(() => ({
    interests: getActiveInterests(),
    hasTimer: !!getActiveTimer(),
  }));

  if (!hydrated) return null;
  const { interests, hasTimer } = data;
  // Hide where it'd be redundant or crowd the UI.
  if (interests.length === 0) return null;
  if (pathname === "/log" || pathname === "/new") return null;

  const chosen = interestId || interests[0].id;

  const log = () => {
    createEntry({ interestId: chosen, durationMinutes: minutes, source: "manual" });
    const result = recomputeAfterMutation(chosen);
    feedback("log", 14);
    celebrateMutation(result);
    setOpen(false);
    setMinutes(30);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        onClick={() => {
          haptic(10);
          setOpen(true);
        }}
        aria-label="Quick log time"
        className="fixed right-4 z-40 grid place-items-center h-14 w-14 rounded-full bg-cta-grad shadow-cta text-white text-2xl font-bold"
        style={{ bottom: hasTimer ? "78px" : "78px" }}
      >
        +
      </motion.button>

      <Modal open={open} onClose={() => setOpen(false)} title="Quick log">
        <label className="block text-sm text-muted mb-1">Interest</label>
        <select
          value={chosen}
          onChange={(e) => setInterestId(e.target.value)}
          className="w-full rounded-lg bg-raised border border-border px-3 py-2 mb-4 text-text min-h-[44px]"
        >
          {interests.map((i) => (
            <option key={i.id} value={i.id} className="bg-surface-solid">
              {i.icon} {i.name}
            </option>
          ))}
        </select>

        <label className="block text-sm text-muted mb-2">How long? (today)</label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {QUICK.map((m) => (
            <button
              key={m}
              onClick={() => setMinutes(m)}
              className={`rounded-xl py-3 text-sm font-bold border transition-colors ${
                minutes === m
                  ? "border-accent bg-accent/15 text-text"
                  : "border-border text-muted"
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-5">
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="flex-1 accent-[color:var(--accent)]"
          />
          <span className="text-sm text-muted w-16 text-right tabnums">
            {formatDuration(minutes)}
          </span>
        </div>

        <AnimatePresence>
          <motion.button
            key="log"
            whileTap={{ scale: 0.97 }}
            onClick={log}
            className="w-full rounded-full bg-cta-grad py-3.5 font-bold uppercase tracking-wide text-white shadow-cta"
          >
            Log {formatDuration(minutes)}
          </motion.button>
        </AnimatePresence>
      </Modal>
    </>
  );
}
