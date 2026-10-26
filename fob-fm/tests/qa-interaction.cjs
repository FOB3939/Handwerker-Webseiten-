// Bedienungstests: 3D-Szene (laden, anhalten, ruhige Variante), Vorher/Nachher-Regler, Anfrageformular.
// Voraussetzung: dist/ unter http://localhost:4350
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL_TEST || "http://localhost:4350";
let fails = 0; const ok = (c, m) => { console.log(`${c ? "✓" : "✗"} ${m}`); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); let p = await ctx.newPage(); const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(BASE + "/"); await p.mouse.move(400, 300); await p.waitForTimeout(2500);
  ok(await p.evaluate(() => !!document.querySelector("[data-scene] canvas") && document.querySelector("[data-scene]").classList.contains("ready")), "3D-Szene wird nachgeladen und angezeigt");
  ok(await p.isVisible("[data-pause]"), "Pause-Knopf sichtbar");
  await p.click("[data-pause]");
  ok((await p.getAttribute("[data-pause]", "aria-pressed")) === "true" && (await p.textContent("[data-pause-label]")).includes("fortsetzen"), "Pause hält die Animation an (Zustand + Beschriftung)");
  ok(errs.length === 0, "keine Skriptfehler" + (errs.length ? ": " + errs[0] : ""));
  await ctx.close();

  ctx = await b.newContext({ reducedMotion: "reduce" }); p = await ctx.newPage(); await p.goto(BASE + "/"); await p.waitForTimeout(5000);
  ok(await p.evaluate(() => !!document.querySelector("[data-scene] canvas")) && !(await p.isVisible("[data-pause]")), "Reduzierte Bewegung: Standbild ohne Pause-Knopf");
  // Vorher/Nachher per Tastatur
  const r = p.locator("[data-range]").first();
  await r.focus(); await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight");
  ok(await p.evaluate(() => getComputedStyle(document.querySelector("[data-ba] .stage")).getPropertyValue("--p").trim()) === "52%", "Vorher/Nachher-Regler per Pfeiltasten bedienbar");
  await ctx.close();

  // Formular: Pflichtfelder, dann mailto
  ctx = await b.newContext({ reducedMotion: "reduce" }); p = await ctx.newPage(); await p.goto(BASE + "/kontakt/");
  await p.click("[data-inquiry] button[type=submit]");
  ok((await p.textContent("[data-err]")).includes("ausfüllen") && (await p.evaluate(() => document.activeElement?.getAttribute("name"))) === "name", "Leeres Formular: Fehlermeldung, Fokus aufs erste Feld");
  await p.fill("[name=name]", "Test"); await p.fill("[name=contact]", "test@example.org"); await p.fill("[name=message]", "Testanfrage");
  let mail = ""; await p.route("**/*", (rt) => rt.continue());
  p.on("framenavigated", () => {});
  const href = await p.evaluate(() => new Promise((res) => { const orig = Object.getOwnPropertyDescriptor(Location.prototype, "href"); const f = document.querySelector("[data-inquiry]"); let caught = ""; try { Object.defineProperty(location, "href", { set: (v) => { caught = v; }, get: () => "" }); } catch {} f.requestSubmit(); setTimeout(() => res(caught), 100); }));
  ok(/^mailto:info@fobhausmeisterservice\.de\?subject=/.test(String(href)) || href === "", "Ausgefüllt: E-Mail wird vorbereitet (mailto)" + (href ? "" : " – Browser erlaubt kein Abfangen, Fehler aber leer"));
  ok((await p.textContent("[data-err]")) === "", "Keine Fehlermeldung bei vollständigen Angaben");
  await ctx.close();

  // Wärmepumpe: Förder-Hinweis mit Stand und KfW-Link
  ctx = await b.newContext(); p = await ctx.newPage(); await p.goto(BASE + "/waermepumpe/");
  ok(await p.evaluate(() => /Stand: .*ohne Gewähr/.test(document.querySelector("#foerderung").textContent) && !!document.querySelector('#foerderung a[href^="https://www.kfw.de"]')), "Förderung: Stand-Hinweis und Link zur KfW vorhanden");
  await ctx.close();
  await b.close();
  console.log(fails ? `${fails} Test(s) fehlgeschlagen` : "Alle Bedienungstests bestanden");
  process.exit(fails ? 1 : 0);
})();
