#!/usr/bin/env node
// Erzeugt die Silver-Stage-Logodateien als echte Vektoren (keine eingebetteten Rasterbilder).
// Signet: zentraler Punkt + drei Gruppen gerundeter Schallwellen im 120°-Abstand (Trefoil wie im Bestandslogo,
// aber mit gleichmäßigen Strichstärken und Bogenabständen). Wortmarke: Jost Medium (SIL Open Font License),
// mit opentype.js in Pfade umgewandelt, damit die Logos ohne installierte Schrift identisch aussehen.
// Aufruf: npm run logo  →  public/brand/*.svg und src/assets/brand.ts (Pfaddaten für Header, Intro, Spiel)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import opentype from "opentype.js";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "public/brand");
fs.mkdirSync(out, { recursive: true });

// ---------- Signet ----------
// Einheit: Radius des Punktes = 10. Bögen konzentrisch um den Punkt.
const DOT = 10;
const STROKE = 6.4;                       // Strichstärke aller Bögen
const GAP = 11.2;                         // Abstand Bogen-Mitte zu Bogen-Mitte
const FIRST = DOT + 9;                    // Radius des innersten Bogens
const SPAN = 64;                          // Öffnungswinkel je Bogen in Grad
const GROUPS = [150, 30, 270];            // Mittelwinkel der drei Gruppen (Mathe-Winkel, 0° = rechts, gegen den Uhrzeigersinn)

