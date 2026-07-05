"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

// Rolls a number up/down when it changes, so progress feels earned.
export default function AnimatedNumber({
  value,
  decimals = 0,
  duration = 0.9,
  className,
  suffix = "",
  prefix = "",
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
