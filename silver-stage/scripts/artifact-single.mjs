// Packt die gebaute Website (dist/) in EINE HTML-Datei: alle Seiten, Stile, Skripte, Schriften und Fotos
// stecken darin. Für Vorschau-Links, die nur Einzeldateien öffentlich teilen können.
// Aufruf: node scripts/artifact-single.mjs [Zielpfad]   (vorher: npm run build)
//
// Funktionsweise: Jede Seite liegt als HTML-Text im Dokument. Ein kleiner Router zeigt die Seite zur
// Adresse #!/pfad/ an (document.open/write), d. h. jede Seite läuft wie auf der echten Website mit
// ihren eigenen Skripten. Interne Links werden auf #!/… umgeschrieben, Zurück/Vor funktioniert.
// Fotos werden einmal als WebP (1280 px) eingebettet und von allen Seiten gemeinsam genutzt.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const out = process.argv[2] || join(root, "artifact-single.html");
const SKIP = new Set(["404.html"]);

// ---------- Seiten einsammeln ----------
const pages = {};
const isRedirect = (html) => /http-equiv="refresh"/.test(html);
const addPage = (route, file) => { const html = readFileSync(file, "utf8"); if (!isRedirect(html)) pages[route] = html; };
addPage("/", join(dist, "index.html"));
for (const d of readdirSync(dist)) {
  const f = join(dist, d, "index.html");
  if (!SKIP.has(d) && statSync(join(dist, d)).isDirectory() && existsSync(f)) addPage(`/${d}/`, f);
}
const routes = Object.keys(pages);

