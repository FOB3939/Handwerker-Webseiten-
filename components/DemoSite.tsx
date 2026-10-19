import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { Lead } from "@/lib/types";
import { themeStyle } from "@/lib/themes";
import { resolveTheme, familyOf, type Identity } from "@/lib/identity";
import { HeroFx, TradeDivider, fxFor, type TradeFxKind } from "./TradeFx";
import { telHref } from "@/lib/leads";
import Scene from "./Scene";
import ContactForm from "./ContactForm";
import QuickRequest from "./QuickRequest";
import BeforeAfter from "./BeforeAfter";
import AreaMap from "./AreaMap";
import Enhance from "./Enhance";
import BrandLogo from "./BrandLogo";
import Splash from "./Splash";
import HofIcon, { productIcon } from "./HofIcons";
import ServiceIcon, { serviceIcon } from "./ServiceIcons";

const DEMO_NOTICE = "Unverbindlicher Website-Entwurf – nicht die offizielle Website des Unternehmens.";

interface Ctx {
  lead: Lead;
  theme: Identity;
  call: string;
  upper: string;
  hof: boolean;
  fx: TradeFxKind | null;
}

export default function DemoSite({ lead }: { lead: Lead }) {
  const { site, company } = lead;
  const theme = resolveTheme(lead);
  const ctx: Ctx = {
    lead,
    theme,
    call: company.phone ? telHref(company.phone) : "#kontakt",
    upper: theme.displayCase === "upper" ? "uppercase tracking-tight" : "",
    hof: (site.category ?? (site.theme === "hof" || site.scene === "farm" ? "hof" : "handwerk")) === "hof",
    fx: null,
  };
  // Gewerk-Signatur (Effekt im Hero + Trennleisten), nur für Handwerk
  if (!ctx.hof) ctx.fx = fxFor(company.trade, familyOf(lead));
  const heroHasForm = !ctx.hof && !["editorial", "organic", "banner"].includes(theme.hero);

  return (
    <div data-identity={theme.name} style={themeStyle(theme)} className="min-h-screen bg-t-bg font-body text-t-ink antialiased">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={theme.fontsHref} precedence="default" />
      <div className="scroll-progress fixed inset-x-0 top-0 z-[55] h-1 bg-t-accent" aria-hidden="true" />
      <Splash icon={site.logoIcon} mark={site.logoMark} name={site.brandName} tagline={`${company.trade} in ${company.city}`} logo={theme.logo} intro={theme.intro} />
      <a href="#inhalt" className="skip-link rounded bg-t-ink px-3 py-2 text-t-bg">Zum Inhalt springen</a>
      <div className="bg-black px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-white/80" role="note">{DEMO_NOTICE}</div>
      <TopBar {...ctx} />
      <Header {...ctx} />
      <main id="inhalt">
        <Hero {...ctx} />
        <Badges {...ctx} />
        <Marquee {...ctx} />
        {ctx.fx && <TradeDivider kind={ctx.fx} />}
        <Services {...ctx} />
        {ctx.hof && <Visit {...ctx} />}
        {!heroHasForm && <QuoteSection {...ctx} />}
        <About {...ctx} />
        <Stats {...ctx} />
        {ctx.hof ? <HofGallery {...ctx} /> : <Projects {...ctx} />}
        <Reviews {...ctx} />
        {ctx.fx && <TradeDivider kind={ctx.fx} />}
        <Process {...ctx} />
        <CtaBand {...ctx} />
        <Region {...ctx} />
        <Faq {...ctx} />
        <Contact {...ctx} />
      </main>
      <Footer {...ctx} />
      <StickyBar {...ctx} />
      <Enhance />
    </div>
  );
}

/* ---------- Kopfbereich ---------- */

function TopBar({ lead, call }: Ctx) {
  const { company, listings } = lead;
  const mh = listings.myhammer;
  return (
    <div className="bg-t-dark text-t-dark-ink">
      <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 text-xs sm:px-6">
        {mh.rating !== null && (
          <a href={mh.url} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1.5 hover:underline">
            <span className="text-t-accent" aria-hidden="true">★★★★★</span>
            <span><b>{fmt(mh.rating)}</b> von 5{mh.reviews !== null && ` · ${mh.reviews} Bewertungen`} auf MyHammer</span>
          </a>
        )}
        <span className="hidden text-t-dark-ink/75 md:inline">Einsatzgebiet: {company.serviceArea.filter((x) => !/umgebung/i.test(x)).slice(0, 3).join(", ")} &amp; Umgebung</span>
        <div className="flex items-center gap-4">
          {company.email && <a href={`mailto:${company.email}`} className="hidden hover:underline sm:inline">{company.email}</a>}
          {company.phone && <a href={call} className="font-semibold hover:underline">{company.phone}</a>}
        </div>
      </div>
    </div>
  );
}

function Logo({ lead, theme }: { lead: Lead; theme: Identity }) {
  const { site, company } = lead;
  return <BrandLogo icon={site.logoIcon} mark={site.logoMark} name={site.brandName} tagline={`${company.trade} in ${company.city}`} variant={theme.logo} />;
}

