import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../form-backend/handler.js";
import { validateInquiry } from "../src/lib/validate.js";

const env = { ALLOWED_ORIGIN: "https://www.silver-stage.de", MAIL_TO: "studio@example.org", MAIL_FROM: "anfrage@example.org", MAIL_API_KEY: "x" };
const good = { name: "Test Person", email: "test@example.org", interest: "Tonstudio", message: "Wir möchten zwei Songs aufnehmen." };
const req = (body, headers = {}) => new Request("https://api.example/anfrage", { method: "POST", headers: { "Content-Type": "application/json", Origin: env.ALLOWED_ORIGIN, "X-Forwarded-For": String(Math.random()), ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

test("gültige Anfrage wird erst nach erfolgreichem Versand bestätigt", async () => {
  let sent = null;
  const res = await handle(req(good), env, async (_e, m) => { sent = m; });
  assert.equal(res.status, 200);
  assert.equal(sent.replyTo, "test@example.org");
  assert.match(sent.text, /zwei Songs/);
});
test("Versandfehler → 502, kein Erfolg", async () => {
  const res = await handle(req(good), env, async () => { throw new Error("down"); });
  assert.equal(res.status, 502);
});
test("Validierungsfehler → 422 mit Feldern", async () => {
  const res = await handle(req({ ...good, email: "x" }), env, async () => {});
  assert.equal(res.status, 422);
  assert.ok((await res.json()).errors.email);
});
test("Honeypot: nichts wird verschickt", async () => {
  let sent = false;
  const res = await handle(req({ ...good, website: "spam" }), env, async () => { sent = true; });
  assert.equal(res.status, 200); assert.equal(sent, false);
});
test("fremde Herkunft und falsche Methode werden abgelehnt", async () => {
  assert.equal((await handle(req(good, { Origin: "https://evil.example" }), env, async () => {})).status, 403);
  assert.equal((await handle(new Request("https://api.example/anfrage"), env)).status, 405);
});
test("Mengenbegrenzung je IP", async () => {
  const h = { "X-Forwarded-For": "10.0.0.9" }; let last;
  for (let i = 0; i < 6; i++) last = await handle(req(good, h), env, async () => {});
  assert.equal(last.status, 429);
});
test("Validierung: Datum in der Vergangenheit, Pflichtfelder", () => {
  const e = validateInquiry({ name: "", email: "", interest: "", message: "kurz", date: "2000-01-01" });
  assert.deepEqual(Object.keys(e).sort(), ["date", "email", "interest", "message", "name"]);
});
