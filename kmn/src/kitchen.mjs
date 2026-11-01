// Erzeugt die isometrischen Zeichnungen (Hero-Küche, Plattenmuster, Leistungs-Piktogramme)
// als SVG-Markup. Einheit: 1 = 10 cm. Projektion: X = (x - y)·cos30, Y = (x + y)·sin30 − z.

const C = Math.cos(Math.PI / 6);
const S = 10; // px je Einheit
const r = (n) => Math.round(n * 100) / 100;

export function proj(x, y, z) {
  return [r((x - y) * C * S), r((x + y) * 0.5 * S - z * S)];
}
const pts = (list) => "M" + list.map((p) => proj(...p).join(" ")).join("L") + "Z";
const line = (a, b) => "M" + proj(...a).join(" ") + "L" + proj(...b).join(" ");
// Matrix, die Ebenenkoordinaten (x, y) der Höhe z in den Bildschirm abbildet.
const planeTop = (z) => `matrix(${r(C * S)} ${r(0.5 * S)} ${r(-C * S)} ${r(0.5 * S)} 0 ${r(-z * S)})`;
// Frontebene y = const: (x, z) → Bildschirm.
const planeFront = (y) => `matrix(${r(C * S)} ${r(0.5 * S)} 0 ${-S} ${r(-y * C * S)} ${r(y * 0.5 * S)})`;

// ---------------------------------------------------------------- Farben
export const COL = {
  ink: "#22272B",
  korpusTop: "#F7F8F6",
  korpusFront: "#E2E5E1",
  korpusSide: "#CDD2CE",
  front: "#858A87",
  frontSide: "#6E7370",
  sockel: "#4A5053",
  wallBack: "#F3F4F1",
  wallLeft: "#E3E6E2",
  floor: "#D7A766",
  floorLine: "#BE8B4A",
  signal: "#C9DB3A",
};

// ---------------------------------------------------------------- Arbeitsplatten-Optiken
// Muster in Ebenenkoordinaten (1 = 10 cm); die Fläche skaliert sie per Matrix.
export const OPTIKEN = [
  { id: "schiefer", name: "Schiefer", desc: "Stein-Optik, anthrazit", edge: "#2E3336", side: "#3A4044" },
  { id: "eiche", name: "Eiche hell", desc: "Holz-Optik, warm und hell", edge: "#B98A55", side: "#C99A63" },
  { id: "nussbaum", name: "Nussbaum", desc: "Holz-Optik, dunkel", edge: "#4E3423", side: "#5E402C" },
  { id: "marmor", name: "Marmor weiß", desc: "Stein-Optik, hell geädert", edge: "#D5D8D6", side: "#E1E3E1" },
  { id: "granit", name: "Granit schwarz", desc: "Stein-Optik, fein gesprenkelt", edge: "#1B1E20", side: "#26292B" },
  { id: "beton", name: "Beton grau", desc: "Beton-Optik, matt", edge: "#8D918F", side: "#9A9E9C" },
  { id: "weiss", name: "Weiß matt", desc: "Uni, ruhig und hell", edge: "#DCDEDB", side: "#E7E9E6" },
  { id: "edelstahl", name: "Edelstahl", desc: "Metall-Optik, gebürstet", edge: "#9EA4A7", side: "#B2B7BA" },
];

