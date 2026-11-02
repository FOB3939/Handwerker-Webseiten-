// Filmische Kamerafahrt durch die Praxis (Three.js + GSAP ScrollTrigger), nur mit den echten Fotos.
// Jedes Foto ist eine Bildebene im Raum. Die Kamera fährt auf die Eingangstür zu; die Tür wird zur Bildmaske,
// durch die man zum Empfang hineinfliegt. Danach gleitet sie mit Tiefenstaffelung, Fokusunschärfe und Lichtfahne
// von Raum zu Raum. Ausgeschnittene Vordergrund-Ebenen (von Hand gezeichnete Masken) liegen etwas vor ihrem Foto
// und erzeugen echten Parallax. Farbkorrektur leicht warm, Vignette und feines Filmkorn im Shader.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Mesh, PlaneGeometry, ShaderMaterial, Texture,
  LinearMipmapLinearFilter, LinearFilter, Vector2, Vector3, Vector4, MathUtils,
} from "three";

const doc = document;
const root = doc.querySelector("[data-h3d]");

const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const FRAG = /* glsl */`
uniform sampler2D map;
uniform float uOpacity, uBlur, uDim, uTime, uLeak, uLeakX, uHole, uZoom, uSeed;
uniform vec2 uPan, uRes;
uniform vec4 uRect;   // Lage dieser Ebene im Eltern-Foto (x, y, w, h; UV, unten links)
uniform vec4 uDoor;   // Tür im Eltern-Foto (Mitte x/y, halbe Breite/Höhe), w = 0: keine Tür
uniform float uAspect; // Seitenverhältnis des Eltern-Fotos
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float rbox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 puv = uRect.xy + vUv * uRect.zw;
  vec2 kuv = (puv - 0.5) / uZoom + 0.5 + uPan;          // Ken Burns im Raum des Eltern-Fotos
  vec2 tuv = (kuv - uRect.xy) / uRect.zw;
  vec4 c;
  if (uBlur < 0.02) {
    c = texture2D(map, tuv);
  } else {
    // weiche Fokusunschärfe: Poisson-Abtastung auf gröberer Mip-Stufe
    float r = uBlur * 0.012;
    vec2 k = vec2(r / uRect.z, r * uAspect / uRect.w);
    float lod = uBlur * 3.5;
    c  = texture2D(map, tuv, lod) * 0.2;
    c += texture2D(map, tuv + k * vec2( 0.95,  0.31), lod) * 0.1;
    c += texture2D(map, tuv + k * vec2(-0.31,  0.95), lod) * 0.1;
    c += texture2D(map, tuv + k * vec2(-0.95, -0.31), lod) * 0.1;
    c += texture2D(map, tuv + k * vec2( 0.31, -0.95), lod) * 0.1;
    c += texture2D(map, tuv + k * vec2( 0.59,  0.81) * 0.5, lod) * 0.1;
    c += texture2D(map, tuv + k * vec2(-0.81,  0.59) * 0.5, lod) * 0.1;
    c += texture2D(map, tuv + k * vec2(-0.59, -0.81) * 0.5, lod) * 0.1;
    c += texture2D(map, tuv + k * vec2( 0.81, -0.59) * 0.5, lod) * 0.1;
  }
  vec3 col = c.rgb;
  // Farbkorrektur: leicht warm, etwas Kontrast, minimal entsättigt
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, 0.93);
  col = (col - 0.5) * 1.06 + 0.5;
  col *= vec3(1.04, 1.0, 0.93);
  col += vec3(0.018, 0.01, 0.0);
  // Vignette (Bildschirm) und Lichtfahne
  vec2 sv = gl_FragCoord.xy / uRes;
  float vd = length((sv - 0.5) * vec2(1.0, 0.8));
  col *= 1.0 - smoothstep(0.38, 0.92, vd) * 0.45;
  float lk = exp(-pow((sv.x - uLeakX + (sv.y - 0.5) * 0.35) * 2.4, 2.0));
  col += uLeak * lk * vec3(1.0, 0.76, 0.42) * 0.42;
  col *= uDim;
  // feines Filmkorn
  col += (hash(gl_FragCoord.xy + fract(uTime * 3.7 + uSeed) * 157.0) - 0.5) * 0.045;
  float a = c.a * uOpacity;
  // weiche, gerundete Bildkante
  vec2 p = (puv - 0.5) * vec2(uAspect, 1.0);
  float d = rbox(p, vec2(uAspect * 0.5, 0.5), 0.035);
  a *= 1.0 - smoothstep(-0.012 - uBlur * 0.09, 0.0, d);
  // Tür als Bildmaske
  if (uDoor.z > 0.0) {
    vec2 hd = uDoor.zw * (1.0 + uHole * uHole * vec2(11.0, 2.6));
    float dd = rbox((puv - uDoor.xy) * vec2(uAspect, 1.0), hd * vec2(uAspect, 1.0), 0.012);
    a *= smoothstep(-0.006, 0.006, dd);
    // warmes Licht am Türrand, während sie sich öffnet
    col += vec3(1.0, 0.8, 0.5) * 0.35 * uHole * (1.0 - smoothstep(0.0, 0.05, dd));
  }
  gl_FragColor = vec4(col, a);
}`;

