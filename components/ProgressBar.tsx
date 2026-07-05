export default function ProgressBar({
  percent,
  color = "var(--accent)",
  height = 8,
}: {
  percent: number;
  color?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="w-full rounded-full bg-border overflow-hidden"
      style={{ height }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped}%`,
          background: color,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}
