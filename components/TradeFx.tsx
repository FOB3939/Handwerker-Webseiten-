import type { CSSProperties } from "react";

// Gewerk-Signatur: ein Effekt im Hero (einmal beim Öffnen, nach dem Logo-Intro) und eine passende
// Trennleiste zwischen Abschnitten. Reines SVG/CSS (keyframes in app/globals.css, Präfix fx2-),
// läuft daher auch in exportierten Seiten; bei „Bewegung reduzieren“ steht der Endzustand still.
export type TradeFxKind = "paint" | "tiles" | "laser" | "planks" | "leaves" | "circuit" | "bricks" | "keys";

export const FX_BY_FAMILY: Record<string, TradeFxKind> = {
  paint: "paint", bath: "tiles", drywall: "laser", kitchen: "laser", parquet: "planks",
  garden: "leaves", electric: "circuit", facade: "bricks", key: "keys",
};

// Erst das Gewerk im Text (z. B. „Maler“ mit Fassaden-Szene bleibt Maler), dann die Material-Familie.
const TRADE_RULES: [RegExp, TradeFxKind][] = [
  [/maler|lackier|anstrich|tapezier/i, "paint"],
  [/fliese|bad|sanitär|naturstein|mosaik/i, "tiles"],
  [/elektr|strom|photovoltaik|solar|wallbox/i, "circuit"],
  [/garten|baum|landschaft|grün|rasen|hecke/i, "leaves"],
  [/parkett|boden|laminat|vinyl|dielen/i, "planks"],
  [/hausmeister|objekt|reinigung|entrümpel/i, "keys"],
  [/trockenbau|innenausbau|akustik|dämm|isolier/i, "laser"],
  [/maurer|fassade|bau\b|rohbau|pflaster/i, "bricks"],
];
export function fxFor(trade: string, family: string): TradeFxKind {
  for (const [re, k] of TRADE_RULES) if (re.test(trade)) return k;
  return FX_BY_FAMILY[family] ?? "laser";
}

const v = (o: Record<string, string | number>) => o as CSSProperties;

export function HeroFx({ kind }: { kind: TradeFxKind }) {
  return (
    <div className={`fx2 fx2-${kind} pointer-events-none absolute inset-0 overflow-hidden ${kind === "tiles" ? "z-[3]" : "-z-[1]"}`} aria-hidden="true">
      {kind === "paint" && (
        <>
          <svg className="fx2-paint-band absolute -left-6 top-[16%] h-24 w-[85%] opacity-30 sm:h-36 lg:w-[62%]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0 70 C 120 40, 260 95, 400 62 S 680 30, 820 66 S 1080 92, 1200 58" fill="none" stroke="rgb(var(--accent))" strokeWidth="46" strokeLinecap="round" pathLength={1} opacity="0.9" />
            <path d="M0 74 C 150 52, 300 98, 460 66 S 760 40, 900 70 S 1100 88, 1200 64" fill="none" stroke="rgb(var(--accent) / .45)" strokeWidth="18" strokeLinecap="round" pathLength={1} />
          </svg>
          <svg className="fx2-roller absolute left-0 top-[14%] h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--ink))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h13v5H4z" fill="rgb(var(--surface))" /><path d="M17 6.5h2.5V12H11v3" /><path d="M9.5 15h3v6h-3z" />
          </svg>
        </>
      )}
      {kind === "tiles" && (
        <div className="fx2-tile-grid absolute inset-0 grid grid-cols-8 grid-rows-5">
          {Array.from({ length: 40 }, (_, i) => (
            <span key={i} className="fx2-tile border border-t-line/70 bg-t-surface" style={v({ "--i": ((i % 8) + Math.floor(i / 8)) })} />
          ))}
        </div>
      )}
      {kind === "laser" && (
        <>
          <span className="fx2-laser absolute inset-x-0 top-0 h-px bg-[rgb(255_40_40)] shadow-[0_0_12px_2px_rgba(255,40,40,.65)]" />
          <svg className="fx2-studs absolute right-0 top-0 hidden h-full w-1/3 opacity-30 lg:block" viewBox="0 0 300 600" preserveAspectRatio="none">
            {[30, 105, 180, 255].map((x, i) => <path key={x} d={`M${x} 0V600`} stroke="rgb(var(--ink))" strokeWidth="2" pathLength={1} style={v({ "--i": i })} />)}
            <path d="M0 300H300" stroke="rgb(var(--ink))" strokeWidth="2" pathLength={1} style={v({ "--i": 4 })} />
          </svg>
        </>
      )}
      {kind === "planks" && (
        <div className="fx2-ground absolute inset-x-0 flex h-5 flex-col gap-px opacity-80 sm:h-7">
          {[0, 1].map((row) => (
            <div key={row} className="flex flex-1 gap-px" style={{ marginLeft: row ? "-6%" : 0 }}>
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="fx2-plank h-full flex-1 rounded-[1px]" style={v({ "--i": i + row * 3, background: `rgb(var(--accent) / ${0.35 + ((i * 7 + row * 3) % 5) * 0.13})` })} />
              ))}
            </div>
          ))}
        </div>
      )}
      {kind === "leaves" && (
        <>
          <svg className="fx2-ground absolute inset-x-0 h-12 w-full sm:h-16" viewBox="0 0 1200 80" preserveAspectRatio="none">
            {Array.from({ length: 60 }, (_, i) => {
              const x = i * 20 + (i % 3) * 4, h = 30 + ((i * 37) % 40);
              return <path key={i} className="fx2-blade" d={`M${x} 80 Q ${x + 6} ${80 - h / 2} ${x + (i % 2 ? 10 : -6)} ${80 - h}`} fill="none" stroke="rgb(var(--accent))" strokeWidth="3" strokeLinecap="round" pathLength={1} style={v({ "--i": i % 12 })} />;
            })}
          </svg>
          {[8, 22, 37, 51, 64, 78, 92].map((left, i) => (
            <svg key={left} className="fx2-leaf absolute top-0 h-7 w-7 sm:h-9 sm:w-9" style={v({ left: `${left}%`, "--i": i })} viewBox="0 0 24 24" fill="rgb(var(--accent) / .7)"><path d="M5 19c0-8.5 5.5-14 15-14 0 9.5-5.5 15-14 15z" /></svg>
          ))}
        </>
      )}
      {kind === "circuit" && (
        <svg className="fx2-ground-tall absolute inset-x-0 h-40 w-full" viewBox="0 0 1200 160" preserveAspectRatio="none">
          <path className="fx2-trace" d="M0 140 H220 V60 H520 V120 H820 V30 H1200" fill="none" stroke="rgb(var(--accent) / .35)" strokeWidth="3" pathLength={1} />
          <path className="fx2-pulse" d="M0 140 H220 V60 H520 V120 H820 V30 H1200" fill="none" stroke="rgb(var(--accent))" strokeWidth="4" strokeLinecap="round" pathLength={1} />
          {[[220, 60], [520, 120], [820, 30]].map(([x, y], i) => <circle key={i} className="fx2-node" cx={x} cy={y} r="7" fill="rgb(var(--accent))" style={v({ "--i": i })} />)}
        </svg>
      )}
      {kind === "bricks" && (
        <div className="fx2-ground-tall absolute right-0 hidden w-72 flex-col-reverse gap-1 p-4 opacity-60 sm:flex">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex gap-1" style={{ marginLeft: row % 2 ? 18 : 0 }}>
              {Array.from({ length: 5 - (row > 2 ? 1 : 0) }, (_, i) => (
                <span key={i} className="fx2-brick h-4 w-12 rounded-[2px] bg-t-accent" style={v({ "--i": row * 5 + i })} />
              ))}
            </div>
          ))}
        </div>
      )}
      {kind === "keys" && (
        <>
          <span className="fx2-shine absolute -inset-y-10 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <svg className="fx2-key fx2-ground-tall absolute right-8 hidden h-16 w-16 sm:block" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--accent))" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 15a4 4 0 1 0 0-.01" /><path d="M10.8 12.2L20 3" /><path d="M16 7l2 2" /><path d="M18 5l2 2" />
          </svg>
        </>
      )}
    </div>
  );
}