// Einfacher deterministischer Zufall für Muster.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function patternDefs() {
  const out = [];
  // Eiche hell: Maserung entlang x.
  {
    const R = rng(7);
    let g = "";
    for (let i = 0; i < 18; i++) {
      const y = r(i * 0.55 + R() * 0.3);
      const a = r(R() * 0.4 - 0.2);
      g += `<path d="M0 ${y} C 6 ${r(y + a)}, 12 ${r(y - a)}, 20 ${y}" stroke="${i % 3 ? "#C79A62" : "#B5864F"}" stroke-width="${r(0.06 + R() * 0.08)}" fill="none"/>`;
    }
    out.push(`<pattern id="pt-eiche" patternUnits="userSpaceOnUse" width="20" height="10"><rect width="20" height="10" fill="#DDB580"/>${g}</pattern>`);
  }
  // Nussbaum
  {
    const R = rng(11);
    let g = "";
    for (let i = 0; i < 16; i++) {
      const y = r(i * 0.62 + R() * 0.3);
      const a = r(R() * 0.6 - 0.3);
      g += `<path d="M0 ${y} C 7 ${r(y + a)}, 13 ${r(y - a)}, 20 ${y}" stroke="${i % 2 ? "#4A3020" : "#6B4A33"}" stroke-width="${r(0.08 + R() * 0.1)}" fill="none"/>`;
    }
    out.push(`<pattern id="pt-nussbaum" patternUnits="userSpaceOnUse" width="20" height="10"><rect width="20" height="10" fill="#5C3E2A"/>${g}</pattern>`);
  }
  // Marmor weiß: wenige weiche Adern.
  out.push(`<pattern id="pt-marmor" patternUnits="userSpaceOnUse" width="24" height="16"><rect width="24" height="16" fill="#F1F2F0"/>
<path d="M-1 3 C 4 5, 7 1, 12 4 S 20 9, 25 6" stroke="#A9AEAD" stroke-width=".12" fill="none"/>
<path d="M-1 11 C 5 9, 9 14, 14 12 S 21 10, 25 13" stroke="#BEC2C0" stroke-width=".09" fill="none"/>
<path d="M8 4.5 C 9 7, 7 9, 9 12" stroke="#C8CCCA" stroke-width=".07" fill="none"/></pattern>`);
  // Granit schwarz: Sprenkel.
  {
    const R = rng(23);
    let g = "";
    for (let i = 0; i < 70; i++) g += `<circle cx="${r(R() * 8)}" cy="${r(R() * 8)}" r="${r(0.04 + R() * 0.07)}" fill="${R() > 0.5 ? "#6C7174" : "#45494C"}"/>`;
    out.push(`<pattern id="pt-granit" patternUnits="userSpaceOnUse" width="8" height="8"><rect width="8" height="8" fill="#202325"/>${g}</pattern>`);
  }
  // Beton grau: Wolken und Poren.
  {
    const R = rng(5);
    let g = "";
    for (let i = 0; i < 14; i++) g += `<ellipse cx="${r(R() * 16)}" cy="${r(R() * 12)}" rx="${r(1 + R() * 2.5)}" ry="${r(0.6 + R() * 1.4)}" fill="${R() > 0.5 ? "#A7ABA9" : "#9A9E9C"}" opacity=".7"/>`;
    for (let i = 0; i < 26; i++) g += `<circle cx="${r(R() * 16)}" cy="${r(R() * 12)}" r="${r(0.03 + R() * 0.05)}" fill="#7C807E"/>`;
    out.push(`<pattern id="pt-beton" patternUnits="userSpaceOnUse" width="16" height="12"><rect width="16" height="12" fill="#A1A5A3"/>${g}</pattern>`);
  }
  // Schiefer: anthrazit mit feinen Schlieren.
  {
    const R = rng(3);
    let g = "";
    for (let i = 0; i < 10; i++) {
      const y = r(R() * 12);
      g += `<path d="M0 ${y} C 5 ${r(y + 0.4)}, 11 ${r(y - 0.5)}, 18 ${r(y + 0.2)}" stroke="#454B4F" stroke-width="${r(0.08 + R() * 0.12)}" fill="none" opacity=".8"/>`;
    }
    out.push(`<pattern id="pt-schiefer" patternUnits="userSpaceOnUse" width="18" height="12"><rect width="18" height="12" fill="#363B3F"/>${g}</pattern>`);
  }
  out.push(`<pattern id="pt-weiss" patternUnits="userSpaceOnUse" width="4" height="4"><rect width="4" height="4" fill="#F4F5F3"/></pattern>`);
  // Edelstahl: gebürstete Linien.
  {
    const R = rng(9);
    let g = "";
    for (let i = 0; i < 40; i++) {
      const y = r(i * 0.2);
      g += `<path d="M0 ${y}H12" stroke="${R() > 0.5 ? "#C9CED0" : "#AEB4B7"}" stroke-width=".05"/>`;
    }
    out.push(`<pattern id="pt-edelstahl" patternUnits="userSpaceOnUse" width="12" height="8"><rect width="12" height="8" fill="#BCC1C4"/>${g}</pattern>`);
  }
  return out.join("");
}

