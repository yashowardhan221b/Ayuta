"use client";

import { useEffect, useState } from "react";
import type { CelebrationItem } from "@/lib/celebrate";

interface Toast extends CelebrationItem {
  key: number;
}

export default function CelebrationHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let counter = 0;
    const handler = (e: Event) => {
      const items = (e as CustomEvent<CelebrationItem[]>).detail ?? [];
      const withKeys = items.map((it) => ({ ...it, key: counter++ }));
      setToasts((prev) => [...prev, ...withKeys]);
      withKeys.forEach((t) => {
        setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.key !== t.key));
        }, 4200);
      });
    };
    window.addEventListener("ayuta:celebrate", handler);
    return () => window.removeEventListener("ayuta:celebrate", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed z-50 inset-x-0 top-4 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.key}
          className="animate-pop-in pointer-events-auto flex items-center gap-3 rounded-xl border border-gold/40 bg-raised px-4 py-3 shadow-lg max-w-sm w-full"
        >
          <span className="text-2xl">{t.icon}</span>
          <div className="min-w-0">
            <div className="text-xs text-gold font-semibold uppercase tracking-wide">
              {t.subtitle}
            </div>
            <div className="text-sm font-medium truncate">{t.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
