#!/usr/bin/env node
// Lizenzfreie Beispielfotos (Pexels) passend zum Gewerk für die Handwerks-Demos.
//
//   PEXELS_API_KEY=… node scripts/fetch-photos.mjs 2026-10-19 [weitere Daten …] [--force] [--only <slug>]
//   node scripts/fetch-photos.mjs --restore 2026-10-19   # nur fehlende Dateien aus site.photos neu laden (ohne Key)
//
// Schreibt site.photos (Hero + Galerie) in die Lead-Dateien und legt die JPEGs unter data/photos/ ab
// (nicht im Git). data/photo-usage.json merkt sich verwendete Fotos, damit keine zwei Seiten dasselbe Bild zeigen.
// data/photo-blocklist.json: Pexels-IDs, die nicht passen (nach Sichtprüfung eintragen, dann mit --force neu holen).
// Netzwerk: api.pexels.com und images.pexels.com müssen erlaubt sein.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const LEADS = join(ROOT, "data/leads");
const PHOTOS = join(ROOT, "data/photos");
const USAGE = join(ROOT, "data/photo-usage.json");
const BLOCK = join(ROOT, "data/photo-blocklist.json");
const CACHE = join(PHOTOS, "search-cache.json");

const args = process.argv.slice(2);
const force = args.includes("--force");
const restore = args.includes("--restore");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const dates = args.filter((a, i) => /^\d{4}-\d{2}-\d{2}$/.test(a) && args[i - 1] !== "--only");
const KEY = process.env.PEXELS_API_KEY;

if (!dates.length) { console.error("Datum angeben, z. B. node scripts/fetch-photos.mjs 2026-10-19"); process.exit(1); }
if (!restore && !KEY) { console.error("PEXELS_API_KEY fehlt (kostenlos unter pexels.com/api; als Umgebungsvariable setzen, nie committen)."); process.exit(1); }

// Gleiche Gewerk-Zuordnung wie components/TradeFx.tsx (TRADE_RULES / FX_BY_FAMILY)
const RULES = [
  [/maler|lackier|anstrich|tapezier/i, "paint"],
  [/fliese|bad|sanitär|naturstein|mosaik/i, "tiles"],
  [/elektr|strom|photovoltaik|solar|wallbox/i, "circuit"],
  [/garten|baum|landschaft|grün|rasen|hecke/i, "leaves"],
  [/parkett|boden|laminat|vinyl|dielen/i, "planks"],
  [/hausmeister|objekt|reinigung|entrümpel/i, "keys"],
  [/trockenbau|innenausbau|akustik|dämm|isolier/i, "laser"],
  [/maurer|fassade|bau\b|rohbau|pflaster/i, "bricks"],
];
const BY_SCENE = { paint: "paint", bath: "tiles", drywall: "laser", kitchen: "laser", parquet: "planks", garden: "leaves", electric: "circuit", facade: "bricks" };
const kindOf = (lead) => RULES.find(([re]) => re.test(lead.company.trade))?.[1] ?? BY_SCENE[lead.site.scene] ?? "laser";

// Hero-Suchen (englisch liefert bei Pexels die besten Treffer) und deutsches Kontextwort für Galerie-Suchen
const KIND = {
  paint: { hero: ["painter painting wall roller", "house painter interior wall", "painting wall paint roller"], de: "Maler" },
  tiles: { hero: ["tiler laying tiles", "bathroom tiles renovation", "tiling floor worker"], de: "Fliesen" },
  laser: { hero: ["drywall installation", "plasterboard wall construction", "interior renovation drywall"], de: "Trockenbau" },
  planks: { hero: ["laying wooden floor", "parquet flooring installation", "hardwood floor worker"], de: "Parkett" },
  leaves: { hero: ["gardener trimming hedge", "landscaping garden work", "garden maintenance lawn"], de: "Garten" },
  circuit: { hero: ["electrician working", "electrician electrical panel", "electrical wiring installation"], de: "Elektriker" },
  bricks: { hero: ["bricklayer building wall", "construction worker masonry", "house renovation construction"], de: "Bau" },
  keys: { hero: ["handyman tools repair", "maintenance worker building", "cleaning service house"], de: "Hausmeister" },
};

const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
mkdirSync(PHOTOS, { recursive: true });
const usage = readJson(USAGE, {});
const blocked = new Set(readJson(BLOCK, []).map(String));
const cache = readJson(CACHE, {});
let remaining = Infinity;

