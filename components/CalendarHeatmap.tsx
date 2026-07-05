"use client";

import type { TimeEntry } from "@/lib/types";
import { getLocalDateString } from "@/lib/streak";
import { withAlpha } from "@/lib/colors";
import { formatDuration } from "@/lib/gamification";

const WEEKS = 17;

export default function CalendarHeatmap({
  entries,
  color,
}: {
  entries: TimeEntry[];
  color: string;
}) {
  // minutes per local date
  const byDate = new Map<string, number>();
  for (const e of entries) {
    byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.durationMinutes);
  }

  const today = new Date();
  // Start on the Monday WEEKS weeks ago so columns are aligned weeks.
  const start = new Date(today);
  const day = (start.getDay() + 6) % 7; // Mon=0
  start.setDate(start.getDate() - day - (WEEKS - 1) * 7);

  const columns: { date: string; minutes: number; future: boolean }[][] = [];
  const cursor = new Date(start);
  const todayStr = getLocalDateString(today);
  for (let w = 0; w < WEEKS; w++) {
    const col: { date: string; minutes: number; future: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const ds = getLocalDateString(cursor);
      col.push({
        date: ds,
        minutes: byDate.get(ds) ?? 0,
        future: ds > todayStr,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    columns.push(col);
  }

  const intensity = (mins: number): number => {
    if (mins <= 0) return 0;
    if (mins < 15) return 0.3;
    if (mins < 45) return 0.5;
    if (mins < 90) return 0.75;
    return 1;
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((cell) => (
              <div
                key={cell.date}
                title={
                  cell.future
                    ? ""
                    : `${cell.date}: ${
                        cell.minutes > 0 ? formatDuration(cell.minutes) : "nothing logged"
                      }`
                }
                className="h-3 w-3 rounded-[3px]"
                style={{
                  background:
                    cell.future
                      ? "transparent"
                      : cell.minutes > 0
                      ? withAlpha(color, intensity(cell.minutes))
                      : "var(--border)",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
