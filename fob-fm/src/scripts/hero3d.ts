// 3D-Szene im Startbereich: Haus im „Bauplan“-Stil (Linien wie das Firmenzeichen, goldene Flächen),
// Luft-Wasser-Wärmepumpe mit drehendem Ventilator, kalte Außenluft (blau) strömt ein, Wärme (gold) fließt ins Haus.
// Wird erst nach dem Laden nachgeladen; pausiert außerhalb des Sichtbereichs und bei verstecktem Tab.
// Reduzierte Bewegung: ein ruhiges Standbild.
import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, BoxGeometry, EdgesGeometry, LineSegments, LineBasicMaterial,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, BufferGeometry, Float32BufferAttribute, Points, PointsMaterial,
  CatmullRomCurve3, Vector3, TubeGeometry, AmbientLight, DirectionalLight, GridHelper, DoubleSide, CylinderGeometry,
  RingGeometry, AdditiveBlending, Fog, CanvasTexture,
} from "three";

const PAPER = 0xf3f1ec, GOLD = 0xd9a21b, ICE = 0x8fd0ef, WARM = 0xffc76a, STEEL = 0x2c3137;

/** Runder, weicher Punkt für die Partikel */
const dot = () => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!, r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,0.8)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
};

export function mount(host: HTMLElement, opts: { calm: boolean }): { setPaused: (p: boolean) => void } {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  host.prepend(renderer.domElement); // vor Knopf und Beschriftung, damit diese bedienbar bleiben
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new Scene();
  scene.fog = new Fog(0x17191c, 14, 30);
  const camera = new PerspectiveCamera(34, 1, 0.1, 100);
  scene.add(new AmbientLight(0xffffff, 0.55));
  const sun = new DirectionalLight(0xffffff, 1.1); sun.position.set(5, 8, 6); scene.add(sun);

  const world = new Group(); scene.add(world);
  const line = (geo: BufferGeometry, color = PAPER, opacity = 1) => new LineSegments(new EdgesGeometry(geo), new LineBasicMaterial({ color, transparent: opacity < 1, opacity }));

  // Boden-Raster wie ein Bauplan
  const grid = new GridHelper(22, 22, 0x3b4148, 0x2a2f35); grid.position.y = -0.001; world.add(grid);

  // ---------- Haus ----------
  const house = new Group(); house.position.set(0.9, 0, 0); world.add(house);
  const W = 4, H = 2.6, D = 3;
  const body = line(new BoxGeometry(W, H, D)); body.position.y = H / 2; house.add(body);
  // Satteldach als Linien
  const r = new BufferGeometry();
  const rh = 1.3, y = H;
  const v = [
    -W / 2, y, -D / 2, 0, y + rh, -D / 2,  0, y + rh, -D / 2, W / 2, y, -D / 2,
    -W / 2, y, D / 2, 0, y + rh, D / 2,    0, y + rh, D / 2, W / 2, y, D / 2,
    0, y + rh, -D / 2, 0, y + rh, D / 2,
  ];
  r.setAttribute("position", new Float32BufferAttribute(v, 3));
  house.add(new LineSegments(r, new LineBasicMaterial({ color: PAPER })));
  // goldene Flächen wie im Firmenzeichen
  const goldMat = new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.88, side: DoubleSide });
  const g1 = new Mesh(new PlaneGeometry(1.5, 2.3), goldMat); g1.position.set(0.9, 1.15, -D / 2 + 0.01); house.add(g1);
  const g2 = new Mesh(new PlaneGeometry(1.4, 1.1), goldMat); g2.rotation.y = Math.PI / 2; g2.position.set(-W / 2 - 0.01, 1.2, 0.4); house.add(g2);
  // innerer Versatz-Rahmen (Motiv aus dem Logo)
  const inner = line(new BoxGeometry(2.2, 1.6, 0.02), PAPER, 0.5); inner.position.set(-0.6, 1.3, D / 2 + 0.25); house.add(inner);
  // Fenster, die warm aufleuchten
  const winMat = new MeshBasicMaterial({ color: WARM, transparent: true, opacity: 0.15 });
  const wins: Mesh[] = [];
  for (const [x, yy] of [[-1.2, 1.7], [0, 1.7], [1.2, 1.7], [-1.2, 0.7], [1.2, 0.7]]) {
    const m = new Mesh(new PlaneGeometry(0.6, 0.55), winMat.clone()); m.position.set(x, yy, D / 2 + 0.012); house.add(m); wins.push(m);
    const f = line(new PlaneGeometry(0.6, 0.55), PAPER, 0.7); f.position.copy(m.position); house.add(f);
  }
  const door = line(new PlaneGeometry(0.7, 1.15), PAPER, 0.8); door.position.set(0, 0.58, D / 2 + 0.012); house.add(door);

  // ---------- Wärmepumpe ----------
  const hp = new Group(); hp.position.set(-2.55, 0, 1.0); hp.rotation.y = 0.35; world.add(hp);
  const unit = new Mesh(new BoxGeometry(1.5, 1.05, 0.55), new MeshStandardMaterial({ color: STEEL, roughness: 0.55, metalness: 0.35 }));
  unit.position.y = 0.62; hp.add(unit);
  const ue = line(new BoxGeometry(1.5, 1.05, 0.55), GOLD); ue.position.copy(unit.position); hp.add(ue);
  const feet = new Mesh(new BoxGeometry(1.3, 0.1, 0.5), new MeshStandardMaterial({ color: 0x1d2125 })); feet.position.y = 0.05; hp.add(feet);
  const ring = new Mesh(new RingGeometry(0.33, 0.37, 48), new MeshBasicMaterial({ color: PAPER, side: DoubleSide })); ring.position.set(-0.25, 0.62, 0.28); hp.add(ring);
  const fan = new Group(); fan.position.copy(ring.position); hp.add(fan);
  // fünf breite, leicht angestellte Flügel + Schutzgitter-Ringe
  for (let i = 0; i < 5; i++) {
    const bl = new Mesh(new BoxGeometry(0.13, 0.27, 0.01), new MeshBasicMaterial({ color: 0x9aa1a9 }));
    bl.position.y = 0.16; bl.rotation.y = 0.5; const arm = new Group(); arm.rotation.z = (i * Math.PI * 2) / 5; arm.add(bl); fan.add(arm);
  }
  for (const rr of [0.12, 0.22]) { const g = new Mesh(new RingGeometry(rr, rr + 0.008, 40), new MeshBasicMaterial({ color: 0x6b737c, side: DoubleSide })); g.position.set(-0.25, 0.62, 0.29); hp.add(g); }
  const hub = new Mesh(new CylinderGeometry(0.05, 0.05, 0.03, 16), new MeshBasicMaterial({ color: GOLD })); hub.rotation.x = Math.PI / 2; fan.add(hub);
  // Lamellen rechts
  for (let i = 0; i < 6; i++) { const l = new Mesh(new BoxGeometry(0.42, 0.015, 0.01), new MeshBasicMaterial({ color: 0x5a626b })); l.position.set(0.42, 0.38 + i * 0.09, 0.28); hp.add(l); }

  // ---------- Leitung Wärmepumpe → Haus ----------
  const hpOut = new Vector3(-1.85, 0.35, 1.05), houseIn = new Vector3(-1.1 + 0.9 - 0.1, 0.35, 1.0);
  const curve = new CatmullRomCurve3([hpOut, new Vector3(-1.5, 0.12, 1.25), new Vector3(-1.25, 0.12, 1.2), new Vector3(houseIn.x - 0.6, 0.3, 1.0), new Vector3(houseIn.x - 0.1, 0.9, 0.7)]);
  world.add(new Mesh(new TubeGeometry(curve, 60, 0.035, 8, false), new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.6 })));

  // ---------- Partikel ----------
  const tex = dot();
  const N_COLD = 120, N_WARM = 70;
  const cold = new Float32Array(N_COLD * 3), coldT = new Float32Array(N_COLD);
  const coldSeed = Array.from({ length: N_COLD }, () => ({ y: 0.25 + Math.random() * 0.8, z: (Math.random() - 0.5) * 0.9, sp: 0.15 + Math.random() * 0.2 }));
  for (let i = 0; i < N_COLD; i++) coldT[i] = Math.random();
  const coldGeo = new BufferGeometry(); coldGeo.setAttribute("position", new Float32BufferAttribute(cold, 3));
  const coldPts = new Points(coldGeo, new PointsMaterial({ color: ICE, size: 0.09, map: tex, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.85 }));
  world.add(coldPts);
  const warm = new Float32Array(N_WARM * 3), warmT = Array.from({ length: N_WARM }, () => Math.random());
  const warmGeo = new BufferGeometry(); warmGeo.setAttribute("position", new Float32BufferAttribute(warm, 3));
  const warmPts = new Points(warmGeo, new PointsMaterial({ color: WARM, size: 0.12, map: tex, transparent: true, depthWrite: false, blending: AdditiveBlending }));
  world.add(warmPts);
  // Wärme im Haus: aufsteigende Funken
  const N_IN = 40, inPos = new Float32Array(N_IN * 3), inSeed = Array.from({ length: N_IN }, () => ({ x: (Math.random() - 0.5) * 3.4, z: (Math.random() - 0.5) * 2.4, t: Math.random() }));
  const inGeo = new BufferGeometry(); inGeo.setAttribute("position", new Float32BufferAttribute(inPos, 3));
  const inPts = new Points(inGeo, new PointsMaterial({ color: WARM, size: 0.08, map: tex, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.7 }));
  inPts.position.copy(house.position); world.add(inPts);

  // ---------- Kamera, Zeiger, Scrollen ----------
  let px = 0, py = 0, tx = 0, ty = 0, scrollP = 0;
  const onPointer = (e: PointerEvent) => { const b = host.getBoundingClientRect(); tx = ((e.clientX - b.left) / b.width - 0.5) * 2; ty = ((e.clientY - b.top) / b.height - 0.5) * 2; };
  if (!opts.calm) addEventListener("pointermove", onPointer, { passive: true });
  const onScroll = () => { const b = host.getBoundingClientRect(); scrollP = Math.min(1, Math.max(0, -b.top / Math.max(1, b.height))); };
  if (!opts.calm) addEventListener("scroll", onScroll, { passive: true });

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // auf schmalen Flächen weiter weg, damit Haus + Pumpe ins Bild passen
    camera.fov = w / h < 1 ? 46 : 34; camera.updateProjectionMatrix();
  };
  let calmDraw = () => {};
  new ResizeObserver(() => { resize(); calmDraw(); }).observe(host); resize();

  let t = 0, heat = opts.calm ? 1 : 0, last = performance.now(), raf = 0, visible = true, paused = false;
  const tmp = new Vector3();
  const frame = (now: number) => {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; t += dt; // rAF-Zeit kann vor performance.now() liegen
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    const ang = (opts.calm ? 0.55 : 0.55 + Math.sin(t * 0.15) * 0.25) + px * 0.25 + scrollP * 0.9;
    const dist = 11.5, el = 4.2 - py * 0.8 + scrollP * 1.2;
    camera.position.set(Math.sin(ang) * dist, el, Math.cos(ang) * dist);
    camera.lookAt(0, 1.2, 0);

    fan.rotation.z -= dt * 9;
    heat = Math.min(1, heat + dt * 0.25);
    // kalte Luft: von links in die Pumpe
    const front = new Vector3(-0.25, 0.62, 0.28); hp.localToWorld(front);
    for (let i = 0; i < N_COLD; i++) {
      coldT[i] = (coldT[i] + dt * coldSeed[i].sp) % 1;
      const s = coldT[i], c = coldSeed[i];
      tmp.set(front.x - 4.2 * (1 - s) + Math.sin(t * 2 + i) * 0.05, front.y + (c.y - 0.6) * (1 - s), front.z + 1.6 * (1 - s) + c.z * (1 - s));
      cold[i * 3] = tmp.x; cold[i * 3 + 1] = tmp.y; cold[i * 3 + 2] = tmp.z;
    }
    coldGeo.attributes.position.needsUpdate = true;
    // Wärme: entlang der Leitung ins Haus
    for (let i = 0; i < N_WARM; i++) {
      warmT[i] = (warmT[i] + dt * 0.22) % 1;
      curve.getPointAt(warmT[i], tmp);
      warm[i * 3] = tmp.x; warm[i * 3 + 1] = tmp.y + Math.sin(t * 6 + i) * 0.015; warm[i * 3 + 2] = tmp.z;
    }
    warmGeo.attributes.position.needsUpdate = true;
    (warmPts.material as PointsMaterial).opacity = 0.35 + heat * 0.65;
    for (let i = 0; i < N_IN; i++) {
      const s = inSeed[i]; s.t = (s.t + dt * 0.12) % 1;
      inPos[i * 3] = s.x; inPos[i * 3 + 1] = 0.2 + s.t * 2.3; inPos[i * 3 + 2] = s.z;
    }
    inGeo.attributes.position.needsUpdate = true;
    (inPts.material as PointsMaterial).opacity = heat * 0.6;
    wins.forEach((w, i) => ((w.material as MeshBasicMaterial).opacity = 0.12 + heat * (0.55 + Math.sin(t * 1.5 + i) * 0.08)));

    renderer.render(scene, camera);
    if (!opts.calm && !paused && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const start = () => { cancelAnimationFrame(raf); if (paused) return; last = performance.now(); raf = requestAnimationFrame(frame); };
  if (opts.calm) { calmDraw = () => frame(performance.now()); calmDraw(); return { setPaused: () => {} }; }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(host);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible && !paused) start(); });
  start();
  return { setPaused: (p: boolean) => { paused = p; if (!p) start(); else cancelAnimationFrame(raf); } };
}
