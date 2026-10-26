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

export type LogoStyle = "badge" | "ring" | "wordmark" | "block" | "tile" | "stamp";

// Selbst gestaltetes Logo (Emblem + Wortmarke) für den Entwurf – je Firma ein eigener Stil
// (lib/identity.ts). Ein vorhandenes Firmenlogo des Betriebs ersetzt es in der Live-Version.
export function Emblem({ icon, mark, size = 44, className = "", variant = "badge" }: { icon: LogoIcon; mark: string; size?: number; className?: string; variant?: LogoStyle }) {
  const M = "rgb(var(--muted))", A = "rgb(var(--accent))", AI = "rgb(var(--accent-ink))", D = "rgb(var(--dark))", DI = "rgb(var(--dark-ink))";
  const two = mark.length > 1;
  const glyph = (x: number, y: number, sc: number, color: string, w = 2.6) => (
    <g transform={`translate(${x} ${y}) scale(${sc})`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path className="logo-path" d={ICONS[icon]} pathLength={1} />
    </g>
  );
  const letters = (x: number, y: number, fs: number, color: string) => (
    <text x={x} y={y} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="900" fontSize={fs} fill={color} letterSpacing="-0.5">{mark}</text>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      {variant === "badge" && (<>
        <rect x="1" y="1" width="46" height="46" rx="12" fill={A} />
        {letters(two ? 21.5 : 22.5, two ? 32 : 33, two ? 18 : 22, AI)}
        {glyph(29.5, 4.5, 0.52, AI)}
      </>)}
      {variant === "ring" && (<>
        <circle cx="24" cy="24" r="22" fill="none" stroke={A} strokeWidth="3" />
        <circle cx="24" cy="24" r="16.5" fill={A} />
        {glyph(14, 14, 0.85, AI, 2.4)}
      </>)}
      {variant === "wordmark" && glyph(4, 4, 1.65, A, 2)}
      {variant === "block" && (<>
        <rect x="2" y="2" width="44" height="44" fill={D} stroke={A} strokeWidth="2" />
        {letters(24, two ? 31 : 33, two ? 20 : 25, DI)}
        <rect x="2" y="40" width="44" height="6" fill={A} />
      </>)}
      {variant === "tile" && (<>
        <rect x="2" y="2" width="21" height="21" rx="3" fill={A} />
        <rect x="25" y="2" width="21" height="21" rx="3" fill={M} />
        <rect x="2" y="25" width="21" height="21" rx="3" fill={M} />
        <rect x="25" y="25" width="21" height="21" rx="3" fill={A} opacity="0.35" />
        {letters(12.5, 18, 13, AI)}
        {glyph(28, 28, 0.62, AI, 2.6)}
        {glyph(5, 28, 0.62, "#fff", 2.6)}
      </>)}
      {variant === "stamp" && (<>
        <path d="M24 2l19 11v22L24 46 5 35V13z" fill={A} />
        <path d="M24 7l14.7 8.5v17L24 41 9.3 32.5v-17z" fill="none" stroke={AI} strokeWidth="1.2" opacity="0.55" />
        {letters(24, two ? 29.5 : 31, two ? 15 : 19, AI)}
      </>)}
    </svg>
  );
}

export default function BrandLogo({ icon, mark, name, tagline, size = 44, variant = "badge" }: { icon: LogoIcon; mark: string; name: string; tagline: string; size?: number; variant?: LogoStyle }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Emblem icon={icon} mark={mark} size={size} className="shrink-0" variant={variant} />
      <span className="min-w-0 leading-tight">
        <span className={`block truncate font-display font-extrabold tracking-tight ${variant === "wordmark" ? "text-lg" : "text-[15px]"}`}>{name}</span>
        <span className="block truncate text-[12px] font-medium text-t-muted">{tagline}</span>
      </span>
    </span>
  );
}
