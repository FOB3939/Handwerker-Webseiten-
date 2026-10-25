#!/usr/bin/env node
// Fügt das Mitmach-Spiel je Gewerk (assets/trade-game.js) in bereits exportierte/veröffentlichte Seiten ein,
// deren Lead-Daten nicht im Repo liegen. Gleiche Regeln wie components/TradeGame.tsx.
//   node scripts/add-games.mjs <ausgabe-ordner> <seite.html> [weitere …]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";

const RULES = [
  [/dach|zimmerei|spengler/i, "roof"],
  [/maler|lackier|anstrich|tapezier/i, "paint"],
  [/fliese|naturstein|mosaik/i, "tiles"],
  [/sanit|installateur|heizung|klempner|bäder|badsanier|wasser|rohr/i, "water"],
  [/fensterreinig|glasreinig|fensterputz|gebäudereinig|reinigungsservice/i, "glass"],
  [/rollladen|rolladen|sonnenschutz|markise|jalousie/i, "blinds"],
  [/metallbau|schlosser|schmiede|geländer|stahlbau|zaun/i, "railing"],
  [/küche|möbel|schreiner|tischler|einbau/i, "kitchen"],
  [/elektr|strom|photovoltaik|solar|wallbox/i, "circuit"],
  [/garten|rasen|landschaft|grün|hecke|baum/i, "lawn"],
  [/hausmeister|objekt|reinigung|winterdienst|entrümpel/i, "sweep"],
  [/parkett|boden|laminat|vinyl|dielen/i, "planks"],
  [/trockenbau|innenausbau|akustik|dämm|isolier/i, "drywall"],
  [/maurer|fassade|bau\b|rohbau|pflaster|sanier|renovier/i, "bricks"],
];
const BY_FX = { paint: "paint", tiles: "tiles", laser: "drywall", planks: "planks", leaves: "lawn", circuit: "circuit", bricks: "bricks", keys: "sweep" };
const game = readFileSync(join(process.cwd(), "assets/trade-game.js"), "utf8");
const intro = readFileSync(join(process.cwd(), "assets/trade-intro.js"), "utf8");
function endOfFirstSection(html, from) {
  if (from < 0) return -1;
  const start = html.indexOf("<section", from);
  if (start < 0) return -1;
  const re = /<\/?section\b/g; re.lastIndex = start; let depth = 0, m;
  while ((m = re.exec(html))) { depth += m[0][1] === "/" ? -1 : 1; if (!depth) return html.indexOf(">", m.index) + 1; }
  return -1;
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const [out, ...files] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
for (const f of files) {
  let html = readFileSync(f, "utf8");
  // Hülle des Artifact-Dienstes entfernen, falls vorhanden (veröffentlicht wird nur der Inhalt)
  const wrap = html.match(/^<!doctype html><html><head>[\s\S]*?<\/head><body>\n([\s\S]*)\n?<\/body><\/html>\s*$/i);
  if (wrap) html = wrap[1];
  if (html.includes('data-trade-game="')) { console.log(basename(f), "hat schon ein Spiel"); continue; }
  // Gewerk steht im Logo-Intro: „<Gewerk> in <Ort>“
  const trade = (html.match(/class="[^"]*demo-splash-tag[^"]*"[^>]*>([^<]+?) in [^<]+</) || [])[1] || "";
  const fx = (html.match(/fx2 fx2-([a-z]+)/) || [])[1];
  const kind = RULES.find(([re]) => re.test(trade))?.[1] ?? BY_FX[fx];
  const company = ((html.match(/<title>Website-Entwurf ([^<]+)<\/title>/) || [])[1] || "").trim();
  if (!kind) { console.log(basename(f), "kein Gewerk erkannt"); continue; }
  const sec = `<section id="mitmachen" class="tg-sec" data-trade-game="${kind}" data-company="${esc(company)}" data-cta="#kontakt" aria-label="Zum Ausprobieren"></section>`;
  // Spiel direkt unter den Hero-Bereich (erste Section in <main>)
  const heroEnd = endOfFirstSection(html, html.indexOf('<main id="inhalt"'));
  html = heroEnd > 0 ? html.slice(0, heroEnd) + sec + html.slice(heroEnd) : html.replace(/<footer/, sec + "<footer");
  // Logo-Intro je Gewerk direkt vor <main>, damit es sofort beim Laden läuft
  if (!html.includes('id="demo-intro"')) html = html.replace('<main id="inhalt"', `<script id="demo-intro">${intro}</script><main id="inhalt"`);
  html += `\n<script id="demo-game">${game}</script>`;
  const name = basename(f);
  writeFileSync(join(out, name), html);
  console.log(name, "|", company, "|", trade, "→", kind);
}
