// Beat Stage – Steuerung im Browser. Wird nur auf /beat-stage/ geladen.
import { SETTINGS, PADS, createChart, Round, Clock } from "./engine.js";
import { DrumSynth } from "./audio.js";

const $ = (s, r = document) => r.querySelector(s);
const root = $("[data-game]");
if (root) init(root);

function init(root) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const synth = new DrumSynth();
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* Speicher nicht verfügbar – Spiel läuft trotzdem */ } },
  };
  const el = {
    start: $("[data-screen=start]", root), stage: $("[data-screen=stage]", root), result: $("[data-screen=result]", root),
    canvas: $("canvas", root), pads: [...root.querySelectorAll("[data-pad]")],
    score: $("[data-score]", root), combo: $("[data-combo]", root), acc: $("[data-acc]", root),
    judge: $("[data-judge]", root), count: $("[data-count]", root), live: $("[data-live]", root),
    pause: $("[data-pause]", root), restart: $("[data-restart]", root), quit: $("[data-quit]", root),
    vol: $("[data-volume]", root), mute: $("[data-mute]", root), soundInfo: $("[data-sound-info]", root),
    signet: $("[data-signet]", root), modeLabel: $("[data-mode]", root), progress: $("[data-progress]", root),
    best: root.querySelectorAll("[data-best]"),
  };
  const beat = 60 / SETTINGS.bpm, LEAD = SETTINGS.countdownBeats * beat, APPROACH = 1.7;
  let state = "start"; // start | count | play | paused | result | free
  let round = null, clock = null, raf = 0, nextClickBeat = 0, resumeFrom = -Infinity, sound = false, clockAudio = false;
  let best = store.get("beatstage-best", 0);
  el.vol.value = String(Math.round(store.get("beatstage-volume", 0.7) * 100));
  synth.setVolume(+el.vol.value / 100);
  const showBest = () => el.best.forEach((b) => (b.textContent = best ? String(best) : "–"));
  showBest();

  const show = (name) => { for (const s of ["start", "stage", "result"]) el[s].hidden = s !== name; };
  const announce = (t) => { el.live.textContent = ""; requestAnimationFrame(() => (el.live.textContent = t)); };
  // Zeitquelle wird je Runde festgelegt und nie mitten in der Runde gewechselt (sonst springt die Zeitleiste)
  const timeSource = () => (clockAudio && synth.ready ? synth.now : performance.now() / 1000);

  // ---------- Ablauf ----------
  async function begin(withSound, free = false) {
    sound = false;
    if (withSound) {
      sound = await synth.init();
      el.soundInfo.textContent = sound ? "" : "Ton konnte nicht gestartet werden – du spielst stumm weiter.";
    } else el.soundInfo.textContent = "";
    el.mute.setAttribute("aria-pressed", String(!sound)); synth.setMuted(!sound);
    el.mute.disabled = !synth.ctx;
    show("stage");
    root.classList.toggle("is-free", free);
    el.modeLabel.textContent = free ? "Freier Modus – kein Zeitdruck" : `Runde · ${SETTINGS.bpm} BPM`;
    if (free) { state = "free"; resize(); drawIdle(); toStage(); el.pads[0].focus({ preventScroll: true }); announce("Freier Modus. Tippe die Pads oder nutze D, F, J und K."); return; }
    round = new Round(createChart());
    clockAudio = sound && synth.ready;
    clock = new Clock(timeSource);
    clock.start(LEAD);
    nextClickBeat = -SETTINGS.countdownBeats;
    resumeFrom = 0;
    state = "count";
    updateHud();
    resize();
    loop();
    toStage();
    el.pause.focus({ preventScroll: true });
    announce("Runde startet: 3, 2, 1.");
  }

  function finish() {
    cancelAnimationFrame(raf); raf = 0; state = "result";
    const r = round.result();
    const isBest = r.score > best;
    if (isBest) { best = r.score; store.set("beatstage-best", best); }
    showBest();
    $("[data-r-score]", root).textContent = String(r.score);
    $("[data-r-acc]", root).textContent = `${r.accuracy} %`;
    $("[data-r-perfect]", root).textContent = String(r.perfect);
    $("[data-r-good]", root).textContent = String(r.good);
    $("[data-r-miss]", root).textContent = String(r.miss);
    $("[data-r-combo]", root).textContent = String(r.maxCombo);
    $("[data-r-new]", root).hidden = !isBest;
    show("result");
    const h = $("[data-result-title]", root); h.focus();
    announce(`Runde beendet. ${r.score} Punkte, Trefferquote ${r.accuracy} Prozent.${isBest ? " Neuer Bestwert!" : ""}`);
  }

  function pause() {
    if (state !== "play" && state !== "count") return;
    clock.pause(); state = "paused"; cancelAnimationFrame(raf); raf = 0;
    el.pause.textContent = "Fortsetzen"; el.pause.setAttribute("aria-pressed", "true");
    el.count.textContent = "Pause"; el.count.hidden = false;
    announce("Pausiert.");
  }
  function resume() {
    if (state !== "paused") return;
    resumeFrom = clock.resume(LEAD);
    nextClickBeat = Math.ceil(clock.now() / beat);
    state = "count"; el.pause.textContent = "Pause"; el.pause.setAttribute("aria-pressed", "false");
    announce("Weiter in 3, 2, 1.");
    loop();
  }
  // Spielfläche unter den festen Header scrollen, damit Punkte und Pads gleichzeitig sichtbar sind
  function toStage() {
    const header = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
    scrollTo({ top: el.stage.getBoundingClientRect().top + scrollY - header - 8, behavior: "instant" });
  }
  function stopToStart() { cancelAnimationFrame(raf); raf = 0; state = "start"; show("start"); $("[data-start-sound]", root).focus(); }

  // ---------- Eingabe ----------
  function press(pad) {
    flashPad(pad);
    if (sound) synth.play(pad);
    if (state === "free") { pulseSignet(pad); return; }
    // Ende des Countdowns: ein Treffer genau auf der Eins zählt auch, wenn der nächste Frame den Zustand noch nicht umgestellt hat
    if (state === "count" && clock.now() >= resumeFrom - SETTINGS.good) { state = "play"; el.count.hidden = true; }
    if (state !== "play") return; // während Countdown/Pause nicht werten
    const t = clock.now();
    const { result } = round.hit(pad, t);
    showJudge(result ?? "daneben", result);
    if (result) pulseSignet(pad);
    updateHud();
  }
  el.pads.forEach((b, i) => {
    b.addEventListener("pointerdown", (e) => { if (e.button === 0) { e.preventDefault(); press(i); } });
    b.addEventListener("click", (e) => { if (e.detail === 0) press(i); }); // Tastatur (Enter/Leertaste) auf dem fokussierten Pad
  });
  const keyMap = Object.fromEntries(PADS.map((p, i) => [p.key, i]));
  const onKey = (e) => {
    const tag = e.target?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || e.target?.isContentEditable || e.ctrlKey || e.metaKey || e.altKey) return;
    if (state === "start" || state === "result") return;
    const k = e.key.toLowerCase();
    if (k in keyMap) { e.preventDefault(); if (!e.repeat) press(keyMap[k]); } // Autorepeat bringt nichts
    else if (k === "escape" || k === "p") { e.preventDefault(); state === "paused" ? resume() : pause(); }
  };
  addEventListener("keydown", onKey);

  $("[data-start-sound]", root).addEventListener("click", () => begin(true));
  $("[data-start-mute]", root).addEventListener("click", () => begin(false));
  $("[data-start-free]", root).addEventListener("click", () => begin(true, true));
  $("[data-again]", root).addEventListener("click", () => begin(sound || (synth.ready && !synth.muted)));
  el.pause.addEventListener("click", () => (state === "paused" ? resume() : pause()));
  el.restart.addEventListener("click", () => begin(sound));
  el.quit.addEventListener("click", stopToStart);
  el.vol.addEventListener("input", () => { synth.setVolume(+el.vol.value / 100); store.set("beatstage-volume", +el.vol.value / 100); });
  el.mute.addEventListener("click", async () => {
    const nowMuted = el.mute.getAttribute("aria-pressed") !== "true";
    if (!nowMuted && !synth.ctx) return;
    if (!nowMuted) await synth.init();
    sound = !nowMuted && synth.ready;
    synth.setMuted(nowMuted); el.mute.setAttribute("aria-pressed", String(nowMuted));
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  addEventListener("pagehide", () => { cancelAnimationFrame(raf); removeEventListener("keydown", onKey); synth.close(); });

  // ---------- Darstellung ----------
  let W = 0, H = 0, dpr = 1;
  const ctx = el.canvas.getContext("2d");
  function resize() {
    const r = el.canvas.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; el.canvas.width = Math.round(W * dpr); el.canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", () => { if (!el.stage.hidden) { resize(); if (state !== "play") drawIdle(); } });

  function loop() {
    const tick = () => {
      if (state !== "play" && state !== "count") return;
      const t = clock.now();
      if (state === "count") {
        const left = Math.ceil((resumeFrom - t) / beat);
        el.count.hidden = left <= 0; el.count.textContent = left > 0 ? String(left) : "";
        if (t >= resumeFrom) { state = "play"; el.count.hidden = true; }
      }
      // Taktgeber vorausplanen (AudioContext-Zeit, kein setTimeout)
      if (sound && clockAudio) {
        while (nextClickBeat * beat < t + 0.15) {
          const at = synth.now + (nextClickBeat * beat - t);
          if (at >= synth.now - 0.01) synth.click(Math.max(at, synth.now), ((nextClickBeat % 4) + 4) % 4 === 0);
          nextClickBeat++;
        }
      }
      if (state === "play") {
        for (const n of round.update(t)) { showJudge("verpasst", null); flashLane(n.pad); }
        updateHud();
        if (round.isOver(t)) { draw(t); return finish(); }
      }
      el.progress.style.transform = `scaleX(${Math.max(0, Math.min(1, t / SETTINGS.roundSeconds))})`;
      draw(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  const laneX = (i) => (W / 4) * i + W / 8;
  const hitY = () => H - 46;
  function shape(kind, x, y, s) {
    ctx.beginPath();
    if (kind === "circle") ctx.arc(x, y, s, 0, Math.PI * 2);
    else if (kind === "square") ctx.rect(x - s * 0.85, y - s * 0.85, s * 1.7, s * 1.7);
    else if (kind === "triangle") { ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s * 0.8); ctx.lineTo(x - s, y + s * 0.8); ctx.closePath(); }
    else { ctx.moveTo(x, y - s * 1.1); ctx.lineTo(x + s * 1.1, y); ctx.lineTo(x, y + s * 1.1); ctx.lineTo(x - s * 1.1, y); ctx.closePath(); }
  }
  const laneFlash = [0, 0, 0, 0];
  function flashLane(i) { laneFlash[i] = performance.now(); }
  function drawLanes() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) {
      const x0 = (W / 4) * i;
      const age = (performance.now() - laneFlash[i]) / 300;
      if (age < 1 && !reduce.matches) { ctx.fillStyle = `rgba(139,125,255,${0.18 * (1 - age)})`; ctx.fillRect(x0, 0, W / 4, H); }
      ctx.strokeStyle = "rgba(243,241,236,0.08)"; ctx.lineWidth = 1;
      if (i) { ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, H); ctx.stroke(); }
      ctx.strokeStyle = "rgba(198,203,210,0.55)"; ctx.lineWidth = 2;
      shape(PADS[i].shape, laneX(i), hitY(), 16); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(243,241,236,0.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, hitY()); ctx.lineTo(W, hitY()); ctx.stroke();
  }
  function draw(t) {
    drawLanes();
    const y0 = hitY();
    for (const n of round.notes) {
      const dt = n.time - t;
      if (dt > APPROACH) break;
      if (n.result && n.result !== "miss") continue;
      if (dt < -0.35) continue;
      const y = y0 - (dt / APPROACH) * (y0 - 10);
      const near = Math.abs(dt) <= SETTINGS.good;
      ctx.fillStyle = n.result === "miss" ? "rgba(255,143,143,0.35)" : near ? "#f3f1ec" : "#c6cbd2";
      if (near && !reduce.matches) { ctx.shadowColor = "rgba(139,125,255,0.9)"; ctx.shadowBlur = 18; }
      shape(PADS[n.pad].shape, laneX(n.pad), y, 14); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  function drawIdle() { drawLanes(); }

  let judgeTimer = 0;
  function showJudge(text, kind) {
    el.judge.textContent = { perfect: "Perfekt", good: "Gut" }[kind] ?? (text === "verpasst" ? "Verpasst" : "Daneben");
    el.judge.dataset.kind = kind ?? "miss";
    el.judge.classList.remove("pop"); void el.judge.offsetWidth; el.judge.classList.add("pop");
    clearTimeout(judgeTimer); judgeTimer = setTimeout(() => (el.judge.textContent = ""), 650);
  }
  function updateHud() {
    if (!round) return;
    el.score.textContent = String(round.score);
    el.combo.textContent = String(round.combo);
    const done = round.counts.perfect + round.counts.good + round.counts.miss;
    el.acc.textContent = done ? `${Math.round(((round.counts.perfect + round.counts.good) / done) * 100)} %` : "–";
  }
  function flashPad(i) { const b = el.pads[i]; b.classList.remove("hit"); void b.offsetWidth; b.classList.add("hit"); }
  function pulseSignet(i) {
    if (reduce.matches || !el.signet) return;
    const group = i === 0 ? 2 : i === 1 ? 0 : i === 2 ? 1 : null; // Kick unten, Snare links, Hi-Hat rechts, Clap alle
    el.signet.querySelectorAll("path").forEach((p) => {
      if (group === null || +p.dataset.group === group) { p.classList.remove("on"); void p.getBoundingClientRect(); p.classList.add("on"); }
    });
  }
}
