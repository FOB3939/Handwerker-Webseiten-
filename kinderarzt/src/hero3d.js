// 3D-Scroll-Szene „Die Sonne geht auf, die Praxis öffnet sich“ (Three.js + GSAP ScrollTrigger).
// Weiche Ton-Formen (Clay): Sonne mit wehenden Strahlen, Bauklötze, Stethoskop, Teddy, Wolken, Ballon.
// Beim Scrollen geht die Sonne auf, die Klötze fügen sich zur Praxis, die Tür öffnet sich, dann folgt das echte Foto.
// Einheit: etwa Meter. y nach oben, z zum Betrachter. Das Haus steht im Ursprung.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, Group, Mesh, SphereGeometry, CylinderGeometry, TorusGeometry,
  ExtrudeGeometry, Shape, TubeGeometry, CatmullRomCurve3, CircleGeometry, MeshStandardMaterial, ShadowMaterial,
  HemisphereLight, DirectionalLight, PointLight, SRGBColorSpace, Vector3, PCFShadowMap, PMREMGenerator,
  NeutralToneMapping, MathUtils,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const doc = document;
const root = doc.querySelector("[data-h3d]");
if (root) init();

function init() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvasBox = root.querySelector("[data-h3d-canvas]");
  const chapters = [...root.querySelectorAll("[data-chapter]")];
  const rail = [...root.querySelectorAll("[data-goto-chapter]")];
  const photo = root.querySelector("[data-photo]");

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
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.className = "h3d__gl";
  canvasBox.prepend(renderer.domElement);
  root.classList.add("h3d--gl");

  // ------------------------------------------------------------ Szene, Licht
  const DAWN = new Color(0xdfe6f7), DAY = new Color(0xf2f6ff), SKY = new Color();
  const scene = new Scene();
  scene.background = SKY.copy(DAWN);
  scene.fog = new Fog(SKY, 14, 34);
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const camera = new PerspectiveCamera(34, 1, 0.1, 80);

  const hemi = new HemisphereLight(0xffffff, 0xd9e1f5, 1.1);
  const key = new DirectionalLight(0xfff0d8, 1.4);
  key.position.set(4.5, 9, 6.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 2, far: 26 });
  key.shadow.radius = 6;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  const rim = new DirectionalLight(0xffd27a, 0);
  rim.position.set(0, 3, -10);
  const glow = new PointLight(0xffc75a, 0, 5, 1.6);
  glow.position.set(0, 0.55, 0.55);
  scene.add(hemi, key, key.target, rim, glow);

  // ------------------------------------------------------------ Materialien (matt, weich)
  const clay = (color, o = {}) => new MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...o });
  const M = {
    white: clay(0xffffff), sky: clay(0xcfddfb), yellow: clay(0xffd45c), coral: clay(0xf7b3a6), blue: clay(0x8fb1f5),
    ink: clay(0x2a3c9e, { roughness: 0.7 }), door: clay(0x3b57d0, { roughness: 0.7 }),
    sun: clay(0xffc93c, { emissive: 0xffb000, emissiveIntensity: 0.55, roughness: 0.6, fog: false }),
    ray: clay(0xffbf24, { emissive: 0xffa800, emissiveIntensity: 0.4, roughness: 0.6, fog: false }),
    teddy: clay(0xd9a877), teddyLight: clay(0xf0d2ac), teddyDark: clay(0x5b3b23, { roughness: 0.5 }),
    steel: clay(0xd8dde8, { roughness: 0.35, metalness: 0.25 }), tube: clay(0x2a3c9e, { roughness: 0.55 }),
    cloud: clay(0xffffff, { roughness: 0.95 }), balloon: clay(0xf0715c, { roughness: 0.45 }),
    ground: clay(0xf4f7fe, { roughness: 1 }), inside: clay(0xffe7a3, { emissive: 0xffc75a, emissiveIntensity: 0 }),
  };
  const shadowCatcher = new ShadowMaterial({ color: 0x1c2a78, opacity: 0.12 });
  const mesh = (geo, mat, cast = true) => { const m = new Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; };

  // ------------------------------------------------------------ Boden
  const ground = mesh(new CylinderGeometry(9, 9.3, 0.5, 72), M.ground, false);
  ground.receiveShadow = false;
  ground.position.y = -0.25;
  const catcher = new Mesh(new CircleGeometry(8.8, 64), shadowCatcher);
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = 0.002; catcher.receiveShadow = true;
  scene.add(ground, catcher);

  // ------------------------------------------------------------ Sonne mit geschwungenen Strahlen (Signet)
  const sun = new Group();
  sun.add(mesh(new SphereGeometry(1.15, 48, 32), M.sun, false));
  const rayShape = new Shape();
  rayShape.moveTo(-0.22, 0);
  rayShape.bezierCurveTo(-0.32, 0.32, -0.1, 0.56, 0.08, 1.02);
  rayShape.bezierCurveTo(0.3, 0.66, 0.34, 0.3, 0.22, 0);
  rayShape.quadraticCurveTo(0, -0.08, -0.22, 0);
  const rayGeo = new ExtrudeGeometry(rayShape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4, curveSegments: 16 });
  rayGeo.translate(0, 0, -0.06);
  const rays = [];
  const NR = 11;
  for (let i = 0; i < NR; i++) {
    const pivot = new Group();
    pivot.rotation.z = (i / NR) * Math.PI * 2;
    const r = mesh(rayGeo, M.ray, false);
    r.position.y = 1.32;
    pivot.add(r);
    sun.add(pivot);
    rays.push({ pivot, r, a: pivot.rotation.z });
  }
  const SUN_Z = -7.5;
  sun.position.set(0, -2.6, SUN_Z);
  sun.scale.setScalar(1.25);
  scene.add(sun);

  // ------------------------------------------------------------ Wolken
  const cloudGeo = new SphereGeometry(1, 24, 16);
  function cloud(parts) {
    const g = new Group();
    for (const [x, y, z, s] of parts) { const p = mesh(cloudGeo, M.cloud, false); p.position.set(x, y, z); p.scale.setScalar(s); g.add(p); }
    scene.add(g);
    return g;
  }
  const clouds = [
    cloud([[0, 0, 0, 0.62], [0.65, 0.18, 0, 0.5], [-0.6, -0.05, 0.05, 0.45], [0.2, 0.4, -0.1, 0.45]]),
    cloud([[0, 0, 0, 0.5], [0.55, 0.12, 0, 0.42], [-0.45, -0.02, 0, 0.36]]),
    cloud([[0, 0, 0, 0.55], [0.6, 0.1, 0, 0.4], [-0.55, 0.05, 0, 0.42], [0.1, 0.35, 0, 0.38]]),
  ];
  const cloudBase = [[-4.6, 4.3, -3.5], [4.8, 3.6, -2.8], [1.8, 5.2, -5.5]];
  clouds.forEach((c, i) => c.position.set(...cloudBase[i]));

  // ------------------------------------------------------------ Bauklötze → Praxis
  const S = 0.92, G = 0.95;
  const blockGeo = new RoundedBoxGeometry(S, S, S, 4, 0.14);
  const colors = [M.white, M.sky, M.yellow, M.coral, M.white, M.blue, M.sky, M.white, M.yellow, M.coral, M.white];
  const blocks = [];
  let ci = 0;
  for (const z of [0.475, -0.475]) for (let row = 0; row < 2; row++) for (let col = -1; col <= 1; col++) {
    const front = z > 0;
    const doorSlot = front && row === 0 && col === 0;
    if (doorSlot) continue;
    const isInside = !front && row === 0 && col === 0;
    const m = mesh(blockGeo, isInside ? M.inside : colors[ci++ % colors.length]);
    blocks.push({ m, to: new Vector3(col * G, 0.46 + row * G, z) });
    scene.add(m);
  }
  // Dach (Prisma) mit kleiner Sonne am Giebel
  const roofShape = new Shape();
  roofShape.moveTo(-1.62, 0); roofShape.lineTo(0, 1.15); roofShape.lineTo(1.62, 0); roofShape.lineTo(-1.62, 0);
  const roofGeo = new ExtrudeGeometry(roofShape, { depth: 1.7, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 5 });
  roofGeo.translate(0, 0, -0.85);
  const roof = new Group();
  roof.add(mesh(roofGeo, M.ink));
  const badge = new Group();
  badge.add(mesh(new SphereGeometry(0.17, 24, 16), M.sun, false));
  for (let i = 0; i < NR; i++) {
    const p = new Group(); p.rotation.z = (i / NR) * Math.PI * 2;
    const r = mesh(rayGeo, M.ray, false); r.position.y = 0.2; r.scale.set(0.16, 0.16, 0.4); p.add(r); badge.add(p);
  }
  badge.position.set(0, 0.45, 0.98);
  roof.add(badge);
  const ROOF_TO = new Vector3(0, 1.93, 0);
  roof.position.copy(ROOF_TO);
  scene.add(roof);
  // Tür: zwei Flügel mit Scharnier außen
  const leafGeo = new RoundedBoxGeometry(0.45, 0.86, 0.09, 3, 0.04);
  const doorL = new Group(), doorR = new Group();
  const dl = mesh(leafGeo, M.door); dl.position.x = 0.225; doorL.add(dl);
  const dr = mesh(leafGeo, M.door); dr.position.x = -0.225; doorR.add(dr);
  const knobGeo = new SphereGeometry(0.04, 12, 8);
  const kl = mesh(knobGeo, M.yellow, false); kl.position.set(0.38, 0, 0.06); doorL.add(kl);
  const kr = mesh(knobGeo, M.yellow, false); kr.position.set(-0.38, 0, 0.06); doorR.add(kr);
  doorL.position.set(-0.45, 0.45, 0.88); doorR.position.set(0.45, 0.45, 0.88);
  const door = new Group(); door.add(doorL, doorR); scene.add(door);
  const DOOR_POINT = new Vector3(0, 0.5, 0.9);

  // ------------------------------------------------------------ Teddy (Silhouette aus Kugeln)
  const teddy = new Group();
  const sph = new SphereGeometry(1, 32, 20);
  const part = (mat, x, y, z, sx, sy = sx, sz = sx) => { const p = mesh(sph, mat); p.position.set(x, y, z); p.scale.set(sx, sy, sz); teddy.add(p); return p; };
  part(M.teddy, 0, 0.5, 0, 0.42, 0.48, 0.38);
  part(M.teddyLight, 0, 0.45, 0.25, 0.25, 0.3, 0.16);
  part(M.teddy, 0, 1.12, 0, 0.32);
  part(M.teddy, -0.24, 1.36, -0.02, 0.12, 0.12, 0.08);
  part(M.teddy, 0.24, 1.36, -0.02, 0.12, 0.12, 0.08);
  part(M.teddyLight, 0, 1.05, 0.27, 0.13, 0.1, 0.08);
  part(M.teddyDark, 0, 1.1, 0.34, 0.04);
  part(M.teddyDark, -0.11, 1.2, 0.28, 0.03);
  part(M.teddyDark, 0.11, 1.2, 0.28, 0.03);
  part(M.teddy, -0.4, 0.62, 0.08, 0.13, 0.25, 0.13).rotation.z = 0.6;
  part(M.teddy, 0.4, 0.62, 0.08, 0.13, 0.25, 0.13).rotation.z = -0.6;
  part(M.teddy, -0.22, 0.13, 0.22, 0.15, 0.13, 0.22);
  part(M.teddy, 0.22, 0.13, 0.22, 0.15, 0.13, 0.22);
  teddy.scale.setScalar(0.85);
  scene.add(teddy);

  // ------------------------------------------------------------ Stethoskop
  const steth = new Group();
  const tubeCurve = new CatmullRomCurve3([
    new Vector3(-0.28, 0.9, 0), new Vector3(-0.3, 0.55, 0), new Vector3(-0.1, 0.2, 0), new Vector3(0, 0, 0),
    new Vector3(0.1, 0.2, 0), new Vector3(0.3, 0.55, 0), new Vector3(0.28, 0.9, 0),
  ]);
  steth.add(mesh(new TubeGeometry(tubeCurve, 64, 0.045, 12, false), M.tube));
  const stem = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(0.05, -0.4, 0.02), new Vector3(0.3, -0.75, 0.05), new Vector3(0.62, -0.82, 0.05)]);
  steth.add(mesh(new TubeGeometry(stem, 48, 0.045, 12, false), M.tube));
  const chest = mesh(new CylinderGeometry(0.2, 0.2, 0.09, 32), M.steel);
  chest.rotation.z = Math.PI / 2; chest.position.set(0.7, -0.82, 0.05); steth.add(chest);
  const ring = mesh(new TorusGeometry(0.2, 0.035, 12, 32), M.yellow); ring.rotation.y = Math.PI / 2; ring.position.copy(chest.position); ring.position.x += 0.0; steth.add(ring);
  for (const s of [-1, 1]) { const tip = mesh(new SphereGeometry(0.07, 16, 12), M.steel); tip.position.set(0.28 * s, 0.93, 0); steth.add(tip); }
  scene.add(steth);

  // ------------------------------------------------------------ Ballon
  const balloon = new Group();
  const bb = mesh(new SphereGeometry(0.42, 40, 28), M.balloon); bb.scale.set(1, 1.18, 1); balloon.add(bb);
  const knot = mesh(new CylinderGeometry(0.02, 0.07, 0.1, 12), M.balloon); knot.position.y = -0.52; balloon.add(knot);
  const strCurve = new CatmullRomCurve3([new Vector3(0, -0.56, 0), new Vector3(0.06, -0.9, 0), new Vector3(-0.05, -1.3, 0), new Vector3(0.02, -1.75, 0)]);
  balloon.add(mesh(new TubeGeometry(strCurve, 32, 0.008, 6, false), M.ink, false));
  scene.add(balloon);

  // ------------------------------------------------------------ Zustände: verstreut (k = 0) → Platz (k = 1)
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const items = [];
  function item(obj, from, to, fromRot, toRot, float = 1) {
    const st = { k: 0, from: new Vector3(...from), to: to.clone ? to.clone() : new Vector3(...to), fr: new Vector3(...fromRot), tr: new Vector3(...toRot), float, ph: rnd() * 6.28 };
    items.push({ obj, st });
    return st;
  }
  // Lose Konstellation um den späteren Bauplatz, frei vom Textbereich links
  const SCATTER = [[-2.2, 3.4, -1], [2.5, 3.9, -0.6], [3.2, 1.5, 0.4], [-1.3, 1.0, 1.4], [1.3, 2.7, 1.3], [-2.6, 1.9, -0.6],
    [0.3, 4.3, -1.6], [2.0, 0.7, 2.0], [-0.5, 2.5, -2.2], [3.4, 3.0, -1.8], [-1.6, 4.4, 0.2]];
  const blockStates = blocks.map((b, i) => item(b.m, SCATTER[i % SCATTER.length], b.to, [rnd() * 3, rnd() * 3, rnd() * 3], [0, 0, 0]));
  const roofSt = item(roof, [0.6, 1.6, 0.8], ROOF_TO, [0.5, 0.7, -0.35], [0, 0, 0]);
  const doorSt = item(door, [2.7, 2.2, 1.9], [0, 0, 0], [0.4, -0.8, 0.3], [0, 0, 0]);
  const teddySt = item(teddy, [-1.2, 3.0, 2.0], [2.15, 0, 0.75], [0.3, 0.6, 0.4], [0, -0.5, 0]);
  const stethSt = item(steth, [3.6, 4.4, 0.2], [-1.95, 0.07, 1.35], [0.2, -0.4, 0.5], [-Math.PI / 2, 0, -0.3]);
  const balloonSt = item(balloon, [-2.4, 0.9, 1.2], [1.75, 3.7, -0.3], [0, 0, 0.2], [0, 0, -0.08], 1.6);
  for (const it of items) { it.obj.position.copy(it.st.from); it.obj.rotation.set(it.st.fr.x, it.st.fr.y, it.st.fr.z); }

  // ------------------------------------------------------------ Kamera-Stationen
  const cam = { px: 0, py: 2.4, pz: 13, tx: 0.2, ty: 2.0, tz: 0 };
  const K = {
    intro: { px: 0, py: 2.4, pz: 13, tx: 0.2, ty: 2.0, tz: 0 },
    sun: { px: -0.6, py: 1.4, pz: 11.5, tx: 0, ty: 2.6, tz: -2 },
    build: { px: 4.2, py: 3.6, pz: 9.2, tx: 0, ty: 1.2, tz: 0 },
    door: { px: 0.5, py: 1.5, pz: 7.4, tx: 0.2, ty: 1.05, tz: 0 },
  };
  Object.assign(cam, K.intro);
  const life = { sunUp: 0, rays: 0.25, open: 0, glow: 0, photo: 0 };

  // ------------------------------------------------------------ Zeitleiste (an Scroll gekoppelt)
  const T = [0, 1, 2.1, 3.3];
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" }, onUpdate: requestRender });
  const C = (k, d, at, ease) => tl.to(cam, { ...K[k], duration: d, ease: ease || "power2.inOut" }, at);
  // 1 Sonne geht auf
  C("sun", 1.0, 0.6);
  tl.to(life, { sunUp: 1, duration: 1.2, ease: "power2.out" }, 0.75);
  tl.to(life, { rays: 1, duration: 0.9, ease: "back.out(1.4)" }, 1.0);
  // 2 Alles fügt sich
  C("build", 1.1, 1.9);
  blockStates.forEach((s, i) => tl.to(s, { k: 1, duration: 0.7, ease: "power3.inOut" }, 2.0 + i * 0.045));
  tl.to(roofSt, { k: 1, duration: 0.6, ease: "power3.inOut" }, 2.55);
  tl.to(doorSt, { k: 1, duration: 0.55, ease: "power3.inOut" }, 2.5);
  tl.to(teddySt, { k: 1, duration: 0.8, ease: "power3.inOut" }, 2.15);
  tl.to(stethSt, { k: 1, duration: 0.8, ease: "power3.inOut" }, 2.3);
  tl.to(balloonSt, { k: 1, duration: 0.9, ease: "power2.inOut" }, 2.4);
  // 3 Die Praxis öffnet sich → Foto
  C("door", 1.0, 3.25, "power2.in");
  tl.to(life, { open: 1, duration: 0.55, ease: "power2.inOut" }, 3.3);
  tl.to(life, { glow: 1, duration: 0.5, ease: "power1.out" }, 3.35);
  tl.to(life, { photo: 1, duration: 0.55, ease: "power2.inOut" }, 3.95);
  tl.to({}, { duration: 0.15 }, 4.5);

  // ------------------------------------------------------------ Rendern
  const v = new Vector3();
  const rel = { x: 0, y: 0, w: 1, h: 1 };
  const stats = { frames: 0 };
  const perf = { sum: 0, n: 0, pr: Math.min(window.devicePixelRatio || 1, 2) };
  let W = 1, Hh = 1, chapter = -1, clock = 0, last = 0, running = false, dirty = true;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const lerp = MathUtils.lerp;

  function apply(time) {
    // Sonne
    const su = life.sunUp;
    sun.position.y = lerp(-2.6, 3.35, su);
    sun.rotation.z = time * 0.05;
    rays.forEach((r, i) => {
      r.pivot.rotation.z = r.a + Math.sin(time * 1.3 + i * 0.9) * 0.07;
      const s = life.rays * (1 + Math.sin(time * 1.7 + i * 1.3) * 0.05);
      r.r.scale.set(1, Math.max(0.001, s), 1);
      r.r.rotation.z = Math.sin(time * 1.1 + i) * 0.12;
    });
    SKY.copy(DAWN).lerp(DAY, su);
    rim.intensity = su * 1.6;
    key.intensity = 1.1 + su * 0.9;
    hemi.intensity = 0.95 + su * 0.35;
    // Wolken treiben, in Kapitel 2 weichen sie zur Seite
    const out = Math.min(1, blockStates[0].k * 1.2);
    clouds.forEach((c, i) => {
      const b = cloudBase[i];
      c.position.set(b[0] + Math.sin(time * 0.12 + i * 2) * 0.35 + Math.sign(b[0]) * out * 0.9, b[1] + Math.sin(time * 0.3 + i) * 0.08, b[2]);
    });
    // Objekte zwischen verstreut und Platz
    for (const { obj, st } of items) {
      const k = st.k, f = (1 - k) * st.float;
      obj.position.lerpVectors(st.from, st.to, k);
      obj.position.y += Math.sin(time * 0.9 + st.ph) * 0.18 * f;
      // Bogen beim Einfliegen
      obj.position.y += Math.sin(k * Math.PI) * 0.6;
      obj.rotation.set(
        lerp(st.fr.x, st.tr.x, k) + Math.sin(time * 0.5 + st.ph) * 0.25 * f,
        lerp(st.fr.y, st.tr.y, k) + time * 0.25 * f,
        lerp(st.fr.z, st.tr.z, k) + Math.cos(time * 0.6 + st.ph) * 0.2 * f);
    }
    balloon.rotation.z += Math.sin(time * 0.8) * 0.04 * balloonSt.k;
    // Tür, Licht innen
    doorL.rotation.y = -life.open * 1.75;
    doorR.rotation.y = life.open * 1.75;
    glow.intensity = life.glow * 4;
    M.inside.emissiveIntensity = life.glow * 0.9;
    // Schatten werden kräftiger, je näher die Formen am Boden sind
    shadowCatcher.opacity = 0.05 + blockStates[blockStates.length - 1].k * 0.1;
    // Kamera mit Mausparallaxe
    const f = W / Hh < 0.8 ? 1.42 : W / Hh < 1.2 ? 1.2 : 1;
    const par = 1 - life.open * 0.8;
    camera.position.set(
      cam.tx + (cam.px - cam.tx) * f + ptr.x * 0.55 * par,
      cam.ty + (cam.py - cam.ty) * f - ptr.y * 0.3 * par,
      cam.tz + (cam.pz - cam.tz) * f);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
  }

  function render() {
    apply(clock);
    // Bild nach rechts (Desktop) bzw. oben (Hochformat) verschieben, damit der Text Platz hat
    const shift = portrait0() ? 1 - life.open * 0.6 : 1;
    const portrait = W / Hh < 0.9;
    const offX = portrait || root.classList.contains("h3d--static") ? 0 : -W * 0.18 * shift;
    const offY = portrait && !root.classList.contains("h3d--static") ? Hh * 0.15 * shift : 0;
    camera.setViewOffset(W, Hh, offX, offY, W, Hh);
    renderer.render(scene, camera);
    // Foto öffnet sich aus der Tür
    if (photo) {
      v.copy(DOOR_POINT).project(camera);
      const px = (((v.x + 1) / 2) * W + rel.x) / rel.w * 100, py = (((1 - v.y) / 2) * Hh + rel.y) / rel.h * 100;
      photo.style.setProperty("--px", px.toFixed(2) + "%");
      photo.style.setProperty("--py", py.toFixed(2) + "%");
      photo.style.setProperty("--pr", (life.photo * 150).toFixed(2) + "%");
      photo.style.setProperty("--ps", (1.15 - life.photo * 0.15).toFixed(3));
      photo.toggleAttribute("data-on", life.photo > 0.001);
    }
    const t = tl.time();
    let idx = 0;
    for (let i = 0; i < T.length; i++) if (t >= T[i] - 0.001) idx = i;
    if (idx !== chapter) {
      chapter = idx;
      chapters.forEach((c, i) => c.toggleAttribute("data-active", i === idx));
      rail.forEach((b, i) => { if (i === idx) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    }
    root.style.setProperty("--h3d-p", (t / tl.duration()).toFixed(4));
    dirty = false;
    stats.frames++;
  }
  function portrait0() { return W / Hh < 0.9; }
  function requestRender() { dirty = true; if (!running) render(); }

  // Ruhige Eigenbewegung nur, solange die Szene sichtbar ist
  let inView = true;
  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    clock += dt;
    // Adaptive Auflösung: bei dauerhaft langsamen Bildern die Pixeldichte senken
    perf.sum += dt; perf.n++;
    if (perf.n >= 40) {
      const avg = perf.sum / perf.n;
      perf.sum = 0; perf.n = 0;
      if (avg > 1 / 28 && perf.pr > 0.55) { perf.pr = Math.max(0.55, perf.pr * 0.8); renderer.setPixelRatio(perf.pr); resize(); }
    }
    ptr.x += (ptr.tx - ptr.x) * 0.06;
    ptr.y += (ptr.ty - ptr.y) * 0.06;
    render();
    requestAnimationFrame(loop);
  }
  function setRunning(on) {
    on = on && inView && !doc.hidden && !reduce;
    if (on === running) return;
    running = on;
    if (on) { last = performance.now(); requestAnimationFrame(loop); }
  }

  function resize() {
    const r = canvasBox.getBoundingClientRect();
    W = Math.max(1, r.width); Hh = Math.max(1, r.height);
    renderer.setSize(W, Hh, false);
    if (photo) { const f = photo.getBoundingClientRect(); Object.assign(rel, { x: r.left - f.left, y: r.top - f.top, w: Math.max(1, f.width), h: Math.max(1, f.height) }); }
    camera.aspect = W / Hh;
    camera.fov = W / Hh < 0.9 ? 46 : 34;
    camera.updateProjectionMatrix();
    render();
  }
  new ResizeObserver(resize).observe(canvasBox);

  // ------------------------------------------------------------ Standbild (reduzierte Bewegung)
  if (reduce) {
    root.classList.add("h3d--static");
    tl.progress(0.74); // Sonne oben, Praxis fertig, Tür noch zu
    life.photo = 0;
    Object.assign(cam, { px: 3.6, py: 3.2, pz: 9.6, tx: 0, ty: 1.5, tz: 0 });
    clock = 1.2;
    resize();
    window.__hero = { tl, st: null, static: true };
    return;
  }

  // ------------------------------------------------------------ Scroll
  gsap.registerPlugin(ScrollTrigger);
  const topH = () => parseFloat(getComputedStyle(doc.documentElement).getPropertyValue("--top-h")) || 72;
  const st = ScrollTrigger.create({
    trigger: root.querySelector("[data-h3d-pin]"),
    start: () => "top " + topH() + "px",
    end: () => "+=" + Math.round(innerHeight * 4.2),
    pin: true,
    scrub: 0.6,
    animation: tl,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    refreshPriority: 10,
  });
  rail.forEach((b) => b.addEventListener("click", () => {
    const i = +b.getAttribute("data-goto-chapter");
    const time = i === 0 ? 0 : i >= 3 ? tl.duration() : T[i] + 0.5;
    const y = st.start + (st.end - st.start) * (time / tl.duration());
    window.scrollTo({ top: Math.ceil(y) + (i === 0 ? 0 : 1), behavior: "auto" });
  }));

  // Mausparallaxe
  if (matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", (e) => { ptr.tx = (e.clientX / innerWidth) * 2 - 1; ptr.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  }
  new IntersectionObserver((en) => { inView = en[0].isIntersecting; setRunning(true); }).observe(root);
  doc.addEventListener("visibilitychange", () => setRunning(true));
  window.__hero = { tl, st, static: false, stats };
  resize();
  setRunning(true);
}
