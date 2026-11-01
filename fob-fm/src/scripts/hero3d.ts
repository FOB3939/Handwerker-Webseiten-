// 3D-Szene im Startbereich: Schnittmodell eines Hauses als Strangschema.
// Die Luft-Wasser-Wärmepumpe saugt Außenluft an (blau), der Vorlauf (rot) bringt Wärme zu den Heizkörpern
// in beiden Geschossen, der Rücklauf (blau) fließt zurück. Vorderwand offen, damit man hineinsieht.
// Wird erst nach dem Laden nachgeladen; pausiert außerhalb des Sichtbereichs und bei verstecktem Tab.
// Reduzierte Bewegung: ein ruhiges Standbild.
import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, BoxGeometry, EdgesGeometry, LineSegments, LineBasicMaterial,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, BufferGeometry, Float32BufferAttribute, Points, PointsMaterial,
  Vector3, TubeGeometry, AmbientLight, DirectionalLight, DoubleSide, CylinderGeometry, RingGeometry, AdditiveBlending,
  Fog, CanvasTexture, CurvePath, LineCurve3,
} from "three";

const MINT = 0xd4e6da, TANNE = 0x1d3a2e, WALL = 0x2f5a47, BRASS = 0xd9a21b, VOR = 0xff6a4a, RUECK = 0x6fb7ec, WARM = 0xffb35c, STEEL = 0x3c4a44;

/** Runder, weicher Punkt für die Partikel */
const dot = () => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!, r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,0.8)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
};

/** Rohrleitung als rechtwinkliger Strang (wie im Strangschema) */
const strang = (pts: number[][]) => {
  const path = new CurvePath<Vector3>();
  for (let i = 1; i < pts.length; i++) path.add(new LineCurve3(new Vector3(...pts[i - 1]), new Vector3(...pts[i])));
  return path;
};

