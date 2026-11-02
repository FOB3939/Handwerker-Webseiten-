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