// Thematische Trennleiste – zeichnet sich beim Hineinscrollen (data-reveal).
export function TradeDivider({ kind }: { kind: TradeFxKind }) {
  return (
    <div data-reveal className={`fx2-div fx2-div-${kind} mx-auto max-w-site overflow-hidden px-4 sm:px-6`} aria-hidden="true">
      <svg className="h-10 w-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
        {kind === "paint" && <path d="M10 22 C 200 8, 380 34, 600 20 S 1000 8, 1190 22" fill="none" stroke="rgb(var(--accent))" strokeWidth="10" strokeLinecap="round" pathLength={1} />}
        {kind === "tiles" && Array.from({ length: 30 }, (_, i) => <rect key={i} x={i * 40 + 2} y="6" width="36" height="28" rx="2" fill={i % 3 ? "rgb(var(--line))" : "rgb(var(--accent) / .55)"} style={v({ "--i": i })} className="fx2-div-cell" />)}
        {kind === "laser" && (<><path d="M0 20H1200" stroke="rgb(255 40 40)" strokeWidth="1.5" strokeDasharray="1 0" pathLength={1} /><rect x="560" y="10" width="80" height="20" rx="10" fill="none" stroke="rgb(var(--ink))" strokeWidth="2" /><circle cx="600" cy="20" r="5" fill="rgb(var(--accent))" className="fx2-bubble" /></>)}
        {kind === "planks" && Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 100 + 2} y="12" width="96" height="16" rx="1" fill={`rgb(var(--accent) / ${0.3 + (i % 4) * 0.15})`} style={v({ "--i": i })} className="fx2-div-cell" />)}
        {kind === "leaves" && Array.from({ length: 80 }, (_, i) => <path key={i} d={`M${i * 15} 40 Q ${i * 15 + 3} 26 ${i * 15 + (i % 2 ? 6 : -3)} ${12 + (i * 13) % 18}`} fill="none" stroke="rgb(var(--accent))" strokeWidth="2" strokeLinecap="round" pathLength={1} />)}
        {kind === "circuit" && (<><path d="M0 20H300V8H700V32H1000V20H1200" fill="none" stroke="rgb(var(--accent) / .4)" strokeWidth="2" pathLength={1} /><path className="fx2-div-pulse" d="M0 20H300V8H700V32H1000V20H1200" fill="none" stroke="rgb(var(--accent))" strokeWidth="3" pathLength={1} /></>)}
        {kind === "bricks" && Array.from({ length: 24 }, (_, i) => <rect key={i} x={i * 50 + (i % 2) * 0} y={i % 2 ? 22 : 4} width="46" height="14" rx="1" fill={`rgb(var(--accent) / ${i % 3 ? 0.4 : 0.75})`} style={v({ "--i": i })} className="fx2-div-cell" />)}
        {kind === "keys" && (<><path d="M20 20H1180" stroke="rgb(var(--line))" strokeWidth="2" strokeDasharray="6 10" /><circle cx="600" cy="20" r="9" fill="none" stroke="rgb(var(--accent))" strokeWidth="2.5" /><path d="M609 20H640M630 20V28M638 20V26" stroke="rgb(var(--accent))" strokeWidth="2.5" strokeLinecap="round" /></>)}
      </svg>
    </div>
  );
}
