// Ayuta's custom cartoon icon set — chunky strokes, warm palette, rounded joins.
// All icons accept `size` and `className`; line icons inherit `currentColor`.

interface IconProps {
  size?: number;
  className?: string;
}

function Svg({
  size = 24,
  className,
  children,
  viewBox = "0 0 24 24",
}: IconProps & { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/* ---------- Brand ---------- */

export function AyutaMark({ size = 32, className }: IconProps) {
  return (
    <Svg size={size} className={className} viewBox="0 0 48 48">
      <g stroke="#3a1d0c" strokeWidth={2} strokeLinejoin="round">
        <path d="M24 14c-3-6-9-8-13-6-3 2-3 8 1 12 3 3 8 4 12 3z" fill="#f97316" />
        <path d="M24 14c3-6 9-8 13-6 3 2 3 8-1 12-3 3-8 4-12 3z" fill="#fb923c" />
        <path d="M24 23c-3 2-7 3-10 8-2 4-1 8 2 9 3 1 7-3 8-8z" fill="#f97316" />
        <path d="M24 23c3 2 7 3 10 8 2 4 1 8-2 9-3 1-7-3-8-8z" fill="#fb923c" />
        <path d="M24 12v20" strokeLinecap="round" />
        <path d="M24 12c-1-3-3-4-5-4M24 12c1-3 3-4 5-4" strokeLinecap="round" />
      </g>
      <circle cx="17" cy="16" r="1.4" fill="#fff7ed" />
      <circle cx="31" cy="16" r="1.4" fill="#fff7ed" />
    </Svg>
  );
}

/* ---------- Navigation ---------- */

export function IconHome({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v9h14v-9" />
        <path d="M10 19v-5h4v5" />
      </g>
    </Svg>
  );
}

// Simplified two-wing butterfly that still reads at 24px.
export function IconPortfolio({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
        <path
          d="M12 7C10 4 6.2 3.4 4.4 5.2 2.6 7 3.4 11 6.2 12.6 8 13.7 10.6 13.6 12 12.6"
          fill="rgba(249,115,22,.4)"
        />
        <path
          d="M12 7c2-3 5.8-3.6 7.6-1.8 1.8 1.8 1 5.8-1.8 7.4-1.8 1.1-4.4 1-5.8 0"
          fill="rgba(236,72,153,.35)"
        />
        <path d="M12 6v13" strokeLinecap="round" />
        <path d="M12 6c-.6-1.6-1.8-2.4-3-2.4M12 6c.6-1.6 1.8-2.4 3-2.4" strokeLinecap="round" />
      </g>
    </Svg>
  );
}

export function IconLog({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </g>
    </Svg>
  );
}

export function IconProfile({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5l-2 5-5 2 2-5z" fill="rgba(249,115,22,.4)" />
      </g>
    </Svg>
  );
}

export function IconStats({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />
      </g>
    </Svg>
  );
}

export function IconAwards({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="rgba(251,191,36,.35)" />
        <path d="M7 6H4c0 3 1.5 4.5 3 4.5M17 6h3c0 3-1.5 4.5-3 4.5" />
        <path d="M12 14v3M8.5 20h7M10 20c0-2 .8-3 2-3s2 1 2 3" />
      </g>
    </Svg>
  );
}

export function IconIdeas({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M12 3a6 6 0 0 1 3.5 10.9c-.8.6-1 1.4-1 2.1h-5c0-.7-.2-1.5-1-2.1A6 6 0 0 1 12 3z"
          fill="rgba(251,191,36,.3)"
        />
        <path d="M10 19h4M10.5 21.5h3" />
      </g>
    </Svg>
  );
}

// A proper gear (fixes the earlier "sun" reading).
export function IconSettings({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
        <path
          d="M12 4l1 2.2a6 6 0 0 1 2.1.9l2.3-.7 1.6 2.8-1.6 1.7a6 6 0 0 1 0 2.2l1.6 1.7-1.6 2.8-2.3-.7a6 6 0 0 1-2.1.9L12 20l-1-2.2a6 6 0 0 1-2.1-.9l-2.3.7-1.6-2.8 1.6-1.7a6 6 0 0 1 0-2.2L5 9.2l1.6-2.8 2.3.7a6 6 0 0 1 2.1-.9z"
          fill="rgba(255,255,255,.08)"
        />
        <circle cx="12" cy="12" r="2.6" fill="rgba(249,115,22,.4)" />
      </g>
    </Svg>
  );
}

/* ---------- Pursuit icons ---------- */

export function PGuitar({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#3a1d0c" strokeWidth={1.6} strokeLinejoin="round">
        <circle cx="9" cy="16" r="5" fill="#f97316" />
        <circle cx="9" cy="16" r="1.6" fill="#241326" />
        <path d="M12.5 12.5l6-6" strokeLinecap="round" strokeWidth={2.2} />
        <rect x="17" y="4" width="4" height="4" rx="1" fill="#fbbf24" transform="rotate(45 19 6)" />
      </g>
    </Svg>
  );
}

export function PCode({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 8l-4 4 4 4" stroke="#34d399" />
        <path d="M16 8l4 4-4 4" stroke="#34d399" />
        <path d="M13 6l-2 12" stroke="#fbbf24" />
      </g>
    </Svg>
  );
}

export function PChess({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g fill="#8b5cf6" stroke="#2a1046" strokeWidth={1.6} strokeLinejoin="round">
        <path d="M9 20h6l-1-4c1-1 1.5-2.5 1-4-.4-1.2.2-2-.6-3A2.4 2.4 0 1 0 10.2 5C9.4 6 10 6.8 9.6 8c-.5 1.5 0 3 1 4z" />
        <rect x="7.5" y="20" width="9" height="2.2" rx="1.1" />
      </g>
    </Svg>
  );
}

export function PLanguage({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#ec4899" strokeWidth={2} strokeLinejoin="round">
        <path d="M4 5h16v10H12l-4 4v-4H4z" fill="rgba(236,72,153,.25)" />
        <path d="M8 9h8M8 12h5" strokeLinecap="round" />
      </g>
    </Svg>
  );
}

export function PArt({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#3a1d0c" strokeWidth={1.6}>
        <path
          d="M12 3a9 8 0 1 0 0 16c1.6 0 1.4-2 2.6-2.6 1-.5 3 .4 3.7-1.3A9 8 0 0 0 12 3z"
          fill="#fbbf24"
        />
        <circle cx="8" cy="10" r="1.3" fill="#ef4444" stroke="none" />
        <circle cx="12" cy="7.5" r="1.3" fill="#34d399" stroke="none" />
        <circle cx="16" cy="10" r="1.3" fill="#38bdf8" stroke="none" />
      </g>
    </Svg>
  );
}

export function PRun({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#f97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="15" cy="5" r="2" fill="#fbbf24" stroke="none" />
        <path d="M6 21l3-5 3 1 1-5-4-2-3 3" />
        <path d="M13 12l4 2 3-1" />
      </g>
    </Svg>
  );
}

// A quill in an inkwell (fixes the "building" reading).
export function PWrite({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#fbbf24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M19 4c-5 .5-8.5 3-10.5 7L7 15l4-1.5c4-2 6.5-5.5 8-9.5z"
          fill="rgba(251,191,36,.3)"
        />
        <path d="M7 15l-2 5" />
        <path d="M13 8.5c-2 .8-3.6 2.2-4.8 4" strokeWidth={1.4} />
      </g>
    </Svg>
  );
}

// A bubbling flask (replaces the earlier atom, which read as a trademarked logo).
export function PScience({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 3h4M11 3v6l-5.5 9a2 2 0 0 0 1.7 3h9.6a2 2 0 0 0 1.7-3L13 9V3" />
        <path d="M8 15h8" />
        <circle cx="11" cy="18" r="0.9" fill="#38bdf8" stroke="none" />
        <circle cx="14" cy="17" r="0.6" fill="#38bdf8" stroke="none" />
      </g>
    </Svg>
  );
}

export function PMusic({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#ec4899" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V6l10-2v11" />
        <circle cx="6.5" cy="18" r="2.5" fill="rgba(236,72,153,.35)" />
        <circle cx="16.5" cy="15" r="2.5" fill="rgba(236,72,153,.35)" />
      </g>
    </Svg>
  );
}

export function PChef({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#f97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M8 13a4 4 0 1 1 .6-7.9 4.5 4.5 0 0 1 6.8 0A4 4 0 1 1 16 13v5H8z"
          fill="rgba(255,255,255,.12)"
        />
        <path d="M8 18h8M10 13v2.5M14 13v2.5" />
      </g>
    </Svg>
  );
}

export function PCamera({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#8b5cf6" strokeWidth={2} strokeLinejoin="round">
        <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" fill="rgba(139,92,246,.25)" />
        <circle cx="12" cy="13" r="3.4" fill="rgba(139,92,246,.35)" />
      </g>
    </Svg>
  );
}

export function PBook({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <g stroke="#34d399" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6c-2-1.8-5-2-8-1v13c3-1 6-.8 8 1 2-1.8 5-2 8-1V5c-3-1-6-.8-8 1z" fill="rgba(52,211,153,.2)" />
        <path d="M12 6v13" />
      </g>
    </Svg>
  );
}

/* ---------- Registries ---------- */

export const NAV_ICONS: Record<string, (p: IconProps) => JSX.Element> = {
  home: IconHome,
  portfolio: IconPortfolio,
  log: IconLog,
  profile: IconProfile,
  stats: IconStats,
  awards: IconAwards,
  ideas: IconIdeas,
  settings: IconSettings,
};

export interface PursuitIconDef {
  key: string; // stored as `ayuta:<key>` in Interest.icon
  label: string;
  Component: (p: IconProps) => JSX.Element;
}

export const PURSUIT_ICONS: PursuitIconDef[] = [
  { key: "guitar", label: "Guitar", Component: PGuitar },
  { key: "code", label: "Code", Component: PCode },
  { key: "chess", label: "Chess", Component: PChess },
  { key: "language", label: "Language", Component: PLanguage },
  { key: "art", label: "Art", Component: PArt },
  { key: "run", label: "Running", Component: PRun },
  { key: "write", label: "Writing", Component: PWrite },
  { key: "science", label: "Science", Component: PScience },
  { key: "music", label: "Music", Component: PMusic },
  { key: "chef", label: "Cooking", Component: PChef },
  { key: "camera", label: "Photo", Component: PCamera },
  { key: "book", label: "Reading", Component: PBook },
];

// Renders an Interest.icon value: `ayuta:<key>` → custom component, else emoji text.
export function PursuitIcon({
  icon,
  size = 20,
  className,
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  if (icon.startsWith("ayuta:")) {
    const def = PURSUIT_ICONS.find((d) => d.key === icon.slice(6));
    if (def) return <def.Component size={size} className={className} />;
  }
  return (
    <span className={className} style={{ fontSize: size * 0.85, lineHeight: 1 }}>
      {icon}
    </span>
  );
}
