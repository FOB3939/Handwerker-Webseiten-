// Verteilt für eine Tagesrunde Farben, Schriften, Layouts, Abschnittsfolgen, Logo-Stile und Intros so,
// dass sich jede Handwerks-Seite von jeder anderen derselben Runde in mindestens MIN_DIFF Merkmalen
// unterscheidet. Schreibt site.look in jede Lead-Datei (lib/identity.ts liest das).
// Aufruf: node scripts/assign-looks.mjs 2026-10-18 [firma-71 firma-72 …]
import fs from "node:fs";
import path from "node:path";
import { family, lookDistance, MIN_DIFF } from "./look-utils.mjs";

const [date, ...only] = process.argv.slice(2);
if (!date) throw new Error("Datum angeben, z. B. 2026-10-18");
const dir = path.join("data/leads", date);
// Anzahl Paletten je Familie und Größen der übrigen Listen – muss zu lib/identity.ts passen.
const PAL = { drywall: 6, bath: 5, paint: 5, garden: 5, parquet: 4, electric: 5, facade: 5, key: 6 };
const N = { font: 14, hero: 8, services: 6, radius: 5, logo: 6, intro: 6, projects: 3, process: 3, faq: 3, reviews: 2, order: 4 };
// Teilerfremde Schrittweiten je Merkmal, damit sich die Kombinationen schnell auseinanderziehen
const STEP = { font: 5, hero: 3, services: 5, radius: 3, logo: 1, intro: 5, projects: 1, process: 2, faq: 1, reviews: 1, order: 3 };

const files = fs.readdirSync(dir).filter((f) => /^firma-\d+\.json$/.test(f) && (!only.length || only.includes(f.replace(".json", ""))))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
const leads = files.map((f) => ({ f, p: path.join(dir, f), lead: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }))
  .filter((x) => (x.lead.site.category ?? "handwerk") !== "hof");

function plan(offset) {
  const famCount = {};
  return leads.map(({ lead }, i) => {
    const fam = family(lead);
    const k = famCount[fam] = (famCount[fam] ?? -1) + 1;
    const look = { palette: (k + offset) % PAL[fam] };
    for (const [key, n] of Object.entries(N)) look[key] = (i * STEP[key] + offset + (key === "intro" ? 1 : 0) + (key === "projects" ? Math.floor(i / 3) : 0)) % n;
    return { fam, look };
  });
}

// Startpunkt je Tag; falls zwei Seiten zu ähnlich wären, nächsten Startpunkt probieren
const base = [...date].reduce((a, c) => a + c.charCodeAt(0), 0);
let best = null;
for (let t = 0; t < 400; t++) {
  const pl = plan(base + t);
  let worst = Infinity;
  for (let a = 0; a < pl.length; a++) for (let b = a + 1; b < pl.length; b++) worst = Math.min(worst, lookDistance(pl[a], pl[b]));
  if (!best || worst > best.worst) best = { pl, worst, t };
  if (worst >= MIN_DIFF + 2) break;
}
if (best.worst < MIN_DIFF) { console.error(`Keine ausreichend unterschiedliche Verteilung gefunden (min. ${best.worst} Unterschiede)`); process.exit(1); }
leads.forEach(({ f, p, lead }, i) => {
  lead.site.look = best.pl[i].look;
  fs.writeFileSync(p, JSON.stringify(lead, null, 2) + "\n");
  console.log(f, best.pl[i].fam, JSON.stringify(lead.site.look));
});
console.log(`Mindestens ${best.worst} von 12 Merkmalen unterscheiden sich zwischen je zwei Seiten.`);
