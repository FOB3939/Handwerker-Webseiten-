#!/usr/bin/env node
// Rüstet eine bestehende Autohändler-Seite (Artifact-HTML) mit Mitmach-Spiel und – falls fehlend – Logo-Intro nach.
// Aufruf: node scripts/auto-upgrade.mjs <eingabe.html> <ausgabe.html> [--sub "Gebrauchtwagen · Ort"]
import fs from "node:fs";
const [inp, out, ...rest] = process.argv.slice(2);
if (!inp || !out) { console.error("Eingabe und Ausgabe angeben"); process.exit(1); }
const opt = {}; for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, "")] = rest[i + 1];
let html = fs.readFileSync(inp, "utf8");
// Vom Artifact-Dienst ergänztes Grundgerüst entfernen (wird beim Veröffentlichen neu gesetzt)
const sk = html.match(/^<!doctype html><html><head><meta charset=utf8>[\s\S]*?<\/head><body>\n?/i);
if (sk) html = html.slice(sk[0].length).replace(/\n?<\/body><\/html>\s*$/i, "");
const report = [];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const title = (html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "").replace(/&amp;/g, "&").trim();
const name = opt.name ?? title.split(/\s[·|–-]\s/)[0];
// Akzentfarbe aus den CSS-Variablen der Seite: die hellste noch farbige, weil das Spiel auf dunklem Grund steht
const lum = (h) => { const [r, g, b] = h.slice(1).match(/../g).map((x) => parseInt(x, 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const sat = (h) => { const v = h.slice(1).match(/../g).map((x) => parseInt(x, 16)); return Math.max(...v) - Math.min(...v); };
const cands = [...html.matchAll(/--(?:champ|acc|accent|brand|gold|primary|red|orange|signal|highlight)[\w-]*\s*:\s*(#[0-9a-f]{6})\b/gi)].map((m) => m[1])
  .filter((h) => sat(h) > 40 && lum(h) > 0.12 && lum(h) < 0.85);
const accent = cands.sort((a, b) => lum(b) - lum(a))[0] ?? "#c8a45e";
const ctaId = ["kontakt", "contact", "anfrage", "termin"].find((id) => new RegExp(`id="${id}"`).test(html));
const cta = ctaId ? `#${ctaId}` : "#kontakt";

if (/data-auto-game/.test(html)) report.push("Spiel schon vorhanden");
else {
  const h1 = html.search(/<h1[\s>]/i);
  if (h1 < 0) throw new Error("keine h1 gefunden");
  // äußerstes Element mit der h1 (section/header/div direkt in main oder body) finden
  const before = html.slice(0, h1);
  const opens = [...before.matchAll(/<(section|header)\b[^>]*>/gi)];
  let start = null;
  for (let i = opens.length - 1; i >= 0; i--) {
    const m = opens[i]; const tag = m[1].toLowerCase();
    const between = html.slice(m.index, h1);
    const depth = (between.match(new RegExp(`<${tag}\\b`, "gi")) || []).length - (between.match(new RegExp(`</${tag}>`, "gi")) || []).length;
    if (depth > 0 && !/class="[^"]*\btop\b/.test(m[0])) { start = { idx: m.index, tag }; }
    if (start) break;
  }
  if (!start) throw new Error("Hero-Bereich nicht gefunden");
  const re = new RegExp(`<(/?)${start.tag}\\b[^>]*>`, "gi"); re.lastIndex = start.idx; let d = 0, end = -1, m;
  while ((m = re.exec(html))) { d += m[1] ? -1 : 1; if (d === 0) { end = m.index + m[0].length; break; } }
  if (end < 0) throw new Error("Ende des Hero-Bereichs nicht gefunden");
  const game = fs.readFileSync(new URL("../assets/auto-game.js", import.meta.url), "utf8");
  const block = `\n<section id="mitmachen" data-auto-game data-cta="${cta}" data-accent="${accent}" data-company="${esc(name)}"></section>\n<script>\n${game}</script>\n`;
  html = html.slice(0, end) + block + html.slice(end);
  report.push(`Spiel nach <${start.tag}> eingefügt (CTA ${cta}, Akzent ${accent})`);
}
if (/class="intro"|id="intro"|class="splash|id="splash"|class="ai"|auto-intro/i.test(html)) report.push("Intro schon vorhanden");
else {
  const intro = fs.readFileSync(new URL("../assets/auto-intro.js", import.meta.url), "utf8");
  const sub = opt.sub ?? "Gebrauchtwagen";
  const tag = `<script id="auto-intro" data-name="${esc(name)}" data-sub="${esc(sub)}" data-accent="${accent}">\n${intro}</script>\n`;
  html = tag + html;
  report.push(`Intro ergänzt („${name}“ · ${sub})`);
}
fs.writeFileSync(out, html);
console.log(`${out}: ${report.join("; ")}`);
