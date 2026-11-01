// Prüft die gebaute Einzeldatei mit Playwright: Konsole, Überlauf, axe, Tastatur-Formular,
// Hero-Animation (normal und reduzierte Bewegung) und legt Screenshots ab.
// Aufruf: node tests/check.cjs [html] [shots-ordner]
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const file = path.resolve(process.argv[2] || path.join(__dirname, "..", "dist", "kmn-neu.html"));
const shots = path.resolve(process.argv[3] || path.join(__dirname, "..", "dist", "shots"));
fs.mkdirSync(shots, { recursive: true });
let axePath;
for (const base of [path.join(__dirname, ".."), "/home/user/Handwerker-Webseiten-"]) {
  try { axePath = require.resolve("axe-core/axe.min.js", { paths: [base] }); break; } catch {}
}
const WIDTHS = [360, 390, 768, 1024, 1440];
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? "  ok   " : "  FEHL ") + msg); };
const decode = (p) => p.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
const heroTl = (p, js) => p.evaluate(js);

(async () => {
  const b = await chromium.launch();
  for (const w of WIDTHS) {
    console.log(`\n== ${w}px`);
    for (const motion of ["no-preference", "reduce"]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: motion });
      const errs = [];
      p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errs.push(m.text()); });
      p.on("pageerror", (e) => errs.push(String(e)));
      p.on("request", (r) => { if (!r.url().startsWith("file:") && !r.url().startsWith("data:")) errs.push("Netzwerk: " + r.url()); });
      await p.goto("file://" + file);
      await decode(p);
      if (motion === "no-preference") {
        await p.waitForTimeout(1200);
        const st = await p.getAttribute("[data-play]", "data-state");
        ok(st === "playing", `${w} Animation läuft (Status ${st})`);
        await p.waitForTimeout(10500);
        const done = await p.getAttribute("[data-play]", "data-state");
        ok(done === "done", `${w} Animation endet (Status ${done})`);
      } else {
        await p.waitForTimeout(300);
        const r = await p.evaluate(() => ({
          state: document.querySelector("[data-play]").getAttribute("data-state"),
          card: getComputedStyle(document.querySelector("[data-photo-card]")).opacity,
          top: getComputedStyle(document.querySelector(".k-top")).opacity,
          label: document.querySelector("[data-step-label]").textContent,
        }));
        ok(r.state === "done" && r.card === "1" && r.top === "1", `${w} reduzierte Bewegung: Standbild der fertigen Küche (${JSON.stringify(r)})`);
        // Überlauf
        const over = await p.evaluate(() => {
          const W = document.documentElement.clientWidth;
          const bad = [...document.querySelectorAll("body *")].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width && r.right > W + 1 && !el.closest(".hp,.defs,.skip");
          }).slice(0, 5).map((el) => el.tagName + "." + el.className);
          return { sw: document.documentElement.scrollWidth, W, bad };
        });
        ok(over.sw <= w && over.bad.length === 0, `${w} kein horizontaler Überlauf (${over.sw}px ${over.bad.join(" ")})`);
        // Tippflächen
        const small = await p.evaluate(() => [...document.querySelectorAll("a[href],button,input:not([type=hidden]):not(#website),select,textarea,summary")]
          .filter((el) => el.offsetParent && !el.closest("p,dd") && !el.matches(".choice input"))
          .map((el) => [el, el.getBoundingClientRect()]).filter(([, r]) => r.height < 44 || r.width < 24)
          .map(([el, r]) => `${el.tagName}:${(el.textContent || el.name).trim().slice(0, 20)}(${Math.round(r.width)}x${Math.round(r.height)})`));
        ok(small.length === 0, `${w} Tippflächen ≥ 44px ${small.join(", ")}`);
        // axe
        if (axePath) {
          await p.addScriptTag({ path: axePath });
          const res = await p.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] }));
          const v = res.violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
          ok(v.length === 0, `${w} axe ohne Verstöße ${v.join("; ")}`);
        }
        await p.screenshot({ path: path.join(shots, `seite-${w}.png`), fullPage: true });
        await p.screenshot({ path: path.join(shots, `start-${w}.png`) });
      }
      ok(errs.length === 0, `${w} ${motion}: keine Konsolenfehler/externen Anfragen ${errs.join(" | ")}`);
      await p.close();
    }
  }

  // Hero-Phasen als Einzelbilder (deterministisch per Timeline-Zeit)
  console.log("\n== Hero-Phasen");
  for (const w of [1440, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto("file://" + file);
    await decode(p);
    await p.click("[data-play]"); // pausieren
    const phases = [["1-aufmass", 0.45], ["2-korpusse", 1.6], ["3-fronten", 2.75], ["4-platte", 3.9], ["5-geraete", 4.9], ["6-pruefen", 6.4], ["7-foto", 99]];
    for (const [n, t] of phases) {
      await p.evaluate((t) => {
        const tl = gsap.globalTimeline.getChildren(false, false, true).find((x) => x.labels && "korpus" in x.labels);
        tl.pause().seek(Math.min(t, tl.duration()), false);
      }, t);
      await p.waitForTimeout(80);
      await (await p.$("[data-stage]")).screenshot({ path: path.join(shots, `hero-${w}-${n}.png`) });
    }
    // Schritt-Knöpfe
    await p.click('[data-seek="platte"]');
    const lab = await p.textContent("[data-step-label]");
    ok(/Arbeitsplatte/.test(lab), `${w} Schritt-Knopf springt zur Arbeitsplatte (${lab})`);
    // Optik wählen färbt Hero-Platte
    await p.click('[data-optik="eiche"]');
    const fill = await p.evaluate(() => document.querySelector(".kitchen .js-wt-top").style.fill);
    ok(/pt-eiche/.test(fill), `${w} Optik-Wahl färbt die Hero-Arbeitsplatte (${fill})`);
    if (w === 1440) { await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100); await (await p.$("[data-stage]")).screenshot({ path: path.join(shots, `hero-${w}-8-eiche.png`) }); }
    await p.close();
  }

  // Formular nur mit Tastatur
  console.log("\n== Formular per Tastatur");
  {
    const p = await b.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: "reduce" });
    await p.goto("file://" + file + "#anfrage");
    await p.focus('input[name="anliegen"][value="kuechenmontage"]');
    await p.keyboard.press("ArrowDown");
    const checked = await p.evaluate(() => document.querySelector('input[name="anliegen"]:checked')?.value);
    ok(checked === "abbau-umbau", `Pfeiltaste wählt Anliegen (${checked})`);
    await p.keyboard.press("Tab");
    ok(await p.evaluate(() => document.activeElement.matches("[data-next]")), "Tab erreicht „Weiter“");
    await p.keyboard.press("Enter");
    ok(await p.evaluate(() => document.activeElement.classList.contains("step__t") && /Vorhaben/.test(document.activeElement.textContent)), "Enter führt zu Schritt 2, Fokus auf Überschrift");
    await p.keyboard.press("Tab");
    ok(await p.evaluate(() => document.activeElement.id === "nachricht"), "Tab erreicht Beschreibung");
    // Fehlerfall
    await p.keyboard.type("kurz");
    await p.focus("[data-step]:not([hidden]) [data-next]");
    await p.keyboard.press("Enter");
    ok(await p.evaluate(() => document.activeElement.id === "nachricht" && document.activeElement.getAttribute("aria-invalid") === "true"), "Fehler: Fokus zurück aufs Feld, aria-invalid gesetzt");
    await p.keyboard.type(" – L-Küche, 3 m, Hersteller bekannt");
    await p.keyboard.press("Tab"); await p.keyboard.type("81379");
    await p.focus("[data-step]:not([hidden]) [data-next]");
    await p.keyboard.press("Enter");
    ok(await p.evaluate(() => /erreichen/.test(document.activeElement.textContent)), "Schritt 3 erreicht");
    await p.keyboard.press("Tab"); await p.keyboard.type("Max Muster");
    await p.keyboard.press("Tab"); await p.keyboard.type("089 123456");
    await p.focus('[type="submit"]');
    await p.keyboard.press("Enter");
    const st = await p.evaluate(() => ({ vis: !document.querySelector("[data-status]").hidden, focus: document.activeElement.matches("[data-status]") }));
    ok(st.vis && st.focus, "Absenden zeigt Vorschau-Hinweis mit Fokus");
    await p.screenshot({ path: path.join(shots, "formular-390.png") });
    await p.close();
  }

  // Rechtliche Seiten per Hash
  {
    const p = await b.newPage({ viewport: { width: 1024, height: 800 } });
    await p.goto("file://" + file + "#impressum");
    ok(await p.isVisible("#impressum-title") && !(await p.isVisible("#hero-title")), "Hash-Route #impressum");
    await p.goto("file://" + file + "#datenschutz");
    ok(await p.isVisible("#datenschutz-title"), "Hash-Route #datenschutz");
    await p.close();
  }
  await b.close();
  console.log(`\n${fails.length ? fails.length + " Fehler" : "Alle Prüfungen bestanden."}`);
  process.exit(fails.length ? 1 : 0);
})();
