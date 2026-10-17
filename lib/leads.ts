import fs from "node:fs";
import path from "node:path";
import type { Lead } from "./types";

const LEADS_DIR = path.join(process.cwd(), "data", "leads");

export function getRunDates(): string[] {
  if (!fs.existsSync(LEADS_DIR)) return [];
  return fs
    .readdirSync(LEADS_DIR)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .reverse();
}

export function getLeadsForDate(date: string): Lead[] {
  const dir = path.join(LEADS_DIR, date);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^firma-\d+\.json$/.test(f))
    .sort((a, b) => parseInt(a.replace(/\D/g, ""), 10) - parseInt(b.replace(/\D/g, ""), 10))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Lead);
}

export function getAllLeads(): Lead[] {
  return getRunDates().flatMap(getLeadsForDate);
}

export function getLeadBySlug(slug: string): Lead | undefined {
  return getAllLeads().find((l) => l.slug === slug);
}

export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("0") ? "+49" + digits.slice(1) : digits}`;
}
