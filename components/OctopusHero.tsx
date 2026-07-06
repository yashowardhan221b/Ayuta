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
      {/* warm garden fallback (behind; shows if photo missing) */}
      <div
        className="absolute inset-0 bg-bg2"
        style={{
          background:
            "radial-gradient(120% 90% at 30% 0%, rgba(251,146,60,0.35), transparent 55%)," +
            "radial-gradient(100% 80% at 90% 10%, rgba(236,72,153,0.28), transparent 55%)," +
            "linear-gradient(180deg,#2a1636,#161a2e)",
        }}
      />

      {/* the monarch migration photo */}
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/monarch-sky.webp"
          alt="A sky full of migrating monarch butterflies — one life, many wings."
          onError={() => setHasImage(false)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: "50% 38%",
            animation: "kenburns 30s ease-in-out infinite alternate",
          }}
        />
      )}

      {/* grade: warm sheen + gentle vignette + melt bottom into the page bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(160deg, rgba(251,191,36,0.10), transparent 42%)," +
            "radial-gradient(120% 100% at 50% 18%, transparent 60%, rgba(20,12,26,0.4))," +
            "linear-gradient(to bottom, transparent 30%, rgba(20,16,40,0.5) 74%, var(--bg) 100%)",
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
              One life · many wings
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
