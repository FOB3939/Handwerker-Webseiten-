(function () {
  "use strict";
  var doc = document;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------ Kopf */
  var top = doc.querySelector("[data-top]");
  var onScroll = function () { if (scrollY > 8) top.setAttribute("data-scrolled", ""); else top.removeAttribute("data-scrolled"); };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = doc.querySelector(".menu-btn");
  var menu = doc.getElementById("menu");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    if (open) menu.setAttribute("data-open", ""); else menu.removeAttribute("data-open");
  }
  menuBtn.addEventListener("click", function () {
    var open = menuBtn.getAttribute("aria-expanded") !== "true";
    setMenu(open);
    if (open) menu.querySelector("a").focus();
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); }
  });

  /* ------------------------------------------------------------ Hash-Routen (Impressum, Datenschutz) */
  var routes = doc.querySelectorAll("[data-route]");
  var lastRoute = "home";
  function route() {
    var h = location.hash.slice(1);
    var name = (h === "impressum" || h === "datenschutz") ? h : "home";
    routes.forEach(function (r) { r.hidden = r.getAttribute("data-route") !== name; });
    if (name !== "home") {
      scrollTo(0, 0);
      var t = doc.querySelector('[data-route="' + name + '"] h1');
      if (t) t.focus();
      doc.title = (name === "impressum" ? "Impressum" : "Datenschutz") + " – K.M.N Küchenmontage";
    } else {
      doc.title = "K.M.N Küchenmontage – Küchenmontage in München";
      if (lastRoute !== "home") {
        var target = h && doc.getElementById(h);
        if (target) target.scrollIntoView(); else scrollTo(0, 0);
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }
    }
    lastRoute = name;
  }
  addEventListener("hashchange", route);
  route();

  /* ------------------------------------------------------------ Arbeitsplatten-Optik */
  var OPT = JSON.parse(doc.getElementById("optiken").textContent);
  var tops = doc.querySelectorAll(".js-wt-top"), edges = doc.querySelectorAll(".js-wt-edge"), sides = doc.querySelectorAll(".js-wt-side");
  var swatches = doc.querySelectorAll("[data-optik]");
  var nameEl = doc.querySelector("[data-optik-name]"), descEl = doc.querySelector("[data-optik-desc]");
  function setOptik(id) {
    var o = OPT.filter(function (x) { return x.id === id; })[0];
    if (!o) return;
    tops.forEach(function (el) { el.style.fill = "url(#pt-" + o.id + ")"; });
    edges.forEach(function (el) { el.style.fill = o.edge; });
    sides.forEach(function (el) { el.style.fill = o.side; });
    swatches.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-optik") === id)); });
    nameEl.textContent = o.name;
    descEl.textContent = o.desc;
    window.dispatchEvent(new CustomEvent("kmn:optik", { detail: o.id }));
  }
  swatches.forEach(function (b) { b.addEventListener("click", function () { setOptik(b.getAttribute("data-optik")); }); });
  setOptik("schiefer");

  initForm();

  /* ------------------------------------------------------------ Formular */
  function initForm() {
    var form = doc.getElementById("anfrage-formular");
    var steps = form.querySelectorAll("[data-step]");
    var count = form.querySelector("[data-count]");
    var bars = form.querySelectorAll("[data-goto]");
    var status = form.querySelector("[data-status]");
    var cur = 0;
    form.querySelector('[name="startedAt"]').value = String(Date.now());

    function show(i, focus) {
      cur = i;
      steps.forEach(function (el, n) { el.hidden = n !== i; });
      count.textContent = "Schritt " + (i + 1) + " von " + steps.length;
      bars.forEach(function (b, n) {
        if (n === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
        if (n < i) b.setAttribute("data-done", ""); else b.removeAttribute("data-done");
        b.disabled = n >= i;
      });
      if (focus) {
        var h = steps[i].querySelector(".step__t");
        if (h) h.focus({ preventScroll: true });
        if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ block: "start" });
      }
    }
    function clear(scope) {
      scope.querySelectorAll(".err").forEach(function (e) { e.remove(); });
      scope.querySelectorAll("[aria-invalid]").forEach(function (e) {
        e.removeAttribute("aria-invalid");
        var d = (e.getAttribute("aria-describedby") || "").split(" ").filter(function (x) { return x && x.indexOf("err-") !== 0; }).join(" ");
        if (d) e.setAttribute("aria-describedby", d); else e.removeAttribute("aria-describedby");
      });
    }
    function fail(el, msg) {
      var id = "err-" + el.id;
      var p = doc.createElement("p");
      p.className = "err"; p.id = id; p.textContent = msg;
      el.closest(".field").appendChild(p);
      el.setAttribute("aria-invalid", "true");
      el.setAttribute("aria-describedby", ((el.getAttribute("aria-describedby") || "") + " " + id).trim());
      return el;
    }
    var val = function (id) { return form.querySelector("#" + id).value.trim(); };
    function check(i) {
      var scope = steps[i];
      clear(scope);
      var bad = [];
      if (i === 0 && !form.querySelector('input[name="anliegen"]:checked')) {
        var p = doc.createElement("p"); p.className = "err"; p.id = "err-anliegen"; p.textContent = "Bitte wählen Sie aus, worum es geht.";
        scope.querySelector(".choices").after(p);
        var first = scope.querySelector('input[name="anliegen"]');
        first.setAttribute("aria-invalid", "true");
        first.setAttribute("aria-describedby", "err-anliegen");
        bad.push(first);
      }
      if (i === 1) {
        if (val("nachricht").length < 10) bad.push(fail(form.querySelector("#nachricht"), "Bitte beschreiben Sie Ihr Vorhaben in ein paar Worten (mind. 10 Zeichen)."));
        if (val("plz") && !/^\d{5}$/.test(val("plz"))) bad.push(fail(form.querySelector("#plz"), "Die Postleitzahl hat fünf Ziffern."));
      }
      if (i === 2) {
        if (val("name").length < 2) bad.push(fail(form.querySelector("#name"), "Bitte geben Sie Ihren Namen an."));
        if (!val("email") && !val("telefon")) bad.push(fail(form.querySelector("#telefon"), "Bitte geben Sie eine E-Mail-Adresse oder eine Rückrufnummer an."));
        else if (val("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) bad.push(fail(form.querySelector("#email"), "Bitte prüfen Sie die E-Mail-Adresse, zum Beispiel name@beispiel.de."));
      }
      if (bad[0]) bad[0].focus();
      return bad.length === 0;
    }
    form.querySelectorAll("[data-next]").forEach(function (b) { b.addEventListener("click", function () { if (check(cur)) show(cur + 1, true); }); });
    form.querySelectorAll("[data-back]").forEach(function (b) { b.addEventListener("click", function () { show(cur - 1, true); }); });
    bars.forEach(function (b, n) { b.addEventListener("click", function () { if (n < cur) show(n, true); }); });
    form.querySelectorAll('input[name="anliegen"]').forEach(function (input) {
      input.addEventListener("change", function () { clear(steps[0]); });
      input.closest("label").addEventListener("click", function (e) {
        if (e.detail === 0) return; // Tastatur: kein automatisches Weiter
        setTimeout(function () { if (cur === 0) show(1, true); }, 180);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!check(2)) return;
      if (val("website")) return; // Honigtopf
      status.hidden = false;
      status.textContent = "Vorschau: Ihre Angaben sind vollständig. In dieser Vorschau wird nichts gesendet. Auf der fertigen Website geht die Anfrage per E-Mail an K.M.N, sobald der Versand eingerichtet ist.";
      status.focus();
      status.scrollIntoView({ block: "center" });
    });
    // Links mit Vorbelegung des Anliegens
    doc.querySelectorAll("[data-anliegen]").forEach(function (a) {
      a.addEventListener("click", function () {
        var input = form.querySelector('input[name="anliegen"][value="' + a.getAttribute("data-anliegen") + '"]');
        if (input) { input.checked = true; clear(steps[0]); show(0, false); }
      });
    });
    show(0, false);
  }
})();
