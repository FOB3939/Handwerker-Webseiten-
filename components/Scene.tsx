export type SceneKind = "bath" | "paint" | "kitchen" | "parquet" | "garden" | "drywall";

interface Props {
  kind: SceneKind;
  palette: string[];
  label: string;
  seed?: number;
  variant?: "before" | "after";
  className?: string;
  showLabel?: boolean;
}

// Selbst gezeichnete Illustrationen (keine fremden Fotos). Sie zeigen die Art des Projekts
// und werden in der Live-Version durch echte Projektfotos des Betriebs ersetzt.
export default function Scene({ kind, palette, label, seed = 0, variant = "after", className = "", showLabel = true }: Props) {
  const p = { a: palette[0], b: palette[1], c: palette[2], d: palette[3], e: palette[4] };
  const id = `${kind}-${seed}-${variant}`;
  const before = variant === "before";
  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative"} overflow-hidden ${className}`} role="img" aria-label={`Beispielillustration: ${label}`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`light-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bcd7e6" />
            <stop offset="1" stopColor="#eef3ea" />
          </linearGradient>
          <linearGradient id={`shade-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        {kind === "garden" ? <Garden p={p} id={id} seed={seed} before={before} /> : <Room kind={kind} p={p} id={id} seed={seed} before={before} />}
        {before && <rect width="400" height="300" fill="#6b6158" opacity="0.28" style={{ mixBlendMode: "multiply" }} />}
      </svg>
      {showLabel && (
        <span className="absolute bottom-3 left-3 max-w-[85%] rounded bg-black/60 px-2 py-1 text-[11px] font-medium leading-snug text-white">
          Beispielbild · später echtes Foto: {label}
        </span>
      )}
    </div>
  );
}

type P = { a: string; b: string; c: string; d: string; e: string };
const VP = { x: 200, y: 150 };

function Room({ kind, p, id, seed, before }: { kind: SceneKind; p: P; id: string; seed: number; before: boolean }) {
  const shift = (seed % 3) * 12 - 12;
  const wall = kind === "paint" ? (before ? "#d9d3c7" : p.a) : kind === "bath" ? "#eef1f1" : "#efe9df";
  const sideWall = kind === "paint" && !before ? p.b : "#e2dbcf";
  const floor = kind === "bath" ? "#d8d4cc" : before && kind === "parquet" ? "#8a7a62" : "#b98d5c";
  return (
    <g transform={`translate(${shift} 0)`}>
      {/* Decke, Wände, Boden */}
      <rect x="-20" y="0" width="440" height="300" fill="#f6f2ea" />
      <polygon points="-20,0 80,40 80,200 -20,300" fill={sideWall} />
      <polygon points="420,0 320,40 320,200 420,300" fill={sideWall} opacity="0.9" />
      <rect x="80" y="40" width="240" height="160" fill={wall} />
      <polygon points="-20,300 80,200 320,200 420,300" fill={floor} />
      <Floor kind={kind} before={before} />
      {/* Fenster mit Lichteinfall */}
      <g>
        <rect x="235" y="62" width="62" height="88" fill="#dbe9f0" stroke="#fff" strokeWidth="5" />
        <line x1="266" y1="62" x2="266" y2="150" stroke="#fff" strokeWidth="3" />
        <polygon points="235,150 297,150 360,300 200,300" fill={`url(#light-${id})`} opacity={before ? 0.25 : 0.7} />
      </g>
      {kind === "bath" && <Bath p={p} />}
      {kind === "paint" && <Paint p={p} before={before} />}
      {kind === "kitchen" && <Kitchen p={p} />}
      {kind === "parquet" && <ParquetDecor p={p} />}
      {kind === "drywall" && <Drywall p={p} before={before} />}
      <rect x="-20" y="0" width="440" height="300" fill={`url(#shade-${id})`} />
    </g>
  );
}

function Floor({ kind, before }: { kind: SceneKind; before: boolean }) {
  const lines = [];
  if (kind === "bath") {
    for (let i = -6; i <= 6; i++) lines.push(<line key={`v${i}`} x1={200 + i * 20} y1="200" x2={200 + i * 58} y2="300" stroke="#fff" strokeWidth="1.2" opacity="0.8" />);
    [215, 235, 262, 300].forEach((y) => lines.push(<line key={`h${y}`} x1="-20" y1={y} x2="420" y2={y} stroke="#fff" strokeWidth="1.2" opacity="0.8" />));
  } else {
    for (let i = -9; i <= 9; i++) {
      const x1 = 200 + i * 13.5;
      const x2 = VP.x + (x1 - VP.x) * 3;
      lines.push(<line key={i} x1={x1} y1="200" x2={x2} y2="350" stroke="#5a3f24" strokeWidth="0.9" opacity="0.35" />);
    }
    [208, 222, 241, 268].forEach((y, i) => lines.push(<line key={`s${y}`} x1={-20 + i * 30} y1={y} x2={140 + i * 40} y2={y} stroke="#5a3f24" strokeWidth="0.8" opacity="0.25" />));
    if (!before) lines.push(<polygon key="sheen" points="120,215 260,215 330,300 60,300" fill="#fff" opacity="0.12" />);
    if (before) lines.push(<g key="wear" opacity="0.5"><ellipse cx="170" cy="250" rx="60" ry="16" fill="#6a5a44" /><ellipse cx="260" cy="230" rx="30" ry="8" fill="#6a5a44" /></g>);
  }
  return <g>{lines}</g>;
}

function Bath({ p }: { p: P }) {
  const tiles = [];
  for (let x = 80; x < 320; x += 24) for (let y = 110; y < 200; y += 18) tiles.push(<rect key={`${x}-${y}`} x={x + 0.8} y={y + 0.8} width="22.4" height="16.4" fill={p.d} opacity="0.55" />);
  return (
    <g>
      <rect x="80" y="110" width="240" height="90" fill="#fff" />
      {tiles}
      {/* Dusche */}
      <rect x="92" y="70" width="70" height="135" fill="#cfe6ea" opacity="0.35" stroke="#9fb9be" strokeWidth="2" />
      <line x1="127" y1="70" x2="127" y2="88" stroke="#7b8b8f" strokeWidth="3" />
      <rect x="114" y="86" width="26" height="5" rx="2" fill="#7b8b8f" />
      {/* Wanne */}
      <path d="M180 196 Q180 160 200 158 L300 158 Q320 160 318 196 Z" fill="#fff" stroke="#cfd5d6" strokeWidth="2" />
      <ellipse cx="249" cy="160" rx="64" ry="6" fill="#e8eef0" />
      <rect x="292" y="132" width="4" height="26" fill="#7b8b8f" />
      {/* Waschtisch-Akzent */}
      <rect x="168" y="122" width="40" height="3" fill={p.a} opacity="0.9" />
      <circle cx="350" cy="120" r="10" fill={p.b} opacity="0.85" />
      <rect x="346" y="128" width="8" height="40" fill={p.b} opacity="0.6" />
    </g>
  );
}

function Paint({ p, before }: { p: P; before: boolean }) {
  return (
    <g>
      {before ? (
        <g opacity="0.55">
          <path d="M100 70 l14 8 -10 12 14 10" stroke="#9c9285" strokeWidth="2" fill="none" />
          <rect x="190" y="90" width="22" height="14" fill="#c9c0b2" />
          <rect x="130" y="150" width="34" height="18" fill="#c9c0b2" />
        </g>
      ) : (
        <g>
          <rect x="96" y="70" width="80" height="54" fill="#fff" opacity="0.9" />
          <rect x="102" y="76" width="68" height="42" fill={p.c} />
          <rect x="80" y="40" width="240" height="6" fill="#fff" opacity="0.7" />
        </g>
      )}
      {/* Leiter */}
      <g stroke="#8a6a44" strokeWidth="4">
        <line x1="300" y1="110" x2="285" y2="232" />
        <line x1="330" y1="110" x2="345" y2="232" />
        {[130, 155, 180, 205].map((y) => (
          <line key={y} x1={298 - (y - 110) * 0.12} y1={y} x2={332 + (y - 110) * 0.12} y2={y} strokeWidth="3" />
        ))}
      </g>
      {/* Farbrolle und Wanne */}
      <line x1="196" y1="246" x2="226" y2="150" stroke="#4a4a4a" strokeWidth="3" />
      <rect x="212" y="140" width="34" height="12" rx="5" fill={before ? "#ddd" : p.a} stroke="#555" strokeWidth="1.5" />
      <polygon points="150,250 196,250 190,262 156,262" fill="#6d6d6d" />
      <rect x="156" y="248" width="34" height="4" fill={p.a} />
    </g>
  );
}

function Kitchen({ p }: { p: P }) {
  return (
    <g>
      {/* Oberschränke */}
      <rect x="86" y="56" width="140" height="42" fill={p.d} stroke="#00000020" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={86 + i * 35} y1="56" x2={86 + i * 35} y2="98" stroke="#00000025" />)}
      {/* Rückwand */}
      <rect x="86" y="98" width="228" height="46" fill={p.c} opacity="0.5" />
      {/* Arbeitsplatte */}
      <polygon points="80,144 320,144 330,152 70,152" fill={p.a} />
      {/* Unterschränke */}
      <rect x="70" y="152" width="260" height="56" fill={p.d} />
      {[1, 2, 3, 4, 5].map((i) => <line key={i} x1={70 + i * 43} y1="152" x2={70 + i * 43} y2="208" stroke="#00000030" />)}
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`g${i}`} x={84 + i * 43} y="160" width="16" height="2.5" fill="#00000045" />)}
      <rect x="70" y="208" width="260" height="6" fill="#00000030" />
      {/* Armatur, Kochfeld */}
      <path d="M150 144 v-20 q0 -6 8 -6 h8" stroke="#8d8d8d" strokeWidth="3" fill="none" />
      <rect x="236" y="141" width="46" height="4" fill="#222" />
      {/* Pendelleuchten */}
      {[150, 250].map((x) => (
        <g key={x}>
          <line x1={x} y1="0" x2={x} y2="28" stroke="#333" />
          <path d={`M${x - 10} 38 Q${x} 22 ${x + 10} 38 Z`} fill={p.b} />
        </g>
      ))}
    </g>
  );
}

