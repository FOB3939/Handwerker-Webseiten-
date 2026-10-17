import type { Motif } from "@/lib/themes";

interface Props {
  motif: Motif;
  palette: string[];
  label: string;
  seed?: number;
  className?: string;
  showLabel?: boolean;
}

// Lizenzfreie, selbst gezeichnete SVG-Platzhalter. Echte Projektfotos des Betriebs ersetzen sie später.
export default function PlaceholderArt({ motif, palette, label, seed = 0, className = "", showLabel = true }: Props) {
  const [c1, c2, c3, c4, c5] = palette;
  const id = `${motif}-${seed}`;
  return (
    <div className={`relative overflow-hidden ${className}`} role="img" aria-label={`Platzhalterbild: ${label}`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c4} />
            <stop offset="1" stopColor={c3} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#g-${id})`} />
        {motif === "paint" && <Paint c1={c1} c2={c2} c3={c3} c5={c5} seed={seed} />}
        {motif === "tiles" && <Tiles c1={c1} c3={c3} c4={c4} c2={c2} seed={seed} />}
        {motif === "leaves" && <Leaves c1={c1} c2={c2} c3={c3} seed={seed} />}
        {motif === "circuit" && <Circuit c1={c1} c2={c2} c3={c3} seed={seed} />}
        {motif === "building" && <Building c1={c1} c2={c2} c3={c3} c5={c5} seed={seed} />}
        {motif === "wood" && <Wood c1={c1} c2={c2} c3={c3} seed={seed} />}
      </svg>
      {showLabel && (
        <span className="absolute bottom-3 left-3 max-w-[85%] rounded bg-black/55 px-2 py-1 text-[11px] font-medium leading-snug text-white backdrop-blur-sm">
          Platzhalter · Foto: {label}
        </span>
      )}
    </div>
  );
}

type C = { c1: string; c2: string; c3: string; c4?: string; c5?: string; seed: number };

function Paint({ c1, c2, c3, c5, seed }: C) {
  const s = seed % 3;
  return (
    <g>
      <rect x={40 + s * 20} y="0" width="120" height="300" fill={c1} opacity="0.92" />
      <rect x={160 + s * 20} y="0" width="70" height="300" fill={c2} opacity="0.85" />
      <rect x={230 + s * 20} y="0" width="50" height="300" fill={c5} opacity="0.8" />
      <path d="M0 230 C 80 200, 140 260, 220 225 S 360 200, 400 235 L400 300 L0 300 Z" fill={c3} opacity="0.9" />
      <path d="M20 70 C 120 40, 220 110, 380 60" stroke="#fff" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.35" />
    </g>
  );
}

function Tiles({ c1, c2, c3, c4, seed }: C) {
  const size = seed % 2 === 0 ? 80 : 60;
  const cells = [];
  for (let x = 0; x < 400; x += size) {
    for (let y = 0; y < 300; y += size / 2) {
      const shade = (x / size + y / (size / 2) + seed) % 4;
      cells.push(
        <rect key={`${x}-${y}`} x={x + 1.5} y={y + 1.5} width={size - 3} height={size / 2 - 3}
          fill={shade === 0 ? c3 : shade === 1 ? c1 : shade === 2 ? c4 : c1} opacity={shade === 0 ? 0.35 : 0.9} />,
      );
    }
  }
  return (
    <g>
      <rect width="400" height="300" fill={c3} opacity="0.5" />
      {cells}
      <rect x="0" y="210" width="400" height="90" fill={c2} opacity="0.18" />
    </g>
  );
}

function Leaves({ c1, c2, c3, seed }: C) {
  const o = (seed % 3) * 30;
  return (
    <g>
      <rect width="400" height="300" fill={c3} opacity="0.55" />
      <path d={`M0 ${200 - o / 3} C 100 ${150 - o / 2}, 250 ${230}, 400 ${170} L400 300 L0 300 Z`} fill={c2} opacity="0.85" />
      <path d="M0 250 C 120 220, 260 280, 400 240 L400 300 L0 300 Z" fill={c1} />
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={60 + i * 75 + o} cy={110 + (i % 2) * 40} rx="34" ry="62" fill={i % 2 ? c1 : c2}
          opacity="0.75" transform={`rotate(${-25 + i * 12} ${60 + i * 75 + o} ${110 + (i % 2) * 40})`} />
      ))}
    </g>
  );
}

function Circuit({ c1, c2, c3, seed }: C) {
  const lines = [40, 90, 140, 190, 240];
  return (
    <g>
      <rect width="400" height="300" fill={c3} />
      {lines.map((y, i) => (
        <g key={y}>
          <path d={`M0 ${y} H ${120 + ((i + seed) % 3) * 50} V ${y + 30} H 400`} stroke={i % 2 ? c1 : "#ffffff"} strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx={120 + ((i + seed) % 3) * 50} cy={y} r="6" fill={c2} />
        </g>
      ))}
      <path d="M210 40 L170 160 H215 L190 270 L265 130 H215 L245 40 Z" fill={c2} opacity="0.95" />
    </g>
  );
}

function Building({ c1, c2, c3, c5, seed }: C) {
  const w = [];
  for (let x = 0; x < 5; x++) for (let y = 0; y < 4; y++) {
    const lit = (x + y + seed) % 4 === 0;
    w.push(<rect key={`${x}${y}`} x={110 + x * 38} y={70 + y * 46} width="24" height="30" rx="2" fill={lit ? c2 : c5} opacity={lit ? 0.95 : 0.6} />);
  }
  return (
    <g>
      <rect width="400" height="300" fill={c3} opacity="0.35" />
      <rect x="90" y="40" width="220" height="260" fill={c1} />
      <path d="M80 44 L200 0 L320 44 Z" fill={c1} opacity="0.85" />
      {w}
      <rect x="0" y="270" width="400" height="30" fill={c1} opacity="0.4" />
    </g>
  );
}

function Wood({ c1, c2, c3, seed }: C) {
  return (
    <g>
      <rect width="400" height="300" fill={c3} />
      {Array.from({ length: 14 }).map((_, i) => (
        <path key={i} d={`M0 ${i * 24 + (seed % 3) * 6} C 100 ${i * 24 - 14}, 260 ${i * 24 + 18}, 400 ${i * 24 - 4}`}
          stroke={i % 3 === 0 ? c2 : c1} strokeWidth={i % 3 === 0 ? 3 : 1.5} fill="none" opacity="0.45" />
      ))}
      {seed % 2 === 0 ? (
        <g>
          <rect x="250" y="60" width="110" height="180" fill={c2} opacity="0.88" />
          <rect x="262" y="72" width="86" height="76" fill={c1} opacity="0.5" />
          <rect x="262" y="156" width="86" height="72" fill={c1} opacity="0.5" />
        </g>
      ) : (
        Array.from({ length: 10 }).map((_, row) => (
          <g key={row}>
            {Array.from({ length: 4 }).map((__, col) => (
              <rect key={col} x={col * 140 - (row % 2) * 70} y={row * 30} width="138" height="28" fill={(row + col) % 3 === 0 ? c1 : c3}
                opacity={(row + col) % 3 === 0 ? 0.35 : 0.15} />
            ))}
          </g>
        ))
      )}
    </g>
  );
}
