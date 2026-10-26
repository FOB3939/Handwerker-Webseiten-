// Beat Stage – Spiellogik ohne Browser-Abhängigkeiten (in tests/engine.test.js geprüft).
// Zeiten in Sekunden relativ zum ersten Schlag der Runde (Countdown liegt davor).

export const SETTINGS = {
  bpm: 100,                 // festes, einsteigerfreundliches Tempo
  roundSeconds: 30,         // Länge der Runde
  perfect: 0.08,            // ±80 ms → „Perfekt“
  good: 0.15,               // ±150 ms → „Gut“, sonst kein Treffer
  countdownBeats: 3,        // „3 – 2 – 1“ vor dem Start und nach Pause
  points: { perfect: 100, good: 50 },
  comboBonus: 5,            // + 5 Punkte je Combo-Stufe …
  comboBonusMax: 20,        // … höchstens 20 Stufen
};

export const PADS = [
  { key: "d", name: "Kick", shape: "circle" },
  { key: "f", name: "Snare", shape: "square" },
  { key: "j", name: "Hi-Hat", shape: "triangle" },
  { key: "k", name: "Clap", shape: "diamond" },
];

// Feste Groove-Muster je Takt (Viertel = 1 Schlag, „h“ = Achtel danach). Keine Zufallsfolgen:
// jede Runde ist gleich, damit sie lernbar und fair bleibt. Pad-Index: 0 Kick, 1 Snare, 2 Hi-Hat, 3 Clap.
const BARS = {
  intro:  [[0, 0], [1, 2], [2, 1], [3, 2]],                          // Kick – Hat – Snare – Hat
  groove: [[0, 0], [1, 2], [2, 1], [2.5, 0], [3, 2]],
  clap:   [[0, 0], [1, 3], [1.5, 2], [2, 1], [3, 3]],
  fill:   [[0, 0], [1, 1], [1.5, 1], [2, 2], [2.5, 2], [3, 3]],
};
const ARRANGEMENT = ["intro", "intro", "groove", "groove", "clap", "groove", "clap", "fill", "groove", "clap", "groove", "fill", "intro"];

/** Notenfolge für eine Runde: [{ id, time, pad }] streng zeitlich sortiert, nur innerhalb von roundSeconds. */
export function createChart(s = SETTINGS) {
  const beat = 60 / s.bpm, notes = [];
  ARRANGEMENT.forEach((bar, b) => {
    for (const [pos, pad] of BARS[bar]) {
      const time = +(b * 4 * beat + pos * beat).toFixed(4);
      if (time <= s.roundSeconds - 0.5) notes.push({ id: notes.length, time, pad });
    }
  });
  return notes;
}

export function judge(dt, s = SETTINGS) {
  const a = Math.abs(dt);
  if (a <= s.perfect) return "perfect";
  if (a <= s.good) return "good";
  return null;
}

/** Rundenzustand. hit()/update() bekommen die aktuelle Songzeit (Sekunden). */
export class Round {
  constructor(chart = createChart(), s = SETTINGS) {
    this.s = s;
    this.notes = chart.map((n) => ({ ...n, result: null }));
    this.score = 0; this.combo = 0; this.maxCombo = 0;
    this.counts = { perfect: 0, good: 0, miss: 0, stray: 0 };
    this.cursor = 0; // erste noch nicht abgelaufene Note
  }
  /** Spieler drückt ein Pad. Rückgabe: { result, note } – result null = Fehlgriff (Combo weg, keine Punkte). */
  hit(pad, t) {
    let best = null, bestDt = Infinity;
    for (let i = this.cursor; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.time - t > this.s.good) break;          // weiter vorn liegt nichts mehr im Fenster
      if (n.result || n.pad !== pad) continue;      // jede Note höchstens einmal werten
      const dt = t - n.time;
      if (Math.abs(dt) <= this.s.good && Math.abs(dt) < Math.abs(bestDt)) { best = n; bestDt = dt; }
    }
    if (!best) { this.counts.stray++; this.combo = 0; return { result: null, note: null }; }
    const result = judge(bestDt, this.s);
    best.result = result; best.dt = bestDt;
    this.counts[result]++; this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.score += this.s.points[result] + this.s.comboBonus * Math.min(this.combo - 1, this.s.comboBonusMax);
    return { result, note: best };
  }
  /** Abgelaufene, nicht getroffene Noten als „verpasst“ werten. Gibt die neu verpassten Noten zurück. */
  update(t) {
    const missed = [];
    while (this.cursor < this.notes.length) {
      const n = this.notes[this.cursor];
      if (!n.result && t - n.time > this.s.good) { n.result = "miss"; this.counts.miss++; this.combo = 0; missed.push(n); }
      if (n.result) this.cursor++; else break;
    }
    return missed;
  }
  isOver(t) { return t > this.s.roundSeconds || (this.cursor >= this.notes.length && t > this.lastTime + this.s.good); }
  get lastTime() { return this.notes.length ? this.notes[this.notes.length - 1].time : 0; }
  get total() { return this.notes.length; }
  get accuracy() { const done = this.counts.perfect + this.counts.good; return this.total ? Math.round((done / this.total) * 100) : 0; }
  result() { return { score: this.score, accuracy: this.accuracy, maxCombo: this.maxCombo, ...this.counts, total: this.total }; }
}

/**
 * Gemeinsame, monotone Zeitleiste mit Pause. source() liefert eine fortlaufende Zeit in Sekunden
 * (AudioContext.currentTime bei Ton, sonst performance.now()/1000). Songzeit = source − start − Pausen.
 */
export class Clock {
  constructor(source) { this.source = source; this.startAt = 0; this.pausedAt = null; this.running = false; }
  /** Start so, dass Songzeit 0 nach `lead` Sekunden (Countdown) erreicht wird. */
  start(lead = 0) { this.startAt = this.source() + lead; this.pausedAt = null; this.running = true; }
  now() { return (this.pausedAt ?? this.source()) - this.startAt; }
  pause() { if (this.pausedAt === null) this.pausedAt = this.source(); this.running = false; }
  /** Fortsetzen mit Countdown: die Songzeit springt um `lead` Sekunden zurück und erreicht die Pausenstelle
   *  genau nach dem Countdown wieder (der Takt läuft hörbar in den Wiedereinstieg hinein).
   *  Gibt die Songzeit zurück, ab der wieder gewertet wird. */
  resume(lead = 0) {
    if (this.pausedAt === null) return this.now();
    const songT = this.pausedAt - this.startAt;
    this.startAt = this.source() - (songT - lead);
    this.pausedAt = null; this.running = true;
    return songT;
  }
  get paused() { return this.pausedAt !== null; }
}