function ParquetDecor({ p }: { p: P }) {
  return (
    <g>
      <rect x="80" y="186" width="240" height="14" fill="#fff" opacity="0.8" />
      <ellipse cx="320" cy="215" rx="16" ry="5" fill="#00000030" />
      <path d="M312 214 h16 l-3 -24 h-10 z" fill={p.c} />
      <path d="M320 190 q-18 -20 -6 -40 q4 18 6 40 q4 -26 18 -34 q-4 22 -18 34" fill="#5f7d4e" />
    </g>
  );
}

function Drywall({ p, before }: { p: P; before: boolean }) {
  return (
    <g>
      {before ? (
        <g stroke="#9a8f80" strokeWidth="3">
          {[110, 150, 190, 230].map((x) => <line key={x} x1={x} y1="60" x2={x} y2="200" />)}
          <line x1="110" y1="60" x2="230" y2="60" />
          <rect x="110" y="60" width="40" height="140" fill="#e7e2d8" stroke="none" opacity="0.9" />
        </g>
      ) : (
        <g>
          <polygon points="110,52 230,52 230,205 110,205" fill={p.b} opacity="0.95" />
          <rect x="135" y="110" width="30" height="95" fill="#fff" opacity="0.65" />
        </g>
      )}
    </g>
  );
}

