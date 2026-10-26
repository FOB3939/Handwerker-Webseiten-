// Logikprüfung für Beat Stage: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { SETTINGS, createChart, judge, Round, Clock } from "../src/game/engine.js";

test("Chart: fest, sortiert, innerhalb der Runde, spielbare Abstände", () => {
  const a = createChart(), b = createChart();
  assert.deepEqual(a, b, "jede Runde gleich (keine Zufallsfolge)");
  assert.ok(a.length > 40);
  for (let i = 1; i < a.length; i++) {
    assert.ok(a[i].time > a[i - 1].time, "streng aufsteigend");
    assert.ok(a[i].time - a[i - 1].time >= 60 / SETTINGS.bpm / 2 - 1e-9, "mindestens eine Achtel Abstand");
  }
  assert.ok(a.at(-1).time <= SETTINGS.roundSeconds);
});

test("Trefferfenster: Perfekt ±80 ms, Gut ±150 ms, sonst nichts", () => {
  assert.equal(judge(0), "perfect");
  assert.equal(judge(0.08), "perfect");
  assert.equal(judge(-0.0801), "good");
  assert.equal(judge(0.15), "good");
  assert.equal(judge(0.151), null);
  assert.equal(judge(-0.2), null);
});

const chart = [{ id: 0, time: 1, pad: 0 }, { id: 1, time: 1.6, pad: 1 }, { id: 2, time: 2.2, pad: 0 }];

test("Jede Note wird höchstens einmal gewertet (Doppel-Tap, Autorepeat)", () => {
  const r = new Round(chart);
  assert.equal(r.hit(0, 1.01).result, "perfect");
  const second = r.hit(0, 1.02);
  assert.equal(second.result, null, "zweiter Tap auf dieselbe Note zählt nicht");
  assert.equal(r.counts.perfect, 1);
  assert.equal(r.combo, 0, "Fehlgriff setzt Combo zurück");
});

test("Falsches Pad und Tap ohne Note bringen keine Punkte", () => {
  const r = new Round(chart);
  assert.equal(r.hit(3, 1.0).result, null);
  assert.equal(r.hit(0, 0.5).result, null);
  assert.equal(r.score, 0);
});

test("Combo zählt hoch und wird bei verpasster Note zurückgesetzt", () => {
  const r = new Round(chart);
  r.hit(0, 1.0); r.hit(1, 1.62);
  assert.equal(r.combo, 2);
  assert.equal(r.score, 100 + 100 + SETTINGS.comboBonus);
  const missed = r.update(2.2 + SETTINGS.good + 0.01);
  assert.equal(missed.length, 1);
  assert.equal(r.combo, 0);
  assert.equal(r.maxCombo, 2);
});

test("Gut-Treffer und Punktestand", () => {
  const r = new Round(chart);
  assert.equal(r.hit(0, 1.12).result, "good");
  assert.equal(r.score, 50);
});

test("Rundenende und Auswertung", () => {
  const r = new Round(chart);
  r.hit(0, 1); r.hit(1, 1.6);
  r.update(5);
  assert.ok(r.isOver(r.lastTime + 0.2));
  const res = r.result();
  assert.equal(res.total, 3);
  assert.equal(res.miss, 1);
  assert.equal(res.accuracy, 67);
});

test("Clock: Pause friert die Songzeit ein, Fortsetzen mit Countdown springt zurück und läuft weiter", () => {
  let t = 100; const c = new Clock(() => t);
  c.start(1.8);                       // Countdown 1,8 s
  assert.equal(+c.now().toFixed(3), -1.8);
  t = 105; assert.equal(+c.now().toFixed(3), 3.2);
  c.pause(); t = 200;
  assert.equal(+c.now().toFixed(3), 3.2, "während Pause keine Zeit vergeht");
  const back = c.resume(1.8);
  assert.equal(+back.toFixed(3), 3.2, "Wertung läuft ab der Pausenstelle weiter");
  assert.equal(+c.now().toFixed(3), 1.4, "Countdown vor der Pausenstelle");
  t = 201.8; assert.equal(+c.now().toFixed(3), 3.2, "nach dem Countdown genau an der Pausenstelle");
});

test("Neustart: neue Runde beginnt sauber", () => {
  const r1 = new Round(chart); r1.hit(0, 1);
  const r2 = new Round(chart);
  assert.equal(r2.score, 0);
  assert.equal(r2.notes.every((n) => n.result === null), true);
});