function arc(r, center, span) {
  const a0 = ((center - span / 2) * Math.PI) / 180, a1 = ((center + span / 2) * Math.PI) / 180;
  const p = (a) => [+(r * Math.cos(a)).toFixed(3), +(-r * Math.sin(a)).toFixed(3)]; // SVG-y nach unten
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0}A${r} ${r} 0 0 0 ${x1} ${y1}`;
}
// count = Bögen je Gruppe (4 = Vollversion, 2 = Kleinformat/Favicon). Äußere Bögen etwas weiter geöffnet.
function signetArcs(count) {
  const arcs = [];
  for (const g of GROUPS) for (let i = 0; i < count; i++) arcs.push({ d: arc(FIRST + i * GAP, g, SPAN + i * 4), group: GROUPS.indexOf(g), ring: i });
  return arcs;
}
const R_OUT = (n) => FIRST + (n - 1) * GAP + STROKE / 2;

function signetSvgInner(count, color) {
  return `<g fill="none" stroke="${color}" stroke-width="${STROKE}" stroke-linecap="round">${signetArcs(count).map((a) => `<path d="${a.d}"/>`).join("")}</g><circle r="${DOT}" fill="${color}"/>`;
}

// ---------- Wortmarke ----------
const fontFile = require.resolve("@fontsource/jost/files/jost-latin-500-normal.woff");
const font = opentype.parse(fs.readFileSync(fontFile).buffer.slice(0));
// Laufweite in em (positiv = weiter). Die Großbuchstaben bekommen etwas Luft, wie bei der Referenz.
function word(text, size, tracking = 0.08) {
  let x = 0; const parts = [];
  const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((g, i) => {
    const p = g.getPath(x, 0, size);
    parts.push(p.toPathData(2));
    const kern = i < glyphs.length - 1 ? font.getKerningValue(g, glyphs[i + 1]) : 0;
    x += ((g.advanceWidth + kern) / font.unitsPerEm) * size + (i < glyphs.length - 1 ? tracking * size : 0);
  });
  const capH = (font.tables.os2.sCapHeight / font.unitsPerEm) * size;
  return { d: parts.join(""), width: x, capH };
}

const svg = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${+w.toFixed(2)} ${+h.toFixed(2)}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
const COLORS = { light: "#F3F1EC", dark: "#101112" };
const files = {};

// Signet allein (quadratisch, mit etwas Rand)
const sR = R_OUT(4) + 4;
for (const [k, c] of Object.entries(COLORS)) files[`signet-${k}.svg`] = svg(sR * 2, sR * 2, `<g transform="translate(${sR} ${sR})">${signetSvgInner(4, c)}</g>`, "Silver Stage");
// Favicon: nur zwei Bögen je Gruppe, damit es bei 16–32 px nicht zuläuft; dunkler Grund mit kleinem Radius
const fR = R_OUT(2) + 6;
files["favicon.svg"] = svg(fR * 2, fR * 2, `<rect width="${fR * 2}" height="${fR * 2}" rx="${fR * 0.28}" fill="#101112"/><g transform="translate(${fR} ${fR})">${signetSvgInner(2, "#F3F1EC")}</g>`, "Silver Stage");

// Horizontal (Header): Signet + einzeilige Wortmarke, Höhe der Großbuchstaben ≈ 58 % des Signetdurchmessers
const SIG_D = R_OUT(4) * 2;
const one = word("SILVER STAGE", 46, 0.1);
const gapH = 22;
const hW = SIG_D + gapH + one.width, hH = SIG_D;
for (const [k, c] of Object.entries(COLORS)) files[`logo-horizontal-${k}.svg`] = svg(hW, hH,
  `<g transform="translate(${SIG_D / 2} ${SIG_D / 2})">${signetSvgInner(4, c)}</g><path fill="${c}" transform="translate(${SIG_D + gapH} ${SIG_D / 2 + one.capH / 2})" d="${one.d}"/>`, "Silver Stage");

// Gestapelt (große Flächen): Signet links, zweizeilig SILVER / STAGE mit enger, ruhiger Zeilenführung
const l1 = word("SILVER", 58, 0.07), l2 = word("STAGE", 58, 0.07);
// STAGE auf die Breite von SILVER bringen (über die Laufweite), damit der Block bündig steht
const spread = (l1.width - l2.width) / 4; // 4 Zwischenräume in STAGE
const l2b = word("STAGE", 58, 0.07 + spread / 58);
const lead = l1.capH * 0.42;               // Zeilenabstand zwischen den Großbuchstaben
const blockH = l1.capH * 2 + lead;
const sH = Math.max(SIG_D, blockH);
const gapS = 26;
const sW = SIG_D + gapS + Math.max(l1.width, l2b.width);
for (const [k, c] of Object.entries(COLORS)) files[`logo-stacked-${k}.svg`] = svg(sW, sH,
  `<g transform="translate(${SIG_D / 2} ${sH / 2})">${signetSvgInner(4, c)}</g>` +
  `<path fill="${c}" transform="translate(${SIG_D + gapS} ${(sH - blockH) / 2 + l1.capH})" d="${l1.d}"/>` +
  `<path fill="${c}" transform="translate(${SIG_D + gapS} ${(sH - blockH) / 2 + l1.capH * 2 + lead})" d="${l2b.d}"/>`, "Silver Stage");

for (const [f, s] of Object.entries(files)) fs.writeFileSync(path.join(out, f), s);

// Pfaddaten für Komponenten (Header-Logo, Intro-Animation, Spiel)
const ts = `// Automatisch erzeugt von scripts/build-logo.mjs – nicht von Hand ändern.
export const SIGNET = ${JSON.stringify({ dot: DOT, stroke: STROKE, rOuter: R_OUT(4), arcs: signetArcs(4) })} as const;
export const SIGNET_SMALL = ${JSON.stringify({ dot: DOT, stroke: STROKE, rOuter: R_OUT(2), arcs: signetArcs(2) })} as const;
export const WORDMARK_ONE_LINE = ${JSON.stringify({ d: one.d, width: +one.width.toFixed(2), capH: +one.capH.toFixed(2), size: 46 })} as const;
`;
fs.mkdirSync(path.join(root, "src/assets"), { recursive: true });
fs.writeFileSync(path.join(root, "src/assets/brand.ts"), ts);
console.log("Logo-Dateien:", Object.keys(files).join(", "));
