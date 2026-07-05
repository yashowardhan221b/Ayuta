export default function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
      <div
        className="text-xl font-semibold tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </div>
      <div className="text-[11px] text-muted mt-0.5 leading-tight">{label}</div>
      {hint && <div className="text-[10px] text-dim mt-0.5">{hint}</div>}
    </div>
  );
}
