#!/usr/bin/env node
// Erzeugt für eine Tagesrunde die WhatsApp-Entwürfe-Seite (HTML, als Artifact zu veröffentlichen) und
// Mail-Entwürfe (.eml mit X-Unsent: 1) für Betriebe mit E-Mail-Adresse. Es wird nichts versendet.
// Aufruf: node scripts/make-drafts.mjs YYYY-MM-DD <links.json> <ausgabeordner>
// links.json: { "<slug>": { "url": "https://claude.ai/artifact/…", "greet": "Vorname Nachname" | null, "about": "Satzteil nach „gestoßen –“" } }
// greet nur setzen, wenn der Inhabername eindeutig belegt ist – nie Herr/Frau raten.
import fs from "node:fs";
import path from "node:path";

const [date, linksFile, outDir] = process.argv.slice(2);
if (!date || !linksFile || !outDir) { console.error("Aufruf: node scripts/make-drafts.mjs YYYY-MM-DD links.json ausgabeordner"); process.exit(1); }
const links = JSON.parse(fs.readFileSync(linksFile, "utf8"));
const dir = path.join("data/leads", date);
const leads = fs.readdirSync(dir).filter((f) => /^firma-\d+\.json$/.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));

const isReserve = (l) => /^RESERVE/.test(l.manualChecks?.[0] ?? "");
const isMobile = (p) => /^(\+49\s?|0)1[5-7]/.test((p ?? "").replace(/[\s/()-]/g, ""));
const waNumber = (p) => "49" + p.replace(/[^\d]/g, "").replace(/^0/, "");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Reihenfolge: reguläre zuerst, dann Reserve mit Handy, dann Reserve mit Festnetz
const rank = (l) => (isReserve(l) ? 1 : 0) * 2 + (isMobile(l.company.phone) ? 0 : 1);
const list = leads.filter((l) => links[l.slug]).sort((a, b) => rank(a) - rank(b));
const missing = leads.filter((l) => !links[l.slug]).map((l) => l.slug);
if (missing.length) { console.error("Kein Link für: " + missing.join(", ")); process.exit(1); }

function message(l, mail = false) {
  const k = links[l.slug];
  return [
    k.greet ? `Guten Tag ${k.greet},` : "Guten Tag,",
    `hier ist Fatih Bulut (fobhausmeisterservice.de). Ich bin auf ${k.about}, aber eine eigene Website habe ich nicht gefunden. Deshalb habe ich Ihnen unverbindlich einen Website-Entwurf gebaut:`,
    k.url,
    `Die Bilder sind Platzhalter – Texte und Fotos passe ich gern an. Wenn er Ihnen gefällt, ${mail ? "antworten Sie einfach auf diese Mail" : "schreiben Sie mir einfach kurz zurück"}.`,
    "Kein Interesse? Kurze Antwort genügt, dann melde ich mich nicht mehr.",
    "Viele Grüße",
    "Fatih Bulut",
  ].join("\n");
}

