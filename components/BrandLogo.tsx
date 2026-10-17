export type LogoIcon = "drop" | "roller" | "leaf" | "cabinet" | "plank" | "bolt" | "house" | "trowel" | "horseshoe" | "barn" | "broom" | "roof";

const ICONS: Record<LogoIcon, string> = {
  drop: "M12 3c-3 4-6.5 7.6-6.5 11.2a6.5 6.5 0 0 0 13 0C18.5 10.6 15 7 12 3z M9 14.5a3 3 0 0 0 3 3",
  roller: "M4 4h13v5H4z M17 6.5h3v5h-8v3 M11 14.5h2v6h-2z",
  leaf: "M5 19c0-8.5 5.5-14 15-14 0 9.5-5.5 15-14 15 M5 19l8-8",
  cabinet: "M4 3h16v18H4z M4 10h16 M12 10v11 M9 6.5h6 M9.5 15h1 M13.5 15h1",
  plank: "M3 14l6-6h7l-6 6z M8 20l6-6h7l-6 6z",
  bolt: "M13 2L4.5 13.5H11L10 22l8.5-11.5H12z",
  house: "M3 11.5L12 4l9 7.5 M5.5 9.5V20h13V9.5 M10 20v-5h4v5",
  trowel: "M4 20l7-7 M9 11l8.5-8.5 3.5 3.5L12.5 14.5z",
  horseshoe: "M7 20V11a5 5 0 0 1 10 0v9 M7 20h3 M14 20h3 M7 14h2 M15 14h2",
  barn: "M3 10l9-6 9 6v11H3z M9 21v-6h6v6 M9 15l6 6 M15 15l-6 6",
  broom: "M14 3l-4 9 M7 12h8l3 9H4z M9 16v5 M13 16v5",
  roof: "M2 13L12 4l10 9 M5 11v9h14v-9 M15 6V3h3v6",
};

// Selbst gestaltetes Logo (Emblem + Wortmarke) für den Entwurf. Ein vorhandenes Firmenlogo
// des Betriebs ersetzt es in der Live-Version.
export function Emblem({ icon, mark, size = 44, className = "" }: { icon: LogoIcon; mark: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="1" y="1" width="46" height="46" rx="12" fill="rgb(var(--accent))" />
      <rect x="1" y="1" width="46" height="46" rx="12" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
      <text x={mark.length > 1 ? 21.5 : 22.5} y={mark.length > 1 ? 32 : 33} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="900"
        fontSize={mark.length > 1 ? 18 : 22} fill="rgb(var(--accent-ink))" letterSpacing="-0.5">{mark}</text>
      <g transform="translate(29.5 4.5) scale(0.52)" fill="none" stroke="rgb(var(--accent-ink))" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        <path d={ICONS[icon]} />
      </g>
    </svg>
  );
}

export default function BrandLogo({ icon, mark, name, tagline, size = 44 }: { icon: LogoIcon; mark: string; name: string; tagline: string; size?: number }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Emblem icon={icon} mark={mark} size={size} className="shrink-0" />
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-display text-[15px] font-extrabold tracking-tight">{name}</span>
        <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-t-muted">{tagline}</span>
      </span>
    </span>
  );
}
