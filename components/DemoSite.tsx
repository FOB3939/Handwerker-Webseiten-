import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { Lead } from "@/lib/types";
import { themeStyle } from "@/lib/themes";
import { resolveTheme, familyOf, type Identity } from "@/lib/identity";
import { HeroFx, TradeDivider, fxFor, type TradeFxKind } from "./TradeFx";
import TradeGame, { gameFor, type GameKind } from "./TradeGame";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Logo-Intro je Gewerk (Wasser, Strom, Holz …) – läuft direkt nach dem Splash, ohne Abhängigkeiten
const intro = readFileSync(join(process.cwd(), "assets/trade-intro.js"), "utf8");
// Gewerk-Effekte (Magic-UI-Stil) und generativer Hintergrund im Aufruf-Banner
const mfx = readFileSync(join(process.cwd(), "assets/trade-mfx.js"), "utf8");
// 3D-Effekte beim Scrollen: GSAP + ScrollTrigger inline (Seiten bleiben eigenständig, kein CDN nötig)
const gsapLib = ["gsap.min.js", "ScrollTrigger.min.js"].map((f) => readFileSync(join(process.cwd(), "node_modules/gsap/dist", f), "utf8")).join("\n");
const t3d = readFileSync(join(process.cwd(), "assets/trade-3d.js"), "utf8");
const STYLES_3D = ["kippen", "schwingen", "tiefe"];
// Je Spielart 2–3 passende Effekte; welcher es wird, hängt an der Abschnittsfolge (von assign-looks verteilt)
const MFX: Record<GameKind, string[]> = {
  circuit: ["beam", "flicker"], drywall: ["beam", "grid"], water: ["ripple", "meteors"], tiles: ["grid", "dots"], paint: ["highlight", "particles"],
  lawn: ["particles", "highlight"], sweep: ["sparkles", "dots", "stripes"], glass: ["sparkles", "ripple", "highlight"], railing: ["flicker", "beam"],
  planks: ["stripes", "dots"], kitchen: ["stripes", "beam"], blinds: ["stripes", "flicker"], roof: ["meteors", "stripes"], bricks: ["dots", "grid"],
};
import { telHref } from "@/lib/leads";
import Scene from "./Scene";
import Photo, { photoSrc } from "./Photo";
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
  const game = ctx.hof ? null : gameFor(company.trade, ctx.fx);
  // Hero-Varianten mit eingebauter Schnellanfrage (dann entfällt der separate Anfrage-Abschnitt)
  const heroHasForm = !ctx.hof && ["fullbleed", "split", "minimal", "panel", "kante"].includes(theme.hero);
  const divider = ctx.fx ? <TradeDivider kind={ctx.fx} /> : null;
  const sections: Record<SectionKey, ReactNode> = {
    badges: <Badges {...ctx} />,
    marquee: <Marquee {...ctx} />,
    div: divider,
    services: <Services {...ctx} />,
    visit: ctx.hof ? <Visit {...ctx} /> : null,
    quote: heroHasForm ? null : <QuoteSection {...ctx} />,
    about: <About {...ctx} />,
    stats: <Stats {...ctx} />,
    projects: ctx.hof ? <HofGallery {...ctx} /> : <Projects {...ctx} />,
    reviews: <Reviews {...ctx} />,
    process: <Process {...ctx} />,
    cta: <CtaBand {...ctx} />,
    region: <Region {...ctx} />,
    faq: <Faq {...ctx} />,
  };

  return (
    <div data-identity={theme.name} data-skin={theme.skin} data-mfx={game ? MFX[game][theme.order % MFX[game].length] : undefined} data-seed={theme.seed} data-pal={theme.palette.join(",")} data-3d={ctx.hof ? undefined : style3d(theme.services)} style={themeStyle(theme)} className="min-h-screen bg-t-bg font-body text-t-ink antialiased">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={theme.fontsHref} precedence="default" />
      <div className="scroll-progress fixed inset-x-0 top-0 z-[55] h-1 bg-t-accent" aria-hidden="true" />
      <Splash icon={site.logoIcon} mark={site.logoMark} name={site.brandName} tagline={`${company.trade} in ${company.city}`} logo={theme.logo} intro={theme.intro} />
      <script id="demo-intro" dangerouslySetInnerHTML={{ __html: intro }} />
      <a href="#inhalt" className="skip-link rounded bg-t-ink px-3 py-2 text-t-bg">Zum Inhalt springen</a>
      <div className="bg-black px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-white/80" role="note">{DEMO_NOTICE}</div>
      <TopBar {...ctx} />
      <Header {...ctx} />
      <main id="inhalt">
        <Hero {...ctx} />
        {game && <TradeGame lead={lead} kind={game} />}
        {sectionOrder(ctx.hof ? 0 : theme.order).map((k, i) => {
          const el = sections[k];
          return el ? <Fragment key={`${k}-${i}`}>{el}</Fragment> : null;
        })}
        <Contact {...ctx} />
      </main>
      <Footer {...ctx} />
      <StickyBar {...ctx} />
      <script id="demo-ldjson" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness(lead)).replace(/</g, "\\u003c") }} />
      <Enhance />
      {game && <script id="demo-mfx" dangerouslySetInnerHTML={{ __html: mfx }} />}
      {!ctx.hof && <script id="demo-gsap" dangerouslySetInnerHTML={{ __html: gsapLib }} />}
      {!ctx.hof && <script id="demo-3d" dangerouslySetInnerHTML={{ __html: t3d }} />}
    </div>
  );
}

