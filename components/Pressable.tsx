"use client";

import { motion } from "framer-motion";
import { feedback, type SoundName } from "@/lib/feedback";

// A tactile button: springs on tap, fires haptic + (optional) sound.
export default function Pressable({
  children,
  onClick,
  className = "",
  sound = "tap",
  haptic = 10,
  disabled = false,
  type = "button",
  title,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  sound?: SoundName | null;
  haptic?: number | number[];
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
  "aria-label"?: string;
}) {
  return (
    <motion.button
      type={type}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      onClick={() => {
        if (disabled) return;
        if (sound) feedback(sound, haptic);
        else if (haptic) feedback("tap", haptic);
        onClick?.();
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
