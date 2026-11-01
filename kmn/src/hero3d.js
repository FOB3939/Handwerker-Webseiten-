// 3D-Scroll-Szene „Küche entsteht“ (Three.js + GSAP ScrollTrigger).
// Einheit: Meter. x nach rechts, y nach oben, z zum Betrachter. Rückwand bei z = 0, linke Wand bei x = 0.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Group, Mesh, BoxGeometry, PlaneGeometry, CylinderGeometry,
  ExtrudeGeometry, Shape, Path, TubeGeometry, CatmullRomCurve3, EdgesGeometry, LineSegments, LineBasicMaterial,
  MeshLambertMaterial, MeshBasicMaterial, HemisphereLight, DirectionalLight, CanvasTexture, RepeatWrapping,
  SRGBColorSpace, Vector3, BufferGeometry, Float32BufferAttribute, PCFShadowMap,
} from "three";

const INK = 0x22272b;
const doc = document;
const root = doc.querySelector("[data-h3d]");
if (root) init();

function init() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvasBox = root.querySelector("[data-h3d-canvas]");
  const chapters = [...root.querySelectorAll("[data-chapter]")];
  const rail = [...root.querySelectorAll("[data-goto-chapter]")];
  const card = root.querySelector("[data-photo-card]");
  const labelBox = root.querySelector("[data-h3d-labels]");

  let renderer;
  try {
    const c = doc.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) throw new Error("kein WebGL");
    renderer = new WebGLRenderer({ canvas: c, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    root.classList.add("h3d--static", "h3d--nogl");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.className = "h3d__gl";
  canvasBox.prepend(renderer.domElement);
  root.classList.add("h3d--gl");

  const scene = new Scene();
  scene.background = new Color(0xf9faf8);
  const camera = new PerspectiveCamera(34, 1, 0.05, 60);

  scene.add(new HemisphereLight(0xffffff, 0xd8c3a0, 2.1));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(3.5, 6.5, 5.5);
  sun.target.position.set(1.8, 0, 1.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 16 });
  sun.shadow.bias = -0.0008;
  scene.add(sun, sun.target);

  // ------------------------------------------------------------ Materialien
  const lineMat = new LineBasicMaterial({ color: INK });
  const mats = {
    korpus: new MeshLambertMaterial({ color: 0xf1f2ef }),
    front: new MeshLambertMaterial({ color: 0x878c89 }),
    frontLight: new MeshLambertMaterial({ color: 0xeef0ed }),
    wall: new MeshLambertMaterial({ color: 0xf4f5f2 }),
    wallLeft: new MeshLambertMaterial({ color: 0xe6e9e5 }),
    dark: new MeshLambertMaterial({ color: 0x2a2f33 }),
    steel: new MeshLambertMaterial({ color: 0xc9cdcf }),
    glass: new MeshLambertMaterial({ color: 0x14181b }),
    window: new MeshLambertMaterial({ color: 0xdfe6e9 }),
    level: new MeshLambertMaterial({ color: 0xc9cdd0 }),
    vial: new MeshLambertMaterial({ color: 0xdcea7a }),
    bubble: new MeshLambertMaterial({ color: 0xfbfde9 }),
    foot: new MeshLambertMaterial({ color: 0x3a4044 }),
    top: new MeshLambertMaterial({ color: 0xffffff }),
    gap: new MeshBasicMaterial({ color: 0xc9db3a, transparent: true, opacity: 0, depthWrite: false }),
  };

  // Flächen etwas nach hinten versetzen, damit die Strichkanten sauber darüber liegen.
  for (const m of Object.values(mats)) if (m.isMeshLambertMaterial) Object.assign(m, { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  function outlined(geo, mat, opts = {}) {
    const m = new Mesh(geo, mat);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    if (opts.edges !== false) m.add(new LineSegments(new EdgesGeometry(geo, 25), lineMat));
    return m;
  }
  // Quader mit Ursprung unten-links-hinten.
  function box(x0, x1, y0, y1, z0, z1, mat, opts) {
    const m = outlined(new BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat, opts);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return m;
  }

  // ------------------------------------------------------------ Texturen
  function canvasTex(w, h, paint, rx = 1, ry = 1) {
    const c = doc.createElement("canvas");
    c.width = w; c.height = h;
    paint(c.getContext("2d"), w, h);
    const t = new CanvasTexture(c);
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(rx, ry);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return t;
  }
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#D8A867"; g.fillRect(0, 0, w, h);
    const rows = 8, ph = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * 400;
      while (x < w) {
        const len = 260 + rnd() * 300;
        g.fillStyle = `hsl(32 ${48 + rnd() * 10}% ${58 + rnd() * 8}%)`;
        g.fillRect(x, r * ph, len, ph);
        g.strokeStyle = "rgba(120,72,25,.22)"; g.lineWidth = 1.2;
        for (let k = 0; k < 7; k++) {
          const y = r * ph + 6 + rnd() * (ph - 12);
          g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + len * 0.3, y + 3, x + len * 0.6, y - 3, x + len, y); g.stroke();
        }
        g.strokeStyle = "#A9773C"; g.lineWidth = 2; g.strokeRect(x, r * ph, len, ph);
        x += len;
      }
    }
  }, 3, 3);

  // Arbeitsplatten-Optiken, passend zur Auswahl im Abschnitt „Arbeitsplatten“.
  const OPT = {
    schiefer: { base: "#363B3F", kind: "streak", line: "rgba(80,88,94,.75)" },
    eiche: { base: "#DDB580", kind: "grain", line: "rgba(160,110,60,.55)" },
    nussbaum: { base: "#5C3E2A", kind: "grain", line: "rgba(40,24,14,.6)" },
    marmor: { base: "#F1F2F0", kind: "vein", line: "rgba(150,156,154,.8)" },
    granit: { base: "#202325", kind: "speck", line: "#6C7174" },
    beton: { base: "#A1A5A3", kind: "cloud", line: "rgba(120,124,122,.5)" },
    weiss: { base: "#F4F5F3", kind: "plain" },
    edelstahl: { base: "#BCC1C4", kind: "brush", line: "rgba(230,234,236,.6)" },
  };
  const texCache = {};
  function optikTex(id) {
    if (texCache[id]) return texCache[id];
    const o = OPT[id];
    seed = 11;
    const t = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = o.base; g.fillRect(0, 0, w, h);
      g.strokeStyle = o.line; g.fillStyle = o.line;
      if (o.kind === "grain" || o.kind === "streak") {
        for (let i = 0; i < (o.kind === "grain" ? 46 : 18); i++) {
          const y = rnd() * h, a = (rnd() - 0.5) * 30;
          g.lineWidth = 0.8 + rnd() * 2.2;
          g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.33, y + a, w * 0.66, y - a, w, y); g.stroke();
        }
      } else if (o.kind === "vein") {
        for (let i = 0; i < 5; i++) {
          let x = 0, y = rnd() * h; g.lineWidth = 0.8 + rnd() * 1.6; g.beginPath(); g.moveTo(x, y);
          while (x < w) { x += 20 + rnd() * 50; y += (rnd() - 0.5) * 60; g.lineTo(x, y); }
          g.stroke();
        }
      } else if (o.kind === "speck") {
        for (let i = 0; i < 2600; i++) { g.globalAlpha = 0.3 + rnd() * 0.7; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
        g.globalAlpha = 1;
      } else if (o.kind === "cloud") {
        for (let i = 0; i < 60; i++) { g.globalAlpha = 0.25; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 60, 10 + rnd() * 30, 0, 0, 7); g.fill(); }
        g.globalAlpha = 1;
      } else if (o.kind === "brush") {
        for (let i = 0; i < 260; i++) { g.lineWidth = 0.6; const y = rnd() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      }
    }, 0.9, 0.9);
    return (texCache[id] = t);
  }
  function setOptik(id) {
    if (!OPT[id]) return;
    mats.top.map = optikTex(id);
    mats.top.needsUpdate = true;
    render();
  }

  // ------------------------------------------------------------ Raum
  const floor = new Mesh(new PlaneGeometry(5.4, 4.4), new MeshLambertMaterial({ map: floorTex }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(2.7, 0, 2.2);
  floor.receiveShadow = true;
  scene.add(floor);
  scene.add(box(0, 5.4, 0, 2.6, -0.08, 0, mats.wall, { cast: false }));
  scene.add(box(-0.08, 0, 0, 2.6, -0.08, 4.4, mats.wallLeft, { cast: false }));
  scene.add(box(3.5, 4.45, 0.95, 2.2, -0.02, 0.005, mats.window, { cast: false }));
  scene.add(box(3.96, 3.99, 0.95, 2.2, 0, 0.012, mats.korpus, { cast: false }));

  // ------------------------------------------------------------ Grundriss und Maßketten (auf dem Boden)
  const planGroup = new Group();
  scene.add(planGroup);
  const planMat = new LineBasicMaterial({ color: INK, transparent: true, opacity: 1 });
  const dimMat = new LineBasicMaterial({ color: 0x7e5221, transparent: true, opacity: 1 });
  function lines(pts, mat, y = 0.004) {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pts.flatMap(([x, z]) => [x, y, z]), 3));
    return new LineSegments(g, mat);
  }
  function rect(x0, x1, z0, z1) { return [[x0, z0], [x1, z0], [x1, z0], [x1, z1], [x1, z1], [x0, z1], [x0, z1], [x0, z0]]; }
  // Stellflächen: Hochschrank + Zeile, Insel
  const plan = [...rect(0, 3.0, 0, 0.6), ...rect(1.0, 2.8, 1.6, 2.2)];
  for (const x of [0.6, 1.2, 1.8, 2.4]) plan.push([x, 0], [x, 0.6]);
  for (const x of [1.6, 2.2]) plan.push([x, 1.6], [x, 2.2]);
  planGroup.add(lines(plan, planMat));
  // Maßketten mit Endstrichen
  function dimX(x0, x1, z) { return [[x0, z], [x1, z], [x0, z - 0.08], [x0, z + 0.08], [x1, z - 0.08], [x1, z + 0.08]]; }
  function dimZ(z0, z1, x) { return [[x, z0], [x, z1], [x - 0.08, z0], [x + 0.08, z0], [x - 0.08, z1], [x + 0.08, z1]]; }
  const dims = [...dimX(0, 3.0, 0.95), ...dimX(1.0, 2.8, 2.6), ...dimZ(0.6, 1.6, 3.35), ...dimZ(0, 0.6, 3.35)];
  planGroup.add(lines(dims, dimMat, 0.006));

  // ------------------------------------------------------------ Küche
  const FOOT = 0.12, KTOP = 0.84, WT = 0.04;
  const feet = new Group(), carcasses = new Group(), fronts = new Group(), handles = new Group(), plinths = new Group();
  scene.add(feet, carcasses, fronts, handles, plinths);
  const carcassList = [];

  function cabinet(x0, x1, z0, z1, h = KTOP, y0 = FOOT, withFeet = true) {
    const g = new Group();
    g.add(box(x0, x1, y0, h, z0, z1, mats.korpus));
    carcasses.add(g);
    carcassList.push(g);
    if (withFeet) {
      for (const [x, z] of [[x0 + 0.06, z0 + 0.08], [x1 - 0.06, z0 + 0.08], [x0 + 0.06, z1 - 0.08], [x1 - 0.06, z1 - 0.08]]) {
        const f = outlined(new CylinderGeometry(0.018, 0.022, FOOT, 10), mats.foot, { edges: false });
        f.position.set(x, FOOT / 2, z);
        feet.add(f);
      }
    }
    return g;
  }
  function front(x0, x1, y0, y1, z, mat = mats.front, handle = "top") {
    const gap = 0.003;
    const f = box(x0 + gap, x1 - gap, y0 + gap, y1 - gap, z, z + 0.019, mat);
    fronts.add(f);
    if (handle) {
      const hy = handle === "top" ? y1 - 0.06 : y0 + 0.08;
      const hw = Math.min(0.32, (x1 - x0) * 0.55), hx = (x0 + x1) / 2;
      const hnd = box(hx - hw / 2, hx + hw / 2, hy - 0.007, hy + 0.007, z + 0.019, z + 0.042, mats.steel, { edges: false });
      handles.add(hnd);
    }
    return f;
  }

  // Hochschrank mit Backofen
  cabinet(0, 0.6, 0, 0.6, 2.1);
  // Zeile
  const row = [[0.6, 1.2], [1.2, 1.8], [1.8, 2.4], [2.4, 3.0]];
  row.forEach(([a, b]) => cabinet(a, b, 0, 0.6));
  // Oberschränke (ohne Füße)
  const wallCab = new Group();
  for (const [a, b] of [[0.6, 1.2], [1.2, 1.8]]) wallCab.add(box(a, b, 1.45, 2.1, 0, 0.35, mats.korpus));
  carcasses.add(wallCab);
  // Insel
  const island = new Group();
  scene.add(island);
  const islandCabs = [[1.0, 1.6], [1.6, 2.2], [2.2, 2.8]];
  islandCabs.forEach(([a, b]) => {
    const g = cabinet(a, b, 1.6, 2.2);
    carcasses.remove(g); island.add(g);
    g.position.set(-1.9, 0, -1.9);
  });
  island.position.set(1.9, 0, 1.9);

  // Fronten
  const ZR = 0.6, ZI = 2.2;
  front(0, 0.6, FOOT, 0.84, ZR, mats.front, "top");
  front(0, 0.6, 1.5, 2.1, ZR, mats.front, "bottom");
  const oven = box(0.03, 0.57, 0.88, 1.46, ZR, ZR + 0.022, mats.dark); fronts.add(oven);
  fronts.add(box(0.1, 0.5, 0.95, 1.33, ZR + 0.022, ZR + 0.026, mats.glass, { edges: false }));
  handles.add(box(0.12, 0.48, 1.38, 1.395, ZR + 0.026, ZR + 0.05, mats.steel, { edges: false }));
  // Zeile: Schubkästen / Türen
  front(0.6, 1.2, FOOT, 0.36, ZR); front(0.6, 1.2, 0.36, 0.6, ZR); front(0.6, 1.2, 0.6, 0.84, ZR);
  front(1.2, 1.8, FOOT, 0.84, ZR);
  front(1.8, 2.4, FOOT, 0.48, ZR); front(1.8, 2.4, 0.48, 0.84, ZR);
  front(2.4, 3.0, FOOT, 0.48, ZR); front(2.4, 3.0, 0.48, 0.84, ZR);
  for (const [a, b] of [[0.6, 1.2], [1.2, 1.8]]) front(a, b, 1.45, 2.1, 0.35, mats.frontLight, "bottom");
  // Insel
  islandCabs.forEach(([a, b]) => { front(a, b, FOOT, 0.48, ZI); front(a, b, 0.48, 0.84, ZI); });
  // Sockelblenden
  plinths.add(box(0.6, 3.0, 0, FOOT, ZR - 0.06, ZR - 0.042, mats.dark, { edges: false }));
  plinths.add(box(1.0, 2.8, 0, FOOT, ZI - 0.06, ZI - 0.042, mats.dark, { edges: false }));
  plinths.add(box(0.0, 0.6, 0, FOOT, ZR - 0.06, ZR - 0.042, mats.dark, { edges: false }));

  // Fugen-Markierungen auf der Inselfront
  const gaps = new Group();
  scene.add(gaps);
  for (const x of [1.6, 2.2]) {
    const g = new Mesh(new BoxGeometry(0.008, 0.7, 0.004), mats.gap); g.position.set(x, 0.48, ZI + 0.03); gaps.add(g);
  }
  for (const [a, b] of islandCabs) {
    const g = new Mesh(new BoxGeometry(b - a - 0.04, 0.008, 0.004), mats.gap); g.position.set((a + b) / 2, 0.48, ZI + 0.03); gaps.add(g);
  }

  // Arbeitsplatten mit Ausschnitten
  function slab(x0, x1, z0, z1, holes) {
    const s = new Shape();
    s.moveTo(x0, -z1); s.lineTo(x1, -z1); s.lineTo(x1, -z0); s.lineTo(x0, -z0); s.lineTo(x0, -z1);
    for (const [hx0, hx1, hz0, hz1, r] of holes) {
      const p = new Path();
      p.moveTo(hx0 + r, -hz1); p.lineTo(hx1 - r, -hz1); p.quadraticCurveTo(hx1, -hz1, hx1, -hz1 + r);
      p.lineTo(hx1, -hz0 - r); p.quadraticCurveTo(hx1, -hz0, hx1 - r, -hz0); p.lineTo(hx0 + r, -hz0);
      p.quadraticCurveTo(hx0, -hz0, hx0, -hz0 - r); p.lineTo(hx0, -hz1 + r); p.quadraticCurveTo(hx0, -hz1, hx0 + r, -hz1);
      s.holes.push(p);
    }
    const g = new ExtrudeGeometry(s, { depth: WT, bevelEnabled: false, curveSegments: 6 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, KTOP, 0);
    return outlined(g, mats.top);
  }
  const tops = new Group();
  scene.add(tops);
  // Zeile in zwei Teilen mit Stoß bei x = 2.4, Spülenausschnitt im ersten Teil
  const topA = slab(0.6, 2.4, 0, 0.62, [[1.28, 1.72, 0.1, 0.5, 0.04]]);
  const topB = slab(2.4, 3.0, 0, 0.62, []);
  const topI = slab(0.95, 2.85, 1.55, 2.3, [[1.55, 2.25, 1.7, 2.14, 0.01]]);
  tops.add(topA, topB, topI);
  // Wandabschlussleiste
  const strip = box(0.6, 3.0, KTOP + WT, KTOP + WT + 0.03, 0, 0.012, mats.korpus);
  scene.add(strip);

  // Geräte: Kochfeld, Spüle, Armatur
  const cooktop = new Group();
  const ctTex = canvasTex(512, 320, (g, w, h) => {
    g.fillStyle = "#121619"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#4C5458"; g.lineWidth = 4;
    for (const [x, y, r] of [[130, 95, 62], [130, 230, 48], [380, 95, 52], [380, 225, 66]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); }
  });
  ctTex.repeat.set(1, 1); ctTex.wrapS = ctTex.wrapT = 1001;
  const ct = new Mesh(new BoxGeometry(0.72, 0.008, 0.46), [mats.glass, mats.glass, new MeshLambertMaterial({ map: ctTex }), mats.glass, mats.glass, mats.glass]);
  ct.position.set(1.9, KTOP + WT + 0.002, 1.92);
  ct.add(new LineSegments(new EdgesGeometry(ct.geometry), lineMat));
  cooktop.add(ct);
  scene.add(cooktop);
  const sink = new Group();
  sink.add(box(1.26, 1.74, KTOP + WT - 0.004, KTOP + WT + 0.004, 0.08, 0.52, mats.dark));
  sink.add(box(1.3, 1.7, KTOP - 0.16, KTOP + WT - 0.004, 0.12, 0.48, mats.glass, { edges: false }));
  const tapCurve = new CatmullRomCurve3([new Vector3(1.5, KTOP + WT, 0.05), new Vector3(1.5, KTOP + 0.3, 0.05), new Vector3(1.5, KTOP + 0.38, 0.13), new Vector3(1.5, KTOP + 0.33, 0.24), new Vector3(1.5, KTOP + 0.26, 0.25)]);
  const tap = new Mesh(new TubeGeometry(tapCurve, 24, 0.012, 8), mats.dark);
  tap.castShadow = true;
  sink.add(tap);
  scene.add(sink);

  // Wasserwaage
  const level = new Group();
  level.add(box(1.15, 2.35, 0, 0.05, -0.03, 0.03, mats.level));
  level.add(box(1.7, 1.8, 0.012, 0.038, 0.03, 0.034, mats.vial, { edges: false }));
  const bubble = new Mesh(new BoxGeometry(0.02, 0.016, 0.004), mats.bubble);
  bubble.position.set(1.75, 0.025, 0.036);
  level.add(bubble);
  level.position.set(0, KTOP, 1.9);
  scene.add(level);

  // ------------------------------------------------------------ Maß-Overlay (HTML)
  const H = 0.88;
  const labels = [
    ["Zeilenlänge", [1.5, 0, 0.95], 0.0, 2.2],
    ["Inselbreite", [1.9, 0, 2.6], 0.0, 2.2],
    ["Durchgang", [3.35, 0, 1.1], 0.0, 2.2],
    ["Stellfüße", [2.8, 0.06, 2.25], 2.0, 2.95],
    ["Wasserwaage", [2.35, KTOP + 0.06, 1.9], 2.1, 2.95],
    ["Arbeitshöhe", [2.97, H / 2, 2.25], 2.95, 3.75],
    ["Ausschnitt Kochfeld", [1.9, H, 1.92], 4.1, 4.75],
    ["Ausschnitt Spüle", [1.5, H, 0.3], 4.1, 5.0],
    ["Stoß", [2.4, H, 0.45], 4.55, 5.05],
    ["Wandanschluss", [2.75, H + 0.03, 0.01], 4.55, 5.05],
    ["Fugen gleichmäßig", [2.2, 0.66, ZI + 0.03], 5.45, 6.0],
  ].map(([text, p, t0, t1]) => {
    const el = doc.createElement("span");
    el.className = "h3d__label";
    el.textContent = text;
    labelBox.appendChild(el);
    return { el, p: new Vector3(...p), t0, t1 };
  });
  // Höhenmaßlinie
  const heightLine = new Group();
  heightLine.add(box(2.95, 2.958, 0, H, 2.25, 2.258, new MeshBasicMaterial({ color: 0x7e5221 }), { edges: false, cast: false }));
  for (const y of [0, H]) heightLine.add(box(2.9, 3.01, y - 0.004, y + 0.004, 2.25, 2.258, new MeshBasicMaterial({ color: 0x7e5221 }), { edges: false, cast: false }));
  scene.add(heightLine);

  // ------------------------------------------------------------ Kamera-Fahrt
  const cam = { px: 2.4, py: 7.6, pz: 5.4, tx: 2.0, ty: 0, tz: 1.6 };
  const K = {
    plan: { px: 2.3, py: 7.4, pz: 5.6, tx: 1.9, ty: 0, tz: 1.5 },
    over: { px: 6.4, py: 3.9, pz: 6.6, tx: 1.75, ty: 0.55, tz: 1.2 },
    level: { px: 4.4, py: 2.0, pz: 4.4, tx: 1.95, ty: 0.55, tz: 1.75 },
    height: { px: 4.5, py: 0.75, pz: 3.7, tx: 2.4, ty: 0.48, tz: 1.9 },
    tops: { px: 4.6, py: 2.7, pz: 4.6, tx: 1.75, ty: 0.75, tz: 1.0 },
    joint: { px: 3.25, py: 1.55, pz: 1.55, tx: 2.3, ty: 0.86, tz: 0.25 },
    fronts: { px: 2.55, py: 0.95, pz: 3.75, tx: 1.95, ty: 0.48, tz: 2.2 },
    end: { px: 5.5, py: 3.0, pz: 5.7, tx: 1.65, ty: 0.75, tz: 1.2 },
  };
  Object.assign(cam, K.plan);

  // Startzustände (Ende = fertige Küche ist der Ausgangszustand der Objekte)
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" }, onUpdate: render });
  const C = (k, d, at, ease) => tl.to(cam, { ...K[k], duration: d, ease: ease || "power2.inOut" }, at);

  // Teile, die erst in ihrem Kapitel erscheinen
  const appear = (objs, at) => { for (const o of objs) { o.visible = false; tl.set(o, { visible: true }, at); } };
  appear([feet, carcasses, island], 1.75);
  appear([level], 2.2);
  appear([heightLine], 3.0);
  appear([tops], 3.9);
  appear([cooktop], 4.4);
  appear([sink], 4.45);
  appear([strip], 4.55);
  appear([fronts], 5.2);
  appear([plinths], 5.55);
  appear([handles], 5.6);

  // Kapitelzeiten
  const T = [0, 0.9, 1.9, 2.95, 3.8, 5.15, 6.1, 6.8];
  // 1 Aufmaß / Plan
  C("over", 1.0, 0.9);
  // 2 Korpusse wachsen aus dem Grundriss, Stellfüße, Nivellieren
  tl.from(feet.children.map((f) => f.scale), { y: 0.001, duration: 0.3, stagger: 0.004 }, 1.75);
  tl.from([...carcasses.children, ...island.children].map((g) => g.scale), { y: 0.001, duration: 0.6, stagger: 0.04, ease: "power3.out" }, 1.95);
  tl.from(island.rotation, { z: 0.035, duration: 0.5, ease: "power2.out" }, 2.55);
  tl.from(level.position, { y: KTOP + 0.7, duration: 0.35, ease: "power2.out" }, 2.2);
  tl.fromTo(bubble.position, { x: 1.79 }, { keyframes: [{ x: 1.715, duration: 0.2 }, { x: 1.765, duration: 0.15 }, { x: 1.75, duration: 0.15 }], ease: "sine.inOut" }, 2.55);
  tl.to(planMat, { opacity: 0.25, duration: 0.4 }, 2.0).to(dimMat, { opacity: 0, duration: 0.4 }, 2.0);
  C("level", 0.9, 1.95);
  // 3 Arbeitshöhe
  tl.from(heightLine.scale, { y: 0.001, duration: 0.4, ease: "power2.out" }, 3.05);
  C("height", 0.85, 2.95);
  tl.to(heightLine.scale, { y: 0.001, duration: 0.2 }, 3.75);
  // 4 Arbeitsplatte
  tl.to(level.position, { y: KTOP + 0.9, duration: 0.25, ease: "power2.in" }, 3.8);
  tl.set(level, { visible: false }, 4.05);
  C("tops", 0.55, 3.8);
  tl.from([topA.position, topB.position, topI.position], { y: 0.7, duration: 0.6, stagger: 0.12, ease: "power2.inOut" }, 3.9);
  tl.from(strip.scale, { x: 0.001, duration: 0.35, ease: "power2.out" }, 4.55);
  tl.from(cooktop.position, { y: 0.35, duration: 0.35, ease: "power2.out" }, 4.4);
  tl.from(sink.position, { y: 0.35, duration: 0.35, ease: "power2.out" }, 4.45);
  C("joint", 0.6, 4.45);
  // 5 Fronten
  C("fronts", 0.7, 5.15);
  tl.from(fronts.children.map((f) => f.position), { z: "+=0.35", y: "+=0.04", duration: 0.45, stagger: 0.012, ease: "power3.out" }, 5.2);
  tl.from(handles.children.map((h) => h.scale), { x: 0.001, y: 0.001, z: 0.001, duration: 0.2, stagger: 0.008 }, 5.6);
  tl.from(plinths.children.map((p) => p.scale), { x: 0.001, duration: 0.25 }, 5.55);
  tl.to(mats.gap, { opacity: 1, duration: 0.15, yoyo: true, repeat: 1 }, 5.75);
  // 6 Fertig
  C("end", 0.6, 6.1);
  tl.fromTo(card, { autoAlpha: 0, y: 40, rotation: 6 }, { autoAlpha: 1, y: 0, rotation: -2.5, duration: 0.45, ease: "power2.out" }, 6.35);
  tl.to({}, { duration: 0.05 }, 6.8);

  // ------------------------------------------------------------ Rendern
  const v = new Vector3();
  let W = 1, Hh = 1, chapter = -1;
  function frame() {
    const aspect = W / Hh;
    // Hochformat: Kamera weiter zurück, damit die Küche in die Breite passt.
    const f = aspect < 1 ? Math.min(1.75, 1.08 / Math.max(aspect, 0.5)) : aspect < 1.2 ? 1.1 : 1;
    camera.position.set(cam.tx + (cam.px - cam.tx) * f, cam.ty + (cam.py - cam.ty) * f, cam.tz + (cam.pz - cam.tz) * f);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
  }
  function render() {
    frame();
    renderer.render(scene, camera);
    const t = tl.time();
    for (const l of labels) {
      const on = t >= l.t0 && t <= l.t1;
      if (!on) { l.el.style.opacity = "0"; continue; }
      v.copy(l.p).project(camera);
      l.el.style.opacity = v.z < 1 ? "1" : "0";
      l.el.style.transform = `translate(${((v.x + 1) / 2) * W}px, ${((1 - v.y) / 2) * Hh}px) translate(-50%, -50%)`;
    }
    let idx = 0;
    for (let i = 0; i < T.length - 1; i++) if (t >= T[i] - 0.001) idx = i;
    idx = Math.min(idx, chapters.length - 1);
    if (idx !== chapter) {
      chapter = idx;
      chapters.forEach((c, i) => c.toggleAttribute("data-active", i === idx));
      rail.forEach((b, i) => { if (i + 1 === idx) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    }
    root.style.setProperty("--h3d-p", (t / tl.duration()).toFixed(4));
  }
  function resize() {
    const r = canvasBox.getBoundingClientRect();
    W = Math.max(1, r.width); Hh = Math.max(1, r.height);
    renderer.setSize(W, Hh, false);
    camera.aspect = W / Hh;
    camera.fov = W / Hh < 1 ? 44 : 34;
    camera.updateProjectionMatrix();
    render();
  }
  new ResizeObserver(resize).observe(canvasBox);

  window.addEventListener("kmn:optik", (e) => setOptik(e.detail));
  const pressed = doc.querySelector('[data-optik][aria-pressed="true"]');
  setOptik(pressed ? pressed.getAttribute("data-optik") : "schiefer");

  // ------------------------------------------------------------ Scroll oder Standbild
  if (reduce) {
    root.classList.add("h3d--static");
    tl.progress(1);
    resize();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const topH = () => parseFloat(getComputedStyle(doc.documentElement).getPropertyValue("--top-h")) || 68;
  const st = ScrollTrigger.create({
    trigger: root.querySelector("[data-h3d-pin]"),
    start: () => "top " + topH() + "px",
    end: () => "+=" + Math.round(innerHeight * 5),
    pin: true,
    scrub: 0.5,
    animation: tl,
    invalidateOnRefresh: true,
    anticipatePin: 1,
  });
  rail.forEach((b) => b.addEventListener("click", () => {
    const i = +b.getAttribute("data-goto-chapter");
    const time = i >= 6 ? tl.duration() : T[i] + 0.25;
    const y = st.start + (st.end - st.start) * (time / tl.duration());
    window.scrollTo({ top: Math.ceil(y) + 1, behavior: "auto" });
  }));
  resize();
}
