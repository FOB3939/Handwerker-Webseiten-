#!/usr/bin/env node
// Bereitet den Build (dist/) für eine private Claude-Artifact-Vorschau auf:
// • alle internen absoluten Links ("/tonstudio/", "/_astro/…") werden relativ zur jeweiligen Seite umgeschrieben,
//   Ordner-Links zeigen explizit auf index.html (der Artifact-Dienst löst Verzeichnisse nicht auf),
// • die Startseite wird ohne eigenes <html>/<head>/<body> ausgegeben (das Grundgerüst setzt der Artifact-Dienst),
// • Weiterleitungsseiten und Sitemaps werden ausgelassen.
// Aufruf: npm run build && node scripts/artifact-export.mjs <zielordner>
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dist = path.join(root, "dist");
const out = path.resolve(process.argv[2] || path.join(root, "artifact"));
const SKIP = /^(clients|r%C3%A4ume|räume|b%C3%BChnenraum|bühnenraum|404\.html|sitemap.*\.xml|robots\.txt)/;

fs.rmSync(out, { recursive: true, force: true });
const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name), rel = path.relative(dist, p).split(path.sep).join("/");
    if (SKIP.test(rel)) continue;
    if (f.isDirectory()) walk(p); else files.push(rel);
  }
})(dist);

// Relativer Pfad von einer Seite (Ordnertiefe) zu einem absoluten Ziel
function rel(fromFile, target) {
  const i = target.search(/[?#]/);
  const pathPart = i < 0 ? target : target.slice(0, i), suffix = i < 0 ? "" : target.slice(i);
  let to = pathPart.replace(/^\//, "").replace(/^_astro\//, "assets/");
  if (to === "" || to.endsWith("/")) to += "index.html";
  const depth = fromFile.split("/").length - 1;
  return "../".repeat(depth) + to + suffix;
}
const rewriteHtml = (html, file) => html
  .replace(/(href|src|action|content)="(\/(?!\/)[^"]*)"/g, (m, attr, url) => {
    if (attr === "content" && !/^\/(_astro|brand|og|favicon)/.test(url)) return m;
    return `${attr}="${rel(file, url)}"`;
  })
  .replace(/url\((['"]?)\/(_astro\/[^)'"]+)\1\)/g, (m, q, u) => `url(${q}${rel(file, "/" + u)}${q})`)
  // responsive Bilder: jede URL in srcset; Großansicht der Bildstrecke (data-zoom)
  .replace(/srcset="([^"]*)"/g, (m, list) => `srcset="${list.split(",").map((part) => part.trim().replace(/^\/(?!\/)\S+/, (url) => rel(file, url))).join(", ")}"`)
  .replace(/data-zoom="(\/(?!\/)[^"]*)"/g, (m, url) => `data-zoom="${rel(file, url)}"`);

const pages = [];
for (const f of files) {
  // Der Artifact-Dienst reserviert Pfade mit "_" → _astro/ wird zu assets/
  const src = path.join(dist, f), dst = path.join(out, f.replace(/^_astro\//, "assets/"));
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (f.endsWith(".html")) {
    let html = rewriteHtml(fs.readFileSync(src, "utf8"), f);
    if (f === "index.html") {
      // Startseite: Kopf- und Körperinhalt ohne Grundgerüst (Artifact-Dienst ergänzt es)
      const head = (html.match(/<head>([\s\S]*?)<\/head>/) || [, ""])[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, "");
      const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/) || [, html])[1];
      html = `${head}\n${body}`;
    } else pages.push(f);
    fs.writeFileSync(dst, html);
  } else if (f.endsWith(".css")) {
    // CSS liegt in _astro/: absolute Verweise auf Nachbardateien relativ machen
    fs.writeFileSync(dst, fs.readFileSync(src, "utf8").replace(/url\((['"]?)\/_astro\//g, "url($1./"));
  } else if (f.endsWith(".js")) {
    fs.writeFileSync(dst, fs.readFileSync(src, "utf8").replace(/(["'`])\/_astro\//g, "$1./"));
  } else fs.copyFileSync(src, dst);
}
const all = files.filter((f) => f !== "index.html").map((f) => f.replace(/^_astro\//, "assets/"));
fs.writeFileSync(path.join(out, "files.json"), JSON.stringify(all, null, 1));
console.log(`${out}: Startseite + ${pages.length} Unterseiten, ${all.length} Dateien insgesamt`);
