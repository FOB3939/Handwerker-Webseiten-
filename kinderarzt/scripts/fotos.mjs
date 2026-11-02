// Schneidet die Original-Screenshots (Google Maps / alte Website) auf den reinen Bildbereich zu
// und speichert WebP (max. 1200 px, q72) nach fotos/.
// Aufruf: node scripts/fotos.mjs <ordner-mit-originalen>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let sharp;
for (const base of [path.join(root, "package.json"), "/home/user/Handwerker-Webseiten-/package.json"]) {
  try { sharp = createRequire(base)("sharp"); break; } catch {}
}
if (!sharp) throw new Error("sharp nicht gefunden");
const src = process.argv[2];
if (!src) throw new Error("Aufruf: node scripts/fotos.mjs <ordner-mit-originalen>");

// [Quelldatei, Ziel, Ausschnitt {left, top, width, height} oder null = ganzes Bild]
// Maps-Screenshots: Bild zwischen Kopfzeile und „Alle Fotos ansehen“, y 800–1579.
// Team-Porträts: unter der Statusleiste bis über den Namensbalken, ohne Scrollleiste rechts.
const maps = { left: 0, top: 800, width: 1170, height: 780 };
const JOBS = [
  ["01-praxis-aussen.jpg", "aussen", null],
  ["11-praxis-aussen-2.png", "aussen-2", maps],
  ["07-kinder-spielecke.png", "spielecke", maps],
  ["08-untersuchung-blutdruck.png", "untersuchung", maps],
  ["09-baby-wickeltisch.png", "wickeltisch", maps],
  ["10-empfang-kind.png", "empfang", { left: 0, top: 350, width: 1170, height: 1605 }],
  ["12-behandlungsraum-ultraschall.png", "behandlungsraum", maps],
  ["13-sprechzimmer.png", "sprechzimmer", maps],
  ["14-wartebereich.png", "wartebereich", maps],
  ["15-otoskop-teddy.png", "otoskop", maps],
  ["16-portrait-aerztin.png", "portrait", { left: 0, top: 860, width: 1170, height: 658 }],
  ["02-team-marlene-remien.png", "team-marlene-remien", { left: 0, top: 100, width: 1130, height: 1870 }],
  ["03-team-meliha-sag.png", "team-meliha-sag", { left: 0, top: 100, width: 1130, height: 1950 }],
  ["04-team-nici-kristen.png", "team-nici-kristen", { left: 0, top: 100, width: 1130, height: 2030 }],
  ["05-team-evgenia-kopp-praxismanagerin.png", "team-evgenia-kopp", { left: 0, top: 100, width: 1130, height: 1890 }],
  ["06-teamfoto-und-text.png", "team-gruppe", { left: 0, top: 800, width: 1150, height: 915 }],
];

