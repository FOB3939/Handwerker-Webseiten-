#!/usr/bin/env node
// Prüft eine Tagesrunde: (1) unterscheidet sich jede Seite von jeder anderen in mindestens MIN_DIFF
// Gestaltungsmerkmalen? (2) Texte: kurze Hero-Zeilen, keine Werbefloskeln, keine unbelegten „Meister“-Angaben.
// Aufruf: node scripts/check-unique.mjs YYYY-MM-DD   – Exit-Code 1 bei zu ähnlichen Seiten oder Textfehlern.
import fs from "node:fs";
import path from "node:path";
import { family, lookDistance, MIN_DIFF } from "./look-utils.mjs";

const date = process.argv[2];
if (!date) { console.error("Datum angeben"); process.exit(1); }
const dir = path.join("data/leads", date);
const leads = fs.readdirSync(dir).filter((f) => /^firma-\d+\.json$/.test(f))
  .map((f) => ({ f, lead: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }))
  .filter((x) => (x.lead.site.category ?? "handwerk") !== "hof");

let errors = 0;
const items = leads.map(({ f, lead }) => ({ f, fam: family(lead), look: lead.site.look ?? {} }));
for (const it of items) if (!it.look || it.look.order === undefined) { console.log(`✗ ${it.f}: kein vollständiger Look – erst assign-looks.mjs laufen lassen`); errors++; }
let worst = Infinity;
for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
  const d = lookDistance(items[a], items[b]);
  worst = Math.min(worst, d);
  if (d < MIN_DIFF) { console.log(`✗ ${items[a].f} und ${items[b].f} unterscheiden sich nur in ${d} Merkmalen`); errors++; }
}

// Textprüfung (Kurzfassung der writing-guidelines für Handwerker-Seiten)
const FLOSKELN = [/qualität zu fairen preisen/i, /ihr zuverlässiger partner/i, /rundum[- ]sorglos/i, /höchste qualität/i, /kompetent und zuverlässig/i, /alles aus einer hand(?!.*\w)/i, /wir sind für sie da/i, /zufriedenheit unserer kunden/i, /nr\.?\s*1/i, /der beste/i];
const words = (s) => (s ?? "").trim().split(/\s+/).filter(Boolean).length;
for (const { f, lead } of leads) {
  const s = lead.site;
  const texts = [s.hero.headline, s.hero.sub, ...s.services.map((x) => `${x.title} ${x.text}`), ...s.why.points.map((x) => `${x.title} ${x.text}`), ...s.faq.map((x) => `${x.q} ${x.a}`)];
  const warn = [];
  if (words(s.hero.headline) > 7) warn.push(`Hero-Überschrift hat ${words(s.hero.headline)} Wörter (max. 7)`);
  if (words(s.hero.sub) > 18) warn.push(`Hero-Unterzeile hat ${words(s.hero.sub)} Wörter (max. 18)`);
  for (const t of texts) for (const re of FLOSKELN) if (re.test(t)) warn.push(`Floskel „${t.match(re)[0]}“`);
  const belegt = JSON.stringify([lead.company.name, lead.facts, lead.sources]).toLowerCase().includes("meister");
  if (!belegt && /meister(?!s?chaft)/i.test(JSON.stringify(s).replace(/hausmeister/gi, ""))) warn.push("„Meister“ im Seitentext, aber nicht belegt");
  if (warn.length) { console.log(`✗ ${f}: ${[...new Set(warn)].join("; ")}`); errors++; }
}
console.log(errors ? `\n${errors} Problem(e) gefunden.` : `\n✓ ${items.length} Seiten – jedes Paar unterscheidet sich in mindestens ${worst} von 12 Merkmalen, Texte ok.`);
process.exit(errors ? 1 : 0);
