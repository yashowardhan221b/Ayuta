import { FRAMEWORKS } from "@/lib/frameworks";

export const metadata = {
  title: "The ideas behind Ayuta",
};

const ORDER = [
  "first20",
  "tenK",
  "dreyfus",
  "deliberate",
  "habit",
  "compounding",
];

export default function IdeasPage() {
  const items = ORDER.map((k) => FRAMEWORKS[k]).filter(Boolean);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">The ideas behind Ayuta</h1>
        <p className="text-sm text-muted mt-1">
          Ayuta is stitched together from a handful of well-known ideas about
          time, practice, and getting good at things. Here they are.
        </p>
      </div>

      {items.map((fw) => (
        <article
          key={fw.key}
          className="rounded-2xl glass p-4"
        >
          <h2 className="font-semibold">{fw.title}</h2>
          <div className="text-xs text-dim mb-2">{fw.source}</div>
          <p className="text-sm text-muted leading-relaxed">{fw.blurb}</p>
          {fw.url && (
            <a
              href={fw.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-accent"
            >
              Learn more ↗
            </a>
          )}
        </article>
      ))}

      <p className="text-xs text-dim pt-2">
        Ayuta (अयुत) is Sanskrit for ten thousand.
      </p>
    </div>
  );
}
