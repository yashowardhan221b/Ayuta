"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CelebrationItem } from "@/lib/celebrate";

interface Toast extends CelebrationItem {
  key: number;
}

const TONE_RING: Record<string, string> = {
  mini: "var(--mini)",
  major: "var(--major)",
  badge: "var(--gold)",
};

export default function CelebrationHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    let counter = 0;
    const onCelebrate = (e: Event) => {
      const items = (e as CustomEvent<CelebrationItem[]>).detail ?? [];
      const withKeys = items.map((it) => ({ ...it, key: counter++ }));
      setToasts((prev) => [...prev, ...withKeys]);
      withKeys.forEach((t) => {
        setTimeout(
          () => setToasts((prev) => prev.filter((x) => x.key !== t.key)),
          4200
        );
      });
    };
    const onLevelUp = (e: Event) => {
      setLevelUp((e as CustomEvent<number>).detail);
      setTimeout(() => setLevelUp(null), 2600);
    };
    window.addEventListener("ayuta:celebrate", onCelebrate);
    window.addEventListener("ayuta:levelup", onLevelUp);
    return () => {
      window.removeEventListener("ayuta:celebrate", onCelebrate);
      window.removeEventListener("ayuta:levelup", onLevelUp);
    };
  }, []);

  return (
    <>
      {/* Toasts */}
      <div className="fixed z-50 inset-x-0 top-4 flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.key}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl glass-raised px-4 py-3 max-w-sm w-full"
              style={{
                boxShadow: `0 0 24px -4px ${
                  TONE_RING[t.tone ?? "mini"]
                }, inset 0 1px 0 rgba(255,255,255,0.08)`,
              }}
            >
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.05 }}
                className="text-3xl"
              >
                {t.icon}
              </motion.span>
              <div className="min-w-0">
                <div
                  className="text-[11px] font-bold uppercase tracking-wide"
                  style={{ color: TONE_RING[t.tone ?? "mini"] }}
                >
                  {t.subtitle}
                </div>
                <div className="text-sm font-semibold truncate">{t.title}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Level-up full-screen moment */}
      <AnimatePresence>
        {levelUp !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.5, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="relative text-center"
            >
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-accent-2 mb-2">
                Level Up
              </div>
              <div className="text-8xl font-black gradient-text leading-none">
                {levelUp}
              </div>
              <div className="text-sm text-muted mt-3">
                Polymath level {levelUp} reached
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