type SectionKey = "badges" | "marquee" | "div" | "services" | "visit" | "quote" | "about" | "stats" | "projects" | "reviews" | "process" | "cta" | "region" | "faq";

// Vier Abschnittsfolgen – das Spiel bleibt immer direkt unter dem Hero, Kontakt immer am Schluss
const ORDERS: SectionKey[][] = [
  ["badges", "marquee", "div", "services", "visit", "quote", "about", "stats", "projects", "reviews", "div", "process", "cta", "region", "faq"],
  ["badges", "services", "stats", "projects", "quote", "div", "process", "about", "reviews", "marquee", "cta", "faq", "region"],
  ["marquee", "badges", "about", "services", "div", "projects", "reviews", "stats", "quote", "process", "region", "cta", "faq"],
  ["badges", "services", "process", "projects", "div", "quote", "reviews", "about", "stats", "marquee", "region", "faq", "cta"],
];
function sectionOrder(n: number) { return ORDERS[n % ORDERS.length]; }
// 3D-Stil folgt dem Leistungs-Layout, das assign-looks innerhalb einer Runde verteilt
const SERVICES_LIST = ["cards", "numbered", "tiles", "feature", "split", "rows"];
function style3d(v: string) { return STYLES_3D[Math.max(0, SERVICES_LIST.indexOf(v)) % STYLES_3D.length]; }

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
          {company.email && <a href={`mailto:${company.email}`} className="hidden min-h-[40px] items-center hover:underline sm:inline-flex">{company.email}</a>}
          {company.phone && <a href={call} className="inline-flex min-h-[40px] items-center font-semibold hover:underline">{company.phone}</a>}
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
            <a key={n.href} href={n.href} className="inline-flex min-h-[44px] items-center whitespace-nowrap text-t-muted transition hover:text-t-ink">{n.label}</a>
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
    <div className="mt-8 flex flex-col flex-wrap gap-3 sm:flex-row">
      <a href="#anfrage" className="btn-shine inline-flex items-center justify-center gap-2 rounded-t bg-t-accent px-7 py-4 font-bold text-t-accent-ink shadow-lg shadow-black/10 transition hover:brightness-110">
        {hero.ctaPrimary}
      </a>
      <a href={call} className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-t border px-7 py-4 font-bold transition ${dark ? "border-white/30 text-white hover:bg-white/10" : "border-t-ink/20 text-t-ink hover:bg-t-ink/5"}`}>
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
  const heroPhoto = hof ? undefined : lead.site.photos?.hero;
  const heroSrc = photoSrc(heroPhoto);
  const art = (cls: string, seed = 0) => heroPhoto && heroSrc
    ? <Photo photo={heroPhoto} src={heroSrc} className={cls} eager badge={false} />
    : <Scene kind={scene} palette={theme.palette} label={hero.imageLabel} seed={seed} className={cls} />;

  if (theme.hero === "kante") return <KanteHero lead={lead} call={call} art={art} sig={sig} />;

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
            <a href={call} className="mt-8 inline-flex min-h-[44px] items-center gap-2 font-bold text-white underline-offset-4 hover:underline">
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

  if (theme.hero === "stack") {
    // zentrierte Überschrift, darunter ein Bildband aus drei Motiven
    return (
      <section className="relative isolate overflow-hidden border-b border-t-line">
        {sig}
        <div className="hero-in mx-auto max-w-4xl px-4 pt-14 text-center sm:px-6 lg:pt-20">
          <div className="flex justify-center"><RatingChip lead={lead} /></div>
          <h1 data-split {...fitH1(hero.headline, 0.7, `mt-5 text-balance font-display text-5xl font-bold leading-[1.02] sm:text-7xl ${upper}`)}>{hero.headline}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-t-muted">{shortSub(hero.sub)}</p>
          <div className="flex justify-center [&>ul]:mx-auto"><OfferStrip lead={lead} hof={hof} /></div>
          <div className="flex justify-center"><CtaRow lead={lead} call={call} /></div>
        </div>
        <div className="hero-media mx-auto mt-12 grid max-w-site gap-4 px-4 pb-14 sm:grid-cols-3 sm:px-6">
          {[0, 1, 2].map((k) => (
            <div key={k} className={`${k ? "hidden sm:block" : ""} ${k === 1 ? "sm:translate-y-8" : ""}`}>{art("aspect-[4/3] w-full rounded-t shadow-xl sm:aspect-[3/4]", k)}</div>
          ))}
        </div>
      </section>
    );
  }

  if (theme.hero === "mosaic") {
    // Text links, rechts eine Kachel-Collage mit Merkmal-Kachel
    const b0 = lead.site.badges[0], b1 = lead.site.badges[1];
    return (
      <section className="relative isolate overflow-hidden">
        {sig}
        <div className="mx-auto grid max-w-site items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-20">
          <div className="hero-in lg:col-span-5">
            <RatingChip lead={lead} />
            <h1 data-split {...fitH1(hero.headline, 0.42, `mt-4 text-balance font-display text-4xl font-extrabold leading-[1.04] sm:text-6xl ${upper}`)}>{hero.headline}</h1>
            <p className="mt-5 max-w-xl text-lg text-t-muted">{shortSub(hero.sub)}</p>
            <OfferStrip lead={lead} hof={hof} narrow />
            <CtaRow lead={lead} call={call} />
          </div>
          <div className="hero-media grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 lg:col-span-7">
            <div className="row-span-2">{art("h-full min-h-[18rem] w-full rounded-t shadow-xl", 0)}</div>
            {art("aspect-[4/3] w-full rounded-t shadow-lg", 2)}
            <div className="flex flex-col justify-end rounded-t bg-t-accent p-5 text-t-accent-ink shadow-lg">
              <p lang="de" className="hyphens-auto break-words font-display text-xl font-black leading-tight sm:text-2xl">{b0?.title}</p>
              <p className="mt-1 text-sm">{b0?.sub}</p>
              {b1 && <p className="mt-3 border-t border-current/30 pt-3 text-sm font-semibold">{b1.title}</p>}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (theme.hero === "card") {
    // Motiv als Vollbild, Text in einer hellen Karte unten links
    return (
      <section className="relative isolate overflow-hidden bg-t-dark">
        {sig}
        <div className="absolute inset-0 -z-10 overflow-hidden"><div data-parallax="0.14" className="h-full w-full">{art("absolute inset-0 h-full w-full", 1)}</div></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="mx-auto flex min-h-[34rem] max-w-site items-end px-4 pb-10 pt-40 sm:px-6 lg:min-h-[40rem]">
          <div className="hero-in w-full max-w-2xl rounded-t bg-t-surface p-6 shadow-2xl sm:p-10">
            <RatingChip lead={lead} />
            <h1 data-split {...fitH1(hero.headline, 0.55, `mt-4 text-balance font-display text-4xl font-bold leading-[1.04] sm:text-6xl ${upper}`)}>{hero.headline}</h1>
            <p className="mt-4 text-lg text-t-muted">{shortSub(hero.sub)}</p>
            <OfferStrip lead={lead} hof={hof} />
            <CtaRow lead={lead} call={call} />
          </div>
        </div>
      </section>
    );
  }

  if (theme.hero === "minimal") {
    // große Überschrift über die volle Breite, darunter Text + Motiv links, Schnellanfrage rechts
    return (
      <section id="anfrage" className="relative isolate overflow-hidden border-b border-t-line">
        {sig}
        <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:py-16">
          <div className="hero-in">
            <RatingChip lead={lead} />
            <h1 data-split {...fitH1(hero.headline, 0.95, `mt-5 max-w-5xl text-balance font-display text-5xl font-black leading-[0.98] sm:text-7xl lg:text-8xl ${upper}`)}>{hero.headline}</h1>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="max-w-xl text-lg text-t-muted">{shortSub(hero.sub)}</p>
              <OfferStrip lead={lead} hof={hof} />
              <a href={call} className="mt-8 inline-flex min-h-[44px] items-center gap-2 font-bold text-t-accent underline-offset-4 hover:underline">
                <PhoneIcon /> {lead.company.phone ? `Direkt anrufen: ${lead.company.phone}` : hero.ctaSecondary}
              </a>
              <div className="hero-media mt-8">{art("aspect-[16/9] w-full rounded-t shadow-xl", 3)}</div>
            </div>
            <div className="hero-media lg:col-span-5"><QuickRequest {...quoteProps(lead, hof)} /></div>
          </div>
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
// Kante-Hero: dunkle Fläche mit gedämpftem Motiv und Raster, Schreibmaschinen-Zeilen in Klammern,
// schmale Versal-Überschrift mit farbigem Schlusswort, eckige Buttons über volle Breite.
function KanteHero({ lead, call, art, sig }: { lead: Lead; call: string; art: (cls: string, seed?: number) => ReactNode; sig: ReactNode }) {
  const { hero } = lead.site;
  const { company } = lead;
  const words = hero.headline.trim().split(/\s+/);
  const last = words.pop() ?? "";
  // Längstes Wort bestimmt die Schriftgröße, damit nichts abgeschnitten oder getrennt wird
  const longest = Math.max(...hero.headline.replace(/[\u00ad.,–!?:]/g, " ").split(/\s+/).map((w) => w.length));
  const area = company.serviceArea.filter((x) => x !== company.city && !/umgebung/i.test(x))[0];
  const status = [company.phone ? `${/^(\+49\s?|0)1[5-7]/.test(company.phone) ? "Mobil" : "Telefon"} ${company.phone}` : null, company.email ? "Anfrage per E-Mail" : "Anfrage per Formular"].filter(Boolean).join(" · ");
  return (
    <section className="kante-hero relative isolate overflow-hidden bg-t-dark text-t-dark-ink">
      {sig}
      <div className="absolute inset-0 -z-10 overflow-hidden"><div data-parallax="0.15" className="h-full w-full opacity-40 saturate-50">{art("absolute inset-0 h-full w-full", 1)}</div></div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/75 to-black/90" />
      <div className="kante-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div className="mx-auto grid max-w-site items-start gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-12 lg:pb-24 lg:pt-16">
        <div className="hero-in lg:col-span-7">
          <p className="kante-mono text-[13px] uppercase leading-relaxed tracking-[0.16em] text-t-dark-ink/85">[ {company.trade} für {company.city}{area ? ` & ${area}` : ""} ]</p>
          <p className="kante-mono mt-5 flex items-center gap-2.5 border-b border-white/15 pb-4 text-[12px] uppercase tracking-[0.14em] text-t-dark-ink/85 sm:text-[13px]">
            <span className="kante-dot h-2.5 w-2.5 shrink-0 rounded-full bg-t-accent" aria-hidden="true" />{status}
          </p>
          <h1 style={{ "--L": longest } as CSSProperties} className="kante-h1 mt-5 font-display font-extrabold uppercase leading-[0.92] tracking-tight">
            {words.join(" ")} <span className="text-t-accent">{last}</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-t-dark-ink/85 sm:text-xl">{shortSub(hero.sub)}</p>
          <div className="mt-9 grid max-w-xl gap-3">
            <a href="#anfrage" className="kante-btn btn-shine flex min-h-[64px] items-center justify-between gap-4 bg-t-accent px-7 text-t-accent-ink transition hover:brightness-110">
              <span>{hero.ctaPrimary}</span><span aria-hidden="true" className="text-2xl leading-none">→</span>
            </a>
            {company.phone && (
              <a href={call} className="kante-btn flex min-h-[64px] items-center justify-between gap-4 border border-white/35 px-7 text-t-dark-ink transition hover:bg-white/10">
                <span>Jetzt anrufen</span><span aria-hidden="true"><PhoneIcon /></span>
              </a>
            )}
          </div>
        </div>
        <div id="anfrage" className="hero-media scroll-mt-24 lg:col-span-5 lg:pt-12"><QuickRequest {...quoteProps(lead)} /></div>
      </div>
    </section>
  );
}

function fitH1(headline: string, frac: number, className: string) {
  const longest = Math.max(...headline.replace(/[\u00ad.,–!?:]/g, " ").split(/\s+/).map((w) => w.length));
  // Breite Versalien (nicht die schmale Banner-Schrift) brauchen mehr Platz pro Buchstabe.
  const wideCaps = className.includes("uppercase") && frac < 0.9;
  if (longest < 9) return { className };
  // Zeichenbreite: aus der Schrift (--h1-cw), breite Versalien mindestens 0.8
  const style = { "--L": longest, "--frac": frac, ...(wideCaps ? { "--cw": "max(0.8, var(--h1-cw, 0.62))" } : {}) };
  return { className: `${className} fit-h1`, style: style as CSSProperties };
}

// narrow: schmale Textspalte (Mosaik-Hero) – höchstens zwei Kacheln pro Reihe, damit keine Wörter brechen
function OfferStrip({ lead, hof, dark = false, narrow = false }: { lead: Lead; hof: boolean; dark?: boolean; narrow?: boolean }) {
  const offer = (lead.site.heroOffer?.length ? lead.site.heroOffer : lead.site.services.map((s) => s.title)).slice(0, hof ? 5 : 6);
  if (!hof) {
    // Handwerk: große Symbol-Kacheln – auf einen Blick erkennbar, was angeboten wird.
    return (
      <ul data-pop aria-label="Leistungen auf einen Blick" className={`mt-7 grid max-w-xl grid-cols-2 gap-2.5 ${narrow ? "" : "sm:grid-cols-3"}`}>
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
        <a href="#besuch" className="inline-flex min-h-[44px] items-center font-bold text-t-accent underline-offset-4 hover:underline">Zeiten & Anfahrt</a>
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
          <p className="mt-6 text-xs text-t-dark-ink/75">Angaben aus öffentlichen Verzeichnissen – bitte vor Veröffentlichung mit dem Hof abstimmen.</p>
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

// Symbolbild je Leistung: Motiv nach Leistungsname (Fassade, Boden, Bad …), sonst das Gewerk-Motiv.
// Immer als „Symbolbild“ gekennzeichnet – es zeigt nicht den Betrieb.
type SvcSceneKind = Parameters<typeof Scene>[0]["kind"];
function serviceScene(title: string, items: string[], fallback: SvcSceneKind): SvcSceneKind {
  const t = `${title} ${items.join(" ")}`.toLowerCase();
  const rules: [RegExp, SvcSceneKind][] = [
    [/fassad|außen|aussen|dach|rinne|blech|fenster|tür|carport|zimmerei/, "facade"],
    [/garten|hecke|rasen|pflaster|baum|beet|grün|terrass/, "garden"],
    [/boden|parkett|laminat|vinyl|dielen|teppich|estrich/, "parquet"],
    [/fliese|bad|dusche|sanit|wc|naturstein|mosaik/, "bath"],
    [/küche|möbel|schrank|einbau/, "kitchen"],
    [/elektr|steckdose|licht|beleuchtung|strom|smart/, "electric"],
    [/trockenbau|decke|spachtel|akustik|dämm/, "drywall"],
    [/anstrich|streich|lack|tapez|farb|wand|maler/, "paint"],
  ];
  return rules.find(([re]) => re.test(t))?.[1] ?? fallback;
}
function SvcImage({ title, items, scene, palette, seed, className }: { title: string; items: string[]; scene: SvcSceneKind; palette: string[]; seed: number; className: string }) {
  return (
    <div className="svc-img relative overflow-hidden">
      <Scene kind={serviceScene(title, items, scene)} palette={palette} label={`Symbolbild: ${title}`} seed={seed} className={`card-media ${className}`} showLabel={false} />
      <span className="absolute right-2 top-2 rounded-sm bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">Symbolbild</span>
    </div>
  );
}

function Services({ lead, theme, upper, hof }: Ctx) {
  const { services, servicesIntro, scene } = lead.site;
  if (hof) return <ProductGrid lead={lead} upper={upper} />;
  return (
    <section id="leistungen" className="mx-auto max-w-site px-4 py-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead kicker="Leistungen" title={servicesIntro.headline} text={servicesIntro.text} upper={upper} />
        <a href="#anfrage" className="inline-flex min-h-[44px] items-center font-bold text-t-accent underline-offset-4 hover:underline">Leistung anfragen</a>
      </div>
      {theme.services === "numbered" && (
        <ol data-stagger className="mt-14 divide-y divide-t-line border-y border-t-line">
          {services.map((s, i) => (
            <li key={s.title} className="group grid gap-4 py-8 transition-colors hover:bg-t-surface md:grid-cols-12 md:items-center md:px-4">
              <div className="md:col-span-3"><SvcImage title={s.title} items={s.items} scene={scene} palette={theme.palette} seed={i + 1} className="aspect-[16/9] w-full rounded-t md:aspect-[4/3]" /></div>
              <span className="flex items-center gap-3 md:col-span-1 md:flex-col md:items-start">
                <span className="svc-badge grid h-14 w-14 place-items-center rounded-full bg-t-accent/10 text-t-accent ring-1 ring-t-accent/25"><ServiceIcon name={serviceIcon(s.title, scene, s.items)} size={28} /></span>
                <span className="font-display text-sm font-bold text-t-accent">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <div className="md:col-span-4">
                <h3 className={`font-display text-2xl font-semibold ${upper}`}>{s.title}</h3>
                <p className="mt-2 text-t-muted">{s.text}</p>
              </div>
              <ul className="flex flex-wrap gap-2 md:col-span-3">
                {s.items.map((it) => <li key={it} className="rounded-full border border-t-line bg-t-surface px-3 py-1.5 text-sm">{it}</li>)}
              </ul>
              <a href="#anfrage" className="inline-flex min-h-[44px] items-center text-sm font-bold text-t-accent md:col-span-1 md:justify-end">Anfragen</a>
            </li>
          ))}
        </ol>
      )}
      {theme.services === "cards" && (
        <div data-stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article key={s.title} className="card-fx group flex flex-col overflow-hidden rounded-t border border-t-line bg-t-surface shadow-sm">
              <SvcImage title={s.title} items={s.items} scene={scene} palette={theme.palette} seed={i + 1} className="aspect-[16/9] w-full" />
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
              <SvcImage title={s.title} items={s.items} scene={scene} palette={theme.palette} seed={i + 1} className="aspect-[16/10] w-full" />
              <span className="card-line block h-1 bg-t-accent" aria-hidden="true" />
              <div className="relative p-6 pt-10">
                <span className="svc-badge absolute -top-7 left-6 grid h-14 w-14 place-items-center rounded-full bg-t-accent text-t-accent-ink shadow-lg ring-4 ring-t-bg"><ServiceIcon name={serviceIcon(s.title, scene, s.items)} size={26} /></span>
                <h3 className={`font-display text-xl font-bold ${upper}`}>{s.title}</h3>
                <p className="mt-2 text-sm text-t-muted">{s.text}</p>
                <p className="mt-3 text-sm font-semibold">{s.items.join(" · ")}</p>
                <a href="#anfrage" className="mt-2 inline-flex min-h-[44px] items-center text-sm font-bold text-t-accent">Anfragen</a>
              </div>
            </article>
          ))}
        </div>
      )}
      {theme.services === "feature" && (() => {
        const [lead0, ...more] = services;
        return (
          <div className="mt-14 grid gap-6 lg:grid-cols-12">
            <article data-reveal="left" className="card-fx group relative flex flex-col overflow-hidden rounded-t bg-t-dark text-t-dark-ink lg:col-span-7">
              <SvcImage title={lead0.title} items={lead0.items} scene={scene} palette={theme.palette} seed={1} className="aspect-[16/10] w-full" />
              <div className="flex flex-1 flex-col p-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-t-accent">Schwerpunkt</span>
                <h3 className={`mt-2 font-display text-3xl font-bold ${upper}`}>{lead0.title}</h3>
                <p className="mt-3 max-w-xl text-t-dark-ink/80">{lead0.text}</p>
                <ul className="mt-5 flex flex-wrap gap-2">{lead0.items.map((it) => <li key={it} className="rounded-full bg-white/10 px-3 py-1.5 text-sm">{it}</li>)}</ul>
                <a href="#anfrage" className="mt-auto pt-6 font-bold text-t-accent">Jetzt anfragen</a>
              </div>
            </article>
            <ul data-stagger className="grid gap-3 lg:col-span-5">
              {more.map((s, i) => (
                <li key={s.title} className="card-fx flex items-start gap-4 overflow-hidden rounded-t border border-t-line bg-t-surface p-3 pr-5">
                  <div className="relative w-28 shrink-0 sm:w-32">
                    <SvcImage title={s.title} items={s.items} scene={scene} palette={theme.palette} seed={i + 2} className="aspect-[4/3] w-full rounded-t" />
                    <span className="svc-badge absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-t-accent text-t-accent-ink shadow"><ServiceIcon name={serviceIcon(s.title, scene, s.items)} size={18} /></span>
                  </div>
                  <div className="min-w-0 py-1">
                    <h3 className={`font-display text-lg font-bold ${upper}`}>{s.title}</h3>
                    <p className="mt-1 text-sm text-t-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}
      {theme.services === "split" && (
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div data-reveal="left" className="relative overflow-hidden rounded-t lg:sticky lg:top-28">
              <Scene kind={scene} palette={theme.palette} label={servicesIntro.headline} seed={2} className="aspect-[4/5] w-full" showLabel={false} />
              <div className="absolute inset-x-4 bottom-4 rounded-t bg-t-bg/95 p-5 shadow-xl">
                <p className="font-display text-4xl font-black text-t-accent">{services.length}</p>
                <p className="text-sm font-semibold">Leistungen in {lead.company.city} und Umgebung</p>
              </div>
            </div>
          </div>
          <ol data-stagger className="space-y-4 lg:col-span-7">
            {services.map((s, i) => (
              <li key={s.title} className="group grid gap-5 rounded-t border-l-4 border-t-accent bg-t-surface p-6 shadow-sm transition hover:shadow-lg sm:grid-cols-[1fr_9.5rem]">
                <SvcImage title={s.title} items={s.items} scene={scene} palette={theme.palette} seed={i + 3} className="aspect-[16/9] w-full rounded-t sm:aspect-[4/3]" />
                <div className="sm:order-first">
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-black text-t-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={`font-display text-xl font-bold ${upper}`}>{s.title}</h3>
                  <span className="ml-auto text-t-accent" aria-hidden="true"><ServiceIcon name={serviceIcon(s.title, scene, s.items)} size={24} /></span>
                </div>
                <p className="mt-2 text-t-muted">{s.text}</p>
                <p className="mt-3 text-sm font-semibold">{s.items.join(" · ")}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
      {theme.services === "rows" && (
        <div data-stagger className="mt-14 space-y-6">
          {services.map((s, i) => (
            <article key={s.title} className="card-fx group grid items-center gap-6 overflow-hidden rounded-t border border-t-line bg-t-surface md:grid-cols-12">
              <div className={`md:col-span-4 ${i % 2 ? "md:order-2" : ""}`}><SvcImage title={s.title} items={s.items} scene={scene} palette={theme.palette} seed={i + 1} className="aspect-[16/9] w-full md:aspect-[4/3]" /></div>
              <div className="p-6 md:col-span-8 md:p-8">
                <div className="flex items-center gap-3 text-t-accent"><ServiceIcon name={serviceIcon(s.title, scene, s.items)} size={22} /><span className="text-xs font-bold uppercase tracking-[0.2em]">Leistung {i + 1}</span></div>
                <h3 className={`mt-2 font-display text-2xl font-bold ${upper}`}>{s.title}</h3>
                <p className="mt-2 max-w-2xl text-t-muted">{s.text}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">{s.items.map((it) => <li key={it} className="flex items-center gap-1.5"><CheckIcon className="text-t-accent" size={14} />{it}</li>)}</ul>
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
              <span className="absolute inset-x-0 bottom-0 bg-black/60 p-4 text-xs font-medium text-white">Platz für ein Foto von {company.owner ?? "Inhaber und Team"} bei der Arbeit</span>
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
            <dt className="text-sm">{t.label}</dt>
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
  const refs = lead.site.photos?.gallery ?? [];
  const pic = (i: number) => { const ref = refs[i]; const src = photoSrc(ref); return ref && src ? { ref, src } : null; };
  const firstPic = pic(0);
  const media = (i: number, label: string, className: string) => {
    const p = pic(i);
    return p ? <Photo photo={p.ref} src={p.src} className={className} /> : <Scene kind={scene} palette={theme.palette} label={label} seed={i + 5} className={className} showLabel={false} />;
  };
  const slider = (
    <BeforeAfter label={first.title}
      before={<Scene kind={scene} palette={theme.palette} label={first.photoNeeded} seed={5} variant="before" className="h-full w-full" showLabel={false} />}
      after={<Scene kind={scene} palette={theme.palette} label={first.photoNeeded} seed={5} className="h-full w-full" showLabel={false} />} />
  );
  const caption = (it: (typeof g.items)[number], i: number) => <><span className="block text-sm font-bold">{it.title}</span><span className="block text-[11px] text-white/80">{pic(i) ? "Später echtes Foto" : "Foto folgt"}: {it.photoNeeded}</span></>;
  return (
    <section id="projekte" className="border-y border-t-line bg-t-surface">
      <div className="mx-auto max-w-site px-4 py-24 sm:px-6">
        <SectionHead kicker="Projekte" title={g.headline} text={g.text} upper={upper} center={theme.projects === "masonry"} />
        {theme.projects === "strip" && (
          <>
            <ul data-stagger className="-mx-4 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6" aria-label="Projektbeispiele, seitlich wischen">
              <li className="w-[85%] shrink-0 snap-start sm:w-[34rem]">
                {firstPic ? media(0, first.photoNeeded, "aspect-[4/3] w-full rounded-t") : slider}
                <p className="mt-3 text-sm text-t-muted">{first.title}: {firstPic ? "Beispielfoto" : "Regler ziehen für Vorher/Nachher"}. Live mit echten Fotos ({first.photoNeeded}).</p>
              </li>
              {rest.map((it, i) => (
                <li key={it.title} className="group relative w-[70%] shrink-0 snap-start overflow-hidden rounded-t sm:w-[22rem]">
                  {media(i + 1, it.photoNeeded, "aspect-[3/4] w-full transition duration-500 group-hover:scale-105")}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 text-white">{caption(it, i + 1)}</div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-t-muted" aria-hidden="true">← wischen →</p>
          </>
        )}
        {theme.projects === "masonry" && (
          <div data-stagger className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            <figure className="break-inside-avoid">
              {firstPic ? media(0, first.photoNeeded, "aspect-[4/3] w-full rounded-t") : slider}
              <figcaption className="mt-2 text-sm text-t-muted">{first.title}: Vorher/Nachher. Live mit echten Fotos ({first.photoNeeded}).</figcaption>
            </figure>
            {rest.map((it, i) => (
              <figure key={it.title} className="group relative break-inside-avoid overflow-hidden rounded-t">
                {media(i + 1, it.photoNeeded, `${["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[16/11]"][i % 4]} w-full transition duration-500 group-hover:scale-105`)}
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-white">{caption(it, i + 1)}</figcaption>
              </figure>
            ))}
          </div>
        )}
        {theme.projects === "feature" && (
        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <figure data-reveal="zoom" className="lg:col-span-7">
            {firstPic ? media(0, first.photoNeeded, "aspect-[4/3] w-full rounded-t shadow-xl") : slider}
            <figcaption className="mt-3 text-sm text-t-muted">{firstPic ? `${first.title}: Beispielfoto. In der Live-Version zeigen wir echte Projekte (${first.photoNeeded}).` : `Regler ziehen: Vorher/Nachher. In der Live-Version mit echten Fotos (${first.photoNeeded}).`}</figcaption>
          </figure>
          <div data-stagger className="grid grid-cols-2 gap-4 lg:col-span-5">
            {rest.slice(0, 4).map((it, i) => (
              <figure key={it.title} className="group relative overflow-hidden rounded-t">
                {media(i + 1, it.photoNeeded, "aspect-square w-full transition duration-500 group-hover:scale-105")}
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-white">{caption(it, i + 1)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Bewertungen ---------- */

function Reviews({ lead, theme, upper }: Ctx) {
  const r = lead.site.reviews;
  if (theme.reviews === "quote") return (
    <section id="bewertungen" className="relative isolate overflow-hidden bg-t-dark text-t-dark-ink">
      <span className="pointer-events-none absolute -left-6 -top-16 -z-10 font-display text-[22rem] font-black leading-none text-t-accent/15" aria-hidden="true">“</span>
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-t-accent">Kundenstimmen</p>
        <h2 className={`mt-3 text-balance font-display text-3xl font-bold sm:text-4xl ${upper}`}>{r.headline}</h2>
        <blockquote data-reveal className="mt-10 text-balance font-display text-2xl leading-snug sm:text-4xl">{r.summary}</blockquote>
        {r.rating !== null && (
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-full bg-white/10 px-5 py-2.5">
            <Stars rating={r.rating} />
            <span className="font-bold tabular-nums">{fmt(r.rating)} / 5</span>
            {r.count !== null && <span className="text-sm text-t-dark-ink/80">aus {r.count} Bewertungen auf {r.source}</span>}
          </div>
        )}
        <ul data-stagger className="mt-10 flex flex-wrap justify-center gap-3">
          {r.highlights.map((h) => <li key={h} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold"><span className="mr-1.5 text-t-accent" aria-hidden="true">★</span>{h}</li>)}
        </ul>
        <p className="mt-8 text-xs text-t-dark-ink/70">Sinngemäße Zusammenfassung öffentlicher Bewertungen, keine wörtlichen Zitate. Quelle: {r.source}, Stand {new Date(lead.date).toLocaleDateString("de-DE")}. <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex min-h-[44px] items-center font-bold text-t-accent underline-offset-4 hover:underline">Alle Bewertungen ansehen</a></p>
      </div>
    </section>
  );
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

function Process({ lead, theme, upper }: Ctx) {
  const p = lead.site.process;
  if (theme.process === "vertical") return (
    <section id="ablauf" className="border-y border-t-line bg-t-surface">
      <div className="mx-auto grid max-w-site gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5"><div className="lg:sticky lg:top-28"><SectionHead kicker="So läuft es ab" title={p.headline} upper={upper} text="Vier Schritte vom ersten Anruf bis zur fertigen Arbeit." /></div></div>
        <ol data-stagger className="relative space-y-10 border-l-2 border-t-line pl-10 lg:col-span-7">
          {p.steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[3.85rem] grid h-11 w-11 place-items-center rounded-full bg-t-accent font-display font-black text-t-accent-ink ring-8 ring-t-surface">{i + 1}</span>
              <h3 className="font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 max-w-xl text-t-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
  if (theme.process === "cards") return (
    <section id="ablauf" className="mx-auto max-w-site px-4 py-24 sm:px-6">
      <SectionHead kicker="So läuft es ab" title={p.headline} upper={upper} />
      <ol data-stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {p.steps.map((s, i) => (
          <li key={s.title} className="card-fx relative overflow-hidden rounded-t border border-t-line bg-t-surface p-6 shadow-sm">
            <span className="pointer-events-none absolute -right-2 -top-6 font-display text-8xl font-black text-t-accent/10" aria-hidden="true">{i + 1}</span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-t-accent">Schritt {i + 1}</span>
            <h3 className="mt-3 font-display text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm text-t-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
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
      <div data-reveal="zoom" data-mfx-cta className="relative isolate overflow-hidden rounded-t bg-t-dark px-6 py-12 text-t-dark-ink sm:px-12">
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

function Faq({ lead, theme, upper }: Ctx) {
  const item = (f: { q: string; a: string }, cls: string) => (
    <details key={f.q} className={`group ${cls}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
        {f.q}
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-t-accent/10 text-xl text-t-accent transition group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <p className="faq-body mt-3 leading-relaxed text-t-muted">{f.a}</p>
    </details>
  );
  const note = "Ihre Frage ist nicht dabei? Rufen Sie einfach an oder schreiben Sie uns.";
  if (theme.faq === "columns") return (
    <section id="faq" className="mx-auto max-w-site px-4 py-24 sm:px-6">
      <SectionHead kicker="FAQ" title="Häufige Fragen" upper={upper} text={note} />
      <div data-stagger className="mt-12 grid items-start gap-4 md:grid-cols-2">
        {lead.site.faq.map((f) => item(f, "rounded-t border border-t-line bg-t-surface p-6 shadow-sm"))}
      </div>
    </section>
  );
  if (theme.faq === "center") return (
    <section id="faq" className="bg-t-surface">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <SectionHead kicker="FAQ" title="Häufige Fragen" upper={upper} text={note} center />
        <div data-reveal className="mt-12 divide-y divide-t-line border-y border-t-line">
          {lead.site.faq.map((f) => item(f, "py-6"))}
        </div>
      </div>
    </section>
  );
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
        <p className="text-xs font-semibold uppercase tracking-wider text-t-dark-ink/75">{title}</p>
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
            {company.phone && <ContactCard icon={<PhoneIcon />} title="Telefon"><a href={call} className="inline-flex min-h-[44px] items-center font-display text-xl">{company.phone}</a></ContactCard>}
            {company.email && <ContactCard icon={<MailIcon />} title="E-Mail"><a href={`mailto:${company.email}`} className="inline-flex min-h-[44px] items-center break-all">{company.email}</a></ContactCard>}
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
            {site.nav.map((n) => <a key={n.href} href={n.href} className="inline-flex min-h-[40px] items-center text-t-muted hover:text-t-ink">{n.label}</a>)}
          </nav>
        </div>
        <div>
          <p className="font-bold">Kontakt</p>
          <div className="mt-3 grid gap-2 text-t-muted">
            {company.phone && <a href={call} className="inline-flex min-h-[40px] items-center hover:text-t-ink">{company.phone}</a>}
            {company.email && <a href={`mailto:${company.email}`} className="inline-flex min-h-[40px] items-center break-all hover:text-t-ink">{company.email}</a>}
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
      <PhotoCredits lead={lead} />
      <p className="border-t border-t-line px-4 py-4 pb-24 text-center text-xs text-t-muted md:pb-4">
        {DEMO_NOTICE} Entwurf vom {new Date(lead.date).toLocaleDateString("de-DE")} · © {year}
      </p>
    </footer>
  );
}

