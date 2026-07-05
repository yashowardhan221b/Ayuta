import Link from "next/link";

export default function EmptyState({
  icon,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  icon: string;
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-sm text-muted max-w-sm mx-auto mb-5">{body}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white min-h-[44px]"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
