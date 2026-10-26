// Formular-Backend für die Anfrage-Funktion (Web-Standard: Request → Response).
// Läuft z. B. als Cloudflare Worker (export default { fetch }), Netlify/Vercel Edge Function oder Deno Deploy.
// Versand per E-Mail-API (Beispiel: Resend). Alle Geheimnisse ausschließlich als Umgebungsvariablen:
//   MAIL_API_KEY   – API-Schlüssel des Mail-Dienstes (niemals ins Repository)
//   MAIL_TO        – Empfänger, z. B. info@silver-stage.de
//   MAIL_FROM      – verifizierter Absender beim Mail-Dienst, z. B. anfrage@silver-stage.de
//   ALLOWED_ORIGIN – Domain der Website, z. B. https://www.silver-stage.de
import { validateInquiry, isSpam, inquiryText } from "../src/lib/validate.js";

const MAX_BODY = 16_000;            // Bytes
const WINDOW_MS = 10 * 60 * 1000;   // einfache Begrenzung: max. 5 Anfragen je IP in 10 Minuten (je Instanz, best effort)
const hits = new Map();

function json(status, data, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": origin, "Vary": "Origin", "Cache-Control": "no-store" },
  });
}

export async function handle(request, env, sendMail = defaultSend) {
  const origin = env.ALLOWED_ORIGIN || "";
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" } });
  }
  if (request.method !== "POST") return json(405, { ok: false, error: "method" }, origin);
  if (origin && request.headers.get("Origin") && request.headers.get("Origin") !== origin) return json(403, { ok: false, error: "origin" }, origin);
  if (!(request.headers.get("Content-Type") || "").includes("application/json")) return json(415, { ok: false, error: "type" }, origin);

  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "unbekannt";
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= 5) return json(429, { ok: false, error: "rate" }, origin);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json(413, { ok: false, error: "size" }, origin);
  let data;
  try { data = JSON.parse(raw); } catch { return json(400, { ok: false, error: "json" }, origin); }
  if (typeof data !== "object" || data === null) return json(400, { ok: false, error: "json" }, origin);

  // Honeypot: Bots bekommen ein „OK“, es wird aber nichts verschickt
  if (isSpam(data)) return json(200, { ok: true }, origin);
  const errors = validateInquiry(data);
  if (Object.keys(errors).length) return json(422, { ok: false, errors }, origin);

  list.push(now); hits.set(ip, list);
  const clean = Object.fromEntries(["name", "email", "phone", "interest", "date", "duration", "message"].map((k) => [k, String(data[k] ?? "").trim().replace(/[\r\n]+/g, k === "message" ? "\n" : " ")]));
  try {
    await sendMail(env, {
      to: env.MAIL_TO,
      from: env.MAIL_FROM,
      replyTo: clean.email,
      subject: `Anfrage: ${clean.interest} – ${clean.name}`.slice(0, 140),
      text: inquiryText(clean),
    });
  } catch {
    return json(502, { ok: false, error: "mail" }, origin); // Website zeigt dann die Fehlermeldung, Eingaben bleiben erhalten
  }
  return json(200, { ok: true }, origin);
}

// Beispiel-Versand über die Resend-API. Für einen anderen Dienst nur diese Funktion austauschen.
async function defaultSend(env, m) {
  if (!env.MAIL_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) throw new Error("Mail-Konfiguration fehlt");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.MAIL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: m.from, to: [m.to], reply_to: m.replyTo, subject: m.subject, text: m.text }),
  });
  if (!res.ok) throw new Error(`Mail-Dienst ${res.status}`);
}

// Cloudflare-Worker-Einstieg
export default { fetch: (request, env) => handle(request, env) };
