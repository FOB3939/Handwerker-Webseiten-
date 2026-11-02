// Prüft die gebaute Einzeldatei mit Playwright: Konsole, Netz, Überlauf, Tippflächen, axe, Tastatur,
// 3D-Szene (normal, reduzierte Bewegung, ohne WebGL), Rundgang, Hash-Routen. Legt Screenshots ab.
// Aufruf: node tests/check.cjs [html] [shots-ordner]
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const file = path.resolve(process.argv[2] || path.join(__dirname, "..", "dist", "kinderarzt-gruenwald.html"));
const shots = path.resolve(process.argv[3] || path.join(__dirname, "..", "dist", "shots"));
fs.mkdirSync(shots, { recursive: true });
let axePath;
for (const base of [path.join(__dirname, ".."), "/home/user/Handwerker-Webseiten-"]) {
  try { axePath = require.resolve("axe-core/axe.min.js", { paths: [base] }); break; } catch {}
}
const WIDTHS = [360, 390, 768, 1024, 1440];
const AXE = { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] };
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? "  ok   " : "  FEHL ") + msg); };
const decode = (p) => p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = "eager"; return i.decode().catch(() => {}); })));
function watch(p) {
  const errs = [];
  // Treiber-Hinweise der Software-GPU beim Screenshot (ReadPixels) stammen nicht von der Seite
  p.on("console", (m) => { if ((m.type() === "error" || m.type() === "warning") && !/GPU stall due to ReadPixels/.test(m.text())) errs.push(m.text()); });
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("request", (r) => { const u = r.url(); if (!u.startsWith("file:") && !u.startsWith("data:")) errs.push("Netzwerk: " + u); });
  return errs;
}
const scrollHero = (p, t) => p.evaluate((t) => { const st = __hero.st; const d = st.animation.duration(); scrollTo(0, st.start + (st.end - st.start) * Math.min(t, d) / d); }, t);
const axeRun = async (p, ctx) => {
  await p.addScriptTag({ path: axePath });
  return p.evaluate(([c, o]) => axe.run(c ? document.querySelector(c) : document, o).then((r) => r.violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`)), [ctx, AXE]);
};

(async () => {
  const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  // Ganzseiten-Screenshots mit dem Standard-Chromium (SwiftShader kachelt sehr hohe Aufnahmen fehlerhaft)
  const bFull = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
  for (const w of WIDTHS) {
    console.log(`\n== ${w}px`);
    for (const motion of ["no-preference", "reduce"]) {
      const p = await (motion === "reduce" ? bFull : b).newPage({ viewport: { width: w, height: w < 500 ? 844 : 900 }, reducedMotion: motion });
      const errs = watch(p);
      await p.goto("file://" + file);
      await decode(p);
      if (motion === "no-preference") {
        await p.waitForTimeout(700);
        const r = await p.evaluate(() => ({ cls: document.querySelector("[data-h3d]").className, pin: !!(window.__hero && __hero.st && __hero.st.pin), canvases: document.querySelectorAll("canvas").length, dpr: (() => { const c = document.querySelector("canvas"); return c ? c.width / c.getBoundingClientRect().width : 0; })() }));
        ok(/h3d--gl/.test(r.cls) && !/static/.test(r.cls) && r.pin && r.canvases === 1 && r.dpr <= 2.01, `${w} 3D-Szene: WebGL, ein Canvas, gepinnt, DPR ≤ 2 (${JSON.stringify(r)})`);
        if (axePath) { const v = await axeRun(p, "[data-h3d]"); ok(v.length === 0, `${w} axe in der gepinnten 3D-Szene ${v.join("; ")}`); }
        // Rundgang: ab 900 px gepinnt und horizontal, darunter wischbare Bildstrecke
        const tour = await p.evaluate(() => document.querySelector("[data-tour]").classList.contains("tour--pinned"));
        ok(tour === (w >= 900), `${w} Rundgang ${w >= 900 ? "horizontal gepinnt" : "als wischbare Bildstrecke"}`);
      } else {
        await p.waitForTimeout(300);
        const r = await p.evaluate(() => ({
          cls: document.querySelector("[data-h3d]").className,
          photo: getComputedStyle(document.querySelector("[data-photo]")).visibility,
          visible: [...document.querySelectorAll("[data-chapter]")].filter((c) => getComputedStyle(c).visibility === "visible" && getComputedStyle(c).opacity === "1").length,
          total: document.querySelectorAll("[data-chapter]").length,
          triggers: ScrollTrigger.getAll().length,
        }));
        ok(/h3d--static/.test(r.cls) && r.photo === "visible" && r.visible === r.total && r.triggers === 0, `${w} reduzierte Bewegung: Standbild, Foto, alle Kapitel, keine Scroll-Animation (${JSON.stringify(r)})`);
        const over = await p.evaluate(() => {
          const W = document.documentElement.clientWidth;
          const bad = [...document.querySelectorAll("body *")].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width && r.right > W + 1 && !el.closest(".skip,.h3d__skip,.tour__track,.sun--big");
          }).slice(0, 5).map((el) => el.tagName + "." + el.className);
          return { sw: document.documentElement.scrollWidth, W, bad };
        });
        ok(over.sw <= w && over.bad.length === 0, `${w} kein horizontaler Überlauf (${over.sw}px ${over.bad.join(" ")})`);
        const small = await p.evaluate(() => [...document.querySelectorAll("a[href],button,summary")]
          .filter((el) => el.offsetParent && !el.closest(".skip,.h3d__skip"))
          .map((el) => [el, el.getBoundingClientRect()]).filter(([, r]) => r.height < 44 || r.width < 24)
          .map(([el, r]) => `${el.tagName}:${el.textContent.trim().slice(0, 20)}(${Math.round(r.width)}x${Math.round(r.height)})`));
        ok(small.length === 0, `${w} Tippflächen ≥ 44 px ${small.join(", ")}`);
        if (axePath) { const v = await axeRun(p); ok(v.length === 0, `${w} axe ganze Seite ${v.join("; ")}`); }
        await p.screenshot({ path: path.join(shots, `seite-${w}.png`), fullPage: true });
        await p.screenshot({ path: path.join(shots, `start-${w}-reduziert.png`) });
      }
      ok(errs.length === 0, `${w} ${motion}: keine Konsolenfehler, keine Netzanfragen ${errs.join(" | ")}`);
      await p.close();
    }
  }

  // 3D-Scrollphasen
  console.log("\n== 3D-Scrollphasen");
  const PH = [["0-start", 0], ["1-sonne", 1.6], ["2-bauen", 2.45], ["2b-praxis", 3.15], ["3-tuer", 3.75], ["3b-foto", 4.25], ["4-ende", 99]];
  const TITLES = ["Kinderärztin in Grünwald", "Guten Morgen", "Alles an seinem Platz", "Alles an seinem Platz", "Herein in die Praxis", "Herein in die Praxis", "Herein in die Praxis"];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = watch(p);
    await p.goto("file://" + file);
    await decode(p);
    await p.waitForTimeout(600);
    for (let i = 0; i < PH.length; i++) {
      await scrollHero(p, PH[i][1]);
      await p.waitForFunction((t) => Math.abs(__hero.tl.time() - Math.min(t, __hero.tl.duration())) < 0.05, PH[i][1], { timeout: 15000 }).catch(() => {});
      await p.waitForTimeout(400);
      const title = await p.evaluate(() => document.querySelector("[data-chapter][data-active]").textContent.trim());
      ok(title.includes(TITLES[i]), `${w} Phase ${PH[i][0]}: „${title.slice(0, 28)}…“`);
      await p.screenshot({ path: path.join(shots, `hero3d-${w}-${PH[i][0]}.png`) });
    }
    const end = await p.evaluate(() => ({ on: document.querySelector("[data-photo]").hasAttribute("data-on"), r: getComputedStyle(document.querySelector("[data-photo]")).clipPath }));
    ok(end.on && /circle\(150%/.test(end.r), `${w} Übergang zum echten Foto vollständig (${end.r.slice(0, 30)})`);
    ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, `${w} 3D-Szene ohne horizontalen Überlauf`);
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForFunction(() => __hero.tl.time() < 0.02, null, { timeout: 20000 }).catch(() => {});
    await p.click('[data-goto-chapter="2"]');
    await p.waitForFunction(() => Math.abs(__hero.tl.time() - 2.6) < 0.05, null, { timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(400);
    const jump = await p.evaluate(() => ({ t: __hero.tl.time().toFixed(2), txt: document.querySelector("[data-chapter][data-active]").textContent.slice(0, 22) }));
    ok(/Alles an seinem Platz/.test(jump.txt), `${w} Kapitel-Knopf „Praxis“ springt zur Szene (${JSON.stringify(jump)})`);
    // Rendern pausiert außerhalb des Bildes
    await p.evaluate(() => document.getElementById("team").scrollIntoView()); await p.waitForTimeout(500);
    await p.waitForTimeout(800);
    const frames = await p.evaluate(() => new Promise((res) => { const a = __hero.stats.frames; setTimeout(() => res(__hero.stats.frames - a), 1000); }));
    ok(frames === 0, `${w} 3D-Szene pausiert außerhalb des Bildes (${frames} Bilder in 1 s)`);
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
    const running = await p.evaluate(() => new Promise((res) => { const a = __hero.stats.frames; setTimeout(() => res(__hero.stats.frames - a), 1000); }));
    ok(running >= 2, `${w} 3D-Szene läuft wieder, sobald sie sichtbar ist (${running} Bilder in 1 s)`);
    // Abschnitte mit Animation (ohne reduzierte Bewegung)
    for (const id of ["praxis", "schwerpunkte", "team", "kontakt"]) {
      await p.evaluate((id) => { const el = document.getElementById(id); scrollTo(0, el.getBoundingClientRect().top + scrollY - 60); }, id);
      await p.waitForTimeout(1600);
      await p.screenshot({ path: path.join(shots, `abschnitt-${id}-${w}.png`) });
    }
    if (w === 1440) {
      await p.evaluate(() => { const t = ScrollTrigger.getAll().find((s) => s.pin && s.trigger && s.trigger.id === "rundgang"); scrollTo(0, t.start + (t.end - t.start) * 0.5); });
      await p.waitForTimeout(1400);
      await p.screenshot({ path: path.join(shots, `rundgang-${w}-mitte.png`) });
      const tp = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector("[data-tour]")).getPropertyValue("--tp")));
      ok(tp > 0.3 && tp < 0.7, `${w} Rundgang bewegt sich horizontal mit dem Scrollen (${tp})`);
    } else {
      await p.evaluate(() => document.getElementById("rundgang").scrollIntoView()); await p.waitForTimeout(400);
      await p.click("[data-tour-next]"); await p.waitForTimeout(900);
      const sl = await p.evaluate(() => document.querySelector("[data-tour-viewport]").scrollLeft);
      ok(sl > 50, `${w} Rundgang: „Nächster Raum“ blättert (${sl})`);
      await p.screenshot({ path: path.join(shots, `rundgang-${w}.png`) });
    }
    ok(errs.length === 0, `${w} Scrollphasen ohne Konsolenfehler ${errs.join(" | ")}`);
    await p.close();
  }

  // Ohne WebGL: gezeichnetes Standbild
  {
    const nb = await chromium.launch({ args: ["--disable-3d-apis", "--disable-webgl"] });
    for (const w of [1024, 390]) {
      const p = await nb.newPage({ viewport: { width: w, height: 800 } });
      const errs = watch(p);
      await p.goto("file://" + file); await p.waitForTimeout(400);
      const r = await p.evaluate(() => ({ cls: document.querySelector("[data-h3d]").className, svg: getComputedStyle(document.querySelector(".h3d__fallback")).display, canvas: document.querySelectorAll("canvas").length }));
      ok(/h3d--nogl/.test(r.cls) && r.svg !== "none" && r.canvas === 0 && errs.length === 0, `ohne WebGL ${w}: gezeichnetes Standbild (${JSON.stringify(r)}) ${errs.join(" ")}`);
      await p.screenshot({ path: path.join(shots, `hero-ohne-webgl-${w}.png`) });
      await p.close();
    }
    await nb.close();
  }

  // Tastatur
  console.log("\n== Tastatur");
  {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    await p.goto("file://" + file);
    await p.keyboard.press("Tab");
    ok(await p.evaluate(() => document.activeElement.classList.contains("skip")), "Erster Tab: „Zum Inhalt springen“");
    await p.keyboard.press("Enter");
    ok(await p.evaluate(() => document.activeElement.id === "inhalt"), "Enter springt zum Inhalt");
    await p.focus(".menu-btn"); await p.keyboard.press("Enter");
    ok(await p.evaluate(() => document.querySelector(".menu-btn").getAttribute("aria-expanded") === "true" && document.activeElement.closest("#menu")), "Menü öffnet per Enter, Fokus im Menü");
    await p.keyboard.press("Escape");
    ok(await p.evaluate(() => document.querySelector(".menu-btn").getAttribute("aria-expanded") === "false" && document.activeElement.matches(".menu-btn")), "Escape schließt, Fokus zurück");
    await p.focus(".h3d__cta a");
    await p.keyboard.press("Tab");
    const nxt = await p.evaluate(() => document.activeElement.closest("[data-h3d]") ? document.activeElement.textContent.trim() : "");
    ok(nxt.length > 0, `Tab aus dem Hero-Button bleibt in der sichtbaren Bedienung (${nxt.slice(0, 30)})`);
    await p.focus(".h3d__skip");
    ok(await p.evaluate(() => getComputedStyle(document.activeElement).opacity === "1"), "„Einleitung überspringen“ wird bei Fokus sichtbar");
    await p.keyboard.press("Enter"); await p.waitForTimeout(300);
    ok(await p.evaluate(() => location.hash === "#praxis"), "„Einleitung überspringen“ führt zur Praxis");
    await p.focus(".callbtn");
    const ring = await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle + " " + s.outlineWidth; });
    ok(/solid 3px/.test(ring), "Sichtbarer Fokusring am Telefon-Button (" + ring + ")");
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
    if (axePath) { const v = await axeRun(p); ok(v.length === 0, "Datenschutz: axe " + v.join(", ")); }
    await p.goto("file://" + file + "#start");
    await p.click('.nav a[href="#team"]');
    await p.waitForTimeout(800);
    ok(await p.evaluate(() => { const r = document.getElementById("team").getBoundingClientRect(); return r.top < 200 && r.bottom > 0; }), "Menü „Team“ springt zum Abschnitt");
    const c = await p.evaluate(() => ({ tel: document.querySelectorAll('a[href="tel:+498964260405"]').length, txt: document.body.innerText }));
    ok(c.tel >= 3, `Telefon-Links auf die Praxisnummer (${c.tel})`);
    ok(!/online.{0,20}(buch|termin)|bewertung|★|beste/i.test(c.txt), "Keine Online-Buchung, Bewertungen oder Superlative im Text");
    await p.close();
  }
  await b.close();
  await bFull.close();
  console.log(`\n${fails.length ? fails.length + " Fehler" : "Alle Prüfungen bestanden."}`);
  process.exit(fails.length ? 1 : 0);
})();
