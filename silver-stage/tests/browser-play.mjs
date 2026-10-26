// Browser-Durchlauf für Beat Stage (Playwright). Voraussetzung: Build in dist/ unter http://localhost:4321.
// Aufruf: node tests/browser-play.mjs  – drückt die Tasten skriptgesteuert im Takt und prüft die Auswertung.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // vorinstalliert oder per npm i -D playwright
import { createChart } from "../src/game/engine.js";
const chart = createChart();
const keys = ["d", "f", "j", "k"];
const BASE = process.env.BASE_URL_TEST || "http://localhost:4321";
const b = await chromium.launch();
async function run(name, { skipEvery = 0, offsetMs = 0, pauseAt = null } = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(`${BASE}/beat-stage/`);
  const res = await p.evaluate(async ({ chart, keys, skipEvery, offsetMs, pauseAt }) => {
    const LEAD = 3 * 0.6;
    const press = (k, repeat = false) => window.dispatchEvent(new KeyboardEvent("keydown", { key: k, repeat, bubbles: true }));
    const t0 = performance.now(); document.querySelector("[data-start-mute]").click();
    const shift = (t) => (pauseAt !== null && t > pauseAt ? 1500 + LEAD * 1000 : 0);
    if (pauseAt !== null) { setTimeout(() => press("Escape"), (LEAD + pauseAt) * 1000); setTimeout(() => press("Escape"), (LEAD + pauseAt) * 1000 + 1500); }
    chart.forEach((n, i) => {
      if (skipEvery && i % skipEvery === 0) return;
      const at = (LEAD + n.time) * 1000 + offsetMs + shift(n.time);
      setTimeout(() => press(keys[n.pad]), at - (performance.now() - t0));
    });
    // Autorepeat (gedrückt gehaltene Taste) darf keine Punkte bringen
    setTimeout(() => { for (let i = 0; i < 20; i++) press("d", true); }, 2600);
    await new Promise((r) => { const iv = setInterval(() => { if (!document.querySelector("[data-screen=result]").hidden) { clearInterval(iv); r(); } }, 200); setTimeout(r, 48000); });
    const g = (s) => document.querySelector(s)?.textContent;
    return { score: g("[data-r-score]"), acc: g("[data-r-acc]"), perfect: +g("[data-r-perfect]"), good: +g("[data-r-good]"), miss: +g("[data-r-miss]"), combo: +g("[data-r-combo]"), best: localStorage.getItem("beatstage-best"), resultFocused: document.activeElement?.hasAttribute("data-result-title") };
  }, { chart, keys, skipEvery, offsetMs, pauseAt });
  console.log(name.padEnd(20), JSON.stringify(res), errs.length ? "FEHLER " + errs.join("|") : "");
  await ctx.close();
  return res;
}
console.log("Noten je Runde:", chart.length);
const a = await run("perfekt");
const c = await run("jede-3-ausgelassen", { skipEvery: 3 });
const d = await run("120ms-spaet", { offsetMs: 120 });
const e = await run("mit-pause", { pauseAt: 10 });
const ok = [a.perfect >= chart.length - 2, c.miss >= Math.floor(chart.length / 3) - 1, d.good >= chart.length - 3 && d.perfect <= 3, e.perfect + e.good >= chart.length - 3, a.resultFocused];
console.log(ok.every(Boolean) ? "✓ alle Erwartungen erfüllt" : "✗ Abweichung: " + JSON.stringify(ok));
await b.close();