// ---------------------------------------------------------------- Bausteine
function box(x0, x1, y0, y1, z0, z1, f = {}) {
  const top = f.top ?? COL.korpusTop, front = f.front ?? COL.korpusFront, side = f.side ?? COL.korpusSide;
  return (
    `<path d="${pts([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])}" fill="${front}"${f.frontCls ? ` class="${f.frontCls}"` : ""}/>` +
    `<path d="${pts([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" fill="${side}"${f.sideCls ? ` class="${f.sideCls}"` : ""}/>` +
    `<path d="${pts([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])}" fill="${top}"${f.topCls ? ` class="${f.topCls}"` : ""}/>`
  );
}
// Rechteck in der Frontebene y.
const frontRect = (x0, x1, y, z0, z1, fill, extra = "") =>
  `<path d="${pts([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]])}" fill="${fill}"${extra}/>`;

// Korpus (Sockel + Kasten), nach vorne offen gezeichnet: man sieht Böden.
function carcass(x0, x1, y0, y1, z1, opts = {}) {
  const sock = opts.sockel ?? 1;
  let s = "";
  s += box(x0 + 0.1, x1 - 0.1, y0, y1 - 0.6, 0, sock, { top: COL.sockel, front: COL.sockel, side: "#3C4144" });
  s += box(x0, x1, y0, y1, sock, z1);
  // Innenleben: Böden als Linien, damit der Korpus ohne Fronten "offen" wirkt.
  const shelves = opts.shelves ?? [sock + (z1 - sock) / 2];
  for (const z of shelves) s += `<path d="${line([x0 + 0.25, y1, z], [x1 - 0.25, y1, z])}" class="k-thin"/>`;
  s += `<path d="${pts([[x0 + 0.25, y1, sock + 0.2], [x1 - 0.25, y1, sock + 0.2], [x1 - 0.25, y1, z1 - 0.2], [x0 + 0.25, y1, z1 - 0.2]])}" class="k-thin" fill="none"/>`;
  return s;
}

// Fronten: Liste [z0, z1] je Front.
function fronts(x0, x1, y, rows, opts = {}) {
  const gap = 0.15;
  const items = [];
  for (const [z0, z1] of rows) {
    let g = frontRect(x0 + gap, x1 - gap, y + 0.18, z0 + gap, z1 - gap, opts.fill ?? COL.front);
    // Kante der Front (Stärke) rechts
    g += `<path d="${pts([[x1 - gap, y, z0 + gap], [x1 - gap, y + 0.18, z0 + gap], [x1 - gap, y + 0.18, z1 - gap], [x1 - gap, y, z1 - gap]])}" fill="${COL.frontSide}"/>`;
    // Griff
    const hz = opts.handleLow ? z0 + 0.9 : z1 - 0.75;
    const hx0 = x0 + (x1 - x0) * 0.3, hx1 = x1 - (x1 - x0) * 0.3;
    const handle = opts.vertical
      ? `<path class="k-handle" d="${line([x1 - 0.9, y + 0.35, z1 - 1.2], [x1 - 0.9, y + 0.35, z1 - 4])}"/>`
      : `<path class="k-handle" d="${line([hx0, y + 0.35, hz], [hx1, y + 0.35, hz])}"/>`;
    items.push({ g, handle });
  }
  return items;
}

