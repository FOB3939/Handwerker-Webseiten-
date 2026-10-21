/* Mitmach-Spiel je Gewerk: baut sich in jedes <section data-trade-game="…"> ein.
   Zwei Mechaniken: "wipe" (Fläche freiwischen: streichen, mähen, fegen) und "place" (Teile antippen/überwischen: Fliesen, Dielen, Platten, Ziegel, Stromkreise).
   Farben kommen aus den Theme-Variablen der Seite (--accent, --ink, --surface …). Ohne Abhängigkeiten. */
(function () {
  var roots = document.querySelectorAll("[data-trade-game]");
  if (!roots.length) return;
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CSS = [
    ".tg-sec{max-width:76rem;margin:0 auto;padding:5rem 1rem}",
    "@media(min-width:640px){.tg-sec{padding:6rem 1.5rem}}",
    ".tg{display:grid;gap:2.5rem;align-items:center}",
    "@media(min-width:1024px){.tg{grid-template-columns:5fr 7fr;gap:4rem}}",
    ".tg-kicker{display:inline-flex;align-items:center;gap:.6rem;font-weight:700;font-size:.875rem;color:rgb(var(--accent-text,var(--accent)))}",
    ".tg-kicker:before{content:'';width:2rem;height:2px;background:currentColor}",
    ".tg-title{font-family:var(--font-display);font-weight:700;font-size:clamp(1.9rem,4.2vw,3rem);line-height:1.05;margin:.9rem 0 0;color:rgb(var(--ink));text-wrap:balance}",
    ".tg-sub{margin:1rem 0 0;color:rgb(var(--muted));font-size:1.05rem;line-height:1.6;max-width:32rem}",
    ".tg-sw{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.5rem}",
    ".tg-sw button{display:inline-flex;align-items:center;gap:.5rem;min-height:44px;padding:.4rem .85rem .4rem .45rem;border-radius:999px;border:1px solid rgb(var(--line));background:rgb(var(--surface));color:rgb(var(--ink));font-family:inherit;font-weight:600;font-size:.85rem;line-height:1;cursor:pointer;transition:border-color .2s,transform .2s}",
    ".tg-sw button:hover{transform:translateY(-1px)}",
    ".tg-sw button[aria-pressed=true]{border-color:rgb(var(--accent));box-shadow:0 0 0 3px rgb(var(--accent)/.18)}",
    ".tg-sw i{width:1.35rem;height:1.35rem;border-radius:50%;box-shadow:inset 0 0 0 1px rgb(0 0 0/.15)}",
    ".tg-meter{margin-top:1.75rem}",
    ".tg-bar{height:.6rem;border-radius:999px;background:rgb(var(--line));overflow:hidden}",
    ".tg-bar i{display:block;height:100%;width:0;border-radius:inherit;background:rgb(var(--accent));transition:width .35s cubic-bezier(.2,.7,.2,1)}",
    ".tg-pct{display:flex;justify-content:space-between;margin-top:.55rem;font-size:.875rem;color:rgb(var(--muted));font-variant-numeric:tabular-nums}",
    ".tg-pct b{color:rgb(var(--ink))}",
    ".tg-act{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.25rem}",
    ".tg-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.8rem 1.2rem;border-radius:var(--radius,.5rem);font-family:inherit;font-weight:700;font-size:.95rem;line-height:1;cursor:pointer;text-decoration:none;border:1px solid rgb(var(--ink)/.18);background:transparent;color:rgb(var(--ink));transition:background .2s,transform .2s}",
    ".tg-btn:hover{background:rgb(var(--ink)/.05)}",
    ".tg-btn.pri{background:rgb(var(--accent));border-color:rgb(var(--accent));color:rgb(var(--accent-ink))}",
    ".tg-btn.pri:hover{filter:brightness(1.08);background:rgb(var(--accent))}",
    ".tg-btn:focus-visible,.tg-slot:focus-visible,.tg-sw button:focus-visible{outline:2px solid rgb(var(--accent));outline-offset:2px}",
    ".tg-done{margin-top:1.5rem;padding:1.1rem 1.2rem;border-radius:var(--radius,.5rem);background:rgb(var(--accent)/.1);border:1px solid rgb(var(--accent)/.35)}",
    ".tg-done p{margin:0 0 .9rem;font-weight:700;color:rgb(var(--ink));line-height:1.45}",
    ".tg-done[hidden]{display:none}",
    ".tg-done:not([hidden]){animation:tg-in .5s cubic-bezier(.34,1.56,.64,1)}",
    "@keyframes tg-in{from{opacity:0;transform:translateY(10px) scale(.97)}}",
    ".tg-stage{position:relative;aspect-ratio:4/3;border-radius:var(--radius,.75rem);overflow:hidden;box-shadow:0 30px 60px -30px rgb(0 0 0/.45),0 0 0 1px rgb(var(--line));touch-action:none;user-select:none;-webkit-user-select:none;background:#ddd;cursor:crosshair}",
    ".tg-stage canvas{position:absolute;inset:0;width:100%;height:100%}",
    ".tg-top{transition:opacity .9s ease}",
    ".tg-tool{position:absolute;left:0;top:0;width:84px;height:84px;margin:-42px 0 0 -42px;pointer-events:none;opacity:0;transition:opacity .2s;filter:drop-shadow(0 8px 10px rgb(0 0 0/.35));z-index:4}",
    ".tg-stage.is-hover .tg-tool,.tg-stage.is-demo .tg-tool{opacity:1}",
    ".tg-stage.is-demo .tg-tool{animation:tg-demo 3.2s ease-in-out infinite}",
    "@keyframes tg-demo{0%,100%{left:20%;top:32%}25%{left:78%;top:36%}50%{left:24%;top:60%}75%{left:80%;top:66%}}",
    ".tg-hint{position:absolute;left:50%;bottom:1rem;transform:translateX(-50%);z-index:5;padding:.5rem .9rem;border-radius:999px;background:rgb(0 0 0/.62);color:#fff;font-family:inherit;font-weight:600;font-size:.8rem;line-height:1.2;white-space:nowrap;pointer-events:none;transition:opacity .3s;backdrop-filter:blur(6px)}",
    ".tg-stage.is-busy .tg-hint{opacity:0}",
    ".tg-slot{position:absolute;padding:0;border:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}",
    ".tg-slot:before{content:'';position:absolute;inset:3px;border:1.5px dashed rgb(255 255 255/.55);border-radius:3px;transition:opacity .2s}",
    ".tg-slot:hover:before{border-color:#fff;background:rgb(255 255 255/.12)}",
    ".tg-slot>i{position:absolute;inset:2px;border-radius:2px;transform:scale(.4) rotate(-14deg);opacity:0}",
    ".tg-slot.on:before{opacity:0}",
    ".tg-slot.on>i{opacity:1;transform:none;transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .2s}",
    ".tg-burst{position:absolute;left:50%;top:50%;width:10px;height:10px;border-radius:2px;pointer-events:none;z-index:6;animation:tg-burst 1s cubic-bezier(.2,.7,.2,1) forwards}",
    "@keyframes tg-burst{to{transform:translate(var(--x),var(--y)) rotate(var(--r));opacity:0}}",
    ".tg-room{position:absolute;padding:0;border:2px solid #0f1724;background:#1a2433;cursor:pointer;color:#8b97a8;font-family:inherit;font-weight:700;font-size:.78rem;line-height:1.1;display:flex;align-items:flex-end;justify-content:flex-start;transition:background .5s,color .5s}",
    ".tg-room span{position:relative;z-index:1;margin:.5rem .6rem}",
    ".tg-room:after{content:'';position:absolute;left:50%;top:42%;width:14px;height:14px;margin:-7px;border-radius:50%;background:#3a4556;transition:all .5s}",
    ".tg-room.on{background:radial-gradient(circle at 50% 42%,#fff5cf 0,#ffd979 22%,#f4c35a 45%,#c99a3e 100%);color:#3b2a06}",
    ".tg-room.on:after{background:#fffbea;box-shadow:0 0 18px 8px rgb(255 236 170/.9)}",
    ".tg-wires{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}",
    ".tg-wires path{fill:none;stroke:rgb(var(--accent));stroke-width:.9;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .6s ease-out}",
    ".tg-wires path.on{stroke-dashoffset:0}",
    ".tg-water .tg-room{background:#eef2f5;border-color:#c3ced8;color:#4a5866}",
    ".tg-water .tg-room:after{width:16px;height:16px;margin:-8px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#b3c0cc}",
    ".tg-water .tg-room.on{background:linear-gradient(180deg,#f2f9ff 0,#c9e7fb 55%,#86c6ef 100%);color:#0b3a5c}",
    ".tg-water .tg-room.on:after{background:#2d8fd6;box-shadow:0 0 14px 5px rgb(45 143 214/.5)}",
    ".tg-water .tg-wires path{stroke:#2d8fd6;stroke-width:1.5}",
    ".tg-water .tg-fuse{background:#2d8fd6;color:#fff;border-color:#c3ced8;font-size:.62rem;text-align:center;padding:2px}",
    ".tg-fuse{position:absolute;z-index:3;display:grid;place-items:center;border-radius:6px;background:#e8ebef;border:2px solid #0f1724;color:#0f1724;font-family:inherit;font-weight:800;font-size:.7rem;line-height:1}",
    ".tg-skim{position:absolute;inset:0;z-index:3;opacity:0;pointer-events:none;transition:opacity 1.2s ease}",
    ".tg-stage.is-done .tg-skim{opacity:1}",
    "@media(prefers-reduced-motion:reduce){.tg *,.tg-stage *{animation:none!important;transition:none!important}}"
  ].join("");
  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);

  // ---------- Texte und Werkzeuge je Gewerk ----------
  var KINDS = {
    paint: { m: "wipe", kicker: "Zum Ausprobieren", title: "Streichen Sie die Wand selbst", sub: "Fahren Sie mit Maus oder Finger über die alte Wand und wählen Sie Ihren Farbton.", hint: "Hier über die Wand streichen", unit: "gestrichen", done: "Frisch gestrichen. Genau so sauber arbeiten wir bei Ihnen zu Hause.", tool: "roller", brush: 0.12,
      swatches: [["Ihr Farbton", "accent"], ["Reinweiß", "#f4f2ec"], ["Salbei", "#a9b8a0"], ["Taubenblau", "#8fa3b8"], ["Sand", "#d8c6a5"]] },
    lawn: { m: "wipe", kicker: "Zum Ausprobieren", title: "Mähen Sie den Rasen", sub: "Schieben Sie den Mäher über die Wiese, bis alles gepflegt ist.", hint: "Mäher über die Wiese ziehen", unit: "gemäht", done: "Sauber gemäht. Den Rest übernehmen wir, regelmäßig und zuverlässig.", tool: "mower", brush: 0.14 },
    sweep: { m: "wipe", kicker: "Zum Ausprobieren", title: "Fegen Sie den Weg frei", sub: "Wischen Sie das Laub mit dem Besen vom Gehweg.", hint: "Laub wegfegen", unit: "gefegt", done: "Weg frei. So gepflegt halten wir Ihr Haus das ganze Jahr.", tool: "broom", brush: 0.13 },
    tiles: { m: "place", kicker: "Zum Ausprobieren", title: "Verlegen Sie die Fliesen", sub: "Tippen Sie die Felder an oder wischen Sie darüber. Den Farbton wählen Sie selbst.", hint: "Felder antippen oder überwischen", unit: "verlegt", done: "Sauber verlegt, Fuge für Fuge. So wird auch Ihr Bad.",
      swatches: [["Anthrazit", "#4a4d52"], ["Weiß matt", "#eceae4"], ["Salbei", "#9fb19a"], ["Ihr Farbton", "accent"]] },
    planks: { m: "place", kicker: "Zum Ausprobieren", title: "Verlegen Sie den Boden", sub: "Legen Sie Diele für Diele, ganz ohne Kniepolster.", hint: "Dielen antippen oder überwischen", unit: "verlegt", done: "Boden liegt, eben und fugenfrei. Wir verlegen auch bei Ihnen.",
      swatches: [["Eiche natur", "#c89a64"], ["Eiche hell", "#ddbf93"], ["Nussbaum", "#7a5236"]] },
    drywall: { m: "place", kicker: "Zum Ausprobieren", title: "Beplanken Sie die Wand", sub: "Setzen Sie die Platten auf das Ständerwerk. Danach wird gespachtelt.", hint: "Platten antippen oder überwischen", unit: "beplankt", done: "Wand steht und ist verspachtelt. Bereit zum Streichen." },
    bricks: { m: "place", kicker: "Zum Ausprobieren", title: "Mauern Sie die Wand", sub: "Stein auf Stein, bis die Wand steht.", hint: "Steine antippen oder überwischen", unit: "gemauert", done: "Die Mauer steht. Für Ihr Projekt mauern wir gern weiter." },
    roof: { m: "place", kicker: "Zum Ausprobieren", title: "Decken Sie das Dach", sub: "Legen Sie die Ziegel Reihe für Reihe auf die Lattung.", hint: "Ziegel antippen oder überwischen", unit: "gedeckt", done: "Dicht und sauber gedeckt. Wir kümmern uns auch um Ihr Dach.",
      swatches: [["Ziegelrot", "#a9472f"], ["Anthrazit", "#3b3f45"], ["Braun", "#6b4330"]] },
    circuit: { m: "place", kicker: "Zum Ausprobieren", title: "Schalten Sie das Licht ein", sub: "Tippen Sie die Räume an, um sie an den Sicherungskasten anzuschließen.", hint: "Räume antippen", unit: "angeschlossen", done: "Alles an, sicher installiert vom Fachbetrieb." },
    water: { m: "place", kicker: "Zum Ausprobieren", title: "Bringen Sie das Wasser ins Haus", sub: "Tippen Sie Küche, Bad und Heizung an, um sie an die Hauptleitung anzuschließen.", hint: "Räume antippen", unit: "angeschlossen", done: "Alles dicht, alles läuft. Installiert vom Fachbetrieb." }
  };

  // Werkzeug-Symbole (eigene Zeichnungen)
  var TOOLS = {
    roller: '<svg viewBox="0 0 84 84"><rect x="8" y="10" width="54" height="20" rx="8" fill="SW" stroke="#2b2b2b" stroke-width="3"/><path d="M62 20h8v20H40v12" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round"/><rect x="34" y="52" width="12" height="28" rx="4" fill="#2b2b2b"/></svg>',
    mower: '<svg viewBox="0 0 84 84"><path d="M58 8 44 40" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/><path d="M50 8h14" stroke="#2b2b2b" stroke-width="5" stroke-linecap="round"/><rect x="12" y="38" width="50" height="26" rx="9" fill="#d23b2a" stroke="#2b2b2b" stroke-width="3"/><circle cx="22" cy="68" r="8" fill="#2b2b2b"/><circle cx="54" cy="68" r="8" fill="#2b2b2b"/><rect x="20" y="44" width="22" height="7" rx="3" fill="#fff" opacity=".6"/></svg>',
    broom: '<svg viewBox="0 0 84 84"><path d="M62 6 40 46" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/><path d="M28 44l22 10-8 24c-10-2-22-8-28-16z" fill="#d9a441" stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round"/><path d="M24 58l-6 8M32 62l-6 10M40 66l-4 10" stroke="#2b2b2b" stroke-width="2"/></svg>'
  };

  function rgbVar(el, name, fb) {
    var v = getComputedStyle(el).getPropertyValue(name).trim();
    if (!v) return fb;
    var p = v.split(/[\s,]+/).map(Number);
    return p.length >= 3 && !p.some(isNaN) ? "rgb(" + p[0] + "," + p[1] + "," + p[2] + ")" : fb;
  }
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function h(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function shade(hex, f) {
    var m = hex.match(/\d+/g); var r, g, b;
    if (hex[0] === "#") { var n = parseInt(hex.slice(1), 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; } else { r = +m[0]; g = +m[1]; b = +m[2]; }
    function c(x) { return Math.max(0, Math.min(255, Math.round(f < 0 ? x * (1 + f) : x + (255 - x) * f))); }
    return "rgb(" + c(r) + "," + c(g) + "," + c(b) + ")";
  }

  Array.prototype.forEach.call(roots, function (root) {
    var kind = root.getAttribute("data-trade-game");
    var K = KINDS[kind];
    if (!K) return;
    var company = root.getAttribute("data-company") || "";
    var cta = root.getAttribute("data-cta") || "#kontakt";
    var accent = rgbVar(root, "--accent", "#c0392b");
    var seed = 0; for (var i = 0; i < company.length; i++) seed = (seed * 31 + company.charCodeAt(i)) | 0;

    root.innerHTML = "";
    var wrap = h("div", { class: "tg" });
    var copy = h("div");
    copy.appendChild(h("span", { class: "tg-kicker" }, K.kicker));
    copy.appendChild(h("h2", { class: "tg-title" }, K.title));
    copy.appendChild(h("p", { class: "tg-sub" }, K.sub));
    var sw = null, color = null;
    if (K.swatches) {
      sw = h("div", { class: "tg-sw", role: "group", "aria-label": "Farbton wählen" });
      K.swatches.forEach(function (s, idx) {
        var col = s[1] === "accent" ? accent : s[1];
        var b = h("button", { type: "button", "aria-pressed": idx === 0 ? "true" : "false" }, '<i style="background:' + col + '"></i>' + s[0]);
        b.addEventListener("click", function () { sw.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); color = col; api.recolor(); });
        sw.appendChild(b);
      });
      color = K.swatches[0][1] === "accent" ? accent : K.swatches[0][1];
      copy.appendChild(sw);
    }
    var meter = h("div", { class: "tg-meter" }, '<div class="tg-bar"><i></i></div><div class="tg-pct" aria-live="polite"><span><b>0 %</b> ' + K.unit + "</span></div>");
    copy.appendChild(meter);
    var act = h("div", { class: "tg-act" });
    var bAuto = h("button", { type: "button", class: "tg-btn" }, "Fertigstellen lassen");
    var bReset = h("button", { type: "button", class: "tg-btn" }, "Noch einmal");
    act.appendChild(bAuto); act.appendChild(bReset);
    copy.appendChild(act);
    var done = h("div", { class: "tg-done", hidden: "" }, "<p>" + K.done + "</p>");
    var doneCta = h("a", { class: "tg-btn pri", href: cta }, company ? "Angebot von " + company + " anfragen" : "Kostenloses Angebot anfragen");
    done.appendChild(doneCta);
    copy.appendChild(done);

    var stage = h("div", { class: "tg-stage", role: "application", "aria-label": K.title });
    var hint = h("div", { class: "tg-hint" }, K.hint);
    wrap.appendChild(copy); wrap.appendChild(stage);
    root.appendChild(wrap);

    var bar = meter.querySelector(".tg-bar i"), pct = meter.querySelector(".tg-pct b");
    var finished = false;
    function progress(p) {
      p = Math.max(0, Math.min(1, p));
      bar.style.width = (p * 100).toFixed(0) + "%";
      pct.textContent = Math.round(p * 100) + " %";
      if (p >= 1 && !finished) finish();
    }
    function finish() {
      finished = true;
      stage.classList.add("is-done");
      done.hidden = false;
      bAuto.disabled = true;
      if (!RM) for (var j = 0; j < 22; j++) {
        var a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 180;
        var p = h("i", { class: "tg-burst" });
        p.style.background = j % 3 ? accent : "#fff";
        p.style.setProperty("--x", Math.cos(a) * d + "px"); p.style.setProperty("--y", Math.sin(a) * d + "px"); p.style.setProperty("--r", Math.random() * 540 + "deg");
        stage.appendChild(p);
        setTimeout(function (n) { n.remove(); }.bind(null, p), 1100);
      }
    }
    function resetUi() { finished = false; stage.classList.remove("is-done", "is-busy"); done.hidden = true; bAuto.disabled = false; progress(0); }

    var api = K.m === "wipe" ? wipeGame() : placeGame();
    stage.appendChild(hint);
    bAuto.addEventListener("click", function () { stage.classList.add("is-busy"); api.auto(); });
    bReset.addEventListener("click", function () { resetUi(); api.reset(); });

    // ---------- Mechanik 1: Fläche freiwischen ----------
    function wipeGame() {
      var base = h("canvas"), top = h("canvas", { class: "tg-top" });
      var tool = h("div", { class: "tg-tool" }, TOOLS[K.tool].replace("SW", color || accent));
      stage.appendChild(base); stage.appendChild(top); stage.appendChild(tool);
      if (!RM) stage.classList.add("is-demo");
      var W = 0, H = 0, dpr = 1, last = null, down = false, raf = 0, dirty = false;
      var bctx = base.getContext("2d"), tctx = top.getContext("2d");
      var probe = document.createElement("canvas"); probe.width = 48; probe.height = 36;
      var pctx = probe.getContext("2d", { willReadFrequently: true });

      function size() {
        var r = stage.getBoundingClientRect();
        if (!r.width) return false;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = r.width; H = r.height;
        [base, top].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
        bctx.setTransform(dpr, 0, 0, dpr, 0, 0); tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }
      function paintAll() {
        var R = rng(seed || 7);
        bctx.globalCompositeOperation = "source-over"; tctx.globalCompositeOperation = "source-over";
        bctx.clearRect(0, 0, W, H); tctx.clearRect(0, 0, W, H);
        if (kind === "paint") { drawWall(bctx, color || accent, false, R); drawWall(tctx, "#c9bfae", true, rng(seed + 3)); }
        if (kind === "lawn") { drawMown(bctx, R); drawGrass(tctx, rng(seed + 5)); }
        if (kind === "sweep") { drawPaving(bctx, rng(seed + 9)); drawPaving(tctx, rng(seed + 9)); drawLeaves(tctx, rng(seed + 11)); }
        top.style.opacity = "1";
      }
      function drawWall(c, col, old, R) {
        c.fillStyle = col; c.fillRect(0, 0, W, H);
        var g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "rgba(255,255,255,.18)"); g.addColorStop(1, "rgba(0,0,0,.10)");
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        if (old) {
          for (var i = 0; i < 26; i++) { c.fillStyle = "rgba(90,70,40," + (0.05 + R() * 0.08) + ")"; c.beginPath(); c.ellipse(R() * W, R() * H * 0.85, 20 + R() * 70, 14 + R() * 50, R() * 3, 0, 7); c.fill(); }
          c.strokeStyle = "rgba(60,50,40,.45)"; c.lineWidth = 1.2;
          for (var k = 0; k < 4; k++) { var x = R() * W, y = R() * H * 0.6; c.beginPath(); c.moveTo(x, y); for (var s = 0; s < 6; s++) { x += (R() - 0.5) * 34; y += 10 + R() * 18; c.lineTo(x, y); } c.stroke(); }
          c.fillStyle = "rgba(255,255,255,.55)"; c.save(); c.translate(W * 0.68, H * 0.22); c.rotate(-0.12); c.fillRect(0, 0, W * 0.16, 14); c.restore();
        } else {
          c.strokeStyle = "rgba(0,0,0,.035)"; c.lineWidth = 2;
          for (var x2 = 0; x2 < W; x2 += 7) { c.beginPath(); c.moveTo(x2, 0); c.lineTo(x2 + 4, H); c.stroke(); }
        }
        // Steckdose und Sockelleiste bleiben gleich – die Wand wirkt dadurch echt
        c.fillStyle = "#f7f6f2"; c.fillRect(0, H * 0.9, W, H * 0.1); c.fillStyle = "rgba(0,0,0,.12)"; c.fillRect(0, H * 0.9, W, 2);
        var sx = W * 0.14, sy = H * 0.7, s2 = Math.max(26, W * 0.06);
        c.fillStyle = "#fbfbf9"; c.strokeStyle = "rgba(0,0,0,.18)"; c.lineWidth = 1.5; roundRect(c, sx, sy, s2, s2, 5); c.fill(); c.stroke();
        c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.arc(sx + s2 * 0.36, sy + s2 / 2, 2.4, 0, 7); c.arc(sx + s2 * 0.64, sy + s2 / 2, 2.4, 0, 7); c.fill();
      }
      function drawMown(c, R) {
        var band = Math.max(28, H / 9);
        for (var y = 0, i = 0; y < H; y += band, i++) { c.fillStyle = i % 2 ? "#6e9b3d" : "#7fae4b"; c.fillRect(0, y, W, band + 1); }
        for (var n = 0; n < W * H / 90; n++) { var x = R() * W, yy = R() * H; c.strokeStyle = R() > 0.5 ? "rgba(40,80,20,.28)" : "rgba(200,230,140,.22)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + (R() - 0.5) * 2, yy - 3 - R() * 3); c.stroke(); }
        c.fillStyle = "#b9b2a4"; c.fillRect(0, 0, W, H * 0.07); c.fillStyle = "rgba(0,0,0,.12)"; c.fillRect(0, H * 0.07, W, 2);
      }
      function drawGrass(c, R) {
        c.fillStyle = "#4e6e2c"; c.fillRect(0, 0, W, H);
        var greens = ["#3f6224", "#557d2f", "#6a9236", "#7aa23f", "#4a6f28", "#8fb24a"];
        for (var n = 0; n < W * H / 26; n++) {
          var x = R() * W, y = R() * H * 1.05 + 6, l = 12 + R() * 26, bend = (R() - 0.5) * 14;
          c.strokeStyle = greens[(R() * greens.length) | 0]; c.lineWidth = 1 + R() * 1.6;
          c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + bend * 0.3, y - l * 0.6, x + bend, y - l); c.stroke();
        }
        for (var f = 0; f < 18; f++) { var fx = R() * W, fy = R() * H; c.fillStyle = R() > 0.5 ? "#f2d33b" : "#ffffff"; c.beginPath(); c.arc(fx, fy, 2.5 + R() * 2, 0, 7); c.fill(); }
        c.fillStyle = "#b9b2a4"; c.fillRect(0, 0, W, H * 0.07); c.fillStyle = "rgba(0,0,0,.12)"; c.fillRect(0, H * 0.07, W, 2);
      }
      function drawPaving(c, R) {
        c.fillStyle = "#8f8a82"; c.fillRect(0, 0, W, H);
        var bw = Math.max(46, W / 9), bh = bw / 2;
        for (var y = 0, r = 0; y < H; y += bh, r++) for (var x = -((r % 2) * bw) / 2; x < W; x += bw) {
          var t = 168 + ((R() * 26) | 0); c.fillStyle = "rgb(" + t + "," + (t - 4) + "," + (t - 12) + ")"; c.fillRect(x + 2, y + 2, bw - 4, bh - 4);
          c.fillStyle = "rgba(255,255,255,.08)"; c.fillRect(x + 2, y + 2, bw - 4, 3);
        }
        c.fillStyle = "#5c7a35"; c.fillRect(0, 0, W, H * 0.06); c.fillRect(0, H * 0.94, W, H * 0.06);
      }
      function drawLeaves(c, R) {
        var cols = ["#c8641e", "#e09a2a", "#a8401f", "#d6b23a", "#8a5a2b", "#b8771f"];
        for (var n = 0; n < W * H / 520; n++) {
          var x = R() * W, y = R() * H, s = 7 + R() * 11, a = R() * 6.3;
          c.save(); c.translate(x, y); c.rotate(a);
          c.fillStyle = cols[(R() * cols.length) | 0]; c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 0.7, s, 0); c.quadraticCurveTo(0, s * 0.7, -s, 0); c.fill();
          c.strokeStyle = "rgba(60,30,10,.45)"; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-s, 0); c.lineTo(s * 1.25, 0); c.stroke();
          c.restore();
        }
      }
      function roundRect(c, x, y, w, hh, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

      function brush() { return Math.max(26, Math.min(W, H) * K.brush * 1.6); }
      function erase(a, b) {
        tctx.globalCompositeOperation = "destination-out"; tctx.strokeStyle = "#000"; tctx.globalAlpha = 1;
        tctx.lineCap = kind === "lawn" ? "butt" : "round"; tctx.lineJoin = "round"; tctx.lineWidth = brush();
        tctx.beginPath(); tctx.moveTo(a.x, a.y); tctx.lineTo(b.x + 0.01, b.y); tctx.stroke();
        dirty = true; if (!raf) raf = requestAnimationFrame(measure);
      }
      function measure() {
        raf = 0; if (!dirty) return; dirty = false;
        pctx.clearRect(0, 0, 48, 36); pctx.drawImage(top, 0, 0, 48, 36);
        var d = pctx.getImageData(0, 0, 48, 36).data, clear = 0;
        for (var i = 3; i < d.length; i += 4) if (d[i] < 90) clear++;
        var p = clear / (48 * 36) / 0.92;
        if (p >= 1 && !finished) { top.style.opacity = "0"; }
        progress(p);
      }
      function pos(e) { var r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      function moveTool(p) { tool.style.transform = "translate(" + p.x + "px," + p.y + "px)"; }
      stage.addEventListener("pointerenter", function () { stage.classList.add("is-hover"); });
      stage.addEventListener("pointerleave", function () { stage.classList.remove("is-hover"); down = false; last = null; });
      stage.addEventListener("pointerdown", function (e) {
        if (finished) return;
        down = true; stage.classList.remove("is-demo"); stage.classList.add("is-busy", "is-hover"); stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
        last = pos(e); moveTool(last); erase(last, last);
      });
      stage.addEventListener("pointermove", function (e) {
        var p = pos(e); if (!stage.classList.contains("is-demo")) moveTool(p);
        if (down && last && !finished) { erase(last, p); last = p; }
      });
      window.addEventListener("pointerup", function () { down = false; last = null; if (window.matchMedia("(hover: none)").matches) stage.classList.remove("is-hover"); });

      function auto() {
        stage.classList.remove("is-demo");
        if (RM) { tctx.clearRect(0, 0, W, H); top.style.opacity = "0"; progress(1); return; }
        var rows = Math.ceil(H / (brush() * 0.7)) + 1, t0 = performance.now(), dur = 1800, prev = null;
        stage.classList.add("is-hover");
        (function step(now) {
          var k = Math.min(1, (now - t0) / dur), f = k * rows, row = Math.floor(f), frac = f - row;
          var y = (row + 0.5) * (H / rows), x = row % 2 ? W * (1 - frac) : W * frac, p = { x: x, y: y };
          if (prev && Math.abs(prev.y - y) < 1) erase(prev, p); else erase(p, p);
          prev = p; moveTool(p);
          if (k < 1 && !finished) requestAnimationFrame(step); else { tctx.clearRect(0, 0, W, H); measure(); progress(1); top.style.opacity = "0"; stage.classList.remove("is-hover"); }
        })(t0);
      }
      function reset() { if (size()) paintAll(); if (!RM) stage.classList.add("is-demo"); }
      var ro = new ResizeObserver(function () { if (!finished && size()) { paintAll(); progress(0); } });
      ro.observe(stage);
      return {
        auto: auto, reset: reset,
        recolor: function () { tool.innerHTML = TOOLS[K.tool].replace("SW", color); if (W) { bctx.globalCompositeOperation = "source-over"; drawWall(bctx, color, false, rng(seed || 7)); } }
      };
    }

    // ---------- Mechanik 2: Teile platzieren ----------
    function placeGame() {
      var slots = [], placed = 0, R = rng(seed || 11);
      var layer = h("div", { style: "position:absolute;inset:0" });
      stage.appendChild(layer);
      stage.style.cursor = "pointer";
      var skim = null;

      function slot(x, y, w, hh, fill, label, extra) {
        var b = h("button", { type: "button", class: "tg-slot", "aria-label": label, "aria-pressed": "false" });
        b.style.cssText = "left:" + x + "%;top:" + y + "%;width:" + w + "%;height:" + hh + "%";
        var i = h("i"); if (extra) i.style.cssText = extra; i.style.backgroundColor = fill;
        b.appendChild(i); layer.appendChild(b); slots.push(b);
        b.addEventListener("click", function () { put(b); });
        return b;
      }
      function put(b) {
        if (finished || b.classList.contains("on")) return;
        b.classList.add("on"); b.setAttribute("aria-pressed", "true"); placed++;
        stage.classList.add("is-busy");
        if (kind === "circuit" || kind === "water") wire(b);
        progress(placed / slots.length);
      }

      function build() {
        layer.innerHTML = ""; slots = []; placed = 0; R = rng(seed || 11);
        if (skim) skim.remove(); skim = null;
        var c = color || accent;
        if (kind === "tiles") {
          stage.style.background = "#b9b4aa";
          // Verlegemuster je Betrieb: Quadrat, Metro im Halbverband oder Großformat
          var pattern = Math.abs(seed) % 3, look = "inset:3px;border-radius:2px;background-image:linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,0) 45%,rgba(0,0,0,.08));box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)";
          var cols = [6, 4, 3][pattern], rows = [5, 9, 3][pattern], n = 0;
          for (var r = 0; r < rows; r++) {
            var shift = pattern === 1 && r % 2 ? -0.5 : 0;
            for (var q = 0; q <= cols; q++) {
              var x0 = Math.max(0, (q + shift) / cols), x1 = Math.min(1, (q + shift + 1) / cols);
              if (x1 - x0 < 0.02) continue;
              slot(x0 * 100, r * 100 / rows, (x1 - x0) * 100, 100 / rows, shade(c, (R() - 0.5) * 0.08), "Fliese " + (++n), look);
            }
          }
        } else if (kind === "planks") {
          stage.style.background = "repeating-linear-gradient(45deg,#9a978f 0 6px,#a3a097 6px 12px)";
          var rowsP = 8, lens = [[0.32, 0.4, 0.28], [0.18, 0.42, 0.4], [0.4, 0.34, 0.26], [0.26, 0.38, 0.36]];
          for (var rp = 0; rp < rowsP; rp++) {
            var x = 0, set = lens[rp % lens.length];
            set.forEach(function (L) {
              var t = shade(c, (R() - 0.5) * 0.18);
              slot(x * 100, rp * 100 / rowsP, L * 100, 100 / rowsP, t, "Diele",
                "inset:1px;border-radius:1px;background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.07) 0 1px,transparent 1px 5px),linear-gradient(90deg,rgba(255,255,255,.12),rgba(0,0,0,.06));box-shadow:inset 0 -2px 0 rgba(0,0,0,.12)");
              x += L;
            });
          }
        } else if (kind === "drywall") {
          stage.style.background = "repeating-linear-gradient(90deg,#aeb6bd 0 12px,#d5dade 12px 14px,transparent 14px 25%),repeating-linear-gradient(170deg,#e2bd5f 0 7px,#d4a94a 7px 11px,#e8c76e 11px 16px)";
          for (var rd = 0; rd < 2; rd++) for (var qd = 0; qd < 4; qd++)
            slot(qd * 25, rd * 50, 25, 50, "#eeeeea", "Gipskartonplatte " + (rd * 4 + qd + 1),
              "inset:2px;border-radius:1px;background-image:radial-gradient(circle,rgba(0,0,0,.35) 1.5px,transparent 2px);background-size:25% 20%;background-position:center;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)");
          skim = h("div", { class: "tg-skim", style: "background:linear-gradient(135deg,#f7f6f2,#e6e3dc);display:grid;place-items:end start" }, '<span style="margin:1rem;padding:.45rem .8rem;border-radius:999px;background:rgb(0 0 0/.6);color:#fff;font-weight:600;font-size:.8rem">Verspachtelt und bereit zum Streichen</span>');
          stage.appendChild(skim);
        } else if (kind === "bricks") {
          stage.style.background = "#cfc8bb";
          var rowsB = 9, per = 6;
          for (var rb = 0; rb < rowsB; rb++) {
            var off = rb % 2 ? -0.5 : 0;
            for (var qb = 0; qb <= per; qb++) {
              var x0 = Math.max(0, (qb + off) / per), x1 = Math.min(1, (qb + off + 1) / per);
              if (x1 - x0 < 0.02) continue;
              var tb = shade("#a54a2e", (R() - 0.5) * 0.3);
              slot(x0 * 100, (rowsB - 1 - rb) * 100 / rowsB, (x1 - x0) * 100, 100 / rowsB, tb, "Ziegel",
                "inset:3px;border-radius:2px;background-image:linear-gradient(180deg,rgba(255,255,255,.14),rgba(0,0,0,.14));box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)");
            }
          }
        } else if (kind === "roof") {
          stage.style.background = "linear-gradient(#b9d3e6,#e8f0f4 78%,#cfd8cf 78%)";
          // Haus: Fassade mit Fenstern und Tür, darüber das Satteldach (Dachfläche = Spielfeld)
          layer.insertAdjacentHTML("beforeend",
            '<div style="position:absolute;left:14%;right:14%;top:52%;bottom:8%;background:#efe9df;box-shadow:inset 0 -6px 0 rgba(0,0,0,.06)"></div>' +
            '<div style="position:absolute;left:22%;top:60%;width:12%;height:14%;background:#7d9ab0;border:4px solid #fff"></div>' +
            '<div style="position:absolute;right:22%;top:60%;width:12%;height:14%;background:#7d9ab0;border:4px solid #fff"></div>' +
            '<div style="position:absolute;left:45%;top:68%;width:10%;height:24%;background:#6b4a33;border-radius:3px 3px 0 0"></div>');
          var roofEl = h("div", { style: "position:absolute;left:6%;right:6%;top:10%;height:44%;clip-path:polygon(50% 0,100% 100%,0 100%);background:repeating-linear-gradient(0deg,#8a6a48 0 3px,#c7a57a 3px 12.5%)" });
          layer.appendChild(roofEl);
          var rowsR = 8, colsR = 14;
          for (var rr = 0; rr < rowsR; rr++) {
            var yc = (rr + 0.5) / rowsR, off = rr % 2 ? 0.5 : 0;
            for (var k = -1; k <= colsR; k++) {
              var xc = (k + off + 0.5) / colsR;
              if (Math.abs(xc - 0.5) > yc / 2 + 0.02) continue; // nur Ziegel auf der Dachfläche
              var sl = slot((k + off) * 100 / colsR, rr * 100 / rowsR - 1.5, 100 / colsR, 100 / rowsR + 3, shade(c, (R() - 0.5) * 0.16), "Dachziegel",
                "inset:0 1px;border-radius:2px 2px 50% 50%/2px 2px 30% 30%;background-image:linear-gradient(180deg,rgba(255,255,255,.14),rgba(0,0,0,.18));box-shadow:0 2px 2px rgba(0,0,0,.25)");
              roofEl.appendChild(sl);
            }
          }
        } else if (kind === "circuit" || kind === "water") {
          var wet = kind === "water";
          stage.classList.toggle("tg-water", wet);
          stage.style.background = wet ? "#dfe6ec" : "#0f1724";
          stage.style.cursor = "default";
          var rooms = wet
            ? [["Küche", 22, 4, 36, 42], ["Bad", 58, 4, 38, 52], ["Heizung", 22, 46, 24, 50], ["Dusche", 46, 56, 50, 40], ["WC", 4, 46, 18, 50]]
            : [["Küche", 22, 4, 36, 42], ["Wohnen", 58, 4, 38, 52], ["Bad", 22, 46, 24, 50], ["Schlafen", 46, 56, 50, 40], ["Flur", 4, 46, 18, 50]];
          var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("class", "tg-wires"); svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none");
          layer.appendChild(svg);
          var fuse = h("div", { class: "tg-fuse", style: "left:4%;top:6%;width:14%;height:30%" }, wet ? "Haupt-<br>leitung" : "FI");
          layer.appendChild(fuse);
          rooms.forEach(function (rm, idx) {
            var b = h("button", { type: "button", class: "tg-room", "aria-label": rm[0] + " anschließen", "aria-pressed": "false" }, "<span>" + rm[0] + "</span>");
            b.style.cssText = "left:" + rm[1] + "%;top:" + rm[2] + "%;width:" + rm[3] + "%;height:" + rm[4] + "%";
            var cx = rm[1] + rm[3] / 2, cy = rm[2] + rm[4] * 0.42;
            var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
            p.setAttribute("d", "M11 21 H" + (11 + (idx + 1) * 1.6) + " V" + cy + " H" + cx);
            p.setAttribute("pathLength", "1");
            svg.appendChild(p); b._wire = p;
            b.addEventListener("click", function () { put(b); });
            layer.appendChild(b); slots.push(b);
          });
        }
      }
      function wire(b) { if (b._wire) b._wire.classList.add("on"); }

      var dragging = false;
      stage.addEventListener("pointerdown", function (e) { if (kind === "circuit" || kind === "water") return; dragging = true; stage.setPointerCapture && stage.setPointerCapture(e.pointerId); hit(e); });
      stage.addEventListener("pointermove", function (e) { if (dragging) hit(e); });
      window.addEventListener("pointerup", function () { dragging = false; });
      function hit(e) {
        var el = document.elementFromPoint(e.clientX, e.clientY);
        while (el && el !== stage && !(el.classList && el.classList.contains("tg-slot"))) el = el.parentNode;
        if (el && el !== stage) put(el);
      }
      function auto() {
        var rest = slots.filter(function (s) { return !s.classList.contains("on"); });
        if (kind === "bricks" || kind === "roof") rest.sort(function (a, b) { return parseFloat(b.style.top) - parseFloat(a.style.top); });
        if (RM) { rest.forEach(function (s) { put(s); s.classList.add("on"); }); return; }
        var gap = Math.max(18, 1400 / Math.max(1, rest.length));
        rest.forEach(function (s, i) { setTimeout(function () { put(s); s.classList.add("on"); }, i * gap); });
      }
      build();
      return {
        auto: auto, reset: build,
        recolor: function () {
          var c = color;
          slots.forEach(function (s) { var i = s.querySelector("i"); if (i) i.style.backgroundColor = shade(c, (R() - 0.5) * (kind === "planks" || kind === "roof" ? 0.18 : 0.08)); });
        }
      };
    }
  });
})();
