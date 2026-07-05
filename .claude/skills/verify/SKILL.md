---
name: verify
description: Build, launch, and drive Ayuta end-to-end to verify changes at the browser surface.
---

# Verifying Ayuta

Ayuta is a Next.js 14 app with **no backend** — all state lives in browser
localStorage (keys prefixed `ayuta_`). Verification means driving the UI in a
real browser; there are no tests and nothing meaningful to curl.

## Build & launch

```bash
npm run build          # must be clean (lint + types run inside)
npx next start -p 3111 # serve the production build
```

Dev mode (`npm run dev`) hides hydration mismatches less than prod — always
verify against `next start`.

## Drive (Playwright)

Global playwright is available: `NODE_PATH=/opt/node22/lib/node_modules node script.js`
with pre-installed Chromium (`PLAYWRIGHT_BROWSERS_PATH` already set).
Use viewport 390×844 first (mobile is the primary target), then 1280×800.

Flows worth driving after any change:

1. Create interest at `/new` (Dabble preselected) → lands on detail, `0.0h / 20h`, stage Novice.
2. Manual log at `/log` → celebration toasts fire once; totals update.
3. Start timer → reload page → clock continues from persisted `startedAt`.
4. Long-session guard: `page.evaluate` backdating `ayuta_active_timer.startedAt`
   5h, reload, Stop → warning shown, suggested minutes capped at 240.
5. Backdated manual entry (3 days ago) → dashboard streak must NOT change.
6. Archive on detail → gone from dashboard, restorable in `/settings`.
7. Export button → download `ayuta-backup-YYYY-MM-DD.json`; import a malformed
   file → clean error, no data loss.

## Gotchas

- **Collect `pageerror` events on every run.** React #418/#423 = a component
  reading localStorage during first render without gating on `useHydrated()`
  (see `lib/hooks.ts`). Any new client component that renders from storage in
  SSR'd HTML needs that gate.
- `window.confirm` dialogs (discard timer, deletes) — attach a Playwright
  `dialog` handler or clicks will hang.
- Kill the server by port listener PID, not `pkill -f "next start"` (that
  pattern matches your own shell).