// ---------------------------------------------------------------- Hero-Küche
export function heroSVG() {
  const L = 34, D = 23, H = 24;
  const parts = [];
  const push = (cls, inner, attrs = "") => parts.push(`<g class="${cls}"${attrs}>${inner}</g>`);

  // Raum
  let room = "";
  room += `<path d="${pts([[0, 0, 0], [L, 0, 0], [L, D, 0], [0, D, 0]])}" fill="${COL.floor}"/>`;
  for (let y = 1.6; y < D; y += 1.6) room += `<path d="${line([0, y, 0], [L, y, 0])}" stroke="${COL.floorLine}" stroke-width=".8"/>`;
  for (let i = 0, y = 0; y < D; y += 1.6, i++) {
    const off = (i * 7.3) % 12;
    for (let x = 3 + off; x < L; x += 12) room += `<path d="${line([x, y, 0], [x, y + 1.6, 0])}" stroke="${COL.floorLine}" stroke-width=".8"/>`;
  }
  room += `<path d="${pts([[0, 0, 0], [L, 0, 0], [L, 0, H], [0, 0, H]])}" fill="${COL.wallBack}"/>`;
  room += `<path d="${pts([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]])}" fill="${COL.wallLeft}"/>`;
  // Fenster in der Rückwand (wie auf dem Foto: rechts)
  room += `<path d="${pts([[25, 0, 9.8], [31.5, 0, 9.8], [31.5, 0, 20.5], [25, 0, 20.5]])}" fill="#DCE3E6" class="k-line"/>`;
  room += `<path d="${line([28.25, 0, 9.8], [28.25, 0, 20.5])}" class="k-thin"/>`;
  room += `<path d="${line([0, 0, 0], [0, 0, H])} ${line([0, 0, 0], [L, 0, 0])} ${line([0, 0, 0], [0, D, 0])}" class="k-line"/>`;
  push("k-room", room);

  // Anriss: Stellflächen auf dem Boden, gestrichelt
  const mark =
    `<path class="k-mark" d="${pts([[0, 0, 0], [22, 0, 0], [22, 6, 0], [0, 6, 0]])}"/>` +
    `<path class="k-mark" d="${pts([[8, 12.5, 0], [26.5, 12.5, 0], [26.5, 19.5, 0], [8, 19.5, 0]])}"/>`;
  // Bemaßung vor der Insel
  const dy = 21.6;
  let meas = `<path class="k-dim" d="${line([8, dy, 0], [26.5, dy, 0])} ${line([8, dy - 0.8, 0], [8, dy + 0.8, 0])} ${line([26.5, dy - 0.8, 0], [26.5, dy + 0.8, 0])}"/>`;
  push("k-measure", mark + meas);

  // Hochschrank links an der Rückwand
  push("k-carcass", carcass(0, 6, 0, 6, 21, { shelves: [7.4, 13.8] }));
  // Oberschränke
  push("k-carcass k-wall", box(6, 12, 0, 3.6, 14, 21) + `<path d="${line([6.25, 3.6, 17.5], [11.75, 3.6, 17.5])}" class="k-thin"/>`);
  push("k-carcass k-wall", box(12, 18, 0, 3.6, 14, 21) + `<path d="${line([12.25, 3.6, 17.5], [17.75, 3.6, 17.5])}" class="k-thin"/>`);
  // Unterschränke Zeile
  const rowCabs = [[6, 12], [12, 16], [16, 22]];
  for (const [a, b] of rowCabs) push("k-carcass", carcass(a, b, 0, 6, 8.6));
  // Fronten Hochschrank: unten Tür, Backofen, oben Tür
  const tallF = [];
  tallF.push(...fronts(0, 6, 6, [[1, 7.4]], { handleLow: false }));
  tallF.push(...fronts(0, 6, 6, [[13.8, 21]], { handleLow: true }));
  const handles = [];
  for (const f of tallF) { push("k-front", f.g); handles.push(f.handle); }
  // Backofen
  push("k-front k-oven",
    frontRect(0.25, 5.75, 6.18, 7.55, 13.65, "#2B3033") +
    frontRect(0.9, 5.1, 6.2, 8.4, 12.2, "#11161A") +
    `<path d="${line([0.9, 6.25, 12.9], [5.1, 6.25, 12.9])}" stroke="#C9CDCF" stroke-width="1.6" stroke-linecap="round"/>`);
  // Oberschrank-Fronten
  for (const [a, b] of [[6, 12], [12, 18]]) {
    const [f] = fronts(a, b, 3.6, [[14, 21]], { handleLow: true, fill: "#EEF0ED" });
    push("k-front", f.g); handles.push(f.handle);
  }
  // Zeilen-Fronten
  const rowRows = [[[1, 3.6], [3.6, 6.1], [6.1, 8.6]], [[1, 8.6]], [[1, 4.8], [4.8, 8.6]]];
  rowCabs.forEach(([a, b], i) => {
    for (const f of fronts(a, b, 6, rowRows[i])) { push("k-front", f.g); handles.push(f.handle); }
  });

  // Arbeitsplatte Zeile (senkt sich) mit Spüle und Armatur
  const wt = (x0, x1, y0, y1, z0, z1) =>
    `<path d="${pts([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])}" class="js-wt-edge"/>` +
    `<path d="${pts([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" class="js-wt-side"/>` +
    `<g transform="${planeTop(z1)}"><path d="M${x0} ${y0}H${x1}V${y1}H${x0}Z" class="js-wt-top" vector-effect="non-scaling-stroke"/></g>`;
  push("k-top", wt(6, 22.3, 0, 6.3, 8.6, 9.1));
  push("k-top", wt(7.6, 26.9, 12.2, 19.6, 8.6, 9.1));

  // Geräte
  const sink =
    `<g transform="${planeTop(9.12)}">` +
    `<rect x="16.6" y="1.2" width="4.4" height="3.8" rx=".5" fill="#2A2F33" stroke="${COL.ink}" stroke-width="1" vector-effect="non-scaling-stroke"/>` +
    `<rect x="17" y="1.6" width="3.6" height="3" rx=".4" fill="#15191C"/>` +
    `<circle cx="18.8" cy="3.1" r=".35" fill="#5A6064"/></g>`;
  const tap = `<path d="M${proj(18.8, 0.7, 9.1).join(" ")} L${proj(18.8, 0.7, 12.4).join(" ")} Q${proj(18.8, 1.4, 13.6).join(" ")} ${proj(18.8, 2.4, 12.6).join(" ")} L${proj(18.8, 2.4, 11.8).join(" ")}" fill="none" stroke="#1E2326" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="k-tap"/>`;
  const cook =
    `<g transform="${planeTop(9.12)}">` +
    `<rect x="12.6" y="13.6" width="8.8" height="5.2" rx=".2" fill="#121619" stroke="#0A0C0E" stroke-width="1" vector-effect="non-scaling-stroke"/>` +
    [[14.6, 15.1, 1.05], [14.6, 17.3, 0.8], [18.6, 15.2, 0.85], [18.8, 17.3, 1.1]]
      .map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="none" stroke="#4C5458" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join("") +
    `<path d="M16.6 13.9V18.5" stroke="#3A4246" stroke-width="1" vector-effect="non-scaling-stroke"/></g>`;

  // Insel-Korpusse und Fronten
  const isl = [[8, 14.2], [14.2, 20.4], [20.4, 26.5]];
  for (const [a, b] of isl) push("k-carcass k-island", carcass(a, b, 12.5, 19.2, 8.6));
  for (const [a, b] of isl) for (const f of fronts(a, b, 19.2, [[1, 4.8], [4.8, 8.6]])) { push("k-front", f.g); handles.push(f.handle); }

  // DOM-Reihenfolge = Zeichenreihenfolge. Insel-Platte nach den Insel-Fronten.
  // parts enthält jetzt: room, measure, Hochschrank, Oberschränke, Zeile, Fronten..., Platten, Insel...
  // Die Platten wurden vor der Insel eingefügt; die Inselplatte muss danach kommen.
  const topIdx = parts.findIndex((p) => p.startsWith('<g class="k-top"'));
  const islandTop = parts.splice(topIdx + 1, 1)[0];
  parts.push(islandTop);

  const gfx = [];
  gfx.push(`<g class="k-handles">${handles.map((h) => `<g class="k-hd">${h}</g>`).join("")}</g>`);
  gfx.push(`<g class="k-dev k-sink">${sink}${tap}</g>`);
  gfx.push(`<g class="k-dev k-cook">${cook}</g>`);

  // Fugenprüfung: Signal-Linien in den Fugen der Insel
  let gaps = "";
  for (const x of [14.2, 20.4]) gaps += `<path class="k-gap" d="${line([x, 19.45, 1.3], [x, 19.45, 8.3])}"/>`;
  for (const [a, b] of isl) gaps += `<path class="k-gap" d="${line([a + 0.4, 19.45, 4.8], [b - 0.4, 19.45, 4.8])}"/>`;
  // Wasserwaage auf der Inselplatte
  const lv0 = 9.4, lv1 = 19.4, ly0 = 12.9, ly1 = 13.5, lz0 = 9.1, lz1 = 9.75;
  let level = box(lv0, lv1, ly0, ly1, lz0, lz1, { top: "#E6E9EA", front: "#C2C7CA", side: "#9EA4A7" });
  level += frontRect(13.6, 15.2, ly1 + 0.02, lz0 + 0.13, lz1 - 0.13, "#DCEB7A");
  level += `<path d="${line([14.15, ly1 + 0.03, lz0 + 0.12], [14.15, ly1 + 0.03, lz1 - 0.12])} ${line([14.65, ly1 + 0.03, lz0 + 0.12], [14.65, ly1 + 0.03, lz1 - 0.12])}" stroke="${COL.ink}" stroke-width=".9"/>`;
  const [bx, by] = proj(14.4, ly1 + 0.04, (lz0 + lz1) / 2);
  level += `<ellipse class="k-bubble" cx="${bx}" cy="${by}" rx="2.6" ry="1.5" fill="#F8FBE6" stroke="${COL.ink}" stroke-width=".6"/>`;
  const [cx, cy] = proj(20.6, 13.2, 11.2);
  const check = `<g class="k-checkmark"><circle cx="${cx}" cy="${cy}" r="9" fill="${COL.ink}"/><path class="k-check" d="M${r(cx - 4)} ${r(cy + 0.3)}l3 3 5.4-6" fill="none" stroke="${COL.signal}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  gfx.push(`<g class="k-gaps">${gaps}</g>`);
  gfx.push(`<g class="k-level">${level}</g>`);
  gfx.push(check);

  // viewBox aus den Ecken
  const corners = [[0, 0, H], [L, 0, H], [0, D, 0], [L, D, 0], [0, D, H], [L, 0, 0]].map((p) => proj(...p));
  const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]);
  const pad = 6;
  const vb = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad].map(r);

  return `<svg class="kitchen" viewBox="${vb.join(" ")}" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">${parts.join("")}${gfx.join("")}</svg>`;
}

