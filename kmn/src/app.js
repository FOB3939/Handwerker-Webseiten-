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
  }
  swatches.forEach(function (b) { b.addEventListener("click", function () { setOptik(b.getAttribute("data-optik")); }); });
  setOptik("schiefer");

  /* ------------------------------------------------------------ Hero: Küche entsteht */
  var stage = doc.querySelector("[data-stage]");
  var playBtn = stage.querySelector("[data-play]");
  var railBtns = Array.prototype.slice.call(stage.querySelectorAll("[data-seek]"));
  var stepNum = stage.querySelector("[data-step-num]"), stepLabel = stage.querySelector("[data-step-label]");
  var STEPS = [
    ["korpus", "Korpusse setzen"],
    ["fronten", "Fronten einhängen und ausrichten"],
    ["platte", "Arbeitsplatte auflegen"],
    ["geraete", "Griffe, Kochfeld und Spüle"],
    ["pruefen", "Wasserwaage und Fugen prüfen"],
    ["foto", "Fertig montiert"]
  ];

  if (!window.gsap) { stage.querySelector(".stage__bar").hidden = true; return finishInit(); }
  gsap.registerPlugin(ScrollTrigger);

  var svg = stage.querySelector(".kitchen");
  var $ = function (s) { return gsap.utils.toArray(svg.querySelectorAll(s)); };
  var card = stage.querySelector("[data-photo-card]");
  // Wasserwaage liegt in der Frontebene: +x auf dem Bildschirm = (cos30, sin30)
  var U = 10, cx = Math.cos(Math.PI / 6) * U, cy = 0.5 * U;

  var tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" }, onUpdate: syncUI, onComplete: function () { setState("done"); } });
  tl.addLabel("korpus", 0)
    .from($(".k-room"), { opacity: 0, duration: 0.5, ease: "power1.out" }, 0)
    .from($(".k-measure"), { opacity: 0, duration: 0.45, ease: "power1.out" }, 0.25)
    .from($(".k-carcass"), { y: -90, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.65)
    .addLabel("fronten", "+=0.1")
    .from($(".k-front"), { x: -24, y: 14, rotation: -4, transformOrigin: "50% 50%", opacity: 0, duration: 0.6, stagger: 0.045 }, "fronten")
    .addLabel("platte", "+=0.1")
    .to($(".k-measure"), { opacity: 0, duration: 0.3, ease: "power1.out" }, "platte")
    .from($(".k-top"), { y: -120, opacity: 0, duration: 0.95, ease: "power2.inOut", stagger: 0.3 }, "platte")
    .addLabel("geraete", "+=0.05")
    .from($(".k-hd"), { scale: 0, transformOrigin: "50% 50%", duration: 0.35, stagger: 0.025, ease: "back.out(2.2)" }, "geraete")
    .from($(".k-sink"), { y: -16, opacity: 0, duration: 0.5 }, "geraete+=0.15")
    .from($(".k-cook"), { opacity: 0, duration: 0.5, ease: "power1.out" }, "geraete+=0.35")
    .addLabel("pruefen", "+=0.1")
    .from($(".k-level"), { y: -46, opacity: 0, duration: 0.6, ease: "power2.out" }, "pruefen")
    .fromTo($(".k-bubble"), { x: 1.4 * cx, y: 1.4 * cy }, {
      keyframes: [{ x: -0.7 * cx, y: -0.7 * cy, duration: 0.45, ease: "sine.inOut" }, { x: 0.3 * cx, y: 0.3 * cy, duration: 0.35, ease: "sine.inOut" }, { x: 0, y: 0, duration: 0.4, ease: "power2.out" }]
    }, "pruefen+=0.45")
    .fromTo($(".k-gap"), { opacity: 0 }, { opacity: 1, duration: 0.22, stagger: 0.06, yoyo: true, repeat: 1, ease: "none" }, ">-0.1")
    .from($(".k-checkmark"), { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 0.45, ease: "back.out(2)" }, "<0.2")
    .addLabel("foto", "+=0.35")
    .from(card, { y: 70, rotation: 9, opacity: 0, duration: 0.9 }, "foto")
    .to({}, { duration: 0.2 });

  var times = STEPS.map(function (s) { return tl.labels[s[0]]; });
  times.push(tl.duration());
  var current = -1;
  function syncUI() {
    var t = tl.time();
    var idx = 0;
    for (var i = 0; i < STEPS.length; i++) if (t >= times[i] - 0.001) idx = i;
    railBtns.forEach(function (b, i) {
      var p = Math.max(0, Math.min(1, (t - times[i]) / (times[i + 1] - times[i])));
      b.style.setProperty("--p", p.toFixed(3));
    });
    if (idx !== current) {
      current = idx;
      stepNum.textContent = String(idx + 1);
      stepLabel.textContent = STEPS[idx][1];
      railBtns.forEach(function (b, i) { if (i === idx) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    }
  }

  var state = "playing", userPaused = false, inView = false;
  function setState(s) {
    state = s;
    playBtn.setAttribute("data-state", s);
    playBtn.setAttribute("aria-label", s === "playing" ? "Animation pausieren" : s === "paused" ? "Animation fortsetzen" : "Aufbau erneut abspielen");
  }
  playBtn.addEventListener("click", function () {
    if (state === "playing") { userPaused = true; tl.pause(); setState("paused"); }
    else if (state === "paused") { userPaused = false; tl.play(); setState("playing"); }
    else { userPaused = false; tl.restart(); setState("playing"); }
  });
  railBtns.forEach(function (b, i) {
    b.addEventListener("click", function () {
      if (reduce.matches || userPaused) {
        // Ohne Bewegung: das fertige Bild dieses Schritts zeigen.
        tl.pause().seek(i === STEPS.length - 1 ? tl.duration() : Math.max(0, times[i + 1] - 0.03));
        setState(i === STEPS.length - 1 ? "done" : "paused");
        userPaused = i !== STEPS.length - 1;
      } else {
        tl.seek(STEPS[i][0]).play();
        setState("playing");
      }
      syncUI();
    });
  });

  function applyMotionPref() {
    if (reduce.matches) {
      tl.progress(1).pause();
      setState("done");
      syncUI();
    } else if (inView && !userPaused && state !== "done") {
      tl.play(); setState("playing");
    }
  }
  if (reduce.addEventListener) reduce.addEventListener("change", applyMotionPref);

  ScrollTrigger.create({
    trigger: stage, start: "top 85%", end: "bottom 12%",
    onToggle: function (self) {
      inView = self.isActive;
      if (reduce.matches) return;
      if (inView && !userPaused && state !== "done") { tl.play(); setState("playing"); }
      else if (!inView && state === "playing") { tl.pause(); }
    }
  });
  setState("playing");
  syncUI();
  applyMotionPref();
  finishInit();

  function finishInit() { initForm(); }

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
