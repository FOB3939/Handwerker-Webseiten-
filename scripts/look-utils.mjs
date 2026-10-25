// Gemeinsame Helfer für assign-looks.mjs und check-unique.mjs

export const MIN_DIFF = 5; // so viele der 12 Merkmale müssen sich zwischen zwei Seiten einer Runde unterscheiden

const PAL_FAMILIES = ["drywall", "bath", "paint", "garden", "parquet", "electric", "facade", "key"];

// muss zu familyOf() in lib/identity.ts passen
export function family(lead) {
  const t = `${lead.company.trade} ${(lead.site.heroOffer ?? []).join(" ")}`.toLowerCase();
  if (/hausmeister|objekt|reinigung/.test(t) && !/garten|baum/.test(t)) return "key";
  return PAL_FAMILIES.includes(lead.site.scene) ? lead.site.scene : "drywall";
}

const KEYS = ["font", "hero", "services", "radius", "logo", "intro", "projects", "process", "faq", "reviews", "order"];

// Anzahl unterschiedlicher Merkmale (Farbpalette zählt als eines: Familie + Nummer)
export function lookDistance(a, b) {
  let d = `${a.fam}:${a.look.palette}` === `${b.fam}:${b.look.palette}` ? 0 : 1;
  for (const k of KEYS) if (a.look[k] !== b.look[k]) d++;
  return d;
}