function Garden({ p, id, seed, before }: { p: P; id: string; seed: number; before: boolean }) {
  const s = (seed % 3) * 18;
  return (
    <g>
      <rect width="400" height="300" fill={`url(#sky-${id})`} />
      <circle cx={330 - s} cy="48" r="22" fill="#fff6d6" opacity="0.9" />
      {/* Bäume Hintergrund */}
      {[30, 95, 300, 360].map((x, i) => (
        <g key={x}>
          <rect x={x + s / 3 - 3} y="120" width="6" height="45" fill="#6b5236" />
          <ellipse cx={x + s / 3} cy={105 + (i % 2) * 8} rx={28 + (i % 2) * 8} ry="38" fill={i % 2 ? p.a : "#3e6a3a"} opacity="0.9" />
        </g>
      ))}
      {/* Hecke */}
      <rect x="0" y="140" width="400" height="38" rx="14" fill={before ? "#6d7a4a" : "#2f5a33"} />
      {/* Zaun */}
      <g opacity={before ? 0.5 : 1}>
        {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={i * 19} y="150" width="10" height="34" fill={p.d} opacity="0.85" />)}
        <rect x="0" y="160" width="400" height="4" fill={p.d} />
      </g>
      {/* Rasen */}
      <path d="M0 180 H400 V300 H0 Z" fill={before ? "#9aa165" : p.b} />
      <path d="M0 200 Q200 185 400 205 V300 H0 Z" fill={before ? "#8e955a" : p.c} opacity="0.55" />
      {/* Terrasse in Perspektive */}
      <polygon points="0,232 230,232 300,300 0,300" fill={before ? "#9a8f7e" : "#b0875a"} />
      {!before && Array.from({ length: 9 }).map((_, i) => <line key={i} x1="0" y1={236 + i * 8} x2={234 + i * 8} y2={236 + i * 8} stroke="#7d5b37" strokeWidth="1" opacity="0.6" />)}
      {/* Teich */}
      {!before && <ellipse cx="320" cy="228" rx="44" ry="12" fill="#7fb3c4" opacity="0.9" />}
      {/* Pflanzkübel */}
      <g>
        <rect x="40" y="206" width="26" height="26" fill="#5c5046" />
        <ellipse cx="53" cy="200" rx="22" ry="16" fill={before ? "#7d7a4a" : "#4f7f3c"} />
      </g>
      {before && <g opacity="0.6">{[120, 180, 250].map((x) => <path key={x} d={`M${x} 214 l6 -14 l6 14 M${x + 10} 216 l4 -10 l4 10`} stroke="#5d6a2f" strokeWidth="2" fill="none" />)}</g>}
    </g>
  );
}
