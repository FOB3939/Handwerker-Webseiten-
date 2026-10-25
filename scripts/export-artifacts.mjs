// Erzeugt aus dem Produktions-Build je Entwurf eine Seite im Format für private, teilbare Claude-Artifacts:
// ohne eigenes <html>/<head>/<body>, CSS inline, kein JS-Bundle, Formular-Hinweis direkt auf der Seite.
// Aufruf: npm run build && node scripts/export-artifacts.mjs <zielordner> [datum]
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const [outDir, onlyDate] = process.argv.slice(2);
if (!outDir) throw new Error("Zielordner angeben");
const appDir = path.join(root, ".next", "server", "app");
const cssDir = path.join(root, ".next", "static", "css");
const css = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(path.join(cssDir, f), "utf8")).join("\n");

// Sticky-Header unter die Statusleiste des Telefons setzen (Safe-Area).
const extraCss = `body{overflow-x:clip}header.sticky{top:env(safe-area-inset-top,0px)}.fixed.bottom-0{padding-bottom:calc(.75rem + env(safe-area-inset-bottom,0px))}`;


function toArtifact(html, companyName) {
  const fontLinks = (html.match(/<link[^>]+href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*>/g) || []).join("\n");
  const title = `Website-Entwurf ${companyName}`.replace(/&/g, "&amp;");
  const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/) || [, ""])[1].replace(/<script\b(?![^>]*id="demo-(?:enhance|motion|game|ldjson|intro|mfx)")[^>]*>[\s\S]*?<\/script>/g, "");
  return `<title>${title}</title>\n<meta name="robots" content="noindex, nofollow">\n${fontLinks}\n<style>${css}\n${extraCss}</style>\n<div lang="de">${body}</div>\n`;
}

fs.mkdirSync(outDir, { recursive: true });
const leadsDir = path.join(root, "data", "leads");
const dates = onlyDate ? [onlyDate] : fs.readdirSync(leadsDir).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
for (const date of dates) {
  for (const f of fs.readdirSync(path.join(leadsDir, date)).filter((n) => /^firma-\d+\.json$/.test(n))) {
    const { slug, company } = JSON.parse(fs.readFileSync(path.join(leadsDir, date, f), "utf8"));
    const target = path.join(outDir, `${slug}.html`);
    fs.writeFileSync(target, toArtifact(fs.readFileSync(path.join(appDir, "demo", `${slug}.html`), "utf8"), company.name));
    console.log(target);
  }
}
