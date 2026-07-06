"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MasteryRing from "./MasteryRing";
import AnimatedNumber from "./AnimatedNumber";
import type { ComboTier } from "@/lib/combo";
import type { DailyGoal } from "@/lib/dailyGoal";

export default function OctopusHero({
  level,
  totalHours,
  streakDays,
  atRisk,
  combo,
  freezes,
  goal,
}: {
  level: number;
  totalHours: number;
  streakDays: number;
  atRisk: boolean;
  combo: ComboTier;
  freezes: number;
  goal: DailyGoal;
}) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <section className="relative rounded-3xl overflow-hidden h-[46vh] min-h-[320px] max-h-[440px]">
      {/* deep-sea fallback scene (always behind; shows if no photo) */}
      <div className="absolute inset-0 bg-bg2">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 8%, rgba(45,212,191,0.16), transparent 55%)," +
              "radial-gradient(90% 70% at 50% 60%, rgba(157,123,255,0.28), transparent 60%)," +
              "radial-gradient(140% 120% at 50% 130%, #041016, transparent 60%)",
          }}
        />
        {/* a lurking bioluminescent presence */}
        <div
          className="absolute left-1/2 top-[46%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-60"
          style={{ background: "radial-gradient(circle, #6d54c9, transparent 70%)" }}
        />
        {/* caustic rays */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background:
              "repeating-linear-gradient(105deg, transparent 0 60px, rgba(190,240,255,0.9) 60px 64px)",
            maskImage: "linear-gradient(to bottom, black, transparent 75%)",
          }}
        />
      </div>

      {/* the real octopus photo (drop-in at /public/octopus-hero.webp) */}
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/octopus-hero.webp"
          alt="A deep-sea octopus — emblem of the polymath: one mind, many crafts."
          onError={() => setHasImage(false)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: "50% 22%", // keep the head and eyes in frame
            animation: "kenburns 26s ease-in-out infinite alternate",
          }}
        />
      )}

      {/* grade stack: tint + vignette + melt into the page bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(160deg, rgba(45,212,191,0.14), transparent 45%)," +
            "radial-gradient(120% 100% at 50% 20%, transparent 55%, rgba(4,20,26,0.55))," +
            "linear-gradient(to bottom, transparent 28%, rgba(4,20,26,0.6) 72%, var(--bg) 100%)",
        }}
      />

      {/* rising motes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#bfe8f2]"
            style={{
              left: `${m.x}%`,
              bottom: `${m.y}%`,
              width: m.r,
              height: m.r,
              opacity: 0,
              animation: `rise ${m.d}s linear ${m.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* polymath hub (glass), lower third */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="absolute inset-x-3 bottom-3 rounded-2xl glass-raised p-4"
      >
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.24em] text-accent font-bold">
              One mind · many crafts
            </div>
            <div className="flex items-end gap-2 mt-0.5">
              <AnimatedNumber
                value={level}
                className="text-4xl font-black gradient-text leading-none"
              />
              <div className="text-xs text-muted mb-1 tabnums">
                Polymath level ·{" "}
                <AnimatedNumber value={totalHours} decimals={1} suffix="h" /> logged
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span
                className="text-[11px] font-bold rounded-full px-2.5 py-1"
                style={{
                  color: "var(--flame-2)",
                  background: "rgba(255,158,92,0.14)",
                  border: "1px solid rgba(255,158,92,0.5)",
                }}
              >
                {streakDays > 0 && <span className="flame">🔥</span>} {streakDays}d
              </span>
              {combo.multiplier > 1 && (
                <span
                  className="text-[11px] font-bold rounded-full px-2.5 py-1"
                  style={{
                    color: combo.color,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${combo.color}`,
                  }}
                >
                  {combo.multiplier}× combo
                </span>
              )}
              {freezes > 0 && (
                <span
                  className="text-[11px] font-bold rounded-full px-2.5 py-1 text-mini"
                  style={{
                    background: "rgba(56,189,248,0.12)",
                    border: "1px solid var(--mini)",
                  }}
                >
                  ❄️ {freezes}
                </span>
              )}
            </div>
          </div>

          <MasteryRing
            pct={goal.pct}
            size={64}
            stroke={7}
            color={goal.done ? "var(--cta-1)" : "var(--accent)"}
          >
            <span className="text-base">{goal.done ? "✅" : "🎯"}</span>
          </MasteryRing>
        </div>
        {atRisk && (
          <div className="mt-2 text-[11px] text-gold flex items-center gap-1.5">
            <span className="flame">🔥</span> Streak alive — log anything today to
            keep it.
          </div>
        )}
      </motion.div>
    </section>
  );
}

const MOTES = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 61) % 100,
  y: (i * 37) % 40,
  r: (i % 3) + 1.5,
  d: 9 + (i % 5) * 2.5,
  delay: (i % 7) * 1.3,
}));
