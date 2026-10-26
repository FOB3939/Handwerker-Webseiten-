// Gemeinsame Prüfregeln für das Anfrageformular – im Browser und im Server-Handler (form-backend/) genutzt.
// Reines JavaScript ohne Abhängigkeiten, damit es auch in Tests (node --test) läuft.

export const INTERESTS = ["Tonstudio", "Stageroom", "Lightroom", "Sonstiges"];
export const DURATIONS = ["1–2 Stunden", "Halber Tag", "Ganzer Tag", "Mehrere Tage", "Noch offen"];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** @param {Record<string, string>} data  @returns {Record<string, string>} Feldname → Fehlermeldung */
export function validateInquiry(data) {
  const e = {};
  const v = (k) => String(data[k] ?? "").trim();
  if (v("name").length < 2) e.name = "Bitte gib deinen Namen an.";
  else if (v("name").length > 120) e.name = "Der Name ist zu lang.";
  if (!v("email")) e.email = "Bitte gib deine E-Mail-Adresse an.";
  else if (!EMAIL.test(v("email")) || v("email").length > 200) e.email = "Bitte prüf die E-Mail-Adresse, z. B. name@beispiel.de.";
  if (v("phone") && !/^[+\d][\d\s()/.-]{5,24}$/.test(v("phone"))) e.phone = "Bitte gib die Telefonnummer nur mit Ziffern ein – oder lass das Feld leer.";
  if (!INTERESTS.includes(v("interest"))) e.interest = "Bitte wähl aus, wofür du anfragst.";
  if (v("date")) {
    const d = new Date(`${v("date")}T12:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime())) e.date = "Bitte gib ein gültiges Datum an.";
    else if (d < today) e.date = "Der Wunschtermin liegt in der Vergangenheit.";
  }
  if (v("duration") && !DURATIONS.includes(v("duration"))) e.duration = "Bitte wähl eine Dauer aus der Liste.";
  if (v("message").length < 10) e.message = "Beschreib dein Vorhaben bitte in ein, zwei Sätzen.";
  else if (v("message").length > 4000) e.message = "Die Beschreibung ist zu lang (max. 4000 Zeichen).";
  return e;
}

/** Honeypot: echte Besucher lassen das versteckte Feld leer. */
export const isSpam = (data) => String(data.website ?? "").trim() !== "";

/** Text für E-Mail-Weiterleitung bzw. Mail-Programm. */
export function inquiryText(data) {
  const lines = [
    `Anfrage über silver-stage.de`,
    ``,
    `Name: ${data.name}`,
    `E-Mail: ${data.email}`,
    data.phone ? `Telefon: ${data.phone}` : null,
    `Interesse: ${data.interest}`,
    data.date ? `Wunschtermin: ${data.date}` : null,
    data.duration ? `Dauer: ${data.duration}` : null,
    ``,
    String(data.message ?? "").trim(),
  ];
  return lines.filter((l) => l !== null).join("\n");
}
