// Produktionscheck: Ein Live-Build (PUBLIC_PREVIEW=false) bricht ab, solange Pflichtdaten fehlen oder
// nur Demo-Einträge in der Speisekarte stehen. So gelangen keine erfundenen Daten oder toten Bestellknöpfe online.
import { BUSINESS, ORDER } from "../config/site";
import { PRODUCTS } from "../config/menu";

export const productionProblems = (): string[] => {
  const p: string[] = [];
  if (!BUSINESS.legalName) p.push("Betreiber/Firmierung (BUSINESS.legalName) fehlt – Impressum");
  if (!BUSINESS.street || !BUSINESS.zip || !BUSINESS.city) p.push("Adresse (BUSINESS.street/zip/city) fehlt");
  if (!BUSINESS.phone || !BUSINESS.phoneHref) p.push("Telefonnummer (BUSINESS.phone/phoneHref) fehlt");
  if (!BUSINESS.hours) p.push("Öffnungszeiten (BUSINESS.hours) fehlen");
  if (!ORDER.url && !BUSINESS.phone) p.push("Kein Bestellweg: ORDER.url oder Telefonnummer nötig");
  const real = PRODUCTS.filter((x) => !x.demo && x.verifiedAt);
  if (real.length === 0) p.push("Speisekarte enthält keine bestätigten Einträge (nur Demo-Daten)");
  if (PRODUCTS.some((x) => !x.demo && x.variants.some((v) => v.priceCents <= 0))) p.push("Produkt mit Preis 0 € oder kleiner");
  return p;
};
let checked = false;
export const assertProduction = () => {
  if (checked) return; checked = true;
  const p = productionProblems();
  if (p.length) throw new Error(`Live-Build gestoppt – noch offen:\n- ${p.join("\n- ")}\n(Für die Vorschau ohne PUBLIC_PREVIEW=false bauen.)`);
};
