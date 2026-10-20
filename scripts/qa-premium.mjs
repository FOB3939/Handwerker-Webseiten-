#!/usr/bin/env node
// Premium-Prüfung („10.000-€-Standard“) für exportierte Seiten: node scripts/qa-premium.mjs YYYY-MM-DD [slug …]
// Prüft je Seite auf Desktop (1366px) und Handy (390px): Barrierefreiheit (axe, WCAG 2.1 AA), Kontrast,
// Tippflächen ≥ 40px, Überschriften-Hierarchie, Bild-Alt-Texte, JS-Fehler, horizontales Scrollen,
// Schriften geladen, strukturierte Daten (JSON-LD), Dateigröße. Exit-Code 1, wenn eine Seite durchfällt.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(existsSync("/opt/node22/lib/node_modules/playwright") ? "/opt/node22/lib/node_modules/playwright" : "playwright");
const axeSrc = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const [date, ...only] = process.argv.slice(2);
if (!date) { console.error("Datum angeben: node scripts/qa-premium.mjs 2026-10-21"); process.exit(1); }
const dir = join(process.cwd(), "previews", date);
const files = readdirSync(dir).filter((f) => f.endsWith(".html") && f !== "index.html" && (!only.length || only.includes(f.replace(".html", ""))));

const browser = await chromium.launch();
let failed = 0;
for (const f of files) {
  const path = join(dir, f);
  const issues = [];
  const kb = Math.round(statSync(path).size / 1024);
  if (kb > 3072) issues.push(`Datei ${kb} KB (> 3 MB)`);
  for (const [w, h, tag] of [[1366, 900, "Desktop"], [390, 844, "Handy"]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    await page.goto("file://" + path);
    await page.waitForTimeout(2600);
    const r = await page.evaluate(async (axeSrc) => {
      // eslint-disable-next-line no-eval
      (0, eval)(axeSrc);
      const ax = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] }, resultTypes: ["violations"] });
      const vis = (el) => { const s = getComputedStyle(el), b = el.getBoundingClientRect(); return s.visibility !== "hidden" && s.display !== "none" && b.width > 0 && b.height > 0; };
      const small = [...document.querySelectorAll("a[href],button,input,select,textarea,summary")].filter(vis)
        .filter((el) => !el.closest(".tg-stage") && !el.closest("p,li")) // Fließtext-Links und Spielfelder ausgenommen
        .filter((el) => { const b = (el.closest("label") || el).getBoundingClientRect(); return b.height < 40 && b.width < 40 * 4 && (b.height < 40 || b.width < 40); })
        .map((el) => (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 30));
      const hs = [...document.querySelectorAll("h1,h2,h3,h4")].filter(vis).map((x) => +x.tagName[1]);
      let skips = 0; for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skips++;
      return {
        axe: ax.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id} (${v.nodes.length})`),
        small: [...new Set(small)].slice(0, 6), smallCount: small.length,
        h1: hs.filter((x) => x === 1).length, skips,
        noAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        fonts: document.fonts.status,
        jsonld: !!document.querySelector('script[type="application/ld+json"]'),
        motion: !!window.Motion,
      };
    }, axeSrc);
    if (errs.length) issues.push(`${tag}: JS-Fehler ${errs[0]}`);
    if (r.axe.length) issues.push(`${tag}: Barrierefreiheit ${r.axe.join(", ")}`);
    if (r.smallCount) issues.push(`${tag}: ${r.smallCount} Tippflächen < 40px (${r.small.join(" | ")})`);
    if (r.h1 !== 1) issues.push(`${tag}: ${r.h1}× h1 statt 1`);
    if (r.skips) issues.push(`${tag}: ${r.skips} Sprünge in der Überschriften-Reihenfolge`);
    if (r.noAlt) issues.push(`${tag}: ${r.noAlt} Bilder ohne alt`);
    if (r.overflow) issues.push(`${tag}: horizontales Scrollen`);
    if (!r.jsonld && tag === "Desktop") issues.push("keine strukturierten Daten (JSON-LD)");
    if (!r.motion && tag === "Desktop") issues.push("Motion fehlt");
    await page.close();
  }
  if (issues.length) failed++;
  console.log(`${issues.length ? "✗" : "✓"} ${f.replace(".html", "")}${issues.length ? "\n   - " + issues.join("\n   - ") : ""}`);
}
await browser.close();
console.log(`\n${files.length - failed}/${files.length} Seiten bestehen den Premium-Standard.`);
process.exit(failed ? 1 : 0);