const BG_VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy * 2.0, 1.0, 1.0); }`;
const BG_FRAG = /* glsl */`
uniform float uTime, uLeak, uLeakX;
uniform vec2 uRes;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 sv = gl_FragCoord.xy / uRes;
  vec3 col = mix(vec3(0.051, 0.075, 0.2), vec3(0.09, 0.12, 0.3), 1.0 - smoothstep(0.0, 0.85, length((sv - vec2(0.62, 0.55)) * vec2(1.2, 1.0))));
  float lk = exp(-pow((sv.x - uLeakX + (sv.y - 0.5) * 0.35) * 2.2, 2.0));
  col += uLeak * lk * vec3(1.0, 0.72, 0.36) * 0.22;
  col *= 1.0 - smoothstep(0.45, 1.0, length((sv - 0.5) * vec2(1.0, 0.8))) * 0.5;
  col += (hash(gl_FragCoord.xy + fract(uTime * 3.7) * 157.0) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}`;

function init() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvasBox = root.querySelector("[data-h3d-canvas]");
  const chapters = [...root.querySelectorAll("[data-chapter]")].sort((a, b) => +a.dataset.chapter - +b.dataset.chapter);
  const rail = [...root.querySelectorAll("[data-goto-chapter]")];
  const LAYERS = JSON.parse(doc.getElementById("hero-layers").textContent);

  const fallback = (cls) => { root.classList.add("h3d--static", cls); startKenBurns(); window.__hero = { static: true }; };
  if (reduce) return fallback("h3d--reduced");
  let renderer;
  try {
    const c = doc.createElement("canvas");
    if (!c.getContext("webgl2")) throw new Error("kein WebGL 2");
    renderer = new WebGLRenderer({ canvas: c, antialias: false, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    return fallback("h3d--nogl");
  }
  const perf = { sum: 0, n: 0, pr: Math.min(window.devicePixelRatio || 1, 2) };
  renderer.setPixelRatio(perf.pr);
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.className = "h3d__gl";
  canvasBox.prepend(renderer.domElement);
  root.classList.add("h3d--gl");

  const scene = new Scene();
  scene.background = new Color(0x0d1333);
  const camera = new PerspectiveCamera(32, 1, 0.1, 300);

  // ------------------------------------------------------------ Bildebenen
  // h: Höhe in Welt-Einheiten, fit: Anteil der Bildhöhe/-breite [Querformat, Hochformat]
  let GAP = 15;
  const PLAN = [
    { key: "aussen", h: 6, pos: [0, 0, 0], ry: 0, fitL: [1.0, 1.0], fitP: [0.5, 1.0], door: [0.475, 0.5625, 0.044, 0.205] },
    { key: "empfang", h: 5.6, pos: [-0.3, 0.25, -GAP], ry: 0, fitL: [0.86, 0.5], fitP: [0.4, 0.8] },
    { key: "wartebereich", h: 5.2, pos: [1.4, 0.2, -GAP * 2], ry: -0.06, fitL: [0.8, 0.6], fitP: [0.4, 0.92] },
    { key: "sprechzimmer", h: 5.2, pos: [-1.4, -0.15, -GAP * 3], ry: 0.09, fitL: [0.8, 0.6], fitP: [0.4, 0.92] },
    { key: "behandlungsraum", h: 5.2, pos: [1.2, 0.2, -GAP * 4], ry: -0.08, fitL: [0.8, 0.6], fitP: [0.4, 0.92] },
    { key: "team-gruppe", h: 5.4, pos: [0, 0.1, -GAP * 5], ry: 0, fitL: [0.8, 0.56], fitP: [0.38, 0.9] },
  ];
  const geo = new PlaneGeometry(1, 1);
  const res = new Vector2(1, 1);
  // Hintergrund: tiefes Abendblau mit Lichtfahne, Vignette und Korn (Vollbild-Ebene)
  const bgU = { uTime: { value: 0 }, uLeak: { value: 0 }, uLeakX: { value: 0 }, uRes: { value: res } };
  const bg = new Mesh(geo, new ShaderMaterial({ vertexShader: BG_VERT, fragmentShader: BG_FRAG, uniforms: bgU, depthTest: false, depthWrite: false, toneMapped: false }));
  bg.frustumCulled = false; bg.renderOrder = -1000;
  scene.add(bg);
  const loads = [];
  function texFrom(img) {
    const t = new Texture(img);
    t.minFilter = LinearMipmapLinearFilter; t.magFilter = LinearFilter; t.generateMipmaps = true;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    img.loading = "eager";
    loads.push(img.decode().catch(() => {}).then(() => { t.needsUpdate = true; requestRender(); }));
    return t;
  }
  function material(tex, aspect, rect, door) {
    return new ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false, toneMapped: false,
      uniforms: {
        map: { value: tex }, uOpacity: { value: 1 }, uBlur: { value: 0 }, uDim: { value: 1 }, uTime: { value: 0 },
        uLeak: { value: 0 }, uLeakX: { value: 0 }, uHole: { value: 0 }, uZoom: { value: 1 }, uSeed: { value: Math.random() },
        uPan: { value: new Vector2() }, uRes: { value: res }, uRect: { value: rect }, uAspect: { value: aspect },
        uDoor: { value: door || new Vector4(0, 0, 0, 0) },
      },
    });
  }
  const planes = PLAN.map((P, i) => {
    const fig = root.querySelector(`[data-tex="${P.key}"]`);
    const img = fig.querySelector("[data-bg]");
    const aspect = (+img.getAttribute("width")) / (+img.getAttribute("height"));
    const w = P.h * aspect;
    const door = P.door ? new Vector4(...P.door) : null;
    const m = new Mesh(geo, material(texFrom(img), aspect, new Vector4(0, 0, 1, 1), door));
    m.scale.set(w, P.h, 1);
    m.position.set(...P.pos);
    m.rotation.y = P.ry;
    m.renderOrder = -i * 10;
    scene.add(m);
    const normal = new Vector3(Math.sin(P.ry), 0, Math.cos(P.ry));
    // Vordergrund-Ebenen
    const layers = (LAYERS[P.key]?.layers || []).map((L, j) => {
      const limg = fig.querySelector(`[data-layer="${L.id}"]`);
      // UV mit Ursprung unten links
      const rect = new Vector4(L.x, 1 - L.y - L.h, L.w, L.h);
      const lm = new Mesh(geo, material(texFrom(limg), aspect, rect, null));
      lm.renderOrder = -i * 10 + 1 + j;
      scene.add(lm);
      return { mesh: lm, L, rect };
    });
    return { P, i, mesh: m, w, h: P.h, aspect, normal, layers, d: 10, cam: new Vector3(), center: new Vector3(...P.pos) };
  });

  // ------------------------------------------------------------ Kamera-Stationen (abhängig vom Seitenverhältnis)
  const K = () => 2 * Math.tan(MathUtils.degToRad(camera.fov / 2));
  const doorCam = new Vector3(), doorPoint = new Vector3();
  let W = 1, Hh = 1, portrait = false;
  function layout() {
    const k = K(), asp = W / Hh;
    for (const pl of planes) {
      const [fh, fw] = portrait ? pl.P.fitP : pl.P.fitL;
      const a = pl.h / (fh * k), b = pl.w / (fw * k * asp);
      // Außenansicht füllt das Bild (cover), die Räume passen hinein (contain)
      pl.d = pl.i === 0 && !portrait ? Math.min(a, b) * 0.97 : Math.max(a, b);
    }
    // Tür: Kamera so nah, dass die Tür fast das Bild füllt
    const A = planes[0], dr = A.P.door;
    doorPoint.set((dr[0] - 0.5) * A.w, (dr[1] - 0.5) * A.h, 0).add(A.center);
    const doorH = dr[3] * 2 * A.h, doorW = dr[2] * 2 * A.w;
    const dd = Math.max(doorH / (0.96 * k), doorW / (0.7 * k * asp));
    doorCam.copy(doorPoint).setZ(A.center.z + dd);
    // Empfang direkt hinter der Tür, so dass die Fahrt danach weiter vorwärts geht
    const z1 = Math.min(-7.5, dd - planes[1].d - 1.2);
    // Abstand der Räume größer als jede Stationsentfernung, damit nie ein Foto zwischen Kamera und Ziel steht
    GAP = Math.max(12, Math.max(...planes.slice(1).map((p) => p.d)) * 1.15 + 2);
    for (const pl of planes) if (pl.i > 0) {
      pl.center.set(pl.P.pos[0], pl.P.pos[1], z1 - (pl.i - 1) * GAP);
      pl.mesh.position.copy(pl.center);
    }
    for (const pl of planes) {
      pl.cam.copy(pl.center).addScaledVector(pl.normal, pl.d);
      // Vordergrund so setzen, dass er von der Station aus deckungsgleich ist
      for (const ly of pl.layers) {
        const { L } = ly;
        const depth = Math.min(L.depth, pl.d * 0.5);
        const s = (pl.d - depth) / pl.d;
        const cx = (L.x + L.w / 2 - 0.5) * pl.w, cy = (0.5 - L.y - L.h / 2) * pl.h;
        const local = new Vector3(cx, cy, 0).applyAxisAngle(new Vector3(0, 1, 0), pl.P.ry).add(pl.center);
        ly.mesh.position.copy(pl.cam).lerp(local, s);
        ly.mesh.scale.set(L.w * pl.w * s, L.h * pl.h * s, 1);
        ly.mesh.rotation.y = pl.P.ry;
      }
    }
  }

  // ------------------------------------------------------------ Zustand und Zeitleiste
  const state = { pos: 0 };
  const tl = gsap.timeline({ paused: true, onUpdate: requestRender });
  const T = [0];
  tl.to({}, { duration: 0.5 });
  for (let i = 0; i < planes.length - 1; i++) {
    tl.to(state, { pos: i + 1, duration: i === 0 ? 1.5 : 1.05, ease: "power2.inOut" });
    T.push(tl.duration() + 0.25);
    tl.to({}, { duration: 0.55 });
  }

  const ease = (t) => t * t * (3 - 2 * t);
  const tmpA = new Vector3(), tmpB = new Vector3(), look = new Vector3();
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  let clock = 0;
  function cameraAt(pos) {
    const i = Math.min(planes.length - 2, Math.floor(pos)), f = pos - i;
    if (i === 0) {
      if (f < 0.5) { const e = ease(f / 0.5); tmpA.copy(planes[0].cam).lerp(doorCam, e); look.copy(planes[0].center).lerp(doorPoint, e); }
      else { const e = ease((f - 0.5) / 0.5); tmpA.copy(doorCam).lerp(planes[1].cam, e); look.copy(doorPoint).lerp(planes[1].center, e); }
    } else {
      tmpA.copy(planes[i].cam).lerp(planes[i + 1].cam, f);
      look.copy(planes[i].center).lerp(planes[i + 1].center, ease(f));
      // sanfter Bogen zwischen den Räumen
      tmpA.x += Math.sin(f * Math.PI) * 0.9 * (i % 2 ? -1 : 1);
      tmpA.y += Math.sin(f * Math.PI) * 0.25;
    }
    return { i, f };
  }

  // ------------------------------------------------------------ Rendern
  const stats = { frames: 0 };
  let chapter = -1, running = false, inView = true, last = 0;
  function render() {
    const pos = state.pos;
    const { i: seg, f } = cameraAt(pos);
    const par = portrait ? 0.15 : 0.35;
    camera.position.copy(tmpA);
    camera.position.x += ptr.x * par;
    camera.position.y -= ptr.y * par * 0.6;
    tmpB.copy(look);
    tmpB.x += ptr.x * par * 0.4;
    camera.lookAt(tmpB);
    // Bildausschnitt: Desktop nach rechts (Text links), Hochformat nach oben (Textkarte unten)
    const inside = pos < 0.5 ? 0 : ease(Math.min(1, (pos - 0.5) / 0.5));
    const offX = portrait ? 0 : -W * 0.16 * inside;
    const doorPhase = pos < 0.5 ? 1 - ease(pos / 0.5) : inside;
    const offY = portrait ? Hh * 0.27 * doorPhase : 0;
    camera.setViewOffset(W, Hh, offX, offY, W, Hh);

    // Fokus auf der Station, zu der die Fahrt geht
    const focusD = MathUtils.lerp(planes[seg].d, planes[seg + 1].d, ease(f));
    const leak = seg === 0 ? Math.pow(Math.sin(Math.min(1, Math.max(0, (f - 0.4) / 0.6)) * Math.PI), 2) : Math.pow(Math.sin(f * Math.PI), 2);
    for (const pl of planes) {
      const toPlane = tmpB.copy(pl.center).sub(camera.position);
      const dz = -toPlane.dot(pl.normal); // Abstand vor der Ebene (positiv = Kamera davor)
      let op = MathUtils.smoothstep(dz, pl.d * 0.12, pl.d * 0.55);
      const ahead = dz - focusD;
      op *= 1 - MathUtils.smoothstep(ahead, GAP * 1.1, GAP * 1.7);
      // Fokus: das Ziel wird scharf, das verlassene Foto weich, alles weiter hinten unscharf
      let blur = pl.i === seg + 1 ? 0.6 * (1 - MathUtils.smoothstep(f, 0.15, 0.85))
        : pl.i === seg ? 0.9 * MathUtils.smoothstep(f, 0.05, 0.6)
        : MathUtils.clamp(Math.abs(ahead) / (focusD * 0.9), 0.5, 1);
      const dim = 1 - 0.6 * MathUtils.smoothstep(ahead, 0, GAP);
      let hole = 0;
      if (pl.i === 0) {
        hole = seg === 0 ? MathUtils.smoothstep(f, 0.3, 0.8) : 1;
        op = seg === 0 ? 1 - MathUtils.smoothstep(f, 0.62, 0.8) : 0;
        blur = seg === 0 ? MathUtils.smoothstep(f, 0.4, 0.75) * 0.7 : 1;
      }
      const layerOp = pl.i === 0 && seg === 0 ? op * (1 - MathUtils.smoothstep(f, 0.42, 0.58)) : op;
      const vis = op > 0.003;
      const zoom = 1.045 + Math.sin(clock * 0.07 + pl.i * 1.7) * 0.025 + (pl.i === 0 ? 0.03 * (1 - Math.min(1, pos * 2)) : 0);
      const panX = Math.sin(clock * 0.05 + pl.i) * 0.012, panY = Math.cos(clock * 0.043 + pl.i * 2) * 0.01;
      for (const m of [pl.mesh, ...pl.layers.map((l) => l.mesh)]) {
        m.visible = vis;
        if (!vis) continue;
        const u = m.material.uniforms;
        u.uOpacity.value = m === pl.mesh ? op : layerOp; u.uBlur.value = blur; u.uDim.value = dim; u.uTime.value = clock;
        u.uLeak.value = leak; u.uLeakX.value = MathUtils.lerp(-0.2, 1.2, f); u.uZoom.value = zoom; u.uPan.value.set(panX, panY);
        u.uHole.value = hole;
      }
    }
    bgU.uTime.value = clock; bgU.uLeak.value = leak; bgU.uLeakX.value = MathUtils.lerp(-0.2, 1.2, f);
    renderer.render(scene, camera);

    // Kapiteltexte
    const idx = Math.min(chapters.length - 1, Math.floor(pos + 0.5));
    if (idx !== chapter) {
      chapter = idx;
      chapters.forEach((c, n) => c.toggleAttribute("data-active", n === idx));
      rail.forEach((b, n) => { if (n === idx) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    }
    root.style.setProperty("--h3d-p", (tl.time() / tl.duration()).toFixed(4));
    root.style.setProperty("--h3d-photo", (1 - MathUtils.smoothstep(pos, 0.3, 0.7)).toFixed(3));
    stats.frames++;
  }
  function requestRender() { if (!running) render(); }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    clock += dt;
    ptr.x += (ptr.tx - ptr.x) * 0.05;
    ptr.y += (ptr.ty - ptr.y) * 0.05;
    // Adaptive Auflösung bei dauerhaft langsamen Bildern
    perf.sum += dt; perf.n++;
    if (perf.n >= 40) {
      const avg = perf.sum / perf.n; perf.sum = 0; perf.n = 0;
      if (avg > 1 / 28 && perf.pr > 0.6) { perf.pr = Math.max(0.6, perf.pr * 0.8); renderer.setPixelRatio(perf.pr); resize(); }
    }
    render();
    requestAnimationFrame(loop);
  }
  function setRunning() {
    const on = inView && !doc.hidden;
    if (on === running) return;
    running = on;
    if (on) { last = performance.now(); requestAnimationFrame(loop); }
  }
  function resize() {
    const r = canvasBox.getBoundingClientRect();
    W = Math.max(1, r.width); Hh = Math.max(1, r.height);
    portrait = W / Hh < 0.9;
    renderer.setSize(W, Hh, false);
    res.set(W * renderer.getPixelRatio(), Hh * renderer.getPixelRatio());
    camera.aspect = W / Hh;
    camera.fov = portrait ? 48 : 32;
    camera.updateProjectionMatrix();
    layout();
    render();
  }
  new ResizeObserver(resize).observe(canvasBox);

  // ------------------------------------------------------------ Scroll
  gsap.registerPlugin(ScrollTrigger);
  const topH = () => parseFloat(getComputedStyle(doc.documentElement).getPropertyValue("--top-h")) || 72;
  const st = ScrollTrigger.create({
    trigger: root.querySelector("[data-h3d-pin]"),
    start: () => "top " + topH() + "px",
    end: () => "+=" + Math.round(innerHeight * 6.5),
    pin: true, scrub: 0.8, animation: tl, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 10,
  });
  const goTo = (n) => {
    const time = n <= 0 ? 0 : n >= T.length - 1 ? tl.duration() : T[n];
    const y = st.start + (st.end - st.start) * (time / tl.duration());
    window.scrollTo({ top: Math.ceil(y) + (n <= 0 ? 0 : 1), behavior: "auto" });
  };
  rail.forEach((b) => b.addEventListener("click", () => goTo(+b.getAttribute("data-goto-chapter"))));
  // Tastatur: Fokus in einem gerade unsichtbaren Kapitel holt dieses Kapitel ins Bild
  chapters.forEach((c, n) => c.addEventListener("focusin", () => { if (n !== chapter) goTo(n); }));

  if (matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", (e) => { ptr.tx = (e.clientX / innerWidth) * 2 - 1; ptr.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  }
  new IntersectionObserver((en) => { inView = en[0].isIntersecting; setRunning(); }).observe(root);
  doc.addEventListener("visibilitychange", setRunning);
  window.__hero = { tl, st, T, stats, state, static: false };
  resize();
  setRunning();
  Promise.all(loads).then(() => { root.classList.add("h3d--ready"); requestRender(); });
}

// Ohne WebGL (mit Bewegung): Ken-Burns der Fotos per CSS, nur solange sichtbar
function startKenBurns() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const figs = root.querySelectorAll(".h3d__ph");
  const io = new IntersectionObserver((en) => en.forEach((e) => e.target.toggleAttribute("data-kb", e.isIntersecting)));
  figs.forEach((f) => io.observe(f));
}

if (root) init();
