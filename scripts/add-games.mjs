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
  [/elektr|strom|photovoltaik|solar|wallbox/i, "circuit"],
  [/hausmeister|objekt|reinigung|winterdienst|entrümpel/i, "sweep"],
  [/garten|rasen|landschaft|grün|hecke|baum/i, "lawn"],
  [/parkett|boden|laminat|vinyl|dielen/i, "planks"],
  [/trockenbau|innenausbau|akustik|dämm|isolier/i, "drywall"],
  [/maurer|fassade|bau\b|rohbau|pflaster|sanier|renovier/i, "bricks"],
];
const BY_FX = { paint: "paint", tiles: "tiles", laser: "drywall", planks: "planks", leaves: "lawn", circuit: "circuit", bricks: "bricks", keys: "sweep" };
const game = readFileSync(join(process.cwd(), "assets/trade-game.js"), "utf8");
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
  const at = html.indexOf('<section id="projekte"');
  html = at > 0 ? html.slice(0, at) + sec + html.slice(at) : html.replace(/<footer/, sec + "<footer");
  html += `\n<script id="demo-game">${game}</script>`;
  const name = basename(f);
  writeFileSync(join(out, name), html);
  console.log(name, "|", company, "|", trade, "→", kind);
}
