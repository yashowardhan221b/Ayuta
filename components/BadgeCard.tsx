import type { BadgeDef } from "@/lib/badges";

export default function BadgeCard({
  def,
  unlocked,
  count,
}: {
  def: BadgeDef;
  unlocked: boolean;
  count?: number;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 text-center transition-transform hover:-translate-y-0.5 ${
        unlocked
          ? "border-gold/40 bg-gold/5 shadow-[0_0_18px_-6px_var(--gold)]"
          : "glass opacity-55"
      }`}
    >
      <div className={`text-3xl mb-1 ${unlocked ? "" : "grayscale"}`}>
        {def.icon}
      </div>
      <div className="text-sm font-medium">{def.name}</div>
      <div className="text-[11px] text-muted leading-tight mt-0.5">
        {def.description}
      </div>
      {unlocked && def.perInterest && (count ?? 0) > 1 && (
        <div className="text-[10px] text-gold mt-1">×{count}</div>
      )}
      {!unlocked && (
        <div className="text-[10px] text-dim mt-1 uppercase tracking-wide">
          Locked
        </div>
      )}
    </div>
  );
}
