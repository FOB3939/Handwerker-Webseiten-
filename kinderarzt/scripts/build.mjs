// Baut die eigenständige Einzeldatei: CSS, JS, GSAP, Three.js (esbuild), Schriften und Fotos werden eingebettet.
// Aufruf: node scripts/build.mjs [zusätzlicher-ausgabepfad.html]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { buildSync } from "esbuild";
import { sunMark, favicon, ICONS } from "../src/art.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const req = createRequire(path.join(root, "package.json"));
const rd = (p) => fs.readFileSync(path.join(root, p), "utf8");
const b64 = (file, mime) => `data:${mime};base64,` + fs.readFileSync(file).toString("base64");
const esc = (s) => s.replace(/<\/script/gi, "<\\/script");

const fonts = {
  fredoka: req.resolve("@fontsource-variable/fredoka/files/fredoka-latin-wdth-normal.woff2"),
  atkinson: req.resolve("@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2"),
};

const LAYERS = JSON.parse(rd("fotos/hero/layers.json"));
let html = rd("src/index.html");
const css = rd("src/styles.css").replace(/\{\{font:([a-z]+)\}\}/g, (_, k) => b64(fonts[k], "font/woff2"));
const js = rd("src/app.js");
const hero3d = buildSync({
  entryPoints: [path.join(root, "src/hero3d.js")], bundle: true, minify: true, format: "iife",
  target: ["es2020"], write: false, legalComments: "none",
}).outputFiles[0].text;
const gsapJs = fs.readFileSync(req.resolve("gsap/dist/gsap.min.js"), "utf8") + "\n" + fs.readFileSync(req.resolve("gsap/dist/ScrollTrigger.min.js"), "utf8");

html = html
  .replace("/*CSS*/", () => css)
  .replace("/*GSAP*/", () => esc(gsapJs))
  .replace("/*JS*/", () => js)
  .replace("/*HERO3D*/", () => esc(hero3d))
  .replace(/\{\{svg:sun\}\}/g, () => sunMark())
  .replace("{{svg:sun-big}}", () => sunMark({ cls: "sun sun--big" }))
  .replace(/\{\{hero:([a-z-]+)\}\}/g, (_, k) => b64(path.join(root, "fotos", "hero", k + ".webp"), "image/webp"))
  .replace(/\{\{layers:([a-z-]+)\}\}/g, (_, k) => (LAYERS[k]?.layers || []).map((L) =>
    `<img class="h3d__lay" data-layer="${L.id}" src="${b64(path.join(root, "fotos", "hero", `${k}-${L.id}.webp`), "image/webp")}" width="${L.pw}" height="${L.ph}" alt="" style="left:${(L.x * 100).toFixed(3)}%;top:${(L.y * 100).toFixed(3)}%;width:${(L.w * 100).toFixed(3)}%">`).join(""))
  .replace("{{layersjson}}", () => JSON.stringify(LAYERS))
  .replace("{{favicon}}", () => favicon())
  .replace(/\{\{icon:([a-z]+)\}\}/g, (_, k) => { if (!ICONS[k]) throw new Error("Icon fehlt: " + k); return ICONS[k](); })
  .replace(/\{\{img:([a-z0-9-]+)\}\}/g, (_, k) => b64(path.join(root, "fotos", k + ".webp"), "image/webp"));

const left = html.match(/\{\{[^}]+\}\}/g);
if (left) throw new Error("Offene Platzhalter: " + left.join(", "));

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
const out = path.join(root, "dist", "kinderarzt-gruenwald.html");
fs.writeFileSync(out, html);
const extra = process.argv[2];
if (extra) fs.copyFileSync(out, extra);
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`gebaut: ${out} (${kb} KB)` + (extra ? `\nkopiert: ${extra}` : ""));
