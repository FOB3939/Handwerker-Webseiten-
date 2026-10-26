// Beat Stage – eigene, synthetisierte Percussion (Web Audio, keine Samples → keine Lizenzfragen).
// Der AudioContext entsteht erst nach einer Nutzeraktion (Klick auf „Mit Sound spielen“).

export class DrumSynth {
  constructor() {
    this.ctx = null; this.master = null; this.noise = null; this.volume = 0.7; this.muted = false;
  }
  /** Muss in einem Klick-Handler aufgerufen werden. Gibt false zurück, wenn der Browser Audio verweigert. */
  async init() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        this.ctx = new AC({ latencyHint: "interactive" });
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        this.applyVolume();
        // 1 s weißes Rauschen als Quelle für Snare, Hi-Hat und Clap
        const len = this.ctx.sampleRate;
        this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noise.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return this.ctx.state === "running";
    } catch { return false; }
  }
  get ready() { return !!this.ctx && this.ctx.state === "running"; }
  get now() { return this.ctx ? this.ctx.currentTime : 0; }
  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); this.applyVolume(); }
  setMuted(m) { this.muted = m; this.applyVolume(); }
  applyVolume() { if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume * 0.9, this.ctx.currentTime, 0.01); }

  #noiseSrc(t) { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.start(t); return s; }
  #env(t, peak, decay) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g.connect(this.master); return g;
  }
  /** Pad 0 Kick, 1 Snare, 2 Hi-Hat, 3 Clap. t = AudioContext-Zeit (Standard: sofort). */
  play(pad, t = this.now, gain = 1) {
    if (!this.ready) return;
    const c = this.ctx;
    if (pad === 0) { // Kick: Sinus mit fallender Tonhöhe
      const o = c.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      o.connect(this.#env(t, 0.95 * gain, 0.42)); o.start(t); o.stop(t + 0.45);
    } else if (pad === 1) { // Snare: Rauschen (Bandpass) + kurzer Ton
      const n = this.#noiseSrc(t), f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 0.7;
      n.connect(f); f.connect(this.#env(t, 0.55 * gain, 0.2)); n.stop(t + 0.22);
      const o = c.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
      o.connect(this.#env(t, 0.35 * gain, 0.1)); o.start(t); o.stop(t + 0.12);
    } else if (pad === 2) { // Hi-Hat: hochgefiltertes Rauschen, sehr kurz
      const n = this.#noiseSrc(t), f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
      n.connect(f); f.connect(this.#env(t, 0.32 * gain, 0.06)); n.stop(t + 0.08);
    } else { // Clap: drei schnelle Rausch-Impulse + Hall-Ausklang
      const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1300; f.Q.value = 1.1;
      const g = c.createGain(); g.gain.value = 0; f.connect(g); g.connect(this.master);
      [0, 0.012, 0.024].forEach((dt) => { g.gain.setValueAtTime(0.6 * gain, t + dt); g.gain.exponentialRampToValueAtTime(0.05, t + dt + 0.01); });
      g.gain.setValueAtTime(0.35 * gain, t + 0.034); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      const n = this.#noiseSrc(t); n.connect(f); n.stop(t + 0.26);
    }
  }
  /** Leiser Taktgeber (Klick), betont auf der Eins. */
  click(t, accent = false) {
    if (!this.ready) return;
    const o = this.ctx.createOscillator(); o.type = "square"; o.frequency.value = accent ? 1760 : 1320;
    const f = this.ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 3000;
    o.connect(f); f.connect(this.#env(t, accent ? 0.08 : 0.05, 0.04)); o.start(t); o.stop(t + 0.05);
  }
  async close() { try { await this.ctx?.close(); } catch { /* bereits geschlossen */ } this.ctx = null; }
}