export function mount(host: HTMLElement, opts: { calm: boolean }): { setPaused: (p: boolean) => void } {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  host.prepend(renderer.domElement); // vor Knopf und Beschriftung, damit diese bedienbar bleiben
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new Scene();
  scene.fog = new Fog(TANNE, 15, 32);
  const camera = new PerspectiveCamera(34, 1, 0.1, 100);
  scene.add(new AmbientLight(0xffffff, 0.7));
  const sun = new DirectionalLight(0xfff4e0, 1.2); sun.position.set(4, 9, 7); scene.add(sun);

  const world = new Group(); scene.add(world);
  const edges = (geo: BufferGeometry, color = MINT, opacity = 1) => new LineSegments(new EdgesGeometry(geo), new LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
  const lines = (v: number[], color = MINT, opacity = 1) => { const g = new BufferGeometry(); g.setAttribute("position", new Float32BufferAttribute(v, 3)); return new LineSegments(g, new LineBasicMaterial({ color, transparent: opacity < 1, opacity })); };

  // Grundplatte mit feinem Raster
  const plate = new Mesh(new BoxGeometry(8.6, 0.12, 5.2), new MeshStandardMaterial({ color: 0x24473a, roughness: 0.9 }));
  plate.position.set(0.1, -0.06, 0.2); world.add(plate);
  const plateEdge = edges(new BoxGeometry(8.6, 0.12, 5.2), MINT, 0.35); plateEdge.position.copy(plate.position); world.add(plateEdge);
  const gv: number[] = [];
  for (let x = -4; x <= 4.21; x += 0.5) gv.push(x + 0.1, 0.002, -2.4, x + 0.1, 0.002, 2.8);
  for (let z = -2.4; z <= 2.81; z += 0.5) gv.push(-4.2, 0.002, z, 4.4, 0.002, z);
  world.add(lines(gv, MINT, 0.07));

  // ---------- Haus im Schnitt (x −1.4 … 3.2, zwei Geschosse, Vorderwand offen) ----------
  const X0 = -1.4, X1 = 3.2, Z0 = -1.5, Z1 = 1.5, H = 2.6, HF = 1.3, RH = 1.25;
  const house = new Group(); world.add(house);
  const wallMat = new MeshStandardMaterial({ color: WALL, transparent: true, opacity: 0.55, side: DoubleSide, roughness: 1 });
  const back = new Mesh(new PlaneGeometry(X1 - X0, H), wallMat); back.position.set((X0 + X1) / 2, H / 2, Z0); house.add(back);
  for (const x of [X0, X1]) { const s = new Mesh(new PlaneGeometry(Z1 - Z0, H), wallMat); s.rotation.y = Math.PI / 2; s.position.set(x, H / 2, 0); house.add(s); }
  const slab = new Mesh(new BoxGeometry(X1 - X0, 0.1, Z1 - Z0), new MeshStandardMaterial({ color: 0x3d6b56, roughness: 1 }));
  slab.position.set((X0 + X1) / 2, HF, 0); house.add(slab);
  const slabEdge = edges(new BoxGeometry(X1 - X0, 0.1, Z1 - Z0), MINT, 0.6); slabEdge.position.copy(slab.position); house.add(slabEdge);
  const box = edges(new BoxGeometry(X1 - X0, H, Z1 - Z0)); box.position.set((X0 + X1) / 2, H / 2, 0); house.add(box);
  // Satteldach (First entlang z) als Linien
  const xm = (X0 + X1) / 2;
  house.add(lines([X0, H, Z0, xm, H + RH, Z0, xm, H + RH, Z0, X1, H, Z0, X0, H, Z1, xm, H + RH, Z1, xm, H + RH, Z1, X1, H, Z1, xm, H + RH, Z0, xm, H + RH, Z1]));
  // Fenster in der linken Wand (zur Wärmepumpe) leuchten warm auf, sobald Wärme ankommt
  const wins: Mesh[] = [];
  for (const [z, y] of [[-0.6, 0.75], [0.6, 0.75], [-0.6, 2.0], [0.6, 2.0]]) {
    const m = new Mesh(new PlaneGeometry(0.6, 0.55), new MeshBasicMaterial({ color: WARM, transparent: true, opacity: 0.1, side: DoubleSide }));
    m.rotation.y = Math.PI / 2; m.position.set(X0 - 0.012, y, z); house.add(m); wins.push(m);
    const f = edges(new PlaneGeometry(0.6, 0.55), MINT, 0.8); f.rotation.y = Math.PI / 2; f.position.copy(m.position); house.add(f);
  }
  // Messingflächen aus dem Firmenzeichen an der rechten Außenwand
  const brassMat = new MeshBasicMaterial({ color: BRASS, transparent: true, opacity: 0.9, side: DoubleSide });
  const b1 = new Mesh(new PlaneGeometry(1.0, 2.0), brassMat); b1.rotation.y = Math.PI / 2; b1.position.set(X1 + 0.012, 1.15, -0.55); house.add(b1);
  const b2 = new Mesh(new PlaneGeometry(1.1, 0.9), brassMat); b2.rotation.y = Math.PI / 2; b2.position.set(X1 + 0.012, 1.0, 0.75); house.add(b2);

  // Heizkörper (Rippen als Linien) und Warmwasserspeicher
  const radMat = new MeshStandardMaterial({ color: 0xe9efe9, roughness: 0.5 });
  const rads: [number, number][] = [[0.5, 0.75], [2.1, 0.75], [0.3, 2.05], [2.1, 2.05]];
  for (const [x, y] of rads) {
    const r = new Mesh(new BoxGeometry(0.95, 0.46, 0.09), radMat); r.position.set(x, y, Z0 + 0.2); house.add(r);
    const rib: number[] = []; for (let i = -0.4; i <= 0.41; i += 0.1) rib.push(x + i, y - 0.21, Z0 + 0.25, x + i, y + 0.21, Z0 + 0.25);
    house.add(lines(rib, 0x8aa596));
  }
  const tank = new Mesh(new CylinderGeometry(0.28, 0.28, 1.0, 28), new MeshStandardMaterial({ color: 0xdfe8e1, roughness: 0.45 }));
  tank.position.set(-0.55, 0.52, 0.55); house.add(tank);
  const tankEdge = edges(new CylinderGeometry(0.28, 0.28, 1.0, 14), 0x8aa596, 0.6); tankEdge.position.copy(tank.position); house.add(tankEdge);

  // ---------- Wärmepumpe (Außengerät) ----------
  const hp = new Group(); hp.position.set(-2.95, 0, 0.75); hp.rotation.y = 0.28; world.add(hp);
  const unit = new Mesh(new BoxGeometry(1.4, 1.0, 0.5), new MeshStandardMaterial({ color: STEEL, roughness: 0.5, metalness: 0.3 }));
  unit.position.y = 0.58; hp.add(unit);
  const ue = edges(new BoxGeometry(1.4, 1.0, 0.5), BRASS); ue.position.copy(unit.position); hp.add(ue);
  const feet = new Mesh(new BoxGeometry(1.2, 0.08, 0.46), new MeshStandardMaterial({ color: 0x17251f })); feet.position.y = 0.04; hp.add(feet);
  const ring = new Mesh(new RingGeometry(0.31, 0.35, 48), new MeshBasicMaterial({ color: MINT, side: DoubleSide })); ring.position.set(-0.24, 0.58, 0.26); hp.add(ring);
  const fan = new Group(); fan.position.copy(ring.position); hp.add(fan);
  for (let i = 0; i < 5; i++) {
    const bl = new Mesh(new BoxGeometry(0.12, 0.25, 0.01), new MeshBasicMaterial({ color: 0xa9bab0 }));
    bl.position.y = 0.15; bl.rotation.y = 0.5; const arm = new Group(); arm.rotation.z = (i * Math.PI * 2) / 5; arm.add(bl); fan.add(arm);
  }
  for (const rr of [0.11, 0.21]) { const g = new Mesh(new RingGeometry(rr, rr + 0.008, 40), new MeshBasicMaterial({ color: 0x6f8579, side: DoubleSide })); g.position.set(-0.24, 0.58, 0.27); hp.add(g); }
  const hub = new Mesh(new CylinderGeometry(0.05, 0.05, 0.03, 16), new MeshBasicMaterial({ color: BRASS })); hub.rotation.x = Math.PI / 2; fan.add(hub);
  for (let i = 0; i < 6; i++) { const l = new Mesh(new BoxGeometry(0.4, 0.014, 0.01), new MeshBasicMaterial({ color: 0x6f8579 })); l.position.set(0.4, 0.36 + i * 0.085, 0.26); hp.add(l); }

  // ---------- Vorlauf und Rücklauf ----------
  const V = [[-2.3, 0.45, 0.62], [-1.85, 0.45, 0.62], [-1.85, 0.3, 0.62], [-1.15, 0.3, 0.62], [-1.15, 0.3, -1.2], [2.95, 0.3, -1.2], [2.95, 1.58, -1.2], [-0.9, 1.58, -1.2]];
  const R = V.map(([x, y, z], i) => [i === 0 ? x : x + 0.13, y - 0.13, z + 0.13]);
  const vor = strang(V), rueck = strang(R);
  world.add(new Mesh(new TubeGeometry(vor, 120, 0.038, 8, false), new MeshBasicMaterial({ color: VOR, transparent: true, opacity: 0.8 })));
  world.add(new Mesh(new TubeGeometry(rueck, 120, 0.038, 8, false), new MeshBasicMaterial({ color: RUECK, transparent: true, opacity: 0.75 })));
  // Anschlüsse der Heizkörper: Vorlauf links, Rücklauf rechts
  const conn: number[] = [], connR: number[] = [];
  for (const [x, y] of rads) {
    const pv = y < 1.3 ? 0.3 : 1.58, pr = pv - 0.13;
    conn.push(x - 0.4, pv, -1.2, x - 0.4, y - 0.23, Z0 + 0.2);
    connR.push(x + 0.4, pr, -1.07, x + 0.4, y - 0.23, Z0 + 0.2);
  }
  world.add(lines(conn, VOR)); world.add(lines(connR, RUECK));

  // ---------- Partikel ----------
  const tex = dot();
  const pts = (n: number, color: number, size: number, opacity = 1) => {
    const arr = new Float32Array(n * 3), geo = new BufferGeometry(); geo.setAttribute("position", new Float32BufferAttribute(arr, 3));
    const p = new Points(geo, new PointsMaterial({ color, size, map: tex, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity })); world.add(p);
    return { arr, geo, p };
  };
  const N_AIR = 110, air = pts(N_AIR, RUECK, 0.09, 0.85), airT = Float32Array.from({ length: N_AIR }, () => Math.random());
  const airSeed = Array.from({ length: N_AIR }, () => ({ y: 0.25 + Math.random() * 0.75, z: (Math.random() - 0.5) * 0.9, sp: 0.15 + Math.random() * 0.2 }));
  const N_V = 80, hot = pts(N_V, WARM, 0.12), hotT = Array.from({ length: N_V }, (_, i) => i / N_V);
  const N_R = 60, back2 = pts(N_R, RUECK, 0.09, 0.7), backT = Array.from({ length: N_R }, (_, i) => i / N_R);
  // aufsteigende Wärme über den Heizkörpern
  const N_UP = 36, up = pts(N_UP, WARM, 0.07, 0.6), upSeed = Array.from({ length: N_UP }, (_, i) => ({ r: i % rads.length, x: (Math.random() - 0.5) * 0.8, t: Math.random() }));

  // ---------- Kamera, Zeiger, Scrollen ----------
  let px = 0, py = 0, tx = 0, ty = 0, scrollP = 0;
  const onPointer = (e: PointerEvent) => { const b = host.getBoundingClientRect(); tx = ((e.clientX - b.left) / b.width - 0.5) * 2; ty = ((e.clientY - b.top) / b.height - 0.5) * 2; };
  if (!opts.calm) addEventListener("pointermove", onPointer, { passive: true });
  const onScroll = () => { const b = host.getBoundingClientRect(); scrollP = Math.min(1, Math.max(0, -b.top / Math.max(1, b.height))); };
  if (!opts.calm) addEventListener("scroll", onScroll, { passive: true });

  let narrow = false;
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    narrow = w < 700 || w / h < 1.1; // auf schmalen Flächen weiter weg, damit Haus + Pumpe ins Bild passen
    camera.fov = narrow ? 38 : 33; camera.updateProjectionMatrix();
  };
  let calmDraw = () => {};
  new ResizeObserver(() => { resize(); calmDraw(); }).observe(host); resize();

  let t = 0, heat = opts.calm ? 1 : 0, last = performance.now(), raf = 0, visible = true, paused = false;
  const tmp = new Vector3(), front = new Vector3();
  const frame = (now: number) => {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; t += dt; // rAF-Zeit kann vor performance.now() liegen
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    const ang = (opts.calm ? 0.42 : 0.42 + Math.sin(t * 0.13) * 0.2) + px * 0.22 + scrollP * 0.6;
    const dist = narrow ? 11.5 : 8.4, el = 3.6 - py * 0.7 + scrollP * 1.2;
    camera.position.set(0.1 + Math.sin(ang) * dist, el, Math.cos(ang) * dist);
    camera.lookAt(0.15, 1.05, 0);

    fan.rotation.z -= dt * 9;
    heat = Math.min(1, heat + dt * 0.22);
    // Außenluft: von vorn links in den Ventilator
    front.set(-0.24, 0.58, 0.26); hp.localToWorld(front);
    for (let i = 0; i < N_AIR; i++) {
      airT[i] = (airT[i] + dt * airSeed[i].sp) % 1;
      const s = airT[i], c = airSeed[i];
      air.arr[i * 3] = front.x - 3.4 * (1 - s) + Math.sin(t * 2 + i) * 0.05;
      air.arr[i * 3 + 1] = front.y + (c.y - 0.6) * (1 - s);
      air.arr[i * 3 + 2] = front.z + 2.2 * (1 - s) + c.z * (1 - s);
    }
    air.geo.attributes.position.needsUpdate = true;
    // Vorlauf vorwärts, Rücklauf zurück
    for (let i = 0; i < N_V; i++) { hotT[i] = (hotT[i] + dt * 0.07) % 1; vor.getPointAt(hotT[i], tmp); hot.arr.set([tmp.x, tmp.y, tmp.z], i * 3); }
    hot.geo.attributes.position.needsUpdate = true;
    for (let i = 0; i < N_R; i++) { backT[i] = (backT[i] - dt * 0.07 + 1) % 1; rueck.getPointAt(backT[i], tmp); back2.arr.set([tmp.x, tmp.y, tmp.z], i * 3); }
    back2.geo.attributes.position.needsUpdate = true;
    (hot.p.material as PointsMaterial).opacity = 0.3 + heat * 0.7;
    for (let i = 0; i < N_UP; i++) {
      const s = upSeed[i], [rx, ry] = rads[s.r]; s.t = (s.t + dt * 0.18) % 1;
      up.arr.set([rx + s.x, ry + 0.25 + s.t * 0.85, Z0 + 0.3 + s.t * 0.5], i * 3);
    }
    up.geo.attributes.position.needsUpdate = true;
    (up.p.material as PointsMaterial).opacity = heat * 0.6;
    wins.forEach((w, i) => ((w.material as MeshBasicMaterial).opacity = 0.08 + heat * (0.5 + Math.sin(t * 1.4 + i) * 0.08)));

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