// ---------- Hilfen ----------
const MIME = { ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif" };
const dataUri = (file) => `data:${MIME[extname(file)] || "application/octet-stream"};base64,${readFileSync(file).toString("base64")}`;
const distFile = (url) => join(dist, decodeURI(url.replace(/^\//, "").split(/[?#]/)[0]));

// Fotos: Astro-Dateiname „name.HASH_variante.ext“ → Stamm „name.HASH“ → eine gemeinsame WebP-Fassung
const IMG_RE = /\/_astro\/([^"'\s),]+?)\.(?:jpg|jpeg|png|webp|avif)/g;
const stems = new Map(); // Stamm → Platzhalter-Schlüssel
const stemOf = (name) => (name.match(/^(.+?\.[A-Za-z0-9_-]{8})/) || [, name])[1]; // Astro-Hash: 8 Zeichen
const photoSrc = (stem) => {
  // Originaldatei in dist/_astro (ohne Variante), sonst größte Variante
  const files = readdirSync(join(dist, "_astro")).filter((f) => f.startsWith(stem) && /\.(jpe?g|png|webp)$/.test(f));
  const orig = files.find((f) => f === `${stem}.jpg` || f === `${stem}.jpeg` || f === `${stem}.png`) || files.sort((a, b) => statSync(join(dist, "_astro", b)).size - statSync(join(dist, "_astro", a)).size)[0];
  return join(dist, "_astro", orig);
};

// ---------- Seiten umschreiben ----------
const cssCache = new Map();
// Gemeinsame Bausteine (Stile, Skripte) nur einmal speichern, Seiten verweisen per Platzhalter
const shared = {}, sharedKey = new Map();
const share = (id, text) => { if (!sharedKey.has(id)) { const k = `@@S${sharedKey.size}@@`; sharedKey.set(id, k); shared[k] = text; } return sharedKey.get(id); };
const inlineCss = (href) => {
  if (!cssCache.has(href)) {
    let css = readFileSync(distFile(href), "utf8");
    css = css.replace(/url\((["']?)(\/_astro\/[^)"']+)\1\)/g, (m, q, u) => /\.(woff2?|svg|png)$/.test(u) ? `url(${dataUri(distFile(u))})` : m);
    cssCache.set(href, css);
  }
  return cssCache.get(href);
};
const routeOf = (href) => {
  const [path, rest = ""] = href.split(/(?=[?#])/);
  const p = path.endsWith("/") ? path : path + "/";
  return routes.includes(p) ? `#!${p}${rest}` : null;
};

const ROUTER = `<script>(${function router() {
  // Läuft in jeder Seite neu (document.open löscht Ereignis-Handler, nicht aber window.__SS)
  const go = (h) => { if (location.hash !== h) location.hash = h; else window.__SS.show(); };
  addEventListener("hashchange", () => { if (!location.hash || location.hash.startsWith("#!/")) window.__SS.show(); });
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href^='#!/']");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); go(a.getAttribute("href"));
  }, true);
}})();</script>`;

for (const r of routes) {
  let h = pages[r];
  // Stylesheets einbetten, Vorladen und Icons auf Dateien entfernen
  h = h.replace(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/g, (_, href) => `<style>${share(href, inlineCss(href))}</style>`);
  h = h.replace(/<link rel="preload"[^>]*>/g, "");
  h = h.replace(/<link rel="(?:icon|apple-touch-icon|sitemap|canonical|alternate)"[^>]*>/g, "");
  h = h.replace(/<meta property="og:[^>]*>|<meta name="twitter:[^>]*>/g, "");
  // Skripte einbetten
  h = h.replace(/<script type="module" src="([^"]+)"><\/script>/g, (_, src) => `<script type="module">${share(src, readFileSync(distFile(src), "utf8"))}</script>`);
  // Bilder: <source> entfernen, srcset/sizes weg, alle Fotoadressen → gemeinsamer Platzhalter
  h = h.replace(/<source\b[^>]*>/g, "");
  h = h.replace(/\s(?:srcset|sizes)="[^"]*"/g, "");
  h = h.replace(IMG_RE, (m, name) => { const s = stemOf(name); if (!stems.has(s)) stems.set(s, `@@I${stems.size}@@`); return stems.get(s); });
  // Logo-Dateien (SVG/PNG in /brand, Favicon)
  h = h.replace(/(["'])(\/(?:brand\/[^"']+|favicon-32\.png|apple-touch-icon\.png|og\.png))\1/g, (m, q, u) => existsSync(distFile(u)) ? `${q}${dataUri(distFile(u))}${q}` : m);
  // Interne Links
  h = h.replace(/href="(\/[^"]*)"/g, (m, href) => { const t = routeOf(href); return t ? `href="${t}"` : m; });
  // Router direkt nach <head>
  h = h.replace(/<head>/, `<head>${ROUTER}`);
  pages[r] = h;
}

// ---------- Fotos einmal einbetten ----------
const images = {};
for (const [stem, key] of stems) {
  const buf = await sharp(photoSrc(stem)).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
  images[key] = `data:image/webp;base64,${buf.toString("base64")}`;
}

// ---------- Hülle ----------
const json = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
const shell = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Website-Entwurf Silver Stage</title><meta name="robots" content="noindex, nofollow"><style>html,body{margin:0;background:#0d0f14;color:#f2f3f5;font-family:system-ui,sans-serif}</style></head><body><p style="padding:24px">Website-Entwurf Silver Stage wird geladen …</p>
<script>
window.__SS = (function () {
  var P = ${json(pages)}, I = ${json(images)}, S = ${json(shared)};
  var fill = function (h) { return h.replace(/@@S\\d+@@/g, function (k) { return S[k] || ""; }).replace(/@@I\\d+@@/g, function (k) { return I[k] || ""; }); };
  return { show: function () {
    var m = (location.hash || "").match(/^#!(\\/[^?#]*)/), r = m && P[m[1]] ? m[1] : "/";
    document.open(); document.write(fill(P[r])); document.close();
    scrollTo(0, 0);
  } };
})();
// erst nach dem Einlesen der Hülle ersetzen (während des Parsens würde document.open ignoriert)
addEventListener("DOMContentLoaded", function () { setTimeout(window.__SS.show, 0); });
</script></body></html>`;
writeFileSync(out, shell);
const mb = (Buffer.byteLength(shell) / 1048576).toFixed(2);
console.log(`${out}: ${routes.length} Seiten (${routes.join(" ")}), ${stems.size} Fotos, ${mb} MB`);