// ---------------------------------------------------------------- Plattenmuster (Abschnitt Arbeitsplatten)
export function sampleSVG() {
  const x0 = 0, x1 = 26, y0 = 0, y1 = 12, z0 = 0, z1 = 1.3;
  const slab =
    `<path d="${pts([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])}" class="js-wt-edge"/>` +
    `<path d="${pts([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" class="js-wt-side"/>` +
    `<g transform="${planeTop(z1)}"><path d="M${x0} ${y0}H${x1}V${y1}H${x0}Z" class="js-wt-top" vector-effect="non-scaling-stroke"/></g>`;
  // Unterbau angedeutet: Korpus mit Front
  const base = box(1, 25, 0.5, 11.2, -9, 0, {}) + frontRect(1.15, 12.9, 11.38, -8.85, -0.15, COL.front) + frontRect(13.1, 24.85, 11.38, -8.85, -0.15, COL.front);
  const corners = [[0, 0, z1], [x1, 0, z1], [0, y1, -9], [x1, y1, -9], [x1, 0, -9]].map((p) => proj(...p));
  const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]);
  const pad = 6;
  const vb = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad].map(r);
  return `<svg class="sample" viewBox="${vb.join(" ")}" aria-hidden="true" focusable="false"><g class="sample-base">${base}</g>${slab}</svg>`;
}

