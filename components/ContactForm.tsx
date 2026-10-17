interface Props {
  topics: string[];
}

const field =
  "mt-1 w-full rounded-t border border-t-line bg-t-surface px-3 py-2.5 text-t-ink placeholder:text-t-muted/70 focus:border-t-accent focus:outline-none focus:ring-2 focus:ring-t-accent/30";

// Kontaktformular des Entwurfs (Absenden zeigt nur einen Hinweis, Skript in Enhance.tsx).
export default function ContactForm({ topics }: Props) {
  return (
    <div>
      <form data-contact className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-t-ink">Name *<input id="cf-name" name="name" required autoComplete="name" className={field} placeholder="Vor- und Nachname" /></label>
        <label className="text-sm font-medium text-t-ink">Telefon *<input id="cf-phone" name="phone" type="tel" required autoComplete="tel" className={field} placeholder="Für den Rückruf" /></label>
        <label className="text-sm font-medium text-t-ink">E-Mail<input id="cf-email" name="email" type="email" autoComplete="email" className={field} placeholder="optional" /></label>
        <label className="text-sm font-medium text-t-ink">Ort des Projekts<input id="cf-place" name="place" autoComplete="address-level2" className={field} placeholder="z. B. Ihr Wohnort" /></label>
        <label className="text-sm font-medium text-t-ink sm:col-span-2">Worum geht es?
          <select id="cf-topic" name="topic" className={field} defaultValue={topics[0]}>
            {topics.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-t-ink sm:col-span-2">Ihre Nachricht *
          <textarea id="cf-message" name="message" required rows={4} className={field} placeholder="Was soll gemacht werden, ungefähre Größe, Wunschtermin." />
        </label>
        <label className="flex items-start gap-3 text-sm text-t-muted sm:col-span-2">
          <input id="cf-consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]" />
          <span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden (siehe Datenschutz). *</span>
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="inline-flex w-full items-center justify-center rounded-t bg-t-accent px-6 py-3.5 font-semibold text-t-accent-ink shadow-sm transition hover:brightness-110 sm:w-auto">Anfrage absenden</button>
          <p className="mt-2 text-xs text-t-muted">* Pflichtfelder</p>
        </div>
      </form>
      <div data-contact-done hidden role="status" className="rounded-t border border-t-line bg-t-surface p-6 text-t-ink">
        <p className="font-display text-xl font-semibold">Danke! So würde Ihre Anfrage beim Betrieb ankommen.</p>
        <p className="mt-2 text-sm text-t-muted">Dies ist ein Website-Entwurf: Das Formular verschickt noch keine Daten. In der Live-Version landet die Anfrage direkt im Postfach des Betriebs.</p>
      </div>
    </div>
  );
}
