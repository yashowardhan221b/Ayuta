"use client";

import { useCallback, useEffect, useState } from "react";

// True only after the first client render — use to gate localStorage reads and
// avoid a hydration mismatch / flash of wrong numbers.
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// Re-runs `read()` whenever data changes (same tab via custom event, other tabs
// via the storage event). Returns [value, refresh].
export function useLiveData<T>(read: () => T, deps: unknown[] = []): [T, () => void] {
  const hydrated = useHydrated();
  const [value, setValue] = useState<T>(read);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refresh = useCallback(() => setValue(read()), deps);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("ayuta:data-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ayuta:data-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return [value, refresh];
}
