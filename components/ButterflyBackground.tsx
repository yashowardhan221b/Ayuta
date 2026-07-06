"use client";

import { useHydrated, useLiveData } from "@/lib/hooks";
import { getAllEntries } from "@/lib/timeEntries";
import ButterflyField from "./ButterflyField";

// Flock grows with lifetime hours — "your time takes wing."
export default function ButterflyBackground() {
  const hydrated = useHydrated();
  const [hours] = useLiveData(
    () => getAllEntries().reduce((s, e) => s + e.durationMinutes, 0) / 60
  );
  if (!hydrated) return null;
  const count = Math.max(10, Math.min(40, 10 + Math.floor(hours / 15)));
  return <ButterflyField count={count} />;
}
