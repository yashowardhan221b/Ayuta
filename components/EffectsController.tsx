"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/settings";

// Toggles the global `reduce-fx` body class from the saved setting, and keeps it
// in sync when settings change on this tab.
export default function EffectsController() {
  useEffect(() => {
    const apply = () => {
      document.body.classList.toggle("reduce-fx", !!getSettings().reduceEffects);
    };
    apply();
    window.addEventListener("ayuta:data-changed", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("ayuta:data-changed", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);
  return null;
}
