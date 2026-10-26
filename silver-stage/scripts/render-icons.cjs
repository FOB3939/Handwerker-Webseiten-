// Rendert Favicon-PNGs, Apple-Touch-Icon und die Social-Vorschau (og.png) aus den Vektor-Logos.
// Aufruf (nach npm run logo): node scripts/render-icons.cjs   – nutzt Playwright/Chromium.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const pub = path.join(__dirname, "..", "public");
const svg = (f) => fs.readFileSync(path.join(pub, "brand", f), "utf8");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const shot = async (html, w, h, out) => {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<html><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden">${html}</body></html>`);
    await p.screenshot({ path: path.join(pub, out), omitBackground: false });
  };
  const fav = svg("favicon.svg").replace("<svg ", `<svg width="100%" height="100%" `);
  await shot(fav, 32, 32, "favicon-32.png");
  const touch = `<div style="width:180px;height:180px;background:#101112;display:grid;place-items:center"><div style="width:132px;height:132px">${svg("signet-light.svg").replace("<svg ", '<svg width="100%" height="100%" ')}</div></div>`;
  await shot(touch, 180, 180, "apple-touch-icon.png");
  const og = `<div style="width:1200px;height:630px;background:radial-gradient(60% 70% at 30% 40%,#24203a 0%,#101112 70%);display:grid;place-items:center;font-family:sans-serif">
    <div style="width:760px">${svg("logo-stacked-light.svg").replace("<svg ", '<svg width="100%" ')}</div>
    <div style="position:absolute;bottom:56px;left:0;right:0;text-align:center;color:#b8bdc5;font:400 20px/1.3 sans-serif;letter-spacing:4px">TONSTUDIO · PROBERAUM · LIGHTROOM — MÜNCHEN-SENDLING</div></div>`;
  await shot(og, 1200, 630, "og.png");
  await b.close();
  console.log("favicon-32.png, apple-touch-icon.png, og.png");
})();
