// Live-Build-Sperre: bricht ab, solange Pflichtangaben fehlen (Impressum/Telefon) – siehe docs/OFFENE-PUNKTE.md
import { COMPANY } from "../config/site";
export const productionProblems = () => {
  const p: string[] = [];
  if (!COMPANY.legalName) p.push("Inhaber/Rechtsform (COMPANY.legalName) fehlt – Impressum");
  if (!COMPANY.phone || !COMPANY.phoneHref) p.push("Telefonnummer (COMPANY.phone/phoneHref) fehlt");
  return p;
};
let done = false;
export const assertProduction = () => {
  if (done) return; done = true;
  const p = productionProblems();
  if (p.length) throw new Error(`Live-Build gestoppt – noch offen:\n- ${p.join("\n- ")}`);
};