async function search(query, locale) {
  const key = `${locale}|${query}`;
  if (cache[key]) return cache[key];
  if (remaining < 3) throw new Error("Pexels-Kontingent für diese Stunde fast aufgebraucht – später erneut starten (fehlende Fotos werden ergänzt).");
  const url = `https://api.pexels.com/v1/search?${new URLSearchParams({ query, locale, orientation: "landscape", per_page: "40" })}`;
  const res = await fetch(url, { headers: { Authorization: KEY } });
  remaining = Number(res.headers.get("x-ratelimit-remaining") ?? remaining);
  if (!res.ok) throw new Error(`Pexels-Suche fehlgeschlagen (${res.status}) für „${query}“`);
  const photos = (await res.json()).photos.map((p) => ({ id: String(p.id), url: p.url, alt: p.alt, author: p.photographer, authorUrl: p.photographer_url, original: p.src.original }));
  cache[key] = photos;
  writeFileSync(CACHE, JSON.stringify(cache));
  return photos;
}

function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

function pick(list, slug, salt) {
  const free = list.filter((p) => !blocked.has(p.id) && (!usage[p.id] || usage[p.id] === slug));
  if (!free.length) return null;
  return free[hash(slug + salt) % Math.min(free.length, 12)];
}

async function download(ref) {
  const path = join(PHOTOS, ref.file);
  if (existsSync(path)) return;
  const res = await fetch(ref.download);
  if (!res.ok) throw new Error(`Download fehlgeschlagen (${res.status}): ${ref.download}`);
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
}

function toRef(p, w, h, slug) {
  usage[p.id] = slug;
  return {
    file: `pexels-${p.id}-${w}x${h}.jpg`,
    download: `${p.original}?${new URLSearchParams({ auto: "compress", cs: "tinysrgb", fit: "crop", w: String(w), h: String(h) })}`,
    alt: `Beispielfoto: ${p.alt || "Handwerksarbeit"}`,
    author: p.author,
    authorUrl: p.authorUrl,
    source: "Pexels",
    sourceUrl: p.url,
  };
}

async function photosFor(lead) {
  const slug = lead.slug;
  const k = KIND[kindOf(lead)];
  let pool = [];
  for (const q of k.hero) pool = pool.concat(await search(q, "en-US"));
  const hero = pick(pool, slug, "hero");
  const gallery = [];
  for (const [i, it] of lead.site.gallery.items.slice(0, 5).entries()) {
    const own = await search(`${it.title} ${k.de}`, "de-DE");
    const p = pick(own.length >= 3 ? own : pool, slug, `g${i}`) ?? pick(pool, slug, `g${i}b`);
    gallery.push(p ? toRef(p, i === 0 ? 1200 : 800, i === 0 ? 900 : 800, slug) : null);
  }
  return { hero: hero ? toRef(hero, 1600, 1067, slug) : undefined, gallery };
}

let changed = 0;
let failed = null;
outer: for (const date of dates) {
  const dir = join(LEADS, date);
  if (!existsSync(dir)) { console.warn(`Kein Ordner ${dir}`); continue; }
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    const path = join(dir, f);
    const lead = JSON.parse(readFileSync(path, "utf8"));
    if (only && lead.slug !== only) continue;
    const hof = (lead.site.category ?? (lead.site.theme === "hof" || lead.site.scene === "farm" ? "hof" : "handwerk")) === "hof";
    if (hof) continue;
    try {
      if (!restore && (force || !lead.site.photos?.hero)) {
        if (force && lead.site.photos) for (const r of [lead.site.photos.hero, ...(lead.site.photos.gallery ?? [])]) if (r) delete usage[r.file.split("-")[1]];
        lead.site.photos = await photosFor(lead);
        writeFileSync(path, JSON.stringify(lead, null, 2) + "\n");
        changed++;
      }
      const refs = [lead.site.photos?.hero, ...(lead.site.photos?.gallery ?? [])].filter(Boolean);
      for (const r of refs) await download(r);
      console.log(`${lead.slug}: ${refs.length} Fotos`);
    } catch (e) {
      failed = e;
      console.error(`${lead.slug}: ${e.message}`);
      if (/Kontingent/.test(e.message)) break outer;
    }
  }
}
writeFileSync(USAGE, JSON.stringify(usage, null, 2) + "\n");
console.log(`${changed} Lead-Dateien aktualisiert.`);
if (failed) process.exit(2);
