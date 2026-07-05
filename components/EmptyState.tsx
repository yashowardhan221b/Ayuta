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
    <div className="rounded-3xl glass p-8 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <h2 className="text-lg font-bold mb-1">{title}</h2>
      <p className="text-sm text-muted max-w-sm mx-auto mb-5">{body}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="inline-flex items-center rounded-full bg-cta-grad px-6 py-3 text-sm font-bold uppercase tracking-wide text-white min-h-[48px] shadow-cta"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