const d = date.split("-").reverse().join(".");
const dShort = d.slice(0, 6);
const sections = list.map((l, i) => {
  const n = i + 1, c = l.company, k = links[l.slug], text = message(l), reserve = isReserve(l);
  const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${c.name} ${c.address ?? c.city}`);
  const wa = isMobile(c.phone)
    ? `<a class="btn" href="https://wa.me/${waNumber(c.phone)}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">In WhatsApp öffnen</a>`
    : `<span class=no>Keine Handynummer – anrufen</span>`;
  return `<section class="c${reserve ? " r" : ""}"><h2>${n}. ${esc(c.name)} <small>${esc(c.city)}</small>${reserve ? " <span class=tag>RESERVE – erst in Google Maps prüfen</span>" : ""}</h2>` +
    `<p class=meta>${esc(c.trade)} · Tel.: <b>${esc(c.phone ?? "—")}</b> · E-Mail: ${esc(c.email ?? "—")} · Entwurf: <a href="${k.url}">${k.url}</a></p>` +
    `<pre id="t${n}">${esc(text)}</pre><div class=row>${wa}<button onclick="cp('t${n}',this)">Text kopieren</button>` +
    `<a class="btn" style="background:var(--line);color:var(--ink)" href="${maps}" target="_blank" rel="noopener">Google Maps prüfen</a></div></section>`;
});
const regular = list.filter((l) => !isReserve(l)).length;
const html = `<!doctype html><html lang=de><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>WhatsApp-Entwürfe ${dShort}</title>
<style>:root{--bg:#f4f6f3;--ink:#16201a;--mut:#5d6b62;--card:#fff;--line:#dfe6e0;--acc:#1f9d55;--warn:#b4541a}@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0f1512;--ink:#e8efe9;--mut:#9aa9a0;--card:#18201b;--line:#2c3830;--acc:#3ccf7a;--warn:#f0965d}}:root[data-theme="dark"]{--bg:#0f1512;--ink:#e8efe9;--mut:#9aa9a0;--card:#18201b;--line:#2c3830;--acc:#3ccf7a;--warn:#f0965d}
body{background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,sans-serif;margin:0;padding:24px 16px}main{max-width:760px;margin:auto}.c{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;margin:14px 0}.r{border-color:var(--warn)}
h2{font-size:17px;margin:0 0 4px}small{color:var(--mut);font-weight:400}.tag{font-size:12px;color:var(--warn);border:1px solid var(--warn);border-radius:99px;padding:1px 8px}.meta{color:var(--mut);font-size:13px;margin:0 0 10px;overflow-wrap:anywhere}
pre{white-space:pre-wrap;font:inherit;background:var(--bg);border-radius:10px;padding:12px;margin:0 0 10px;overflow-wrap:anywhere}.row{display:flex;gap:8px;flex-wrap:wrap}.btn,button{border:0;border-radius:10px;padding:10px 14px;font:600 14px system-ui;cursor:pointer;text-decoration:none}.btn{background:var(--acc);color:#fff}button{background:var(--line);color:var(--ink)}.no{color:var(--mut);font-size:13px;align-self:center}
.note{background:var(--card);border-left:4px solid var(--warn);padding:10px 14px;border-radius:8px;font-size:14px}</style></head><body><main>
<h1>WhatsApp-Entwürfe ${d}</h1><p class=meta>${list.length} fertige Nachrichten – oben ${regular === 1 ? "der reguläre Lead" : `die ${regular} regulären Leads`}, unten Reserve. Absender: Fatih Bulut.</p><p class=note><b>Vor dem Senden:</b> 1) Entwurfs-Link über „Teilen“ freigeben. 2) In Google Maps prüfen, dass keine Website hinterlegt ist („Google Maps prüfen“). 3) Werbung per WhatsApp ohne vorherige Einwilligung ist nach § 7 UWG riskant – am sichersten kurz anrufen und fragen, ob Sie den Entwurf per WhatsApp schicken dürfen. Der Button öffnet WhatsApp mit fertigem Text – gesendet wird erst, wenn Sie selbst auf Senden tippen.</p>${sections.join("")}</main><script>function cp(id,b){var t=document.getElementById(id).innerText;function ok(){b.textContent='Kopiert ✓'}function fb(){var r=document.createRange();r.selectNodeContents(document.getElementById(id));var s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand('copy');ok()}catch(e){b.textContent='Text markiert – jetzt kopieren'}}try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e){fb()}}</script></body></html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `whatsapp-${date}.html`), html);
// Mail-Betreff als RFC-2047 (UTF-8, Q-Encoding), in Stücken unter 76 Zeichen
const qEnc = (s) => {
  const bytes = Buffer.from(s, "utf8"); let cur = "", out = [];
  for (const b of bytes) {
    const ch = (b >= 0x30 && b <= 0x39) || (b >= 0x41 && b <= 0x5a) || (b >= 0x61 && b <= 0x7a) ? String.fromCharCode(b) : b === 0x20 ? "_" : "=" + b.toString(16).toUpperCase().padStart(2, "0");
    if (cur.length + ch.length > 60 && !/^=[89AB]/.test(ch)) { out.push(cur); cur = ""; }
    cur += ch;
  }
  out.push(cur);
  return out.map((p) => `=?utf-8?q?${p}?=`).join("\n ");
};
let mails = 0;
for (const l of list.filter((x) => x.company.email)) {
  const eml = [`X-Unsent: 1`, `From: Fatih Bulut <info@fobhausmeisterservice.de>`, `To: ${l.company.email}`,
    `Subject: ${qEnc(`Unverbindlicher Website-Entwurf für ${l.company.name}`)}`, `MIME-Version: 1.0`, `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`, ``, message(l, true)].join("\n");
  fs.writeFileSync(path.join(outDir, `${l.slug}.eml`), eml + "\n");
  mails++;
}
console.log(`${outDir}/whatsapp-${date}.html: ${list.length} Nachrichten (${regular} regulär), ${mails} Mail-Entwürfe`);
