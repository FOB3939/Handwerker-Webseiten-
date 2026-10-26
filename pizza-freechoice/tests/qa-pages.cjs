// QA über alle Seiten und Breiten: Überlauf, Konsolenfehler, axe (WCAG 2.2 AA), h1, Titel/Beschreibung,
// Tippflächen, interne Links. Voraussetzung: dist/ unter http://localhost:4340. Aufruf: node tests/qa-pages.cjs
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const axe = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.env.BASE_URL_TEST || "http://localhost:4340";
const PAGES = ["/", "/speisekarte/", "/bestellen/", "/lieferung-abholung/", "/ueber-uns/", "/kontakt/", "/allergene-zusatzstoffe/", "/impressum/", "/datenschutz/", "/404.html"];
const WIDTHS = [360, 390, 768, 1024, 1440];
(async () => {
  const b = await chromium.launch();
  const links = new Set(); let problems = 0;
  for (const pg of PAGES) for (const w of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage(); const errs = [];
    p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && errs.push(m.text()));
    const resp = await p.goto(BASE + pg); await p.waitForTimeout(250);
    const info = await p.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden"; };
      const small = [...document.querySelectorAll("a, button, input, select, textarea, summary")].filter(vis).filter((e) => {
        if (e.closest("p, li address") && e.tagName === "A" && getComputedStyle(e).display === "inline") return false; // Fließtext-Links (WCAG-Ausnahme)
        if (e.closest(".hp")) return false;
        const r = e.getBoundingClientRect(); return r.height < 44 && r.width < 44 || r.height < 24 || r.width < 24;
      }).map((e) => `${e.tagName}:${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 24)}`);
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        h1: document.querySelectorAll("h1").length,
        title: document.title, desc: document.querySelector('meta[name="description"]')?.content?.length ?? 0,
        canonical: !!document.querySelector('link[rel="canonical"]'), robots: document.querySelector('meta[name="robots"]')?.content,
        small, links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h.startsWith("/")),
      };
    });
    info.links.forEach((l) => links.add(l.split("#")[0].split("?")[0]));
    await p.addScriptTag({ content: axe });
    const ax = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map((v) => `${v.id}(${v.nodes.length})`));
    const issues = [];
    if (info.overflow) issues.push("Überlauf");
    if (info.h1 !== 1) issues.push(`h1=${info.h1}`);
    if (info.desc < 50) issues.push("Beschreibung fehlt/kurz");
    if (ax.length) issues.push("axe " + ax.join(","));
    if (info.small.length) issues.push("klein: " + [...new Set(info.small)].slice(0, 4).join(" | "));
    if (errs.length) issues.push("Fehler: " + errs.slice(0, 2).join(" | "));
    if (pg !== "/404.html" && resp.status() !== 200) issues.push("HTTP " + resp.status());
    if (issues.length) { problems++; console.log(`✗ ${pg} @${w}: ${issues.join("; ")}`); }
    await ctx.close();
  }
  // interne Links prüfen
  const p = await b.newPage(); const broken = [];
  for (const l of links) { const r = await p.request.get(BASE + l); if (r.status() >= 400) broken.push(`${l} ${r.status()}`); }
  console.log(broken.length ? "✗ Defekte Links: " + broken.join(", ") : `✓ ${links.size} interne Links erreichbar`);
  console.log(problems ? `${problems} Seiten/Breiten mit Befund` : `✓ ${PAGES.length} Seiten × ${WIDTHS.length} Breiten ohne Befund`);
  await b.close();
})();
