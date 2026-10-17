import { LAKES, PLACES } from "@/lib/geo";

interface Props {
  home: string;
  places: string[];
  accent: string;
}

// Schematische Karte (keine eingebetteten Fremdkarten): Orte nach echter relativer Lage, Seen als Umriss.
export default function AreaMap({ home, places, accent }: Props) {
  const pts = [home, ...places].filter((n, i, a) => PLACES[n] && a.indexOf(n) === i).map((n) => ({ n, ll: PLACES[n] }));
  if (pts.length < 2) return null;
  const k = Math.cos((48 * Math.PI) / 180);
  const lats = pts.map((p) => p.ll[0]);
  const lons = pts.map((p) => p.ll[1]);
  const pad = 0.035;
  const minLat = Math.min(...lats) - pad, maxLat = Math.max(...lats) + pad;
  const minLon = Math.min(...lons) - pad / k, maxLon = Math.max(...lons) + pad / k;
  const W = 400;
  const H = Math.max(240, Math.min(420, (W * (maxLat - minLat)) / ((maxLon - minLon) * k)));
  const x = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * W;
  const y = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * H;
  const homePt = pts[0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Karte des Einsatzgebiets rund um ${home}`}>
      <rect width={W} height={H} rx="12" fill="rgb(var(--surface))" />
      <g opacity="0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`g${i}`} x1={(i * W) / 8} y1="0" x2={(i * W) / 8} y2={H} stroke="rgb(var(--line))" strokeWidth="1" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={(i * H) / 6} x2={W} y2={(i * H) / 6} stroke="rgb(var(--line))" strokeWidth="1" />
        ))}
      </g>
      {LAKES.map((l) => (
        <ellipse key={l.name} cx={x(l.c[1])} cy={y(l.c[0])} rx={(l.rx / (maxLon - minLon)) * W} ry={(l.ry / (maxLat - minLat)) * H} fill="#9cc7d8" opacity="0.55" />
      ))}
      <circle cx={x(homePt.ll[1])} cy={y(homePt.ll[0])} r={Math.min(W, H) * 0.42} fill={accent} opacity="0.07" />
      <circle cx={x(homePt.ll[1])} cy={y(homePt.ll[0])} r={Math.min(W, H) * 0.24} fill={accent} opacity="0.08" />
      {pts.slice(1).map((p) => (
        <line key={`l${p.n}`} x1={x(homePt.ll[1])} y1={y(homePt.ll[0])} x2={x(p.ll[1])} y2={y(p.ll[0])} stroke={accent} strokeOpacity="0.25" strokeDasharray="3 4" />
      ))}
      {pts.map((p, i) => {
        const cx = x(p.ll[1]);
        const cy = y(p.ll[0]);
        const right = cx < W - 90;
        return (
          <g key={p.n}>
            <circle cx={cx} cy={cy} r={i === 0 ? 9 : 5} fill={i === 0 ? accent : "rgb(var(--ink))"} stroke="#fff" strokeWidth="2" />
            <text x={right ? cx + 10 : cx - 10} y={cy + 4} textAnchor={right ? "start" : "end"} fontSize={i === 0 ? 14 : 12} fontWeight={i === 0 ? 700 : 500} fill="rgb(var(--ink))" style={{ paintOrder: "stroke", stroke: "rgb(var(--surface))", strokeWidth: 3 }}>
              {p.n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
