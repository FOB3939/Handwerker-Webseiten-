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
  const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
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
        await p.waitForTimeout(600);
        const r = await p.evaluate(() => ({ cls: document.querySelector("[data-h3d]").className, st: window.ScrollTrigger ? ScrollTrigger.getAll().length : 0 }));
        ok(/h3d--gl/.test(r.cls) && !/static/.test(r.cls) && r.st > 0, `${w} 3D-Szene mit WebGL und ScrollTrigger aktiv (${r.cls})`);
        if (axePath) {
          await p.addScriptTag({ path: axePath });
          const res = await p.evaluate(() => axe.run(document.querySelector("[data-h3d]"), { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] }));
          const v = res.violations.map((x) => `${x.id}(${x.nodes.length})`);
          ok(v.length === 0, `${w} axe in der gepinnten 3D-Szene ohne Verstöße ${v.join("; ")}`);
        }
      } else {
        await p.waitForTimeout(300);
        const r = await p.evaluate(() => ({
          cls: document.querySelector("[data-h3d]").className,
          card: getComputedStyle(document.querySelector("[data-photo-card]")).opacity,
          visible: [...document.querySelectorAll("[data-chapter]")].filter((c) => getComputedStyle(c).visibility === "visible" && getComputedStyle(c).opacity === "1").length,
          total: document.querySelectorAll("[data-chapter]").length,
          pin: getComputedStyle(document.querySelector("[data-h3d-pin]")).height,
        }));
        ok(/h3d--static/.test(r.cls) && r.card === "1" && r.visible === r.total, `${w} reduzierte Bewegung: Standbild und alle Kapitel als Liste (${JSON.stringify(r)})`);
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

  // 3D-Szene: je Kapitel ein Bild beim Scrollen
  console.log("\n== 3D-Scroll-Phasen");
  const PH = [["0-start", 0], ["1-plan", 1.5], ["2-korpusse", 2.75], ["3-hoehe", 3.5], ["4-arbeitsplatte", 4.35], ["4b-stoss", 5.0], ["5-fronten", 5.85], ["6-fertig", 99]];
  const TITLES = ["Ihre Küche", "Nach Plan", "Korpusse", "Arbeitshöhe", "Arbeitsplatte", "Arbeitsplatte", "Fronten", "Fertig"];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errs.push(m.text()); });
    p.on("pageerror", (e) => errs.push(String(e)));
    await p.goto("file://" + file);
    await decode(p);
    for (let i = 0; i < PH.length; i++) {
      await p.evaluate((t) => { const st = ScrollTrigger.getAll()[0]; const d = st.animation.duration(); scrollTo(0, st.start + (st.end - st.start) * Math.min(t, d) / d); }, PH[i][1]);
      await p.waitForTimeout(1200);
      const title = await p.evaluate(() => document.querySelector("[data-chapter][data-active]").textContent.trim());
      ok(title.includes(TITLES[i]), `${w} Kapitel ${PH[i][0]} sichtbar („${title.slice(0, 30)}…“)`);
      await p.screenshot({ path: path.join(shots, `hero3d-${w}-${PH[i][0]}.png`) });
    }
    const over = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(over <= w, `${w} 3D-Szene ohne horizontalen Überlauf (${over})`);
    // Kapitel-Knopf springt
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
    await p.click('[data-goto-chapter="4"]'); await p.waitForTimeout(1200);
    const t4 = await p.evaluate(() => document.querySelector("[data-chapter][data-active]").textContent);
    ok(/Arbeitsplatte einbauen/.test(t4), `${w} Kapitel-Knopf 4 springt zur Arbeitsplatte`);
    // Optik-Wahl löst Umfärben aus (SVG-Fallback und 3D-Ereignis)
    const ev = await p.evaluate(() => new Promise((res) => { addEventListener("kmn:optik", (e) => res(e.detail), { once: true }); document.querySelector('[data-optik="eiche"]').click(); }));
    ok(ev === "eiche", `${w} Optik-Wahl färbt die 3D-Arbeitsplatte (${ev})`);
    if (w === 1440) {
      await p.evaluate(() => { const st = ScrollTrigger.getAll()[0]; scrollTo(0, st.start + (st.end - st.start) * 4.9 / st.animation.duration()); });
      await p.waitForTimeout(1200);
      await p.screenshot({ path: path.join(shots, "hero3d-1440-4c-eiche.png") });
    }
    ok(errs.length === 0, `${w} 3D-Szene ohne Konsolenfehler ${errs.join(" | ")}`);
    await p.close();
  }
  // Ohne WebGL: SVG-Standbild
  {
    const nb = await chromium.launch({ args: ["--disable-3d-apis", "--disable-webgl"] });
    const p = await nb.newPage({ viewport: { width: 1024, height: 800 } });
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    await p.goto("file://" + file); await p.waitForTimeout(300);
    const r = await p.evaluate(() => ({ cls: document.querySelector("[data-h3d]").className, svg: getComputedStyle(document.querySelector(".h3d__fallback")).display }));
    ok(/h3d--nogl/.test(r.cls) && r.svg !== "none" && errs.length === 0, `ohne WebGL: gezeichnetes Standbild (${JSON.stringify(r)}) ${errs.join(" ")}`);
    await p.screenshot({ path: path.join(shots, "hero3d-ohne-webgl-1024.png") });
    await nb.close();
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
    ok(await p.isVisible('[data-route="impressum"] .legal__draft'), "Impressum zeigt Entwurfshinweis");
    await p.screenshot({ path: path.join(shots, "impressum-1024.png"), fullPage: true });
    await p.goto("file://" + file + "#datenschutz");
    ok(await p.isVisible("#datenschutz-title"), "Hash-Route #datenschutz");
    await p.screenshot({ path: path.join(shots, "datenschutz-1024.png"), fullPage: true });
    if (axePath) {
      await p.addScriptTag({ path: axePath });
      const v = (await p.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag22aa", "best-practice"] }))).violations.map((x) => x.id);
      ok(v.length === 0, "Datenschutz: axe ohne Verstöße " + v.join(", "));
    }
    await p.goto("file://" + file + "#start");
    await p.click('.nav a[href="#ueber-uns"]');
    await p.waitForFunction(() => Math.abs(document.getElementById("ueber-uns").getBoundingClientRect().top) < 200, null, { timeout: 5000 }).catch(() => {});
    ok(await p.evaluate(() => { const r = document.getElementById("ueber-uns").getBoundingClientRect(); return r.top < 200 && r.bottom > 0; }), "Menü „Über uns“ springt zum Abschnitt");
    await (await p.$("#ueber-uns")).screenshot({ path: path.join(shots, "ueber-uns-1024.png") });
    await p.close();
  }
  await b.close();
  console.log(`\n${fails.length ? fails.length + " Fehler" : "Alle Prüfungen bestanden."}`);
  process.exit(fails.length ? 1 : 0);
})();
