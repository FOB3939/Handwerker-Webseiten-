// Erzeugt eigenständige HTML-Dateien (CSS inline, ohne JS-Bundles) aus dem Produktions-Build,
// damit die Entwürfe ohne Server geöffnet oder verschickt werden können. Vorher: npm run build
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appDir = path.join(root, ".next", "server", "app");
const cssDir = path.join(root, ".next", "static", "css");
const css = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(path.join(cssDir, f), "utf8")).join("\n");


function standalone(html) {
  return html
    .replace(/<link(?![^>]*fonts\.googleapis)[^>]+rel="stylesheet"[^>]*>/g, "")
    .replace(/<link[^>]+rel="preload"[^>]*>/g, "")
    .replace(/<script\b(?![^>]*id="demo-(?:enhance|motion|game|ldjson|intro|mfx)")[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/href="\/demo\/([a-z0-9-]+)"/g, 'href="$1.html"')
    .replace(/href="\/daily\/(\d{4}-\d{2}-\d{2})"/g, 'href="index.html"')
    .replace(/href="\/"/g, 'href="index.html"')
    .replace("</head>", `<style>${css}</style></head>`)
    ;
}

const dates = fs.readdirSync(path.join(appDir, "daily")).filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f)).map((f) => f.slice(0, 10));
const leadsDir = path.join(root, "data", "leads");

for (const date of dates) {
  const out = path.join(root, "previews", date);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), standalone(fs.readFileSync(path.join(appDir, "daily", `${date}.html`), "utf8")));
  for (const f of fs.readdirSync(path.join(leadsDir, date)).filter((n) => /^firma-\d+\.json$/.test(n))) {
    const { slug } = JSON.parse(fs.readFileSync(path.join(leadsDir, date, f), "utf8"));
    fs.writeFileSync(path.join(out, `${slug}.html`), standalone(fs.readFileSync(path.join(appDir, "demo", `${slug}.html`), "utf8")));
  }
  console.log(`previews/${date}: ${fs.readdirSync(out).length} Dateien`);
}
