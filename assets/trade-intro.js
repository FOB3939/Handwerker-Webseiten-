/* Logo-Intro je Gewerk (ca. 3 s): ergänzt das vorhandene .demo-splash um eine passende Szene
   (Wasser, Strom, Holz, Farbe, Fliesen, Garten, Trockenbau, Mauerwerk, Dach, Hausmeister).
   Das Gewerk wird aus dem Intro-Untertitel („<Gewerk> in <Ort>“) gelesen. Ohne Abhängigkeiten,
   respektiert „Bewegung reduzieren“. Verlängert das Intro und verschiebt die Hero-Animationen passend. */
(function () {
  var splash = document.querySelector(".demo-splash");
  if (!splash || splash.getAttribute("data-intro-fx")) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var tag = (splash.querySelector(".demo-splash-tag") || {}).textContent || "";
  var cut = tag.lastIndexOf(" in "); if (cut > 0) tag = tag.slice(0, cut); // nur das Gewerk, nicht den Ort (z. B. „Windach“)
  var RULES = [
    [/elektr|strom|photovoltaik|solar|wallbox|blitz/i, "electric"],
    [/dach/i, "roof"],
    [/sanit|installateur|heizung|klempner|bäder|badsanierung|wasser|rohr|spengler/i, "water"],
    [/schreiner|tischler|zimmer|holz|parkett|boden|dielen|möbel|küchen/i, "wood"],
    [/maler|lackier|anstrich|tapezier/i, "paint"],
    [/fliese|naturstein|mosaik/i, "tiles"],
    [/hausmeister|objekt|reinigung|winterdienst|entrümpel/i, "keys"],
    [/garten|rasen|landschaft|grün|hecke|baum/i, "garden"],
    [/trockenbau|innenausbau|akustik|dämm|isolier/i, "drywall"],
    [/maurer|fassade|bau|pflaster|sanier|renovier/i, "bricks"],
  ];
  var kind = "drywall";
  for (var i = 0; i < RULES.length; i++) if (RULES[i][0].test(tag)) { kind = RULES[i][1]; break; }
  splash.setAttribute("data-intro-fx", kind);

  var css = [
    // Timing: Intro ~3 s, danach Hero
    ".demo-splash{animation:splash-out .6s ease-in 2.7s forwards!important}",
    ".hero-in>:first-child{animation-delay:2.85s!important}.hero-in>:nth-child(2){animation-delay:2.95s!important}.hero-in>:nth-child(3){animation-delay:3.05s!important}.hero-in>:nth-child(4){animation-delay:3.18s!important}.hero-in>:nth-child(5){animation-delay:3.3s!important}.hero-in>:nth-child(6){animation-delay:3.42s!important}.hero-in>:nth-child(7){animation-delay:3.54s!important}",
    ".hero-media{animation-delay:2.75s!important}.ink-line{animation-delay:3.4s!important}.fx2{--t0:3.15s!important}",
    ".anim [data-pop]>li{animation-delay:calc(3.15s + var(--k,0)*.09s)!important}.anim [data-pop] .svc-icon path{animation-delay:calc(3.4s + var(--k,0)*.09s + var(--i,0)*.1s)!important}",
    ".ti{position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none}.demo-splash .intro-stage{z-index:2}",
    "[data-intro-fx] .intro-half,[data-intro-fx] .intro-curtain{display:none!important}.demo-splash[data-intro-fx]{background:rgb(var(--dark))!important}",
    ".ti *{position:absolute}",
    // Wasser
    ".ti-water{left:0;right:0;bottom:0;height:0;animation:ti-rise 2.3s cubic-bezier(.3,.7,.3,1) .2s forwards}",
    "@keyframes ti-rise{to{height:46%}}",
    ".ti-wave{left:0;top:-38px;width:200%;height:40px;animation:ti-wave 2.2s linear infinite}.ti-wave.b{top:-30px;animation-duration:3.1s;animation-direction:reverse;opacity:.6}",
    "@keyframes ti-wave{to{transform:translateX(-50%)}}",
    ".ti-water-body{inset:0;background:linear-gradient(#2d8fd6cc,#14548fee)}",
    ".ti-bub{bottom:-10px;width:8px;height:8px;border-radius:50%;border:2px solid #bfe6ff;opacity:0;animation:ti-bub 2s ease-in infinite}",
    "@keyframes ti-bub{0%{transform:translateY(0);opacity:0}20%{opacity:.9}100%{transform:translateY(-38vh);opacity:0}}",
    ".ti-drop{left:50%;top:-30px;width:14px;height:20px;margin-left:-7px;background:#7cc8ff;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;animation:ti-drop .7s cubic-bezier(.6,0,1,.6) both}",
    "@keyframes ti-drop{to{transform:translateY(calc(50vh - 90px))}}",
    ".ti-ring{left:50%;top:calc(50% - 70px);width:20px;height:6px;margin-left:-10px;border:2px solid #9fd6ff;border-radius:50%;opacity:0;animation:ti-ring .8s ease-out both}",
    "@keyframes ti-ring{0%{opacity:1;transform:scale(.3)}100%{opacity:0;transform:scale(9)}}",
    // Strom
    ".ti-bolt{left:50%;top:0;width:120px;height:52vh;margin-left:-60px;filter:drop-shadow(0 0 10px #ffe36a) drop-shadow(0 0 24px #ffd21f)}",
    ".ti-bolt path{fill:none;stroke:#fff6c2;stroke-width:5;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:ti-draw .22s ease-out .35s forwards,ti-fade .5s ease-in 1.1s forwards}",
    "@keyframes ti-draw{to{stroke-dashoffset:0}}@keyframes ti-fade{to{opacity:0}}",
    ".ti-flash{inset:0;background:#fff8d6;opacity:0;animation:ti-flash .5s ease-out .55s}",
    "@keyframes ti-flash{0%{opacity:.75}100%{opacity:0}}",
    ".ti-wire{left:0;top:0;width:100%;height:100%}.ti-wire path{fill:none;stroke:rgb(var(--accent-text-dark,var(--accent)));stroke-width:.45;opacity:.55;stroke-dasharray:1;stroke-dashoffset:1;animation:ti-draw 1s ease-out .7s forwards}",
    ".ti-wire .p{stroke:#ffe36a;stroke-width:.8;opacity:1;stroke-dasharray:.06 .94;stroke-dashoffset:1;animation:ti-pulse 1.4s linear 1.3s infinite}",
    "@keyframes ti-pulse{to{stroke-dashoffset:0}}",
    "[data-intro-fx=electric] .demo-splash-mark{animation:ti-flicker 1.2s steps(1) .55s both!important}",
    "@keyframes ti-flicker{0%{opacity:0}8%{opacity:1}14%{opacity:.2}22%{opacity:1}30%{opacity:.4}38%,100%{opacity:1}}",
    // Holz
    ".ti-plank{left:0;width:100%;background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.12) 0 2px,transparent 2px 46px),repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 7px);box-shadow:inset 0 -2px 0 rgba(0,0,0,.35);animation:ti-plank .7s cubic-bezier(.2,.8,.2,1) both}",
    "@keyframes ti-plank{from{transform:translateX(var(--from))}to{transform:none}}",
    ".ti-wood-shade{inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,.25),rgba(0,0,0,.6))}",
    ".ti-dust{left:50%;top:50%;width:5px;height:5px;border-radius:1px;background:#e6c58f;opacity:0;animation:ti-burst 1.1s ease-out both}",
    "@keyframes ti-burst{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--x),var(--y)) rotate(200deg)}}",
    // Farbe
    ".ti-stroke{left:-5%;top:calc(50% - 90px);width:110%;height:180px}.ti-stroke path{fill:none;stroke:rgb(var(--accent));stroke-width:120;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;opacity:.85;animation:ti-draw 1s cubic-bezier(.65,0,.35,1) .25s forwards}",
    ".ti-drip{top:0;width:14px;border-radius:0 0 8px 8px;background:rgb(var(--accent));height:0;animation:ti-drip 1.6s cubic-bezier(.3,.6,.4,1) both}",
    "@keyframes ti-drip{to{height:var(--h)}}",
    // Fliesen
    ".ti-tile{border-radius:3px;background:rgb(var(--accent)/.22);box-shadow:inset 0 0 0 1px rgb(255 255 255/.12);transform:scale(0) rotate(-20deg);animation:ti-tile .5s cubic-bezier(.34,1.56,.64,1) both}",
    "@keyframes ti-tile{to{transform:none}}",
    // Garten
    ".ti-grass{left:0;bottom:0;width:100%;height:42%}.ti-grass path{fill:none;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:ti-draw .9s ease-out both}",
    ".ti-leaf{top:-20px;width:16px;height:9px;border-radius:0 100% 0 100%;opacity:0;animation:ti-leaf 2.6s linear both}",
    "@keyframes ti-leaf{0%{opacity:0;transform:translate(0,0) rotate(0)}15%{opacity:.95}100%{opacity:0;transform:translate(var(--x),60vh) rotate(320deg)}}",
    // Trockenbau
    ".ti-laser{left:0;width:100%;height:2px;background:#ff3b3b;box-shadow:0 0 12px 3px rgba(255,40,40,.7);animation:ti-laser 1.4s cubic-bezier(.45,0,.2,1) .15s both}",
    "@keyframes ti-laser{0%{top:0;opacity:0}10%{opacity:1}80%{top:62%;opacity:1}100%{top:58%;opacity:.5}}",
    ".ti-stud{top:0;bottom:0;width:10px;background:linear-gradient(90deg,#9aa4ad,#d5dbe0 40%,#8e979f);opacity:.5;transform:scaleY(0);transform-origin:top;animation:ti-stud .7s ease-out both}",
    "@keyframes ti-stud{to{transform:none}}",
    // Mauerwerk
    ".ti-brick{height:6vh;border-radius:2px;background:linear-gradient(#b2553a,#8c3d27);box-shadow:inset 0 0 0 1px rgba(0,0,0,.2);opacity:0;animation:ti-brick .45s cubic-bezier(.34,1.56,.64,1) both}",
    "@keyframes ti-brick{from{opacity:0;transform:translateY(-40vh)}to{opacity:.9;transform:none}}",
    // Dach
    ".ti-roof{left:50%;top:calc(50% - 290px);width:420px;max-width:92vw;height:150px;transform:translateX(-50%)}.ti-roof path{fill:none;stroke:rgb(var(--accent-text-dark,var(--accent)));stroke-width:8;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:ti-draw .9s ease-out .2s forwards}",
    ".ti-roof .t{stroke:none;fill:rgb(var(--accent)/.85);opacity:0;animation:ti-fadein .35s ease-out both}",
    "@keyframes ti-fadein{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}",
    // Hausmeister: Tür öffnet, Licht fällt aufs Logo
    ".ti-light{inset:0;background:radial-gradient(ellipse at center,rgb(255 236 180/.35),transparent 60%);opacity:0;animation:ti-fadein .9s ease-out .7s both}",
    ".ti-door{top:0;bottom:0;width:50%;background:linear-gradient(90deg,rgb(var(--dark)),rgb(var(--dark)/.92));box-shadow:0 0 0 1px rgba(255,255,255,.06);animation:ti-door 1.1s cubic-bezier(.6,0,.2,1) .35s both}",
    ".ti-door.l{left:0;transform-origin:left;--r:-80deg}.ti-door.r{right:0;transform-origin:right;--r:80deg}",
    ".ti-door:after{content:'';top:50%;width:8px;height:40px;margin-top:-20px;border-radius:4px;background:#d4b26a;position:absolute}.ti-door.l:after{right:18px}.ti-door.r:after{left:18px}",
    "@keyframes ti-door{to{transform:perspective(900px) rotateY(var(--r));opacity:.15}}",
  ].join("");
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var L = document.createElement("div");
  L.className = "ti";
  splash.insertBefore(L, splash.firstChild);
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, cls, style) { var e = document.createElement(tag); if (cls) e.className = cls; if (style) e.style.cssText = style; L.appendChild(e); return e; }
  function svg(cls, vb, inner, par) { var s = document.createElementNS(NS, "svg"); s.setAttribute("class", cls); s.setAttribute("viewBox", vb); s.setAttribute("preserveAspectRatio", "none"); s.innerHTML = inner; (par || L).appendChild(s); return s; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  if (kind === "water") {
    var w = el("div", "ti-water");
    var body = document.createElement("div"); body.className = "ti-water-body"; w.appendChild(body);
    var wave = "M0 20 Q 25 0 50 20 T 100 20 T 150 20 T 200 20 V40 H0Z";
    svg("ti-wave", "0 0 200 40", '<path d="' + wave + '" fill="#2d8fd6" fill-opacity=".8"/>', w);
    svg("ti-wave b", "0 0 200 40", '<path d="' + wave + '" fill="#6cc0f5" fill-opacity=".6"/>', w);
    for (var b = 0; b < 14; b++) { var bb = document.createElement("i"); bb.className = "ti-bub"; bb.style.cssText = "left:" + rnd(3, 97) + "%;animation-delay:" + rnd(.4, 2.2) + "s;width:" + rnd(5, 12) + "px;height:" + rnd(5, 12) + "px"; w.appendChild(bb); }
    [0.15, 0.75, 1.3].forEach(function (d, k) { el("i", "ti-drop", "animation-delay:" + d + "s;margin-left:" + (-7 + (k - 1) * 26) + "px"); el("i", "ti-ring", "animation-delay:" + (d + 0.7) + "s;margin-left:" + (-10 + (k - 1) * 26) + "px"); });
  } else if (kind === "electric") {
    svg("ti-bolt", "0 0 120 300", '<path pathLength="1" d="M70 0 L48 92 L78 96 L40 196 L70 200 L52 300"/>');
    el("i", "ti-flash");
    var paths = "", pulses = "";
    [["M0 30 H30 V50 H48", 0], ["M100 22 H72 V46 H54", 1], ["M0 76 H26 V56 H46", 2], ["M100 80 H70 V58 H55", 3]].forEach(function (p) { paths += '<path pathLength="1" d="' + p[0] + '"/>'; pulses += '<path class="p" pathLength="1" d="' + p[0] + '" style="animation-delay:' + (1.3 + p[1] * 0.2) + 's"/>'; });
    svg("ti-wire", "0 0 100 100", paths + pulses);
  } else if (kind === "wood") {
    var woods = ["#5b3a1f", "#6e4726", "#7d532d", "#664124", "#73502c", "#5f3d21", "#6a4626", "#7a5130"];
    for (var p = 0; p < 8; p++) el("i", "ti-plank", "top:" + p * 12.5 + "%;height:12.6%;background-color:" + woods[p] + ";--from:" + (p % 2 ? "110%" : "-110%") + ";animation-delay:" + (0.08 * p) + "s");
    el("i", "ti-wood-shade");
    for (var d2 = 0; d2 < 26; d2++) { var a2 = Math.random() * 6.28, r2 = rnd(80, 260); el("i", "ti-dust", "animation-delay:" + rnd(.7, 1.1) + "s;--x:" + Math.cos(a2) * r2 + "px;--y:" + Math.sin(a2) * r2 + "px"); }
  } else if (kind === "paint") {
    svg("ti-stroke", "0 0 1000 180", '<path pathLength="1" d="M60 100 C 260 30, 420 160, 600 80 S 900 60, 960 96"/>');
    for (var dr = 0; dr < 9; dr++) el("i", "ti-drip", "left:" + (6 + dr * 11 + rnd(-3, 3)) + "%;width:" + rnd(8, 16) + "px;--h:" + rnd(6, 26) + "vh;animation-delay:" + rnd(.3, 1.2) + "s;opacity:.8");
  } else if (kind === "tiles") {
    var cols = 10, rows = 7;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) el("i", "ti-tile", "left:calc(" + c * 10 + "% + 3px);top:calc(" + r * (100 / rows) + "% + 3px);width:calc(10% - 6px);height:calc(" + 100 / rows + "% - 6px);animation-delay:" + (0.12 + (r + c) * 0.045) + "s");
  } else if (kind === "garden") {
    var blades = "", greens = ["#3f7d2a", "#5a9a34", "#6fb33f", "#4c8a2e"];
    for (var g = 0; g < 70; g++) { var x = g * 1.45 + rnd(-.5, .5), hgt = rnd(30, 95), bend = rnd(-8, 8); blades += '<path pathLength="1" stroke="' + greens[g % 4] + '" stroke-width="' + rnd(.8, 1.6).toFixed(2) + '" d="M' + x.toFixed(1) + " 100 Q " + (x + bend / 3).toFixed(1) + " " + (100 - hgt / 2).toFixed(1) + " " + (x + bend).toFixed(1) + " " + (100 - hgt).toFixed(1) + '" style="animation-delay:' + rnd(.1, .7).toFixed(2) + 's"/>'; }
    svg("ti-grass", "0 0 100 100", blades);
    var lc = ["#c8641e", "#e09a2a", "#8fb24a", "#d6b23a"];
    for (var lf = 0; lf < 12; lf++) el("i", "ti-leaf", "left:" + rnd(0, 95) + "%;background:" + lc[lf % 4] + ";--x:" + rnd(-80, 80) + "px;animation-delay:" + rnd(0, 1.2) + "s");
  } else if (kind === "drywall") {
    for (var sd = 0; sd < 6; sd++) el("i", "ti-stud", "left:calc(" + (8 + sd * 17) + "% - 5px);animation-delay:" + (0.5 + sd * 0.1) + "s");
    el("i", "ti-laser");
  } else if (kind === "bricks") {
    var bw = 12.5, rowsB = 6, n = 0;
    for (var rb = 0; rb < rowsB; rb++) for (var cb = -1; cb < 9; cb++) { var off = rb % 2 ? bw / 2 : 0; el("i", "ti-brick", "left:calc(" + (cb * bw + off) + "% + 2px);width:calc(" + bw + "% - 4px);bottom:calc(" + rb * 6.4 + "vh + 2px);animation-delay:" + (0.1 + n++ * 0.018) + "s"); }
  } else if (kind === "roof") {
    var tiles = "";
    for (var rr = 0; rr < 4; rr++) for (var k2 = 0; k2 <= rr * 2 + 2; k2++) { var y = 30 + rr * 28, half = 30 + rr * 52, x0 = 210 - half + k2 * (2 * half / (rr * 2 + 2)) - 14; if (k2 > rr * 2 + 1) continue; tiles += '<rect class="t" x="' + x0.toFixed(0) + '" y="' + y + '" width="26" height="24" rx="4" style="animation-delay:' + (0.9 + rr * 0.18 + k2 * 0.03).toFixed(2) + 's"/>'; }
    var s = svg("ti-roof", "0 0 420 150", tiles + '<path pathLength="1" d="M10 145 L210 10 L410 145"/>');
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");
  } else if (kind === "keys") {
    el("i", "ti-light");
    el("i", "ti-door l"); el("i", "ti-door r");
  }
})();
