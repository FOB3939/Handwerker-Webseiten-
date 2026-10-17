"use client";

import { useState, type FormEvent } from "react";

interface Props {
  topics: string[];
  companyName: string;
}

export default function ContactForm({ topics, companyName }: Props) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-t border border-t-line bg-t-surface p-6 text-t-ink">
        <p className="font-display text-xl font-semibold">Danke – so würde Ihre Anfrage bei {companyName} ankommen.</p>
        <p className="mt-2 text-sm text-t-muted">
          Dies ist ein Website-Entwurf: Das Formular verschickt noch keine Daten. In der Live-Version landet die Anfrage
          direkt im Postfach des Betriebs.
        </p>
        <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm font-semibold text-t-accent underline underline-offset-4">
          Formular erneut anzeigen
        </button>
      </div>
    );
  }

  const field = "mt-1 w-full rounded-t border border-t-line bg-t-surface px-3 py-2.5 text-t-ink placeholder:text-t-muted/70 focus:border-t-accent focus:outline-none focus:ring-2 focus:ring-t-accent/30";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate={false}>
      <label className="text-sm font-medium text-t-ink">
        Name *
        <input name="name" required autoComplete="name" className={field} placeholder="Vor- und Nachname" />
      </label>
      <label className="text-sm font-medium text-t-ink">
        Telefon *
        <input name="phone" type="tel" required autoComplete="tel" className={field} placeholder="Für den Rückruf" />
      </label>
      <label className="text-sm font-medium text-t-ink">
        E-Mail
        <input name="email" type="email" autoComplete="email" className={field} placeholder="optional" />
      </label>
      <label className="text-sm font-medium text-t-ink">
        Ort des Projekts
        <input name="place" autoComplete="address-level2" className={field} placeholder="z. B. Ihr Wohnort" />
      </label>
      <label className="text-sm font-medium text-t-ink sm:col-span-2">
        Worum geht es?
        <select name="topic" className={field} defaultValue={topics[0]}>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-t-ink sm:col-span-2">
        Ihre Nachricht *
        <textarea name="message" required rows={4} className={field} placeholder="Kurz beschreiben: Was soll gemacht werden, ungefähre Größe, Wunschtermin." />
      </label>
      <label className="flex items-start gap-3 text-sm text-t-muted sm:col-span-2">
        <input type="checkbox" required className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]" />
        <span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden (siehe Datenschutz). *</span>
      </label>
      <div className="sm:col-span-2">
        <button type="submit" className="inline-flex w-full items-center justify-center rounded-t bg-t-accent px-6 py-3.5 font-semibold text-t-accent-ink shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-t-accent sm:w-auto">
          Anfrage absenden
        </button>
        <p className="mt-2 text-xs text-t-muted">* Pflichtfelder</p>
      </div>
    </form>
  );
}
