// Verteilt für eine Tagesrunde Farben, Schriften, Layouts, Logo-Stile und Intros so, dass sich keine
// zwei Handwerks-Seiten gleichen. Schreibt site.look in jede Lead-Datei (lib/identity.ts liest das).
// Aufruf: node scripts/assign-looks.mjs 2026-10-18 [firma-71 firma-72 …]
import fs from "node:fs";
import path from "node:path";

const [date, ...only] = process.argv.slice(2);
if (!date) throw new Error("Datum angeben, z. B. 2026-10-18");
const dir = path.join("data/leads", date);
// Anzahl Paletten je Familie und Größen der übrigen Listen – muss zu lib/identity.ts passen.
const PAL = { drywall: 6, bath: 3, paint: 3, garden: 3, parquet: 3, electric: 3, facade: 2, key: 2 };
const N = { font: 14, hero: 4, services: 3, radius: 5, logo: 6, intro: 6 };

const family = (lead) => {
  const t = `${lead.company.trade} ${(lead.site.heroOffer ?? []).join(" ")}`.toLowerCase();
  if (/hausmeister|objekt|reinigung/.test(t) && !/garten|baum/.test(t)) return "key";
  return lead.site.scene in PAL ? lead.site.scene : "drywall";
};

const files = fs.readdirSync(dir).filter((f) => /^firma-\d+\.json$/.test(f) && (!only.length || only.includes(f.replace(".json", ""))))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
const famCount = {};
let i = 0;
const offset = [...date].reduce((a, c) => a + c.charCodeAt(0), 0); // je Tag andere Startpunkte
for (const f of files) {
  const p = path.join(dir, f);
  const lead = JSON.parse(fs.readFileSync(p, "utf8"));
  if ((lead.site.category ?? "handwerk") === "hof") continue;
  const fam = family(lead);
  const k = famCount[fam] = (famCount[fam] ?? -1) + 1;
  lead.site.look = {
    palette: (k + offset) % PAL[fam],
    font: (i * 5 + offset) % N.font,          // Schrittweite 5 ist teilerfremd zu 14 → 14 verschiedene
    hero: (i + offset) % N.hero,
    services: (i * 2 + offset) % N.services,
    radius: (i * 3 + offset) % N.radius,
    logo: (i + offset) % N.logo,
    intro: (i * 5 + offset + 1) % N.intro,     // 5 teilerfremd zu 6
  };
  fs.writeFileSync(p, JSON.stringify(lead, null, 2) + "\n");
  console.log(f, fam, JSON.stringify(lead.site.look));
  i++;
}
