(function () {
  "use strict";
  var doc = document;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------ Entwurfshinweis: Höhe merken, damit der Hero beim Start ganz sichtbar ist */
  var draft = doc.querySelector(".draft");
  var setDraft = function () { doc.documentElement.style.setProperty("--draft-h", (draft ? draft.offsetHeight : 0) + "px"); };
  setDraft();
  addEventListener("resize", setDraft);

  /* ------------------------------------------------------------ Kopf */
  var top = doc.querySelector("[data-top]");
  var onScroll = function () { if (scrollY > 40) top.setAttribute("data-scrolled", ""); else top.removeAttribute("data-scrolled"); };
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
  var TITLE = "Kinderärztin in Grünwald – Kinderarztpraxis Dr. med. Maru Bohdansky";
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
      doc.title = (name === "impressum" ? "Impressum" : "Datenschutz") + " – Kinderarztpraxis Dr. med. Maru Bohdansky";
    } else {
      doc.title = TITLE;
      if (lastRoute !== "home") {
        if (hasGsap) ScrollTrigger.refresh();
        var target = h && doc.getElementById(h);
        if (target) target.scrollIntoView(); else scrollTo(0, 0);
      }
    }
    lastRoute = name;
  }
  addEventListener("hashchange", route);
  route();

  /* ------------------------------------------------------------ Rundgang */
  var tour = doc.querySelector("[data-tour]");
  var vp = tour.querySelector("[data-tour-viewport]");
  var track = tour.querySelector("[data-tour-track]");
  var rooms = [].slice.call(track.children);
  var prev = tour.querySelector("[data-tour-prev]"), next = tour.querySelector("[data-tour-next]");
  var tourST = null;
  function tourIndex() {
    if (tourST) return Math.round(tourST.progress * (rooms.length - 1));
    var c = vp.scrollLeft + vp.clientWidth / 2, best = 0, bd = 1e9;
    rooms.forEach(function (r, i) { var d = Math.abs(r.offsetLeft + r.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function setTourUI(p) {
    tour.style.setProperty("--tp", p.toFixed(4));
    var i = tourIndex();
    prev.disabled = i <= 0;
    next.disabled = i >= rooms.length - 1;
  }
  function goRoom(i) {
    i = Math.max(0, Math.min(rooms.length - 1, i));
    if (tourST) {
      scrollTo({ top: Math.round(tourST.start + (tourST.end - tourST.start) * (i / (rooms.length - 1))) + 1, behavior: reduce ? "auto" : "smooth" });
    } else {
      var r = rooms[i];
      vp.scrollTo({ left: r.offsetLeft + r.offsetWidth / 2 - vp.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
    }
  }
  prev.addEventListener("click", function () { goRoom(tourIndex() - 1); });
  next.addEventListener("click", function () { goRoom(tourIndex() + 1); });
  vp.addEventListener("scroll", function () {
    if (tourST) return;
    var max = vp.scrollWidth - vp.clientWidth;
    setTourUI(max > 0 ? vp.scrollLeft / max : 0);
  }, { passive: true });
  setTourUI(0);

  if (hasGsap && !reduce) {
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      tour.classList.add("tour--pinned");
      var dist = function () { return Math.max(0, track.scrollWidth - vp.clientWidth); };
      var tw = gsap.to(track, { x: function () { return -dist(); }, ease: "none" });
      tourST = ScrollTrigger.create({
        trigger: tour, start: function () { return "top " + (parseFloat(getComputedStyle(doc.documentElement).getPropertyValue("--top-h")) || 72) + "px"; },
        end: function () { return "+=" + dist(); }, pin: tour.querySelector("[data-tour-pin]"), scrub: 0.5, animation: tw,
        invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { setTourUI(self.progress); },
      });
      // Bilder im Rundgang leicht gegenläufig (Tiefe)
      rooms.forEach(function (r) {
        var img = r.querySelector("img");
        gsap.fromTo(img, { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: r, containerAnimation: tw, start: "left right", end: "right left", scrub: true } });
      });
      setTourUI(0);
      return function () { tour.classList.remove("tour--pinned"); tourST = null; gsap.set(track, { x: 0 }); setTourUI(0); };
    });
  }

  /* ------------------------------------------------------------ Fotos mit weichen Masken: Reveal beim Scrollen */
  if (hasGsap && !reduce) {
    doc.querySelectorAll(".mask[data-reveal]").forEach(function (el) {
      gsap.fromTo(el, { "--ci": "12%", "--cs": 1.2 }, {
        "--ci": "0%", "--cs": 1, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 95%", end: "top 40%", scrub: 0.6 },
      });
    });

    /* Schwerpunkte: Kacheln steigen gestaffelt auf, Piktogramme zeichnen sich */
    var tiles = doc.querySelectorAll("[data-tile]");
    tiles.forEach(function (t) { t.querySelectorAll(".draw").forEach(function (p) { p.setAttribute("pathLength", "1"); }); });
    gsap.set(tiles, { "--dash": 1, "--tb": 0.2 });
    ScrollTrigger.batch(tiles, {
      start: "top 85%", once: true,
      onEnter: function (els) {
        gsap.fromTo(els, { y: 70, rotation: function (i) { return [-2.5, 1.5, -1][i % 3]; } }, { y: 0, rotation: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 });
        gsap.to(els, { "--dash": 0, duration: 1.6, ease: "power2.inOut", stagger: 0.15, delay: 0.15 });
        gsap.to(els, { "--tb": 1, duration: 1.4, ease: "expo.out", stagger: 0.12 });
      },
    });
  }

  /* ------------------------------------------------------------ Team-Karten mit leichtem 3D-Tilt */
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    doc.querySelectorAll("[data-tilt]").forEach(function (card) {
      var inner = card.querySelector(".person__in");
      card.addEventListener("pointermove", function (e) {
        var r = inner.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.setAttribute("data-tilting", "");
        inner.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
        inner.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
        inner.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
        inner.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
        inner.style.setProperty("--go", "1");
      });
      card.addEventListener("pointerleave", function () {
        card.removeAttribute("data-tilting");
        ["--rx", "--ry"].forEach(function (k) { inner.style.setProperty(k, "0deg"); });
        inner.style.setProperty("--go", "0");
      });
    });
  }

  /* ------------------------------------------------------------ Nach dem Laden der Schriften neu messen */
  if (hasGsap) {
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
})();
