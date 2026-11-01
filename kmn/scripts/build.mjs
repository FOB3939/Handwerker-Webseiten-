// Baut die eigenständige Einzeldatei: CSS, JS, GSAP, Schrift und Fotos werden eingebettet.
// Aufruf: node scripts/build.mjs [zusätzlicher-ausgabepfad.html]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { heroSVG, sampleSVG, patternDefs, ICONS, OPTIKEN } from "../src/kitchen.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => fs.readFileSync(path.join(root, p), "utf8");
const b64 = (file, mime) => `data:${mime};base64,` + fs.readFileSync(file).toString("base64");

// GSAP: lokal oder aus dem Hauptrepo (kein CDN zur Laufzeit).
function resolveGsap(file) {
  for (const base of [path.join(root, "package.json"), "/home/user/Handwerker-Webseiten-/package.json"]) {
    try { return createRequire(base).resolve("gsap/dist/" + file); } catch {}
  }
  throw new Error("gsap nicht gefunden: npm i gsap im Ordner kmn/ ausführen.");
}
const fontFile = createRequire(path.join(root, "package.json")).resolve("@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2");

const star = '<svg viewBox="0 0 20 20" focusable="false"><path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"/></svg>';
const ext = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6 3H3v10h10v-3M9 2h5v5M14 2L7.5 8.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const favicon = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#22272B"/><path d="M8 22l8 4 8-4V12l-8-4-8 4z" fill="#C99254" stroke="#EEF0EC" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 12l8 4 8-4M16 16v10" fill="none" stroke="#EEF0EC" stroke-width="1.6" stroke-linejoin="round"/></svg>');

const swatches = OPTIKEN.map((o) =>
  `<li><button type="button" class="swatch" data-optik="${o.id}" aria-pressed="${o.id === "schiefer"}"><svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><g transform="scale(4)"><rect width="10" height="10" fill="url(#pt-${o.id})"/></g></svg><span><b>${o.name}</b><small>${o.desc}</small></span></button></li>`
).join("");

let html = rd("src/index.html");
const css = rd("src/styles.css").replace("{{font:archivo}}", b64(fontFile, "font/woff2"));
const js = rd("src/app.js");
const gsapJs = fs.readFileSync(resolveGsap("gsap.min.js"), "utf8") + "\n" + fs.readFileSync(resolveGsap("ScrollTrigger.min.js"), "utf8");

html = html
  .replace("/*CSS*/", () => css)
  .replace("/*GSAP*/", () => gsapJs.replace(/<\/script/gi, "<\\/script"))
  .replace("/*JS*/", () => js)
  .replace("<script>/*", () => `<script type="application/json" id="optiken">${JSON.stringify(OPTIKEN)}</script>\n<script>/*`)
  .replace("{{patterns}}", () => patternDefs())
  .replace("{{svg:hero}}", () => heroSVG())
  .replace("{{svg:sample}}", () => sampleSVG())
  .replace("{{swatches}}", () => swatches)
  .replace("{{favicon}}", favicon)
  .replace(/\{\{stars\}\}/g, star.repeat(5))
  .replace(/\{\{ext\}\}/g, ext)
  .replace(/\{\{icon:([a-z-]+)\}\}/g, (_, k) => ICONS[k]())
  .replace(/\{\{img:([a-z-]+)\}\}/g, (_, k) => b64(path.join(root, "fotos", k + ".webp"), "image/webp"));

const left = html.match(/\{\{[^}]+\}\}/g);
if (left) throw new Error("Offene Platzhalter: " + left.join(", "));

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
const out = path.join(root, "dist", "kmn-neu.html");
fs.writeFileSync(out, html);
const extra = process.argv[2];
if (extra) fs.copyFileSync(out, extra);
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`gebaut: ${out} (${kb} KB)` + (extra ? `\nkopiert: ${extra}` : ""));