function PhotoCredits({ lead }: { lead: Lead }) {
  const p = lead.site.photos;
  const used = [p?.hero, ...(p?.gallery ?? [])].filter((r): r is NonNullable<typeof r> => !!r && !!photoSrc(r));
  const authors = [...new Map(used.map((r) => [r.authorUrl, r])).values()];
  if (!authors.length) return null;
  return (
    <p className="mx-auto max-w-site px-4 pb-6 text-xs text-t-muted sm:px-6">
      Beispielfotos (lizenzfrei, keine Arbeiten des Betriebs) von{" "}
      {authors.map((r, i) => (
        <Fragment key={r.authorUrl}>
          {i > 0 && ", "}
          <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 hover:text-t-ink">{r.author}</a>
        </Fragment>
      ))}{" "}
      auf <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 hover:text-t-ink">Pexels</a>.
    </p>
  );
}

// Strukturierte Daten (schema.org) nur aus belegten Angaben – keine Bewertungen, keine Öffnungszeiten-Schätzungen.
function localBusiness(lead: Lead) {
  const { company, site } = lead;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: company.name,
    description: site.seoDescription,
    areaServed: company.serviceArea.filter((x) => !/umgebung/i.test(x)).map((name) => ({ "@type": "Place", name })),
    makesOffer: site.services.map((sv) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: sv.title } })),
  };
  if (company.phone) data.telephone = company.phone;
  if (company.email) data.email = company.email;
  data.address = company.address
    ? { "@type": "PostalAddress", streetAddress: company.address.split(",")[0], addressLocality: company.city, addressCountry: "DE" }
    : { "@type": "PostalAddress", addressLocality: company.city, addressCountry: "DE" };
  return data;
}

function StickyBar({ lead, call, theme }: Ctx) {
  if (theme.skin === "kante") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-t-dark md:hidden">
        {lead.company.phone && (
          <a href={call} className="kante-btn flex min-h-[60px] flex-1 items-center justify-center gap-2 text-t-dark-ink"><PhoneIcon /> Anrufen</a>
        )}
        <a href="#anfrage" className="kante-btn flex min-h-[60px] flex-[1.3] items-center justify-center bg-t-accent px-3 text-t-accent-ink">{lead.site.stickyCta}</a>
      </div>
    );
  }
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
    <span role="img" className="inline-flex items-center gap-0.5 text-t-accent" aria-label={`${fmt(rating)} von 5 Sternen`}>
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