// ---------------------------------------------------------------- Piktogramme (Leistungen, Formular)
function iconWrap(inner, bounds) {
  const xs = bounds.map((c) => c[0]), ys = bounds.map((c) => c[1]);
  const pad = 3;
  const vb = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad].map(r);
  return `<svg class="pict" viewBox="${vb.join(" ")}" aria-hidden="true" focusable="false">${inner}</svg>`;
}
const B = (x0, x1, y0, y1, z0, z1) => [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y1, z1]].map((p) => proj(...p));

export const ICONS = {
  kuechenmontage: () => {
    let s = box(0, 6, 0, 6, 0, 8.6) + frontRect(0.15, 5.85, 6.15, 0.15, 8.45, "var(--pict-front)");
    s += box(6, 12, 0, 6, 0, 8.6) + frontRect(6.15, 11.85, 6.15, 0.15, 4.2, "var(--pict-front)") + frontRect(6.15, 11.85, 6.15, 4.4, 8.45, "var(--pict-front)");
    s += box(-0.3, 12.3, 0, 6.4, 8.6, 9.3, { top: "var(--pict-top)", front: "var(--pict-edge)", side: "var(--pict-edge)" });
    return iconWrap(s, B(-0.3, 12.3, 0, 6.4, 0, 9.3));
  },
  "abbau-umbau": () => {
    let s = box(0, 6, 0, 6, 0, 8.6) + frontRect(0.15, 5.85, 6.15, 0.15, 8.45, "var(--pict-front)");
    s += `<g transform="translate(14 -16)">${box(6, 12, 0, 6, 0, 8.6)}</g>`;
    const [ax, ay] = proj(9, 3, 11);
    s += `<path d="M${ax + 6} ${ay + 18} l0 -14 m-5 5 l5 -5 5 5" fill="none" stroke="var(--pict-ink)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    return iconWrap(s, [...B(0, 6, 0, 6, 0, 8.6), ...B(6, 12, 0, 6, 0, 8.6).map(([x, y]) => [x + 14, y - 16])]);
  },
  arbeitsplatte: () => {
    let s = box(0, 14, 0, 6.4, 0, 1, { top: "var(--pict-top)", front: "var(--pict-edge)", side: "var(--pict-edge)" });
    const a = proj(0, 8.6, 0), b = proj(14, 8.6, 0);
    s += `<path d="M${a.join(" ")}L${b.join(" ")}" stroke="var(--pict-ink)" stroke-width="1.2" stroke-dasharray="3 2.4"/>`;
    s += `<path d="M${proj(0, 7.6, 0).join(" ")}L${proj(0, 9.6, 0).join(" ")}M${proj(14, 7.6, 0).join(" ")}L${proj(14, 9.6, 0).join(" ")}" stroke="var(--pict-ink)" stroke-width="1.2"/>`;
    return iconWrap(s, [...B(0, 14, 0, 6.4, 0, 1), proj(0, 9.6, 0), proj(14, 9.6, 0)]);
  },
  moebelmontage: () => {
    let s = box(0, 8, 0, 3.6, 0, 14);
    for (const z of [4.6, 9.3]) s += `<path d="${line([0.3, 3.6, z], [7.7, 3.6, z])}" class="k-line"/>`;
    s += `<path d="${pts([[0.3, 3.6, 0.3], [7.7, 3.6, 0.3], [7.7, 3.6, 13.7], [0.3, 3.6, 13.7]])}" fill="none" class="k-line"/>`;
    return iconWrap(s, B(0, 8, 0, 3.6, 0, 14));
  },
  sonstiges: () => {
    let s = box(0, 5, 0, 5, 0, 5);
    s += `<g transform="translate(13 2)">${box(0, 4, 0, 4, 0, 4)}</g>`;
    return iconWrap(s, [...B(0, 5, 0, 5, 0, 5), ...B(0, 4, 0, 4, 0, 4).map(([x, y]) => [x + 13, y + 2])]);
  },
};
