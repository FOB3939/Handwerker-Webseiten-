interface Props {
  services: string[];
  sizeLabel: string;
  sizes: string[];
  timings: string[];
  compact?: boolean;
  title?: string;
  firstQuestion?: string;
}

const STEPS = ["Leistung", "Umfang", "Zeitraum", "Kontakt"];

const optionCls =
  "rounded-t border border-t-line px-4 py-3 text-left text-sm font-medium transition hover:border-t-accent hover:bg-t-accent/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-t-accent";
const inputCls =
  "mt-1 w-full rounded-t border border-t-line bg-t-bg px-3 py-2.5 focus:border-t-accent focus:outline-none focus:ring-2 focus:ring-t-accent/30";

// Mehrstufige Schnellanfrage („Angebot in 60 Sekunden“). Gesteuert vom Skript in Enhance.tsx;
// im Entwurf werden keine Daten verschickt.
export default function QuickRequest({ services, sizeLabel, sizes, timings, compact = false, title = "Angebot in 60 Sekunden", firstQuestion = "Was dürfen wir für Sie tun?" }: Props) {
  const groups = [
    { q: firstQuestion, o: services },
    { q: sizeLabel, o: sizes },
    { q: "Wann soll es losgehen?", o: timings },
  ];
  return (
    <div data-qr className={`rounded-t bg-t-surface text-t-ink shadow-2xl ring-1 ring-t-line ${compact ? "p-5" : "p-6 sm:p-8"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg font-bold">{title}</p>
        <p className="text-xs font-semibold text-t-muted" data-qr-count>Schritt 1 von 4</p>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span key={s} data-qr-bar className={`h-1.5 rounded-full ${i === 0 ? "bg-t-accent/50" : "bg-t-line"}`} />
        ))}
      </div>
      {groups.map((g, i) => (
        <fieldset key={g.q} data-qr-step={i} hidden={i > 0} className="mt-5">
          <legend className="font-semibold">{g.q}</legend>
          <div className={`mt-3 grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
            {g.o.map((o) => (
              <button key={o} type="button" data-qr-choice={o} className={optionCls}>{o}</button>
            ))}
          </div>
          {i > 0 && <button type="button" data-qr-back className="mt-4 text-sm font-semibold text-t-muted hover:text-t-ink">← Zurück</button>}
        </fieldset>
      ))}
      <form data-qr-step={3} hidden className="mt-5 grid gap-3">
        <p className="font-semibold">Wohin dürfen wir uns melden?</p>
        <label className="text-sm font-medium">Name<input required autoComplete="name" className={inputCls} /></label>
        <label className="text-sm font-medium">Telefon<input type="tel" required autoComplete="tel" className={inputCls} /></label>
        <label className="flex items-start gap-2 text-xs text-t-muted">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]" />
          Ich stimme zu, dass meine Angaben zur Bearbeitung der Anfrage genutzt werden.
        </label>
        <div className="flex items-center gap-4">
          <button type="submit" className="rounded-t bg-t-accent px-5 py-3 font-semibold text-t-accent-ink hover:brightness-110">Kostenlos anfragen</button>
          <button type="button" data-qr-back className="text-sm font-semibold text-t-muted hover:text-t-ink">← Zurück</button>
        </div>
      </form>
      <div data-qr-done hidden role="status" className="mt-5">
        <p className="font-semibold">Danke! So würde Ihre Anfrage beim Betrieb ankommen:</p>
        <ul data-qr-summary className="mt-3 space-y-1 text-sm text-t-muted" />
        <p className="mt-3 text-xs text-t-muted">Website-Entwurf: Es werden noch keine Daten verschickt.</p>
        <button type="button" data-qr-reset className="mt-4 text-sm font-semibold text-t-accent underline underline-offset-4">Neue Anfrage</button>
      </div>
    </div>
  );
}
