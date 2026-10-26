import type { SceneKind } from "@/components/Scene";
import type { LogoIcon } from "@/components/BrandLogo";

export type ThemeKey = "atelier" | "objekt" | "stein" | "garten" | "volt" | "werk" | "aqua" | "hof";

export interface SourceRef {
  label: string;
  url: string;
}

export interface Lead {
  id: string;
  slug: string;
  date: string;
  company: {
    name: string;
    owner: string | null;
    trade: string;
    city: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    serviceArea: string[];
  };
  listings: {
    google: { url: string; rating: number | null; reviews: number | null; evidence: string };
    myhammer: { url: string; rating: number | null; reviews: number | null; evidence: string };
  };
  websiteStatus: string;
  websiteChecks: string[];
  facts: {
    services: string[];
    experience: string | null;
    praisedFor: string[];
  };
  strategy: {
    audience: string;
    mainService: string;
    trustSignal: string;
    conversionGoal: string;
    visualConcept: string;
  };
  sales: {
    score: number;
    whyGoodLead: string[];
    pitch: string;
  };
  manualChecks: string[];
  sources: SourceRef[];
  site: SiteContent;
}

export interface SiteContent {
  theme: ThemeKey;
  /** "hof" = Hofladen/Bauernhof/Pferdehof (Produkte, Öffnungszeiten, Anfahrt); "handwerk" = Leistungen & Angebot */
  category?: "handwerk" | "hof";
  /** 3–5 ganz kurze Angebots-Stichworte für den Hero (z. B. "Eier", "Kartoffeln" bzw. "Badsanierung", "Fliesen") */
  heroOffer?: string[];
  /** Nur belegte Öffnungs-/Verkaufszeiten, z. B. { label: "Mo, Mi, Sa", value: "8–13 Uhr" } */
  hours?: { label: string; value: string }[];
  scene: SceneKind;
  /** Lizenzfreie Beispielfotos (gesetzt von scripts/fetch-photos.mjs). Fehlt die Datei, bleibt die Illustration. */
  photos?: { hero?: PhotoRef; gallery?: (PhotoRef | null)[] };
  quote: { sizeLabel: string; sizes: string[]; timings: string[] };
  badges: { title: string; sub: string }[];
  seoTitle: string;
  seoDescription: string;
  logoMark: string;
  brandName: string;
  logoIcon: LogoIcon;
  nav: { label: string; href: string }[];
  hero: {
    eyebrow: string;
    headline: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    bullets: string[];
    imageLabel: string;
  };
  trust: { value: string; label: string }[];
  services: { title: string; text: string; items: string[] }[];
  servicesIntro: { headline: string; text: string };
  why: { headline: string; points: { title: string; text: string }[] };
  reviews: { headline: string; summary: string; highlights: string[]; source: string; sourceUrl: string; rating: number | null; count: number | null };
  process: { headline: string; steps: { title: string; text: string }[] };
  gallery: { headline: string; text: string; items: { title: string; photoNeeded: string }[] };
  region: { headline: string; text: string; places: string[] };
  faq: { q: string; a: string }[];
  contact: { headline: string; text: string; topics: string[]; responseNote: string };
  stickyCta: string;
}

export interface PhotoRef {
  /** Pfad relativ zu data/photos/ */
  file: string;
  /** Original-URL zum erneuten Herunterladen (images.pexels.com) */
  download: string;
  alt: string;
  author: string;
  authorUrl: string;
  source: "Pexels";
  sourceUrl: string;
}