fs.mkdirSync(path.join(root, "fotos"), { recursive: true });
for (const [file, name, crop] of JOBS) {
  let img = sharp(path.join(src, file)).rotate();
  if (crop) img = img.extract(crop);
  const out = path.join(root, "fotos", name + ".webp");
  await img.resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
  const m = await sharp(out).metadata();
  console.log(`${name}.webp ${m.width}×${m.height} ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}

// ------------------------------------------------------------ Hero-Fahrt: größere Fassungen + ausgeschnittene Vordergrund-Ebenen
// Hochskaliert mit Lanczos und leicht nachgeschärft. Masken sind von Hand gezeichnete Polygone (Koordinaten im
// Raster der fotos/*.webp oben) oder ein Helligkeits-Schlüssel (Blätter vor heller Wand). Kein KI-Tiefenmodell.
// Unter den Ausschnitten wird das Hintergrundbild weich aus der Umgebung aufgefüllt, damit der Parallax keine Doppelkanten zeigt.
const HERO = {
  aussen: { w: 1600, view: [1168, 736], layers: [
    { id: "blaetter", depth: 2.2, key: { box: [0, 0, 400, 118], below: 175 } },
    { id: "pflanzen", depth: 0.9, polys: [
      [[430, 330], [452, 360], [458, 398], [458, 482], [397, 482], [397, 398], [405, 360]],
      [[582, 328], [604, 360], [612, 402], [612, 488], [552, 488], [552, 402], [560, 360]],
    ] },
  ] },
  empfang: { w: 1094, view: [875, 1200], layers: [
    { id: "tresen", depth: 1.1, polys: [
      [[30, 452], [768, 476], [724, 1147], [410, 1135], [418, 1200], [600, 1200], [598, 1140], [62, 1097]],
      [[255, 250], [298, 212], [346, 228], [362, 282], [346, 302], [362, 452], [336, 456], [318, 382], [298, 332], [268, 276]],
    ] },
  ] },
  wartebereich: { w: 1560, view: [1170, 780], layers: [
    { id: "vorne", depth: 1.4, polys: [
      [[605, 780], [612, 705], [700, 672], [712, 645], [832, 612], [866, 520], [900, 510], [905, 465], [1000, 450], [1002, 100], [1170, 58], [1170, 780]],
      [[88, 530], [120, 492], [150, 486], [160, 440], [200, 425], [268, 432], [270, 452], [252, 480], [290, 490], [316, 520], [312, 560], [298, 660], [250, 688], [150, 688], [100, 660], [90, 560]],
    ] },
  ] },
  sprechzimmer: { w: 1560, view: [1170, 780], layers: [] },
  behandlungsraum: { w: 1560, view: [1170, 780], layers: [] },
  "team-gruppe": { w: 1500, view: [1150, 915], layers: [] },
};
function pushPull(rgb, dil, W, H) {
  // Ebene 0: bekannte Pixel (außerhalb der geweiteten Maske) mit Gewicht 1
  let lv = [{ w: W, h: H, c: new Float32Array(W * H * 3), k: new Float32Array(W * H) }];
  for (let i = 0; i < W * H; i++) { const k = dil[i] > 10 ? 0 : 1; lv[0].k[i] = k; for (let c = 0; c < 3; c++) lv[0].c[i * 3 + c] = rgb[i * 3 + c] * k; }
  while (lv[lv.length - 1].w > 1 || lv[lv.length - 1].h > 1) {
    const a = lv[lv.length - 1], w = Math.max(1, a.w >> 1), h = Math.max(1, a.h >> 1);
    const b = { w, h, c: new Float32Array(w * h * 3), k: new Float32Array(w * h) };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let ks = 0, cs = [0, 0, 0];
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
        const sx = Math.min(a.w - 1, x * 2 + dx), sy = Math.min(a.h - 1, y * 2 + dy), si = sy * a.w + sx;
        ks += a.k[si]; for (let c = 0; c < 3; c++) cs[c] += a.c[si * 3 + c];
      }
      const o = y * w + x; b.k[o] = Math.min(1, ks);
      for (let c = 0; c < 3; c++) b.c[o * 3 + c] = ks > 0 ? cs[c] / ks * b.k[o] : 0;
    }
    lv.push(b);
  }
  // Aufwärts: fehlende Anteile aus der gröberen Ebene (bilinear) ergänzen
  for (let L = lv.length - 2; L >= 0; L--) {
    const a = lv[L], b = lv[L + 1];
    for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
      const o = y * a.w + x, k = a.k[o];
      if (k >= 1) continue;
      const fx = Math.min(b.w - 1, Math.max(0, (x + 0.5) / 2 - 0.5)), fy = Math.min(b.h - 1, Math.max(0, (y + 0.5) / 2 - 0.5));
      const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(b.w - 1, x0 + 1), y1 = Math.min(b.h - 1, y0 + 1), tx = fx - x0, ty = fy - y0;
      for (let c = 0; c < 3; c++) {
        const v = (b.c[(y0 * b.w + x0) * 3 + c] * (1 - tx) + b.c[(y0 * b.w + x1) * 3 + c] * tx) * (1 - ty) + (b.c[(y1 * b.w + x0) * 3 + c] * (1 - tx) + b.c[(y1 * b.w + x1) * 3 + c] * tx) * ty;
        a.c[o * 3 + c] = a.c[o * 3 + c] + v * (1 - k);
      }
      a.k[o] = 1;
    }
  }
  return Buffer.from(lv[0].c.map((v) => Math.max(0, Math.min(255, Math.round(v)))));
}
const SRC = Object.fromEntries(JOBS.map(([f, n, c]) => [n, [f, c]]));
fs.mkdirSync(path.join(root, "fotos", "hero"), { recursive: true });
const meta = {};
for (const [name, cfg] of Object.entries(HERO)) {
  const [file, crop] = SRC[name];
  let img = sharp(path.join(src, file)).rotate();
  if (crop) img = img.extract(crop);
  const { data: rgb, info } = await img.resize({ width: cfg.w, kernel: "lanczos3" }).sharpen({ sigma: 0.7, m1: 0.6, m2: 1.6 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, s = W / cfg.view[0];
  const all = new Float32Array(W * H);
  meta[name] = { w: W, h: H, layers: [] };
  for (const L of cfg.layers) {
    let m;
    if (L.polys) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#000"/>${L.polys.map((p) => `<polygon fill="#fff" points="${p.map(([x, y]) => `${(x * s).toFixed(1)},${(y * s).toFixed(1)}`).join(" ")}"/>`).join("")}</svg>`;
      m = (await sharp(Buffer.from(svg)).blur(1.6 * s).extractChannel(0).raw().toBuffer());
    } else {
      // Helligkeits-Schlüssel: dunkle Blätter vor der hellen Wand
      const [bx, by, bw, bh] = L.key.box.map((v) => Math.round(v * s));
      const raw = Buffer.alloc(W * H);
      for (let y = by; y < Math.min(H, by + bh); y++) for (let x = bx; x < Math.min(W, bx + bw); x++) {
        const i = (y * W + x) * 3, lum = 0.3 * rgb[i] + 0.59 * rgb[i + 1] + 0.11 * rgb[i + 2];
        raw[y * W + x] = lum < L.key.below ? 255 : lum < L.key.below + 25 ? Math.round(255 * (L.key.below + 25 - lum) / 25) : 0;
      }
      m = await sharp(raw, { raw: { width: W, height: H, channels: 1 } }).blur(1.1 * s).extractChannel(0).raw().toBuffer();
    }
    // Begrenzungsrahmen
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (m[y * W + x] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    x0 = Math.max(0, x0 - 4); y0 = Math.max(0, y0 - 4); x1 = Math.min(W - 1, x1 + 4); y1 = Math.min(H - 1, y1 + 4);
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
    const rgba = Buffer.alloc(cw * ch * 4);
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const si = ((y + y0) * W + x + x0), o = (y * cw + x) * 4;
      rgba[o] = rgb[si * 3]; rgba[o + 1] = rgb[si * 3 + 1]; rgba[o + 2] = rgb[si * 3 + 2]; rgba[o + 3] = m[si];
      all[si] = Math.max(all[si], m[si] / 255);
    }
    const out = path.join(root, "fotos", "hero", `${name}-${L.id}.webp`);
    await sharp(rgba, { raw: { width: cw, height: ch, channels: 4 } }).webp({ quality: 80, alphaQuality: 90 }).toFile(out);
    meta[name].layers.push({ id: L.id, depth: L.depth, x: x0 / W, y: y0 / H, w: cw / W, h: ch / H, pw: cw, ph: ch });
    console.log(`hero/${name}-${L.id}.webp ${cw}×${ch} ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
  }
  // Hintergrund unter den Ausschnitten weich auffüllen (Push-Pull-Pyramide aus der Umgebung)
  let bg = rgb;
  if (cfg.layers.length) {
    const dil = await sharp(Buffer.from(all.map((v) => v * 255)), { raw: { width: W, height: H, channels: 1 } }).blur(6 * s).extractChannel(0).raw().toBuffer();
    const filled = pushPull(rgb, dil, W, H);
    const fb = await sharp(filled, { raw: { width: W, height: H, channels: 3 } }).blur(3 * s).raw().toBuffer();
    bg = Buffer.from(rgb);
    for (let i = 0; i < W * H; i++) {
      const t = Math.min(1, dil[i] / 60);
      if (t <= 0) continue;
      for (let c = 0; c < 3; c++) bg[i * 3 + c] = Math.round(rgb[i * 3 + c] * (1 - t) + fb[i * 3 + c] * t);
    }
  }
  const out = path.join(root, "fotos", "hero", `${name}.webp`);
  await sharp(bg, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 74 }).toFile(out);
  console.log(`hero/${name}.webp ${W}×${H} ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}
fs.writeFileSync(path.join(root, "fotos", "hero", "layers.json"), JSON.stringify(meta, null, 1));
