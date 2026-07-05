"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { haptic } from "@/lib/feedback";

const SUGGESTIONS: { name: string; icon: string; color: string }[] = [
  { name: "Guitar", icon: "🎸", color: "#f97316" },
  { name: "Spanish", icon: "🗣️", color: "#f43f5e" },
  { name: "Coding", icon: "💻", color: "#38bdf8" },
  { name: "Chess", icon: "♟️", color: "#a855f7" },
  { name: "Drawing", icon: "🎨", color: "#ec4899" },
  { name: "Writing", icon: "✍️", color: "#eab308" },
  { name: "Running", icon: "🏃", color: "#10b981" },
  { name: "Piano", icon: "🎹", color: "#8b5cf6" },
  { name: "Reading", icon: "📚", color: "#06b6d4" },
];

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const pick = (s?: { name: string; icon: string; color: string }) => {
    haptic(12);
    if (s) {
      router.push(
        `/new?name=${encodeURIComponent(s.name)}&icon=${encodeURIComponent(
          s.icon
        )}&color=${encodeURIComponent(s.color)}`
      );
    } else {
      router.push("/new");
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="text-7xl"
            >
              🏔️
            </motion.div>
            <div>
              <h1 className="text-3xl font-black">
                Welcome to <span className="gradient-text">Ayuta</span>
              </h1>
              <p className="text-muted mt-2 max-w-sm mx-auto">
                Pick the things you want to get good at. Log your hours. Watch
                yourself climb from Novice to Expert — one checkpoint at a time.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-sm text-muted">
              <span>⏱️ Track time with a timer or by hand</span>
              <span>🎯 Hit mini &amp; major checkpoints</span>
              <span>🔥 Build streaks and level up</span>
            </div>
            <button
              onClick={() => {
                haptic(12);
                setStep(1);
              }}
              className="rounded-full bg-cta-grad px-8 py-3.5 font-bold uppercase tracking-wide text-white shadow-cta active:translate-y-1 active:shadow-none transition-all"
            >
              Get started →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h2 className="text-2xl font-black">What&apos;s first?</h2>
              <p className="text-muted text-sm mt-1">
                Pick something to start — you can add more anytime.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.04 * i, type: "spring", stiffness: 300, damping: 18 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => pick(s)}
                  className="rounded-2xl glass p-3 flex flex-col items-center gap-1 aspect-square justify-center"
                  style={{ boxShadow: `0 8px 20px -12px ${s.color}` }}
                >
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-xs font-semibold">{s.name}</span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => pick()}
              className="w-full rounded-full border border-border-strong py-3 text-sm font-semibold text-muted"
            >
              Something else →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
