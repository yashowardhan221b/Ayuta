"use client";

import { motion } from "framer-motion";

export default function ProgressBar({
  percent,
  color = "var(--accent)",
  height = 8,
  glow = false,
  shimmer = false,
}: {
  percent: number;
  color?: string;
  height?: number;
  glow?: boolean;
  shimmer?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: "rgba(255,255,255,0.07)" }}
    >
      <motion.div
        className="h-full rounded-full relative overflow-hidden"
        style={{
          background: color,
          boxShadow: glow ? `0 0 12px ${color}` : undefined,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.05 }}
      >
        {shimmer && clamped > 0 && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.2s linear infinite",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