function Header({ lead, call, theme }: Ctx) {
  const { site, company } = lead;
  return (
    <header className="sticky top-0 z-30 border-b border-t-line bg-t-bg/95 backdrop-blur">
      <div className="hdr-inner mx-auto flex max-w-site items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#inhalt" className="min-w-0"><Logo lead={lead} theme={theme} /></a>
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {site.nav.map((n) => (
            <a key={n.href} href={n.href} className="whitespace-nowrap text-t-muted transition hover:text-t-ink">{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {company.phone && (
            <a href={call} className="hidden items-center gap-2 whitespace-nowrap rounded-t border border-t-ink/15 px-4 py-2.5 text-sm font-bold xl:inline-flex">
              <PhoneIcon /> {company.phone}
            </a>
          )}
          <a href="#anfrage" className="btn-shine hidden whitespace-nowrap rounded-t bg-t-accent px-4 py-2.5 text-sm font-bold text-t-accent-ink shadow-sm hover:brightness-110 sm:inline-flex">
            {site.hero.ctaPrimary}
          </a>
          <details className="relative lg:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-t border border-t-line [&::-webkit-details-marker]:hidden" aria-label="Menü öffnen">
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </summary>
            <nav aria-label="Mobile Navigation" className="absolute right-0 mt-2 w-60 rounded-t border border-t-line bg-t-surface p-2 shadow-xl">
              {site.nav.map((n) => (
                <a key={n.href} href={n.href} className="block rounded px-3 py-2.5 text-sm font-semibold hover:bg-t-bg">{n.label}</a>
              ))}
              <a href="#anfrage" className="mt-1 block rounded bg-t-accent px-3 py-2.5 text-sm font-bold text-t-accent-ink">{site.hero.ctaPrimary}</a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function RatingChip({ lead, dark = false }: { lead: Lead; dark?: boolean }) {
  const mh = lead.listings.myhammer;
  if (mh.rating === null) return null;
  return (
    <a href={mh.url} target="_blank" rel="noopener noreferrer nofollow"
      className={`inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm ${dark ? "bg-white/10 text-white ring-1 ring-white/20" : "bg-t-surface ring-1 ring-t-line"}`}>
      <Stars rating={mh.rating} />
      <span><b>{fmt(mh.rating)}</b>{mh.reviews !== null && ` · ${mh.reviews} Bewertungen`} · MyHammer</span>
    </a>
  );
}

function CtaRow({ lead, call, dark = false }: { lead: Lead; call: string; dark?: boolean }) {
  const { hero } = lead.site;
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <a href="#anfrage" className="btn-shine inline-flex items-center justify-center gap-2 rounded-t bg-t-accent px-7 py-4 font-bold text-t-accent-ink shadow-lg shadow-black/10 transition hover:brightness-110">
        {hero.ctaPrimary}
      </a>
      <a href={call} className={`inline-flex items-center justify-center gap-2 rounded-t border px-7 py-4 font-bold transition ${dark ? "border-white/30 text-white hover:bg-white/10" : "border-t-ink/20 text-t-ink hover:bg-t-ink/5"}`}>
        <PhoneIcon /> {lead.company.phone ?? hero.ctaSecondary}
      </a>
    </div>
  );
}

function Bullets({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className={`mt-7 grid gap-2.5 text-[15px] ${dark ? "text-white/90" : "text-t-ink/80"}`}>
      {items.map((b) => (
        <li key={b} className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-t-accent text-t-accent-ink"><CheckIcon size={12} /></span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

// Hero-Unterzeile bei Handwerkern: nur der erste Satz, damit der Hero ruhig bleibt.
function shortSub(sub: string) {
  const m = sub.match(/^.+?[.!?](?=\s|$)/);
  return (m ? m[0] : sub).trim();
}

function quoteProps(lead: Lead, hof = false) {
  return {
    services: lead.site.contact.topics.filter((t) => t !== "Sonstiges").slice(0, 6),
    ...lead.site.quote,
    title: hof ? "Anfrage in 60 Sekunden" : "Angebot in 60 Sekunden",
    firstQuestion: hof ? "Was interessiert Sie?" : "Was dürfen wir für Sie tun?",
  };
}

function Hero({ lead, theme, call, upper, hof, fx }: Ctx) {
  const sig = fx ? <HeroFx kind={fx} /> : null;
  const { hero, scene } = lead.site;
  const art = (cls: string, seed = 0) => <Scene kind={scene} palette={theme.palette} label={hero.imageLabel} seed={seed} className={cls} />;

  if (theme.hero === "editorial") {
    return (
      <section className="relative isolate overflow-hidden">
        {sig}
        <div className="mx-auto grid max-w-site items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-12 lg:pt-16">
          <div className="hero-in lg:col-span-6">
            <RatingChip lead={lead} />
            {hof && <p className="mt-8 text-sm font-bold uppercase tracking-[0.22em] text-t-accent">{hero.eyebrow}</p>}
            <h1 data-split {...fitH1(hero.headline, 0.48, `mt-4 text-balance font-display text-5xl font-semibold leading-[1.02] sm:text-7xl ${upper}`)}><span className="ink-line">{hero.headline}</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-t-muted">{hof ? hero.sub : shortSub(hero.sub)}</p>
            <OfferStrip lead={lead} hof={hof} />
            <CtaRow lead={lead} call={call} />
            {hof && <Bullets items={hero.bullets} />}
          </div>
          <div className="hero-media relative lg:col-span-6">
            <div className="absolute -right-24 -top-10 hidden h-[120%] w-2/3 rounded-l-full bg-t-accent/10 lg:block" aria-hidden="true" />
            {art("aspect-[4/5] w-full rounded-t shadow-2xl sm:aspect-[5/5]")}
            <div className="absolute -bottom-6 left-4 right-4 flex items-center justify-between gap-4 rounded-t bg-t-surface p-4 shadow-xl sm:left-auto sm:right-6 sm:w-80">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-t-muted">{lead.site.badges[0]?.sub}</p>
                <p className="font-display text-lg font-semibold">{lead.site.badges[0]?.title}</p>
              </div>
              <div className="flex gap-1" aria-hidden="true">
                {theme.palette.slice(0, 4).map((c) => <span key={c} className="h-8 w-4 rounded-sm" style={{ background: c }} />)}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (theme.hero === "fullbleed") {
    return (
      <section id="anfrage" className="relative isolate overflow-hidden bg-t-dark text-white">
        {sig}
        <div className="absolute inset-0 -z-10 overflow-hidden"><div data-parallax="0.18" className="h-full w-full">{art("absolute inset-0 h-full w-full", 1)}</div></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/50 to-black/5" />
        <div className="mx-auto grid max-w-site items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-24">
          <div className="hero-in lg:col-span-7">
            <RatingChip lead={lead} dark />
            {hof && <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-t-accent">{hero.eyebrow}</p>}
            <h1 data-split {...fitH1(hero.headline, 0.55, `mt-5 text-balance font-display text-4xl font-light leading-[1.04] sm:text-6xl ${upper}`)}>{hero.headline}</h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">{hof ? hero.sub : shortSub(hero.sub)}</p>
            <OfferStrip lead={lead} hof={hof} dark />
            {hof && <Bullets items={hero.bullets} dark />}
            <a href={call} className="mt-8 inline-flex items-center gap-2 font-bold text-white underline-offset-4 hover:underline">
              <PhoneIcon /> {lead.company.phone ? `Lieber direkt anrufen: ${lead.company.phone}` : hero.ctaSecondary}
            </a>
          </div>
          <div className="hero-media lg:col-span-5">{hof ? <HofInfoCard lead={lead} /> : <QuickRequest {...quoteProps(lead, hof)} />}</div>
        </div>
      </section>
    );
  }

  if (theme.hero === "organic") {
    return (
      <section className="px-3 pt-3 sm:px-6 sm:pt-6">
        <div className="relative isolate mx-auto max-w-site overflow-hidden rounded-[2rem] bg-t-dark text-t-dark-ink">
          <div className="absolute inset-0 -z-10 overflow-hidden"><div data-parallax="0.15" className="h-full w-full">{art("absolute inset-0 h-full w-full", 1)}</div></div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-t-dark via-t-dark/70 to-transparent" />
          <div className="grid gap-10 px-6 pb-12 pt-28 sm:px-12 lg:grid-cols-12 lg:pb-16 lg:pt-44">
            <div className="hero-in lg:col-span-8">
              <p className="font-display text-xl italic text-t-dark-ink/90">{hero.eyebrow}</p>
              <h1 data-split {...fitH1(hero.headline, 0.62, `mt-3 text-balance font-display text-5xl font-semibold leading-[1.04] sm:text-7xl ${upper}`)}>{hero.headline}</h1>
              <p className="mt-5 max-w-xl text-lg text-t-dark-ink/85">{hero.sub}</p>
              <OfferStrip lead={lead} hof={hof} dark />
              <CtaRow lead={lead} call={call} dark />
            </div>
            <div className="hero-media self-end lg:col-span-4">
              <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
                <RatingChip lead={lead} dark />
                <ul className="mt-4 space-y-2 text-sm text-t-dark-ink/90">
                  {hero.bullets.map((b) => <li key={b} className="flex gap-2"><CheckIcon className="mt-0.5 shrink-0 text-t-accent" />{b}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (theme.hero === "banner") {
    return (
      <section className="relative isolate overflow-hidden border-b border-t-line">
        {sig}
        <div className="hero-in mx-auto max-w-site px-4 pt-12 sm:px-6 lg:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0 max-w-4xl">
              {hof && <p className="flex flex-wrap items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-t-accent">
                <span className="h-0.5 w-10 bg-t-accent" aria-hidden="true" /> {hero.eyebrow}
              </p>}
              <h1 data-split {...fitH1(hero.headline, 0.9, `mt-4 text-balance font-display text-[2.6rem] font-black leading-[0.95] sm:text-6xl lg:text-7xl ${upper}`)}>{hero.headline}</h1>
            </div>
            <RatingChip lead={lead} />
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7"><p className="text-lg leading-relaxed text-t-muted">{hof ? hero.sub : shortSub(hero.sub)}</p><OfferStrip lead={lead} hof={hof} /></div>
            <div className="lg:col-span-5"><CtaRow lead={lead} call={call} /></div>
          </div>
        </div>
        <div className="hero-media relative mx-auto mt-10 max-w-site px-4 pb-12 sm:px-6">
          {art("aspect-[16/9] w-full rounded-t shadow-2xl sm:aspect-[21/8]")}
          {hof && <ul className="relative -mt-8 mx-4 grid gap-px overflow-hidden rounded-t bg-t-line shadow-xl sm:mx-10 sm:grid-cols-3">
            {hero.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 bg-t-surface px-5 py-4 text-sm font-semibold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-t-accent text-t-accent-ink"><CheckIcon size={14} /></span>{b}
              </li>
            ))}
          </ul>}
        </div>
      </section>
    );
  }

  // split: Text links, Schnellanfrage rechts
  return (
    <section id="anfrage" className="relative isolate overflow-hidden border-b border-t-line">
      {sig}
      <div className="hero-media absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden lg:block" aria-hidden="true">
        <div data-parallax="0.12" className="h-full w-full">{art("h-full w-full", 0)}</div>
        <div className="absolute inset-0 bg-gradient-to-r from-t-bg via-t-bg/30 to-transparent" />
      </div>
      <div className="relative mx-auto grid max-w-site items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-20">
        <div className="hero-in lg:col-span-6">
          <RatingChip lead={lead} />
          {hof && <p className="mt-7 text-sm font-bold uppercase tracking-wider text-t-accent">{hero.eyebrow}</p>}
          <h1 data-split {...fitH1(hero.headline, 0.48, `mt-4 text-balance font-display text-4xl font-extrabold leading-[1.04] sm:text-6xl ${upper}`)}>{hero.headline}</h1>
          <p className="mt-5 max-w-xl text-lg text-t-muted">{hof ? hero.sub : shortSub(hero.sub)}</p>
          <OfferStrip lead={lead} hof={hof} />
          {hof && <Bullets items={hero.bullets} />}
          <a href={call} className="mt-8 inline-flex items-center gap-2 rounded-t border border-t-ink/15 bg-t-surface px-5 py-3 font-bold">
            <PhoneIcon /> {lead.company.phone ? `${hero.ctaSecondary}: ${lead.company.phone}` : hero.ctaSecondary}
          </a>
          {art("mt-8 aspect-[16/9] w-full rounded-t lg:hidden", 0)}
        </div>
        <div className="hero-media lg:col-span-5 lg:col-start-8">{hof ? <HofInfoCard lead={lead} /> : <QuickRequest {...quoteProps(lead, hof)} />}</div>
      </div>
    </section>
  );
}

/* ---------- Vertrauen ---------- */

function Badges({ lead }: Ctx) {
  return (
    <section aria-label="Qualitätsmerkmale" className="border-b border-t-line bg-t-surface">
      <ul data-stagger className="mx-auto grid max-w-site grid-cols-2 gap-px bg-t-line px-0 sm:px-6 lg:grid-cols-4">
        {lead.site.badges.map((b) => (
          <li key={b.title} className="flex items-center gap-3 bg-t-surface px-4 py-5 sm:px-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-t-accent/40 text-t-accent"><ShieldIcon /></span>
            <span className="min-w-0">
              <span className="block text-sm font-bold leading-tight">{b.title}</span>
              <span className="block text-xs text-t-muted">{b.sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHead({ kicker, title, text, upper, center = false, dark = false }: { kicker: string; title: string; text?: string; upper: string; center?: boolean; dark?: boolean }) {
  return (
    <div data-reveal className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="flex items-center gap-2 text-[15px] font-semibold text-t-accent"><span className="h-px w-8 bg-current" aria-hidden="true" />{kicker}</p>
      <h2 className={`mt-3 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl ${upper}`}>{title}</h2>
      {text && <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-t-dark-ink/75" : "text-t-muted"}`}>{text}</p>}
    </div>
  );
}

function Marquee({ lead }: Ctx) {
  const words = [...lead.site.services.map((s) => s.title), ...lead.site.region.places.slice(0, 4)];
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="flex items-center gap-10 whitespace-nowrap font-display text-2xl font-bold sm:text-3xl">
          <ServiceIcon name={serviceIcon(w, lead.site.scene)} size={26} className="text-t-accent" />{w}
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee overflow-hidden border-b border-t-line bg-t-bg py-5 text-t-ink/80" aria-hidden="true">
      <div className="marquee-track">{row}{row}</div>
    </div>
  );
}

// Verkleinert die Hero-Überschrift, wenn ein einzelnes Wort sehr lang ist (z. B. „Hausmeisterservice“),
// damit es nicht mitten im Wort umbricht.
function fitH1(headline: string, frac: number, className: string) {
  const longest = Math.max(...headline.replace(/[\u00ad.,–!?:]/g, " ").split(/\s+/).map((w) => w.length));
  // Breite Versalien (nicht die schmale Banner-Schrift) brauchen mehr Platz pro Buchstabe.
  const wideCaps = className.includes("uppercase") && frac < 0.9;
  if (longest < (wideCaps ? 10 : 12)) return { className };
  return { className: `${className} fit-h1`, style: { "--L": longest, "--frac": frac, "--cw": wideCaps ? 0.8 : 0.6 } as CSSProperties };
}

function OfferStrip({ lead, hof, dark = false }: { lead: Lead; hof: boolean; dark?: boolean }) {
  const offer = (lead.site.heroOffer?.length ? lead.site.heroOffer : lead.site.services.map((s) => s.title)).slice(0, hof ? 5 : 6);
  if (!hof) {
    // Handwerk: große Symbol-Kacheln – auf einen Blick erkennbar, was angeboten wird.
    return (
      <ul data-pop aria-label="Leistungen auf einen Blick" className="mt-7 grid max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-3">
        {offer.map((o, k) => (
          <li key={o} style={{ "--k": k } as CSSProperties} className={`offer-tile flex flex-col items-center gap-2 rounded-t px-2 py-3 text-center text-[12px] font-bold leading-tight shadow-sm sm:flex-row sm:gap-2.5 sm:px-2.5 sm:py-2.5 sm:text-left sm:text-[13px] ${dark ? "bg-white/10 text-white ring-1 ring-white/25 backdrop-blur" : "bg-t-surface text-t-ink ring-1 ring-t-line"}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${dark ? "bg-t-accent text-t-accent-ink" : "bg-t-accent/15 text-t-accent"}`}>
              <ServiceIcon name={serviceIcon(o, lead.site.scene)} size={22} />
            </span>
            <span lang="de" className={`min-w-0 hyphens-auto break-words ${o.length > 15 ? "sm:text-[12px]" : ""}`}>{o}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="mt-6">
      <p className={`text-xs font-bold uppercase tracking-[0.18em] ${dark ? "text-white/70" : "text-t-muted"}`}>
        {hof ? "Bei uns gibt’s" : "Leistungen auf einen Blick"}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {offer.map((o) => (
          <li key={o} className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold shadow-sm sm:text-[15px] ${dark ? "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur" : "bg-t-surface text-t-ink ring-1 ring-t-line"}`}>
            <span className={`grid h-6 w-6 place-items-center rounded-full ${dark ? "bg-white/20" : "bg-t-accent/15 text-t-accent"}`}>
              <HofIcon name={hof ? productIcon(o) : "check"} size={14} />
            </span>
            {o}
          </li>
        ))}
      </ul>
    </div>
  );
}

function routeHref(lead: Lead) {
  const q = lead.company.address ?? `${lead.company.name} ${lead.company.city}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

function HofInfoCard({ lead }: { lead: Lead }) {
  const { company, site } = lead;
  return (
    <div className="rounded-t bg-t-surface p-6 text-t-ink shadow-2xl ring-1 ring-t-line sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-t-accent">{company.trade}</p>
      <p className="mt-1 font-display text-2xl font-bold">Einkaufen bei {site.brandName}</p>
      <div className="mt-5 rounded-t bg-t-bg p-4">
        <p className="flex items-center gap-2 text-sm font-bold"><HofIcon name="sun" size={16} className="text-t-accent" /> {site.hours?.length ? "Verkaufszeiten" : "Verkauf"}</p>
        {site.hours?.length ? (
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {site.hours.map((h) => (<Fragment key={h.label}><dt className="font-semibold">{h.label}</dt><dd className="text-t-muted">{h.value}</dd></Fragment>))}
          </dl>
        ) : (
          <p className="mt-2 text-sm text-t-muted">{site.contact.responseNote}</p>
        )}
      </div>
      <p className="mt-4 flex items-start gap-2 text-sm"><PinIcon /> <span>{company.address ?? company.city}</span></p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <a href={routeHref(lead)} target="_blank" rel="noopener noreferrer" className="btn-shine rounded-t bg-t-accent px-4 py-3 text-center text-sm font-bold text-t-accent-ink">Route planen</a>
        <a href="#anfrage" className="rounded-t border border-t-ink/15 px-4 py-3 text-center text-sm font-bold">Vorbestellen / anfragen</a>
      </div>
    </div>
  );
}

function ProductGrid({ lead, upper }: { lead: Lead; upper: string }) {
  const { services, servicesIntro } = lead.site;
  return (
    <section id="leistungen" className="mx-auto max-w-site px-4 py-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead kicker="Unser Angebot" title={servicesIntro.headline} text={servicesIntro.text} upper={upper} />
        <a href="#besuch" className="font-bold text-t-accent underline-offset-4 hover:underline">Zeiten & Anfahrt</a>
      </div>
      <div data-stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article key={s.title} className="card-fx relative overflow-hidden rounded-t border border-t-line bg-t-surface p-7 shadow-sm">
            <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-t-accent/10" aria-hidden="true" />
            <span className="relative grid h-14 w-14 place-items-center rounded-full bg-t-accent text-t-accent-ink shadow-md">
              <HofIcon name={productIcon(`${s.title} ${s.items.join(" ")}`)} size={28} />
            </span>
            <h3 className={`relative mt-5 font-display text-2xl font-bold ${upper}`}>{s.title}</h3>
            <p className="relative mt-2 text-t-muted">{s.text}</p>
            {s.items.length > 0 && (
              <ul className="relative mt-4 flex flex-wrap gap-1.5">
                {s.items.map((it) => <li key={it} className="rounded-full bg-t-bg px-3 py-1 text-xs font-semibold ring-1 ring-t-line">{it}</li>)}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Visit({ lead, upper }: Ctx) {
  const { company, site } = lead;
  return (
    <section id="besuch" className="bg-t-dark text-t-dark-ink">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHead kicker="Besuch & Öffnungszeiten" title={`So finden Sie ${site.brandName}`} upper={upper} dark
            text={`${company.address ?? company.city} – einfach vorbeikommen, einkaufen und genießen.`} />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={routeHref(lead)} target="_blank" rel="noopener noreferrer" className="btn-shine rounded-t bg-t-accent px-6 py-3.5 text-center font-bold text-t-accent-ink">Route planen</a>
            {company.phone && <a href={telHref(company.phone)} className="rounded-t border border-white/30 px-6 py-3.5 text-center font-bold">{company.phone}</a>}
          </div>
        </div>
        <div data-reveal="right" className="rounded-t bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
          <p className="flex items-center gap-2 font-display text-xl font-bold"><HofIcon name="sun" className="text-t-accent" /> {site.hours?.length ? "Verkaufszeiten" : "Verkauf & Abholung"}</p>
          {site.hours?.length ? (
            <dl className="mt-5 divide-y divide-white/10">
              {site.hours.map((h) => (
                <div key={h.label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="font-semibold">{h.label}</dt>
                  <dd className="text-t-dark-ink/80 tabular-nums">{h.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-t-dark-ink/80">{site.contact.responseNote}</p>
          )}
          <p className="mt-6 text-xs text-t-dark-ink/60">Angaben aus öffentlichen Verzeichnissen – bitte vor Veröffentlichung mit dem Hof abstimmen.</p>
        </div>
      </div>
    </section>
  );
}

function HofGallery({ lead, theme, upper }: Ctx) {
  const g = lead.site.gallery;
  const { scene } = lead.site;
  return (
    <section id="projekte" className="border-y border-t-line bg-t-surface">
      <div className="mx-auto max-w-site px-4 py-24 sm:px-6">
        <SectionHead kicker="Einblicke" title={g.headline} text={g.text} upper={upper} />
        <div data-stagger className="mt-14 grid auto-rows-[11rem] grid-cols-2 gap-4 md:auto-rows-[13rem] md:grid-cols-4">
          {g.items.map((it, i) => (
            <figure key={it.title} className={`group relative overflow-hidden rounded-t ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
              <Scene kind={i % 2 === 0 ? scene : scene === "farm" ? "garden" : "farm"} palette={theme.palette} label={it.photoNeeded} seed={i + 2} className="h-full w-full transition duration-700 group-hover:scale-105" showLabel={false} />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-white">
                <span className="block text-sm font-bold">{it.title}</span>
                <span className="block text-[11px] text-white/80">Foto folgt: {it.photoNeeded}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Leistungen ---------- */

function Services({ lead, theme, upper, hof }: Ctx) {
  const { services, servicesIntro, scene } = lead.site;
  if (hof) return <ProductGrid lead={lead} upper={upper} />;
  return (
    <section id="leistungen" className="mx-auto max-w-site px-4 py-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead kicker="Leistungen" title={servicesIntro.headline} text={servicesIntro.text} upper={upper} />
        <a href="#anfrage" className="font-bold text-t-accent underline-offset-4 hover:underline">Leistung anfragen</a>
      </div>
      {theme.services === "numbered" && (
        <ol data-stagger className="mt-14 divide-y divide-t-line border-y border-t-line">
          {services.map((s, i) => (
            <li key={s.title} className="group grid gap-4 py-8 transition-colors hover:bg-t-surface md:grid-cols-12 md:items-center md:px-4">
              <span className="flex items-center gap-3 md:col-span-1 md:flex-col md:items-start">
                <span className="svc-badge grid h-14 w-14 place-items-center rounded-full bg-t-accent/10 text-t-accent ring-1 ring-t-accent/25"><ServiceIcon name={serviceIcon(s.title, scene, s.items)} size={28} /></span>
                <span className="font-display text-sm font-bold text-t-accent/70">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <div className="md:col-span-5">
                <h3 className={`font-display text-2xl font-semibold ${upper}`}>{s.title}</h3>
                <p className="mt-2 text-t-muted">{s.text}</p>
              </div>
              <ul className="flex flex-wrap gap-2 md:col-span-4">
                {s.items.map((it) => <li key={it} className="rounded-full border border-t-line bg-t-surface px-3 py-1.5 text-sm">{it}</li>)}
              </ul>
              <a href="#anfrage" className="text-sm font-bold text-t-accent md:col-span-2 md:text-right">Anfragen</a>
            </li>
          ))}
        </ol>
      )}
      {theme.services === "cards" && (
        <div data-stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article key={s.title} className="card-fx group flex flex-col overflow-hidden rounded-t border border-t-line bg-t-surface shadow-sm">
              <div className="overflow-hidden"><Scene kind={scene} palette={theme.palette} label={s.title} seed={i + 1} className="card-media aspect-[16/9] w-full" showLabel={false} /></div>
              <span className="card-line block h-1 bg-t-accent" aria-hidden="true" />
              <div className="relative flex flex-1 flex-col p-6 pt-10">
                <span className="svc-badge absolute -top-7 left-6 grid h-14 w-14 place-items-center rounded-full bg-t-accent text-t-accent-ink shadow-lg ring-4 ring-t-surface"><ServiceIcon name={serviceIcon(s.title, scene, s.items)} size={26} /></span>
                <h3 className={`font-display text-xl font-bold ${upper}`}>{s.title}</h3>
                <p className="mt-2 text-t-muted">{s.text}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {s.items.map((it) => <li key={it} className="flex gap-2"><CheckIcon className="mt-0.5 shrink-0 text-t-accent" size={14} />{it}</li>)}
                </ul>
                <a href="#anfrage" className="mt-auto pt-5 text-sm font-bold text-t-accent">Jetzt anfragen</a>
              </div>
            </article>
          ))}
        </div>
      )}
      {theme.services === "tiles" && (
        <div data-stagger className="mt-14 grid gap-px bg-t-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article key={s.title} className="card-fx group relative bg-t-bg">
              <div className="overflow-hidden"><Scene kind={scene} palette={theme.palette} label={s.title} seed={i + 1} className="card-media aspect-[16/10] w-full" showLabel={false} /></div>
              <span className="card-line block h-1 bg-t-accent" aria-hidden="true" />
              <div className="relative p-6 pt-10">
                <span className="svc-badge absolute -top-7 left-6 grid h-14 w-14 place-items-center rounded-full bg-t-accent text-t-accent-ink shadow-lg ring-4 ring-t-bg"><ServiceIcon name={serviceIcon(s.title, scene, s.items)} size={26} /></span>
                <h3 className={`font-display text-xl font-bold ${upper}`}>{s.title}</h3>
                <p className="mt-2 text-sm text-t-muted">{s.text}</p>
                <p className="mt-3 text-sm font-semibold">{s.items.join(" · ")}</p>
                <a href="#anfrage" className="mt-4 inline-block text-sm font-bold text-t-accent">Anfragen</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function QuoteSection({ lead, upper, hof }: Ctx) {
  return (
    <section id="anfrage" className="bg-t-dark text-t-dark-ink">
      <div className="mx-auto grid max-w-site items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHead kicker={hof ? "Vorbestellen & anfragen" : "Schnellanfrage"} title={hof ? "In 60 Sekunden vorbestellen oder anfragen" : "In 60 Sekunden zum unverbindlichen Angebot"} upper={upper} dark
            text={hof ? "Drei kurze Fragen – dann meldet sich der Hof mit einer Rückmeldung zu Verfügbarkeit und Abholung." : "Drei kurze Fragen, dann meldet sich der Betrieb mit einer Einschätzung bei Ihnen. Kostenlos und ohne Verpflichtung."} />
          <ul className="mt-8 grid gap-3 text-t-dark-ink/85 sm:grid-cols-3">
            {(hof ? ["Direkt vom Hof", "Unverbindlich", "Persönliche Rückmeldung"] : ["Kostenlos", "Unverbindlich", "Persönliche Rückmeldung"]).map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm font-semibold"><CheckIcon className="text-t-accent" />{t}</li>
            ))}
          </ul>
        </div>
        <div data-reveal="right"><QuickRequest {...quoteProps(lead, hof)} /></div>
      </div>
    </section>
  );
}

/* ---------- Über uns / Zahlen ---------- */

function About({ lead, upper }: Ctx) {
  const { why, logoMark } = lead.site;
  const { company } = lead;
  return (
    <section id="ueber-uns" className="mx-auto max-w-site px-4 py-24 sm:px-6">
      <div className="grid gap-14 lg:grid-cols-12">
        <div data-reveal="left" className="lg:col-span-5">
          <div className="relative">
            <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-t bg-t-accent text-t-accent-ink">
              <span className="font-display text-[9rem] font-black leading-none opacity-90" aria-hidden="true">{logoMark}</span>
              <span className="absolute inset-x-0 bottom-0 bg-black/25 p-4 text-xs font-medium text-white">Platz für ein Foto von {company.owner ?? "Inhaber und Team"} bei der Arbeit</span>
            </div>
            <div className="absolute -bottom-6 right-2 rounded-t bg-t-surface p-5 shadow-xl sm:-right-6">
              <p className="text-xs font-bold uppercase tracking-wider text-t-muted">Ihr Ansprechpartner</p>
              <p className="font-display text-xl font-bold">{company.owner ?? company.name}</p>
              <p className="text-sm text-t-muted">{company.trade} · {company.city}</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <SectionHead kicker={`Warum ${company.owner ?? lead.site.brandName}`} title={why.headline} upper={upper} />
          <div data-stagger className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {why.points.map((p) => (
              <div key={p.title} className="border-t-2 border-t-accent pt-5">
                <h3 className="font-display text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-t-muted">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats({ lead }: Ctx) {
  return (
    <section aria-label="Zahlen" className="bg-t-accent text-t-accent-ink">
      <dl data-stagger className="mx-auto grid max-w-site grid-cols-2 gap-y-8 px-4 py-12 sm:px-6 lg:grid-cols-4">
        {lead.site.trust.map((t) => (
          <div key={t.label} className="flex flex-col-reverse gap-1 px-2 text-center">
            <dt className="text-sm opacity-85">{t.label}</dt>
            <dd data-count className="break-words font-display text-3xl font-black tabular-nums sm:text-5xl">{t.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---------- Projekte ---------- */

function Projects({ lead, theme, upper }: Ctx) {
  const g = lead.site.gallery;
  const { scene } = lead.site;
  const [first, ...rest] = g.items;
  return (
    <section id="projekte" className="border-y border-t-line bg-t-surface">
      <div className="mx-auto max-w-site px-4 py-24 sm:px-6">
        <SectionHead kicker="Projekte" title={g.headline} text={g.text} upper={upper} />
        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <figure data-reveal="zoom" className="lg:col-span-7">
            <BeforeAfter label={first.title}
              before={<Scene kind={scene} palette={theme.palette} label={first.photoNeeded} seed={5} variant="before" className="h-full w-full" showLabel={false} />}
              after={<Scene kind={scene} palette={theme.palette} label={first.photoNeeded} seed={5} className="h-full w-full" showLabel={false} />} />
            <figcaption className="mt-3 text-sm text-t-muted">Regler ziehen: Vorher/Nachher. In der Live-Version mit echten Fotos ({first.photoNeeded}).</figcaption>
          </figure>
          <div data-stagger className="grid grid-cols-2 gap-4 lg:col-span-5">
            {rest.slice(0, 4).map((it, i) => (
              <figure key={it.title} className="group relative overflow-hidden rounded-t">
                <Scene kind={scene} palette={theme.palette} label={it.photoNeeded} seed={i + 6} className="aspect-square w-full transition duration-500 group-hover:scale-105" showLabel={false} />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-white">
                  <span className="block text-sm font-bold">{it.title}</span>
                  <span className="block text-[11px] text-white/80">Foto folgt: {it.photoNeeded}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Bewertungen ---------- */

function Reviews({ lead, upper }: Ctx) {
  const r = lead.site.reviews;
  return (
    <section id="bewertungen" className="mx-auto max-w-site px-4 py-24 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead kicker="Kundenstimmen" title={r.headline} upper={upper} />
          {r.rating !== null && (
            <div data-reveal="left" className="mt-8 rounded-t bg-t-dark p-7 text-t-dark-ink shadow-xl">
              <p className="text-sm font-semibold text-t-dark-ink/70">Durchschnitt auf {r.source}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span data-count className="font-display text-6xl font-black tabular-nums">{fmt(r.rating)}</span>
                <span className="text-t-dark-ink/70">/ 5</span>
              </div>
              <Stars rating={r.rating} />
              {r.count !== null && <p className="mt-3 text-sm text-t-dark-ink/80">aus {r.count} Bewertungen</p>}
              <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-5 inline-block text-sm font-bold text-t-accent underline-offset-4 hover:underline">Alle Bewertungen ansehen</a>
            </div>
          )}
        </div>
        <div className="lg:col-span-8">
          <blockquote data-reveal className="border-l-4 border-t-accent pl-6 font-display text-2xl leading-snug sm:text-3xl">{r.summary}</blockquote>
          <ul data-stagger className="mt-10 grid gap-4 sm:grid-cols-2">
            {r.highlights.map((h) => (
              <li key={h} className="card-fx rounded-t border border-t-line bg-t-surface p-6 shadow-sm">
                <Stars rating={5} />
                <p className="mt-3 font-display text-lg font-semibold">{h}</p>
                <p className="mt-1 text-xs text-t-muted">Häufig genannt in Bewertungen auf {r.source}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-t-muted">Sinngemäße Zusammenfassung öffentlicher Bewertungen, keine wörtlichen Zitate. Quelle: {r.source}, Stand {new Date(lead.date).toLocaleDateString("de-DE")}.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Ablauf / CTA ---------- */

function Process({ lead, upper }: Ctx) {
  const p = lead.site.process;
  return (
    <section id="ablauf" className="border-y border-t-line bg-t-surface">
      <div className="mx-auto max-w-site px-4 py-24 sm:px-6">
        <SectionHead kicker="So läuft es ab" title={p.headline} upper={upper} center />
        <ol data-observe data-stagger className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <span className="absolute left-[12%] right-[12%] top-6 hidden h-0.5 bg-t-line md:block" aria-hidden="true"><span className="process-fill block h-full w-full bg-t-accent" /></span>
          {p.steps.map((s, i) => (
            <li key={s.title} className="relative text-center">
              <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-t-accent font-display text-lg font-black text-t-accent-ink ring-8 ring-t-surface">{i + 1}</span>
              <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm text-t-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CtaBand({ lead, call, upper }: Ctx) {
  return (
    <section className="mx-auto max-w-site px-4 py-20 sm:px-6">
      <div data-reveal="zoom" className="relative overflow-hidden rounded-t bg-t-dark px-6 py-12 text-t-dark-ink sm:px-12">
        <div className="fx-float absolute -right-16 -top-16 h-64 w-64 rounded-full bg-t-accent/25" aria-hidden="true" />
        <div className="fx-float absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-t-accent/10" style={{ animationDelay: "-3s" }} aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className={`text-balance font-display text-3xl font-bold sm:text-4xl ${upper}`}>{lead.site.contact.headline}</h2>
            <p className="mt-3 text-t-dark-ink/80">Kostenlos und unverbindlich – Sie bekommen eine persönliche Rückmeldung.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#anfrage" className="btn-shine rounded-t bg-t-accent px-7 py-4 text-center font-bold text-t-accent-ink hover:brightness-110">{lead.site.hero.ctaPrimary}</a>
            {lead.company.phone && <a href={call} className="rounded-t border border-white/30 px-7 py-4 text-center font-bold hover:bg-white/10">{lead.company.phone}</a>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Region / FAQ ---------- */

function Region({ lead, theme, upper }: Ctx) {
  const r = lead.site.region;
  return (
    <section id="region" className="bg-t-surface">
      <div className="mx-auto grid max-w-site items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHead kicker="Einsatzgebiet" title={r.headline} text={r.text} upper={upper} />
          <ul data-stagger className="mt-8 flex flex-wrap gap-2" aria-label="Orte im Einsatzgebiet">
            {r.places.map((p) => (
              <li key={p} className="rounded-full border border-t-line bg-t-bg px-4 py-2 text-sm font-semibold">{lead.company.trade} {p}</li>
            ))}
          </ul>
        </div>
        <div data-reveal="zoom" className="rounded-t border border-t-line p-2 shadow-sm">
          <AreaMap home={lead.company.city} places={r.places} accent={theme.palette[0]} />
          <p className="px-2 pb-1 pt-2 text-xs text-t-muted">Schematische Darstellung des Einsatzgebiets.</p>
        </div>
      </div>
    </section>
  );
}

function Faq({ lead, upper }: Ctx) {
  return (
    <section id="faq" className="mx-auto max-w-site px-4 py-24 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead kicker="FAQ" title="Häufige Fragen" upper={upper} text="Ihre Frage ist nicht dabei? Rufen Sie einfach an oder schreiben Sie uns." />
        </div>
        <div data-reveal className="divide-y divide-t-line rounded-t border border-t-line bg-t-surface lg:col-span-8">
          {lead.site.faq.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-t-accent/10 text-xl text-t-accent transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="faq-body mt-3 leading-relaxed text-t-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Kontakt / Footer ---------- */

function ContactCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-t bg-white/5 p-5 ring-1 ring-white/10">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-t-accent text-t-accent-ink">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-t-dark-ink/60">{title}</p>
        <div className="mt-0.5 break-words font-semibold">{children}</div>
      </div>
    </div>
  );
}

function Contact({ lead, call, upper }: Ctx) {
  const { contact } = lead.site;
  const { company } = lead;
  return (
    <section id="kontakt" className="bg-t-dark text-t-dark-ink">
      <div className="mx-auto grid max-w-site gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHead kicker="Kontakt" title={contact.headline} text={contact.text} upper={upper} dark />
          <div data-stagger className="mt-8 grid gap-3">
            {company.phone && <ContactCard icon={<PhoneIcon />} title="Telefon"><a href={call} className="font-display text-xl">{company.phone}</a></ContactCard>}
            {company.email && <ContactCard icon={<MailIcon />} title="E-Mail"><a href={`mailto:${company.email}`}>{company.email}</a></ContactCard>}
            <ContactCard icon={<PinIcon />} title="Standort">{company.address ?? company.city}</ContactCard>
            <ContactCard icon={<ShieldIcon />} title="Hinweis">{contact.responseNote}</ContactCard>
          </div>
        </div>
        <div data-reveal="right" className="rounded-t bg-t-bg p-6 text-t-ink shadow-2xl sm:p-8 lg:col-span-7">
          <h3 className="font-display text-2xl font-bold">Nachricht senden</h3>
          <p className="mb-6 mt-1 text-sm text-t-muted">Je genauer Ihre Beschreibung, desto schneller die Einschätzung.</p>
          <ContactForm topics={contact.topics} />
        </div>
      </div>
    </section>
  );
}

function Footer({ lead, call, theme }: Ctx) {
  const { company, site } = lead;
  const year = new Date(lead.date).getFullYear();
  return (
    <footer className="border-t border-t-line bg-t-bg">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-14 text-sm sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo lead={lead} theme={theme} />
          <p className="mt-4 max-w-sm text-t-muted">{company.trade} für {company.serviceArea.filter((x) => !/umgebung/i.test(x)).slice(0, 4).join(", ")} und Umgebung.</p>
        </div>
        <div>
          <p className="font-bold">Seiten</p>
          <nav aria-label="Footer-Navigation" className="mt-3 grid gap-2">
            {site.nav.map((n) => <a key={n.href} href={n.href} className="text-t-muted hover:text-t-ink">{n.label}</a>)}
          </nav>
        </div>
        <div>
          <p className="font-bold">Kontakt</p>
          <div className="mt-3 grid gap-2 text-t-muted">
            {company.phone && <a href={call} className="hover:text-t-ink">{company.phone}</a>}
            {company.email && <a href={`mailto:${company.email}`} className="break-words hover:text-t-ink">{company.email}</a>}
            <span>{company.address ?? company.city}</span>
            <a href="#impressum" className="hover:text-t-ink">Impressum</a>
            <a href="#datenschutz" className="hover:text-t-ink">Datenschutz</a>
          </div>
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
      <p className="border-t border-t-line px-4 py-4 pb-24 text-center text-xs text-t-muted md:pb-4">
        {DEMO_NOTICE} Entwurf vom {new Date(lead.date).toLocaleDateString("de-DE")} · © {year}
      </p>
    </footer>
  );
}

function StickyBar({ lead, call }: Ctx) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-t-line bg-t-surface/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="flex gap-2">
        {lead.company.phone && (
          <a href={call} className="flex flex-1 items-center justify-center gap-2 rounded-t border border-t-ink/15 px-3 py-3 text-sm font-bold">
            <PhoneIcon /> Anrufen
          </a>
        )}
        <a href="#anfrage" className="pulse-ring btn-shine flex flex-[1.5] items-center justify-center rounded-t bg-t-accent px-3 py-3 text-sm font-bold text-t-accent-ink">{lead.site.stickyCta}</a>
      </div>
    </div>
  );
}

/* ---------- Kleinteile ---------- */

function fmt(n: number) {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-t-accent" aria-label={`${fmt(rating)} von 5 Sternen`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" fill={i < Math.round(rating) ? "currentColor" : "none"} stroke="currentColor">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}

function CheckIcon({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
