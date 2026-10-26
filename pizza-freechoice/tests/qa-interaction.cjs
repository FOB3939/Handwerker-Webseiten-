// Bedienungstests: Intro, Suche in der Speisekarte, mobiles Menü, Bestell-Leiste, Bestellseite ohne Fake-Checkout.
// Voraussetzung: dist/ unter http://localhost:4340. Aufruf: node tests/qa-interaction.cjs
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL_TEST || "http://localhost:4340";
let fails = 0;
const ok = (c, m) => { console.log(`${c ? "✓" : "✗"} ${m}`); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();

  // Intro: läuft beim ersten Besuch, Bestellweg bleibt im DOM, endet nach ≤ ~3 s, nicht erneut in der Sitzung
  let ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); let p = await ctx.newPage();
  await p.goto(BASE + "/"); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.documentElement.classList.contains("intro-play")), "Intro startet beim ersten Besuch");
  ok(await p.evaluate(() => !!document.querySelector("h1") && !!document.querySelector('a[href="/bestellen/"]')), "Einstieg und Bestellweg sind sofort im Dokument");
  await p.waitForTimeout(3200);
  ok(await p.evaluate(() => document.documentElement.classList.contains("intro-done")), "Intro endet nach rund 3 s");
  await p.goto(BASE + "/speisekarte/"); await p.goto(BASE + "/");
  ok(!(await p.evaluate(() => document.documentElement.classList.contains("intro-play"))), "Intro läuft nicht erneut in derselben Sitzung");
  await ctx.close();

  // Überspringen per Knopf und Escape
  ctx = await b.newContext(); p = await ctx.newPage(); await p.goto(BASE + "/"); await p.waitForTimeout(300);
  await p.click("[data-intro-skip]");
  ok(await p.evaluate(() => document.documentElement.classList.contains("intro-done")), "„Überspringen“ beendet das Intro");
  await ctx.close();
  ctx = await b.newContext(); p = await ctx.newPage(); await p.goto(BASE + "/"); await p.waitForTimeout(300);
  await p.keyboard.press("Escape");
  ok(await p.evaluate(() => document.documentElement.classList.contains("intro-done")), "Escape beendet das Intro");
  await ctx.close();

  // Reduzierte Bewegung: kein Intro
  ctx = await b.newContext({ reducedMotion: "reduce" }); p = await ctx.newPage(); await p.goto(BASE + "/");
  ok(!(await p.evaluate(() => document.documentElement.classList.contains("intro-play"))), "Bei reduzierter Bewegung kein Intro");
  await ctx.close();

  // Suche in der Speisekarte
  ctx = await b.newContext({ reducedMotion: "reduce" }); p = await ctx.newPage(); await p.goto(BASE + "/speisekarte/");
  const visible = () => p.evaluate(() => [...document.querySelectorAll("[data-item]")].filter((e) => !e.hidden).length);
  const all = await visible();
  await p.fill("[data-search]", "salami");
  const n = await visible();
  ok(n > 0 && n < all, `Suche „salami“ filtert (${n} von ${all})`);
  await p.fill("[data-search]", "xyzpizza");
  ok((await visible()) === 0 && (await p.isVisible("[data-none]")), "Leeres Suchergebnis wird erklärt");
  await p.click("[data-reset]");
  ok((await visible()) === all && (await p.inputValue("[data-search]")) === "", "„zeig alle Gerichte“ setzt die Suche zurück");
  ok(await p.evaluate(() => !!document.querySelector('label input[type="search"]')), "Suchfeld hat ein Label");
  await ctx.close();

  // Mobiles Menü + Bestell-Leiste
  ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" }); p = await ctx.newPage(); await p.goto(BASE + "/");
  await p.click("[data-menu-open]");
  ok(await p.isVisible("[data-mobile]") && (await p.evaluate(() => document.activeElement?.hasAttribute("data-menu-close"))), "Menü öffnet, Fokus im Dialog");
  await p.keyboard.press("Escape");
  ok(!(await p.isVisible("[data-mobile]")) && (await p.evaluate(() => document.activeElement?.hasAttribute("data-menu-open"))), "Escape schließt, Fokus zurück");
  ok(await p.isVisible(".mbar"), "Bestell-Leiste am Handy sichtbar");
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(200);
  const cover = await p.evaluate(() => { const bar = document.querySelector(".mbar").getBoundingClientRect(); const links = [...document.querySelectorAll(".site-footer a")]; const last = links[links.length - 1].getBoundingClientRect(); return last.bottom <= bar.top + 1; });
  ok(cover, "Bestell-Leiste verdeckt den Fuß nicht (letzter Link darüber)");
  await ctx.close();

  // Bestellen: kein Fake-Checkout ohne bestätigte URL
  ctx = await b.newContext({ reducedMotion: "reduce" }); p = await ctx.newPage(); await p.goto(BASE + "/bestellen/");
  ok(await p.evaluate(() => !document.querySelector("form") && !document.querySelector('a[target="_blank"][href^="http"]')), "Ohne Bestell-URL: kein Formular, kein toter Anbieter-Link");
  await ctx.close();

  await b.close();
  console.log(fails ? `${fails} Test(s) fehlgeschlagen` : "Alle Bedienungstests bestanden");
  process.exit(fails ? 1 : 0);
})();
