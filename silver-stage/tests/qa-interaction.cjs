// Interaktionstests: mobiles Menü, Räume-Dropdown, Formular (ohne und mit Backend – Backend wird simuliert,
// es werden keine echten Anfragen verschickt). Voraussetzung: dist/ auf :4321, dist-endpoint/ (PUBLIC_FORM_ENDPOINT=/api/anfrage) auf :4322.
const { chromium } = require("playwright");
const ok = (c, m) => console.log(`${c ? "✓" : "✗"} ${m}`);
(async () => {
  const b = await chromium.launch();
  // Mobiles Menü
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" }); const p = await ctx.newPage();
    await p.goto("http://localhost:4321/tonstudio/");
    await p.focus("[data-menu-open]"); await p.keyboard.press("Enter");
    ok(await p.isVisible("#mobile-menu"), "Menü öffnet per Tastatur");
    ok(await p.evaluate(() => document.activeElement?.hasAttribute("data-menu-close")), "Fokus springt ins Menü");
    for (let i = 0; i < 12; i++) await p.keyboard.press("Tab");
    ok(await p.evaluate(() => document.querySelector("#mobile-menu").contains(document.activeElement)), "Fokus bleibt im Menü (Tab-Falle)");
    await p.keyboard.press("Escape");
    ok(!(await p.isVisible("#mobile-menu")) && await p.evaluate(() => document.activeElement?.hasAttribute("data-menu-open")), "Escape schließt, Fokus zurück auf Menü-Knopf");
    await ctx.close(); }
  // Dropdown Räume (Desktop)
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    await p.goto("http://localhost:4321/");
    await p.evaluate(() => document.documentElement.classList.add("intro-done"));
    await p.focus(".sub-toggle"); await p.keyboard.press("Enter");
    ok(await p.getAttribute(".sub-toggle", "aria-expanded") === "true", "Räume-Untermenü öffnet per Tastatur");
    await p.keyboard.press("Tab"); ok(await p.evaluate(() => document.activeElement?.closest(".sub") !== null), "Tab führt in das Untermenü");
    await p.keyboard.press("Escape"); ok(await p.getAttribute(".sub-toggle", "aria-expanded") === "false", "Escape schließt das Untermenü");
    await ctx.close(); }
  // Formular ohne Backend
  { const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage(); 
    await p.goto("http://localhost:4321/kontakt/?raum=stageroom");
    ok(await p.inputValue("#f-interest") === "Stageroom", "Raum aus ?raum= vorausgewählt");
    await p.click("[data-submit]");
    const firstFocus = await p.evaluate(() => document.activeElement?.id);
    const errs = await p.$$eval("[data-err]", (e) => e.filter((x) => x.textContent).map((x) => x.dataset.err));
    ok(firstFocus === "f-name" && errs.includes("name") && errs.includes("email") && errs.includes("message"), `Pflichtfelder gemeldet (${errs.join(", ")}), Fokus auf erstem Fehler`);
    ok(await p.getAttribute("#f-email", "aria-invalid") === "true", "aria-invalid gesetzt");
    await p.fill("#f-name", "Test Person"); await p.fill("#f-email", "kein-at"); await p.fill("#f-message", "Wir möchten zwei Songs aufnehmen.");
    await p.click("[data-submit]");
    ok((await p.textContent("[data-err=email]")).includes("prüf"), "Ungültige E-Mail wird erklärt");
    await p.fill("#f-email", "test@example.org");
    await p.click("[data-submit]"); await p.waitForTimeout(400);
    const status = await p.textContent("[data-status]");
    ok(/erst verschickt/.test(status) && !(await p.isVisible("[data-done]")), "Ohne Backend: keine Erfolgsmeldung, klarer Hinweis aufs E-Mail-Programm" + (/erst verschickt/.test(status) ? "" : ` [Status: ${status}]`));
    ok(await p.inputValue("#f-name") === "Test Person", "Eingaben bleiben erhalten");
    await ctx.close(); }
  // Formular mit Backend: Fehler, dann Erfolg; Doppel-Absenden
  { const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage(); let calls = 0, mode = 500;
    await p.route("**/api/anfrage", async (r) => { calls++; await new Promise((x) => setTimeout(x, 400)); r.fulfill({ status: mode, body: "{}" }); });
    await p.goto("http://localhost:4322/kontakt/");
    await p.fill("#f-name", "Test Person"); await p.fill("#f-email", "test@example.org"); await p.selectOption("#f-interest", "Tonstudio"); await p.fill("#f-message", "Wir möchten zwei Songs aufnehmen.");
    // zweimal schnell hintereinander absenden (wie ein Doppelklick)
    await p.evaluate(() => { const f = document.querySelector("[data-inquiry]"); f.requestSubmit(); f.requestSubmit(); });
    await p.waitForTimeout(900);
    ok(calls === 1, `Doppeltes Absenden verhindert (${calls} Anfrage)`);
    const st = await p.textContent("[data-status]");
    ok(st.includes("nicht geklappt") && !(await p.isVisible("[data-done]")), "Serverfehler: Fehlermeldung, kein Erfolg" + (st.includes("nicht geklappt") ? "" : ` [Status: ${st}]`));
    ok(await p.inputValue("#f-message") !== "", "Eingaben nach Fehler erhalten");
    mode = 200; await p.click("[data-submit]"); await p.waitForTimeout(700);
    ok(await p.isVisible("[data-done]") && await p.evaluate(() => document.activeElement?.hasAttribute("data-done")), "Erfolg erst nach Server-OK, Fokus auf Bestätigung");
    await ctx.close(); }
  // Startseite: Line-up wählt den Raum (Druckplatte, Überblick), Pfeiltasten wandern
  { const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } }); const p = await ctx.newPage();
    await ctx.addInitScript(() => { try { sessionStorage.setItem("ss-intro-seen", "1"); } catch {} });
    await p.goto("http://localhost:4321/");
    await p.click('[data-ch="lightroom"]');
    ok(await p.getAttribute('[data-ch="lightroom"]', "aria-pressed") === "true" && await p.getAttribute('[data-ch="stageroom"]', "aria-pressed") === "false", "Line-up: Lightroom gewählt (aria-pressed)");
    ok(await p.getAttribute("[data-programm]", "data-room") === "lightroom" && await p.isVisible('[data-prog="lightroom"]') && !(await p.isVisible('[data-prog="stageroom"]')), "Überblick zeigt den gewählten Raum");
    ok(await p.isVisible('[data-shot="lightroom"]') && await p.isVisible('[data-out="lightroom"]'), "Druckplatte und Bildzeile wechseln");
    await p.focus('[data-ch="lightroom"]'); await p.keyboard.press("ArrowLeft");
    ok(await p.evaluate(() => document.activeElement?.dataset.ch === "stageroom"), "Pfeiltasten wandern zwischen den Räumen");
    await ctx.close(); }
  // Markenintro: einmal pro Sitzung, überspringbar
  { const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } }); const p = await ctx.newPage();
    await p.goto("http://localhost:4321/");
    ok(await p.isVisible("[data-intro]"), "Intro läuft beim ersten Besuch");
    await p.click("[data-intro-skip]");
    ok(!(await p.isVisible("[data-intro]")), "Intro lässt sich überspringen");
    await p.goto("http://localhost:4321/");
    ok(!(await p.isVisible("[data-intro]")), "Intro läuft nur einmal pro Sitzung");
    await ctx.close(); }
  await b.close();
})();
