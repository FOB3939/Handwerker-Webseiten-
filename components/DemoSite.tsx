import type { Lead } from "@/lib/types";
import { themes, themeStyle, type Theme } from "@/lib/themes";
import { telHref } from "@/lib/leads";
import PlaceholderArt from "./PlaceholderArt";
import ContactForm from "./ContactForm";

const DEMO_NOTICE = "Unverbindlicher Website-Entwurf – nicht die offizielle Website des Unternehmens.";

export default function DemoSite({ lead }: { lead: Lead }) {
  const { site, company } = lead;
  const base = themes[site.theme];
  const theme = site.motif ? { ...base, motif: site.motif } : base;
  const call = company.phone ? telHref(company.phone) : "#kontakt";
  const upper = theme.displayCase === "upper" ? "uppercase tracking-tight" : "";

  return (
    <div style={themeStyle(theme)} className="min-h-screen bg-t-bg font-body text-t-ink">
      <a href="#inhalt" className="skip-link rounded bg-t-ink px-3 py-2 text-t-bg">
        Zum Inhalt springen
      </a>

      <div className="bg-t-dark px-4 py-2 text-center text-xs text-t-dark-ink/85" role="note">
        {DEMO_NOTICE}
      </div>

      <Header lead={lead} call={call} />

      <main id="inhalt">
        <Hero lead={lead} theme={theme} call={call} upper={upper} />
        <TrustBar items={site.trust} variant={theme.hero} />
        <Services lead={lead} theme={theme} upper={upper} />
        <Why lead={lead} theme={theme} upper={upper} />
        <Reviews lead={lead} upper={upper} />
        <Process lead={lead} upper={upper} />
        <Gallery lead={lead} theme={theme} upper={upper} />
        <Region lead={lead} upper={upper} />
        <Faq lead={lead} upper={upper} />
        <Contact lead={lead} call={call} upper={upper} />
      </main>

      <Footer lead={lead} call={call} />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-t-line bg-t-surface/95 p-3 backdrop-blur md:hidden">
        <div className="flex gap-2">
          {company.phone && (
            <a href={call} className="flex flex-1 items-center justify-center gap-2 rounded-t border border-t-ink/15 px-3 py-3 text-sm font-semibold text-t-ink">
              <PhoneIcon /> Anrufen
            </a>
          )}
          <a href="#kontakt" className="flex flex-[1.4] items-center justify-center rounded-t bg-t-accent px-3 py-3 text-sm font-semibold text-t-accent-ink">
            {site.stickyCta}
          </a>
        </div>
      </div>
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}

function Header({ lead, call }: { lead: Lead; call: string }) {
  const { site, company } = lead;
  return (
    <header className="sticky top-0 z-30 border-b border-t-line bg-t-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#inhalt" className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-t bg-t-accent font-display text-lg font-bold text-t-accent-ink">
            {site.logoMark}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-bold leading-tight">{company.name}</span>
            <span className="block truncate text-xs text-t-muted">{company.trade} · {company.city}</span>
          </span>
        </a>
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {site.nav.map((n) => (
            <a key={n.href} href={n.href} className="text-t-muted transition hover:text-t-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {company.phone && (
            <a href={call} className="hidden items-center gap-2 rounded-t bg-t-accent px-4 py-2.5 text-sm font-semibold text-t-accent-ink sm:inline-flex">
              <PhoneIcon /> {company.phone}
            </a>
          )}
          <details className="relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-t border border-t-line [&::-webkit-details-marker]:hidden" aria-label="Menü öffnen">
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </summary>
            <nav aria-label="Mobile Navigation" className="absolute right-0 mt-2 w-56 rounded-t border border-t-line bg-t-surface p-2 shadow-xl">
              {site.nav.map((n) => (
                <a key={n.href} href={n.href} className="block rounded px-3 py-2.5 text-sm font-medium hover:bg-t-bg">
                  {n.label}
                </a>
              ))}
              <a href="#kontakt" className="mt-1 block rounded bg-t-accent px-3 py-2.5 text-sm font-semibold text-t-accent-ink">
                {site.hero.ctaPrimary}
              </a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function CtaRow({ lead, call, dark = false }: { lead: Lead; call: string; dark?: boolean }) {
  const { hero } = lead.site;
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <a href="#kontakt" className="inline-flex items-center justify-center rounded-t bg-t-accent px-6 py-3.5 font-semibold text-t-accent-ink shadow-sm transition hover:brightness-110">
        {hero.ctaPrimary}
      </a>
      <a
        href={lead.company.phone ? call : "#kontakt"}
        className={`inline-flex items-center justify-center gap-2 rounded-t border px-6 py-3.5 font-semibold transition ${
          dark ? "border-white/30 text-white hover:bg-white/10" : "border-t-ink/20 text-t-ink hover:bg-t-ink/5"
        }`}
      >
        <PhoneIcon /> {hero.ctaSecondary}
      </a>
    </div>
  );
}

function Bullets({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className={`mt-6 grid gap-2 text-sm ${dark ? "text-white/85" : "text-t-muted"}`}>
      {items.map((b) => (
        <li key={b} className="flex items-start gap-2">
          <CheckIcon className="mt-0.5 shrink-0 text-t-accent" /> <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function Hero({ lead, theme, call, upper }: { lead: Lead; theme: Theme; call: string; upper: string }) {
  const { hero } = lead.site;
  const art = (cls: string, seed = 0) => <PlaceholderArt motif={theme.motif} palette={theme.palette} label={hero.imageLabel} seed={seed} className={cls} />;

  if (theme.hero === "editorial") {
    return (
      <section className="mx-auto grid max-w-site gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-12 lg:pt-20">
        <div className="lg:col-span-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-t-accent">{hero.eyebrow}</p>
          <h1 className={`mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl ${upper}`}>{hero.headline}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-t-muted">{hero.sub}</p>
          <CtaRow lead={lead} call={call} />
          <Bullets items={hero.bullets} />
        </div>
        <div className="relative lg:col-span-5">
          {art("aspect-[4/5] w-full rounded-t shadow-2xl")}
          <div className="absolute -bottom-5 -left-3 flex gap-1.5 rounded-t bg-t-surface p-2 shadow-lg sm:-left-6" aria-hidden="true">
            {theme.palette.map((c) => (
              <span key={c} className="h-8 w-8 rounded-sm" style={{ background: c }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (theme.hero === "panel") {
    return (
      <section className="bg-t-dark text-t-dark-ink">
        <div className="mx-auto grid max-w-site gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="inline-flex rounded-full bg-t-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-t-accent">{hero.eyebrow}</p>
            <h1 className={`mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl ${upper}`}>{hero.headline}</h1>
            <p className="mt-5 max-w-xl text-lg text-t-dark-ink/80">{hero.sub}</p>
            <CtaRow lead={lead} call={call} dark />
          </div>
          <div className="rounded-t bg-t-surface p-6 text-t-ink shadow-2xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-t-muted">Auf einen Blick</p>
            <Bullets items={hero.bullets} />
            {art("mt-6 aspect-[16/9] w-full rounded-t")}
          </div>
        </div>
      </section>
    );
  }

  if (theme.hero === "fullbleed") {
    return (
      <section className="relative isolate min-h-[34rem] overflow-hidden bg-t-dark text-white">
        {art("absolute inset-0 -z-10 h-full w-full")}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
        <div className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-t-accent">{hero.eyebrow}</p>
          <h1 className={`mt-5 max-w-3xl font-display text-4xl font-light leading-[1.05] sm:text-6xl ${upper}`}>{hero.headline}</h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">{hero.sub}</p>
          <CtaRow lead={lead} call={call} dark />
          <div className="max-w-xl"><Bullets items={hero.bullets} dark /></div>
        </div>
      </section>
    );
  }

  if (theme.hero === "organic") {
    return (
      <section className="px-3 pt-3 sm:px-6 sm:pt-6">
        <div className="relative isolate mx-auto max-w-site overflow-hidden rounded-[2rem] bg-t-dark text-t-dark-ink">
          {art("absolute inset-0 -z-10 h-full w-full opacity-60", 1)}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-t-dark via-t-dark/70 to-t-dark/20" />
          <div className="px-6 pb-14 pt-24 sm:px-12 lg:pb-20 lg:pt-36">
            <p className="font-display text-lg italic text-t-dark-ink/85">{hero.eyebrow}</p>
            <h1 className={`mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.08] sm:text-6xl ${upper}`}>{hero.headline}</h1>
            <p className="mt-5 max-w-xl text-lg text-t-dark-ink/85">{hero.sub}</p>
            <CtaRow lead={lead} call={call} dark />
            <div className="mt-2 flex flex-wrap gap-2">
              {hero.bullets.map((b) => (
                <span key={b} className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // split
  return (
    <section className="border-b border-t-line">
      <div className="mx-auto grid max-w-site items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-t-accent">
            <span className="h-0.5 w-8 bg-t-accent" aria-hidden="true" /> {hero.eyebrow}
          </p>
          <h1 className={`mt-4 font-display text-4xl font-bold leading-[1.02] sm:text-6xl ${upper}`}>{hero.headline}</h1>
          <p className="mt-5 max-w-xl text-lg text-t-muted">{hero.sub}</p>
          <CtaRow lead={lead} call={call} />
          <Bullets items={hero.bullets} />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {art("col-span-3 aspect-[3/4] rounded-t", 0)}
          <div className="col-span-2 grid gap-3">
            <PlaceholderArt motif={theme.motif} palette={theme.palette} label="Detail" seed={2} className="aspect-square rounded-t" showLabel={false} />
            <div className="flex aspect-square flex-col justify-end rounded-t bg-t-dark p-4 text-t-dark-ink">
              <span className="font-display text-3xl font-bold">{lead.site.trust[0]?.value}</span>
              <span className="text-xs text-t-dark-ink/75">{lead.site.trust[0]?.label}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar({ items, variant }: { items: Lead["site"]["trust"]; variant: Theme["hero"] }) {
  const overlap = variant === "panel" || variant === "fullbleed";
  return (
    <section aria-label="Vertrauenssignale" className={`mx-auto max-w-site px-4 sm:px-6 ${overlap ? "-mt-8 relative z-10" : "mt-10"}`}>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-t border border-t-line bg-t-line shadow-sm lg:grid-cols-4">
        {items.map((t) => (
          <div key={t.label} className="bg-t-surface p-5">
            <dt className="text-xs text-t-muted">{t.label}</dt>
            <dd className="order-first font-display text-2xl font-bold text-t-ink">{t.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SectionHead({ kicker, title, text, upper, center = false }: { kicker: string; title: string; text?: string; upper: string; center?: boolean }) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-t-accent">{kicker}</p>
      <h2 className={`mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl ${upper}`}>{title}</h2>
      {text && <p className="mt-4 text-lg text-t-muted">{text}</p>}
    </div>
  );
}

function Services({ lead, theme, upper }: { lead: Lead; theme: Theme; upper: string }) {
  const { services, servicesIntro } = lead.site;
  return (
    <section id="leistungen" className="mx-auto max-w-site px-4 py-20 sm:px-6">
      <SectionHead kicker="Leistungen" title={servicesIntro.headline} text={servicesIntro.text} upper={upper} />
      {theme.services === "numbered" && (
        <ol className="mt-12 divide-y divide-t-line border-y border-t-line">
          {services.map((s, i) => (
            <li key={s.title} className="grid gap-4 py-8 md:grid-cols-12">
              <span className="font-display text-4xl font-light text-t-accent md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <div className="md:col-span-5">
                <h3 className={`font-display text-2xl font-semibold ${upper}`}>{s.title}</h3>
                <p className="mt-2 text-t-muted">{s.text}</p>
              </div>
              <ul className="flex flex-wrap content-start gap-2 md:col-span-6">
                {s.items.map((it) => (
                  <li key={it} className="rounded-full border border-t-line bg-t-surface px-3 py-1.5 text-sm">{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
      {theme.services === "cards" && (
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.title} className="flex flex-col rounded-t border border-t-line bg-t-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="grid h-11 w-11 place-items-center rounded-t bg-t-accent/15 text-t-accent" aria-hidden="true"><CheckIcon /></span>
              <h3 className={`mt-4 font-display text-xl font-bold ${upper}`}>{s.title}</h3>
              <p className="mt-2 text-t-muted">{s.text}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {s.items.map((it) => (
                  <li key={it} className="flex gap-2"><span className="text-t-accent" aria-hidden="true">–</span>{it}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
      {theme.services === "tiles" && (
        <div className="mt-12 grid gap-px bg-t-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article key={s.title} className="group bg-t-bg">
              <PlaceholderArt motif={theme.motif} palette={theme.palette} label={s.title} seed={i + 1} className="aspect-[16/10] w-full" showLabel={false} />
              <div className="p-6">
                <h3 className={`font-display text-xl font-semibold ${upper}`}>{s.title}</h3>
                <p className="mt-2 text-sm text-t-muted">{s.text}</p>
                <p className="mt-3 text-sm font-medium">{s.items.join(" · ")}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Why({ lead, theme, upper }: { lead: Lead; theme: Theme; upper: string }) {
  const { why } = lead.site;
  const { company } = lead;
  return (
    <section id="ueber-uns" className="bg-t-dark text-t-dark-ink">
      <div className="mx-auto grid max-w-site gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-t-accent">Warum {company.owner ?? company.name}?</p>
          <h2 className={`mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl ${upper}`}>{why.headline}</h2>
          <PlaceholderArt motif={theme.motif} palette={theme.palette} label={company.owner ? `Portrait ${company.owner}` : "Portrait des Inhabers / Teams"} seed={3} className="mt-8 aspect-[4/3] rounded-t" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
          {why.points.map((p) => (
            <div key={p.title} className="rounded-t border border-white/10 bg-white/[0.04] p-6">
              <h3 className="font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-t-dark-ink/75">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-t-accent" aria-label={`${rating.toLocaleString("de-DE")} von 5 Sternen`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill={i < Math.round(rating) ? "currentColor" : "none"} stroke="currentColor">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Reviews({ lead, upper }: { lead: Lead; upper: string }) {
  const r = lead.site.reviews;
  return (
    <section id="bewertungen" className="mx-auto max-w-site px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHead kicker="Kundenstimmen" title={r.headline} upper={upper} />
          {r.rating !== null && (
            <div className="mt-8 rounded-t border border-t-line bg-t-surface p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl font-bold">{r.rating.toLocaleString("de-DE", { minimumFractionDigits: 1 })}</span>
                <span className="text-t-muted">von 5</span>
              </div>
              <Stars rating={r.rating} />
              <p className="mt-2 text-sm text-t-muted">
                {r.count !== null ? `${r.count} Bewertungen auf ` : "Bewertungen auf "}
                <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-t-ink underline underline-offset-4">{r.source}</a>
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-7">
          <p className="text-xl leading-relaxed">{r.summary}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {r.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 rounded-t border border-t-line bg-t-surface p-5">
                <CheckIcon className="mt-0.5 shrink-0 text-t-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-t-muted">
            Sinngemäße Zusammenfassung öffentlicher Bewertungen. Quelle: {r.source}. Stand der Recherche: {new Date(lead.date).toLocaleDateString("de-DE")}.
          </p>
        </div>
      </div>
    </section>
  );
}

function Process({ lead, upper }: { lead: Lead; upper: string }) {
  const p = lead.site.process;
  return (
    <section id="ablauf" className="border-y border-t-line bg-t-surface">
      <div className="mx-auto max-w-site px-4 py-20 sm:px-6">
        <SectionHead kicker="So läuft es ab" title={p.headline} upper={upper} center />
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {p.steps.map((s, i) => (
            <li key={s.title} className="relative rounded-t bg-t-bg p-6">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-t-accent font-bold text-t-accent-ink">{i + 1}</span>
              <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-t-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Gallery({ lead, theme, upper }: { lead: Lead; theme: Theme; upper: string }) {
  const g = lead.site.gallery;
  return (
    <section id="projekte" className="mx-auto max-w-site px-4 py-20 sm:px-6">
      <SectionHead kicker="Projekte" title={g.headline} text={g.text} upper={upper} />
      <div className="mt-12 grid auto-rows-[12rem] grid-cols-2 gap-3 md:auto-rows-[14rem] md:grid-cols-4">
        {g.items.map((it, i) => (
          <figure key={it.title} className={`relative overflow-hidden rounded-t ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
            <PlaceholderArt motif={theme.motif} palette={theme.palette} label={it.photoNeeded} seed={i + 4} className="h-full w-full" />
            <figcaption className="absolute right-3 top-3 rounded bg-t-surface/90 px-2 py-1 text-xs font-semibold text-t-ink">{it.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Region({ lead, upper }: { lead: Lead; upper: string }) {
  const r = lead.site.region;
  return (
    <section id="region" className="bg-t-surface">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <SectionHead kicker="Einsatzgebiet" title={r.headline} text={r.text} upper={upper} />
        <ul className="flex flex-wrap content-start gap-2" aria-label="Orte im Einsatzgebiet">
          {r.places.map((p) => (
            <li key={p} className="rounded-full border border-t-line bg-t-bg px-4 py-2 text-sm font-medium">
              {lead.company.trade} {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq({ lead, upper }: { lead: Lead; upper: string }) {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <SectionHead kicker="FAQ" title="Häufige Fragen" upper={upper} center />
      <div className="mt-10 divide-y divide-t-line rounded-t border border-t-line bg-t-surface">
        {lead.site.faq.map((f) => (
          <details key={f.q} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="text-xl text-t-accent transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-3 text-t-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Contact({ lead, call, upper }: { lead: Lead; call: string; upper: string }) {
  const { contact } = lead.site;
  const { company } = lead;
  return (
    <section id="kontakt" className="bg-t-dark text-t-dark-ink">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-t-accent">Kontakt</p>
          <h2 className={`mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl ${upper}`}>{contact.headline}</h2>
          <p className="mt-4 text-lg text-t-dark-ink/80">{contact.text}</p>
          {company.phone && (
            <a href={call} className="mt-8 flex items-center gap-4 rounded-t bg-white/5 p-5 transition hover:bg-white/10">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-t-accent text-t-accent-ink"><PhoneIcon /></span>
              <span>
                <span className="block text-sm text-t-dark-ink/70">Direkt anrufen</span>
                <span className="block font-display text-2xl font-bold">{company.phone}</span>
              </span>
            </a>
          )}
          <dl className="mt-6 space-y-3 text-sm text-t-dark-ink/80">
            {company.owner && (<div><dt className="inline font-semibold text-t-dark-ink">Ansprechpartner: </dt><dd className="inline">{company.owner}</dd></div>)}
            <div><dt className="inline font-semibold text-t-dark-ink">Standort: </dt><dd className="inline">{company.address ?? company.city}</dd></div>
            <div><dt className="inline font-semibold text-t-dark-ink">Hinweis: </dt><dd className="inline">{contact.responseNote}</dd></div>
          </dl>
        </div>
        <div className="rounded-t bg-t-bg p-6 text-t-ink sm:p-8 lg:col-span-7">
          <ContactForm topics={contact.topics} companyName={company.name} />
        </div>
      </div>
    </section>
  );
}

function Footer({ lead, call }: { lead: Lead; call: string }) {
  const { company, site } = lead;
  const year = new Date(lead.date).getFullYear();
  return (
    <footer className="border-t border-t-line bg-t-bg">
      <div className="mx-auto grid max-w-site gap-8 px-4 py-12 text-sm sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">{company.name}</p>
          <p className="mt-2 text-t-muted">{company.trade} für {company.serviceArea.slice(0, 3).join(", ")} und Umgebung.</p>
          {company.phone && <a href={call} className="mt-3 inline-block font-semibold text-t-accent">{company.phone}</a>}
        </div>
        <nav aria-label="Footer-Navigation" className="grid content-start gap-2">
          {site.nav.map((n) => (
            <a key={n.href} href={n.href} className="text-t-muted hover:text-t-ink">{n.label}</a>
          ))}
        </nav>
        <div className="grid content-start gap-2">
          <a href="#impressum" className="text-t-muted hover:text-t-ink">Impressum</a>
          <a href="#datenschutz" className="text-t-muted hover:text-t-ink">Datenschutz</a>
        </div>
      </div>
      <div className="mx-auto grid max-w-site gap-4 px-4 pb-10 text-xs text-t-muted sm:px-6 md:grid-cols-2">
        <div id="impressum" className="rounded-t border border-dashed border-t-line p-4">
          <p className="font-semibold text-t-ink">Impressum (Platzhalter)</p>
          <p className="mt-1">Angaben gemäß § 5 DDG werden vor Veröffentlichung gemeinsam mit dem Betrieb ergänzt (Inhaber, Anschrift, Kontakt, ggf. Handwerkskammer und USt-IdNr.).</p>
        </div>
        <div id="datenschutz" className="rounded-t border border-dashed border-t-line p-4">
          <p className="font-semibold text-t-ink">Datenschutzerklärung (Platzhalter)</p>
          <p className="mt-1">Die vollständige Datenschutzerklärung nach DSGVO (Kontaktformular, Hosting, Server-Logs) wird vor dem Livegang erstellt.</p>
        </div>
      </div>
      <p className="border-t border-t-line px-4 py-4 text-center text-xs text-t-muted">
        {DEMO_NOTICE} Entwurf vom {new Date(lead.date).toLocaleDateString("de-DE")} · © {year}
      </p>
    </footer>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" className={className} aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
