import type { Lead } from "./types";
import { themes, type Theme, type HeroVariant, type ServicesVariant } from "./themes";

// Eigene visuelle Identität je Handwerksbetrieb: Farben aus den Materialien des Gewerks,
// Schriftpaar, Hero-/Leistungs-Layout, Logo-Stil und Intro-Animation. Die Auswahl ist über den
// Slug fest (gleiche Firma = gleiches Aussehen), aber zwei Firmen desselben Gewerks unterscheiden sich.

export type LogoStyle = "badge" | "ring" | "wordmark" | "block" | "tile" | "stamp";
export type IntroStyle = "rise" | "curtain" | "draw" | "stamp" | "letters" | "split";
export type ProjectsStyle = "feature" | "strip" | "masonry";
export type ProcessStyle = "line" | "vertical" | "cards";
export type FaqStyle = "side" | "columns" | "center";
export type ReviewsStyle = "side" | "quote";

export interface Identity extends Theme {
  logo: LogoStyle;
  intro: IntroStyle;
  projects: ProjectsStyle;
  process: ProcessStyle;
  faq: FaqStyle;
  reviews: ReviewsStyle;
  /** Reihenfolge der Abschnitte (0–3), siehe DemoSite ORDERS */
  order: number;
  /** Startwert für den generativen Hintergrund – je Betrieb eindeutig */
  seed: number;
  name: string;
}

interface Palette {
  name: string;
  bg: string; surface: string; ink: string; muted: string; line: string;
  accent: string; accentInk: string; dark: string; darkInk: string;
  scene: string[];
}

const P = (name: string, bg: string, surface: string, ink: string, muted: string, line: string, accent: string, accentInk: string, dark: string, darkInk: string, scene: string[]): Palette =>
  ({ name, bg, surface, ink, muted, line, accent, accentInk, dark, darkInk, scene });

const PALETTES: Record<string, Palette[]> = {
  drywall: [
    P("Gipsweiß & Signalgelb", "#F2F3F1", "#FFFFFF", "#1E2226", "#5E656C", "#DADDDA", "#F2B705", "#1E2226", "#23282D", "#F2F3F1", ["#F2B705", "#D9DCD8", "#8C939A", "#ECEDEA", "#2E353B"]),
    P("Sichtbeton & Bauorange", "#E9E8E4", "#F6F5F2", "#1C1C1B", "#5F5E5A", "#D2D0CA", "#E4570B", "#FFFFFF", "#2A2A28", "#ECEBE7", ["#E4570B", "#BDBAB3", "#77746E", "#E2E0DB", "#2A2A28"]),
    P("Akustik-Blau", "#EEF2F4", "#FFFFFF", "#14202B", "#56636F", "#D5DDE3", "#2F5D8A", "#FFFFFF", "#132432", "#E9F0F5", ["#2F5D8A", "#C9D4DC", "#7E95A8", "#E6ECF0", "#132432"]),
    P("Lehmputz & Anthrazit", "#F1ECE5", "#FBF8F4", "#24221F", "#68625A", "#DDD4C8", "#2E3135", "#F1ECE5", "#2E3135", "#F1ECE5", ["#2E3135", "#C8B49A", "#9C8E7C", "#E7DFD4", "#B5652F"]),
    P("Kalkweiß & Flaschengrün", "#F6F6F3", "#FFFFFF", "#162019", "#58625B", "#DDE1DC", "#1E5B3A", "#FFFFFF", "#15291D", "#EEF4EF", ["#1E5B3A", "#D6D9D2", "#8D978F", "#ECEEEA", "#E0B341"]),
    P("Trockenbau-Violett", "#F4F3F7", "#FFFFFF", "#1C1A26", "#5E5B6E", "#DEDCE6", "#5B3FD1", "#FFFFFF", "#1B1830", "#EFEDF9", ["#5B3FD1", "#D3D0DE", "#8E8AA3", "#ECEAF2", "#F2B705"]),
  ],
  bath: [
    P("Fugenweiß & Petrol", "#F3F7F7", "#FFFFFF", "#0F2426", "#4F6668", "#D3E0E0", "#0F6E73", "#FFFFFF", "#0D2B2E", "#E8F3F3", ["#0F6E73", "#BFD7D7", "#6E9A9B", "#E6EFEF", "#0D2B2E"]),
    P("Terrazzo & Tannengrün", "#F4F1EC", "#FFFFFF", "#1C2621", "#5D6A62", "#DED8CE", "#2E5A45", "#FFFFFF", "#1B2C24", "#F0EDE6", ["#2E5A45", "#D9CFC0", "#A2967F", "#ECE6DC", "#1B2C24"]),
    P("Marmor & Messing", "#F6F5F2", "#FFFFFF", "#1A2228", "#5C646B", "#DEDCD6", "#9C7A3C", "#FFFFFF", "#1D2A30", "#F3F1EC", ["#9C7A3C", "#D8D6D0", "#8E9499", "#EDEBE6", "#1D2A30"]),
    P("Wasserblau & Chrom", "#F1F6FA", "#FFFFFF", "#0F1E2C", "#506273", "#D4E0EA", "#1769AA", "#FFFFFF", "#0E2236", "#E7F0F8", ["#1769AA", "#BFD3E3", "#7F97AB", "#E4ECF2", "#0E2236"]),
    P("Kupferrohr & Schiefer", "#F4F2F0", "#FFFFFF", "#1E1F22", "#5F6166", "#DDD9D4", "#B0582B", "#FFFFFF", "#25272B", "#F2EEEA", ["#B0582B", "#C9C3BB", "#7D8086", "#EAE5DF", "#25272B"]),
  ],
  paint: [
    P("Ultramarin", "#FAFAF7", "#FFFFFF", "#15182B", "#5A5E73", "#E1E1EA", "#3346D3", "#FFFFFF", "#161A3A", "#EEF0FB", ["#3346D3", "#F2C14E", "#E36A5C", "#DCE0F5", "#161A3A"]),
    P("Ocker & Kreide", "#F8F6F0", "#FFFFFF", "#24211A", "#666052", "#E4DECF", "#C58B10", "#1F1A10", "#2B2618", "#F7F1E2", ["#C58B10", "#6F8F8A", "#B9533F", "#ECE4D0", "#2B2618"]),
    P("Salbei & Graphit", "#F4F6F3", "#FFFFFF", "#1D2420", "#5A665F", "#D8DFD9", "#4F7566", "#FFFFFF", "#202A25", "#EDF2EE", ["#4F7566", "#D8B26E", "#8FA79A", "#E3E9E4", "#202A25"]),
    P("Ziegelrot & Leinen", "#F7F3EE", "#FFFFFF", "#2A1D18", "#6B5C55", "#E5DAD0", "#A63D2A", "#FFFFFF", "#2D1F1A", "#F6EEE7", ["#A63D2A", "#E2B46B", "#5E7C8A", "#EDE2D6", "#2D1F1A"]),
    P("Pflaume & Puder", "#F7F4F6", "#FFFFFF", "#24182A", "#66596B", "#E4DAE3", "#7A3E7A", "#FFFFFF", "#2A1B2E", "#F4ECF3", ["#7A3E7A", "#E8B7A8", "#8D96A8", "#EEE4EC", "#2A1B2E"]),
  ],
  garden: [
    P("Moos & Rinde", "#F1F3EC", "#FFFFFF", "#1E2B1F", "#5A6857", "#D8DECF", "#4E7A2D", "#FFFFFF", "#1F3324", "#EEF3E6", ["#4E7A2D", "#A7C080", "#8B6B4A", "#E4EADA", "#1F3324"]),
    P("Tanne & Nebel", "#EDF2EF", "#FFFFFF", "#132620", "#52675F", "#D2DED8", "#1F6B4F", "#FFFFFF", "#0F2A21", "#E6F1EC", ["#1F6B4F", "#9CC3AE", "#6E8B7D", "#E1ECE6", "#0F2A21"]),
    P("Laub & Stein", "#F5F3EC", "#FFFFFF", "#22261C", "#62665A", "#E0DDD0", "#6B8E23", "#FFFFFF", "#2A3020", "#F1F0E6", ["#6B8E23", "#C9B88A", "#8D8C7E", "#E9E6DA", "#2A3020"]),
    P("Wiese & Sonnengelb", "#F6F6EE", "#FFFFFF", "#1C2618", "#5B6555", "#DEE2D2", "#3F7D20", "#FFFFFF", "#1C2E16", "#EEF4E6", ["#3F7D20", "#F0C53A", "#7E9A6A", "#E6EBDA", "#1C2E16"]),
    P("Kiefer & Terrakotta", "#F4F1EB", "#FFFFFF", "#1F2420", "#5E655F", "#DDD8CC", "#2F5D4A", "#FFFFFF", "#1E2C26", "#EFEDE5", ["#2F5D4A", "#C2734A", "#93A08F", "#E7E2D6", "#1E2C26"]),
  ],
  parquet: [
    P("Eiche geölt", "#F7F3EC", "#FFFFFF", "#2B211A", "#6E6156", "#E4DACB", "#8A5A2B", "#FFFFFF", "#2B211A", "#F5EEE4", ["#8A5A2B", "#D2B48C", "#A88763", "#EFE5D6", "#2B211A"]),
    P("Nussbaum & Leinen", "#F2EEE9", "#FBF9F6", "#231B16", "#665A51", "#DDD3C9", "#5B3A29", "#FFFFFF", "#231B16", "#F2EAE2", ["#5B3A29", "#B89272", "#8C7A6B", "#E9E0D6", "#231B16"]),
    P("Esche & Graublau", "#F6F7F5", "#FFFFFF", "#1E2328", "#5D646B", "#DCE0E2", "#3C5A73", "#FFFFFF", "#1E2B36", "#EEF2F5", ["#3C5A73", "#D8C3A0", "#9AA6B0", "#E9EDEF", "#1E2B36"]),
    P("Räuchereiche & Olive", "#F3F1EC", "#FFFFFF", "#22201A", "#64605A", "#DCD7CE", "#5F6B2E", "#FFFFFF", "#26241D", "#F0EDE5", ["#5F6B2E", "#B48A5E", "#8E8677", "#E8E3D8", "#26241D"]),
  ],
  electric: [
    P("Anthrazit & Strom", "#F5F7FA", "#FFFFFF", "#0E1622", "#566173", "#DCE2EA", "#0057FF", "#FFFFFF", "#0B1422", "#E8EEF8", ["#0057FF", "#FFC300", "#7A8AA0", "#E3E8EF", "#0B1422"]),
    P("Signalgelb", "#FFFFFF", "#F6F6F2", "#14140F", "#5C5C52", "#E4E4DC", "#FFC300", "#14140F", "#14140F", "#F7F6EE", ["#FFC300", "#2A2A24", "#9A9A8C", "#EEEDE4", "#14140F"]),
    P("Kupfer & Kabel", "#F4F4F2", "#FFFFFF", "#1A1C1E", "#5D6064", "#DCDCD8", "#B8642E", "#FFFFFF", "#1E2124", "#F1EFEB", ["#B8642E", "#2F6F8F", "#9A9D9F", "#E7E6E2", "#1E2124"]),
    P("Schaltschrank-Grau & Grün", "#F3F5F4", "#FFFFFF", "#141C19", "#56615C", "#D9E0DC", "#0F7B4F", "#FFFFFF", "#12201A", "#E9F2ED", ["#0F7B4F", "#F2C200", "#8A9A92", "#E3EAE6", "#12201A"]),
    P("Nachtblau & Neon", "#F2F3F8", "#FFFFFF", "#121428", "#575A73", "#DADCE8", "#4B3BD6", "#FFFFFF", "#101233", "#ECEDFA", ["#4B3BD6", "#21D4A8", "#8288A8", "#E4E5F1", "#101233"]),
  ],
  facade: [
    P("Sichtbeton & Signalrot", "#ECECEA", "#F7F7F5", "#1B1B1A", "#5E5E5B", "#D4D4D0", "#D7402B", "#FFFFFF", "#232322", "#EFEFEC", ["#D7402B", "#BFBFBA", "#7C7C77", "#E3E3DF", "#232322"]),
    P("Stahlblau & Kalk", "#F2F4F5", "#FFFFFF", "#162029", "#56626C", "#D7DDE1", "#2B4C6F", "#FFFFFF", "#15212D", "#ECF1F4", ["#2B4C6F", "#E0C9A6", "#8696A3", "#E5EAED", "#15212D"]),
    P("Zinkgrau & Orange", "#F1F2F2", "#FFFFFF", "#1A1D1F", "#5C6266", "#D8DBDC", "#D9631E", "#FFFFFF", "#202427", "#EEF0F0", ["#D9631E", "#A9B0B4", "#6D757A", "#E4E7E8", "#202427"]),
    P("Ziegel & Moos", "#F5F1EC", "#FFFFFF", "#251C17", "#675B53", "#E1D6CB", "#9E3B23", "#FFFFFF", "#2A1E19", "#F3EBE4", ["#9E3B23", "#7E8F5A", "#9B8B7E", "#EBE1D7", "#2A1E19"]),
    P("Schiefer & Eisblau", "#EFF2F4", "#FFFFFF", "#13191E", "#55606A", "#D5DCE1", "#3E6E8E", "#FFFFFF", "#151D24", "#E8EEF2", ["#3E6E8E", "#BFD1DD", "#76848F", "#E2E8EC", "#151D24"]),
  ],
  key: [
    P("Navy & Messing", "#F3F5F8", "#FFFFFF", "#111C2E", "#526075", "#D9DFE8", "#C9A227", "#111C2E", "#14213D", "#EDF1F7", ["#14213D", "#C9A227", "#5D7896", "#E2E7EF", "#8AA0BA"]),
    P("Petrol & Sand", "#F5F4F0", "#FFFFFF", "#132326", "#566568", "#DEDBD2", "#136F75", "#FFFFFF", "#11292C", "#EEF3F2", ["#136F75", "#D6C29A", "#7C9396", "#E7E5DD", "#11292C"]),
    P("Frische Minze", "#F2F7F5", "#FFFFFF", "#10221C", "#506860", "#D5E3DD", "#13805E", "#FFFFFF", "#0F2A21", "#E8F4EF", ["#13805E", "#9ED8C3", "#77938A", "#E2EEE9", "#0F2A21"]),
    P("Himmelblau & Weiß", "#F3F7FB", "#FFFFFF", "#0F1D2E", "#52637A", "#D6E1EC", "#1E6FD0", "#FFFFFF", "#0E2240", "#E9F1FA", ["#1E6FD0", "#BCD6F2", "#7C93AE", "#E5EDF6", "#0E2240"]),
    P("Graphit & Limette", "#F4F5F3", "#FFFFFF", "#171A16", "#5A6058", "#DBDFD8", "#5E8F12", "#FFFFFF", "#1C2118", "#EFF3EA", ["#5E8F12", "#C9D96B", "#878F83", "#E6EAE2", "#1C2118"]),
    P("Bordeaux & Kreide", "#F7F4F3", "#FFFFFF", "#25161A", "#6A5A5E", "#E5DADC", "#8C2339", "#FFFFFF", "#2C1A1F", "#F5ECEE", ["#8C2339", "#D9B9A0", "#958A8D", "#EEE5E6", "#2C1A1F"]),
  ],
};

// Schriftpaare (Google Fonts) – bewusst keine Standard-Systemschriften.
interface Fonts { display: string; body: string; href: string; upper?: boolean }
const F = (display: string, body: string, href: string, upper = false): Fonts => ({ display, body, href, upper });
const g = (q: string) => `https://fonts.googleapis.com/css2?${q}&display=swap`;
// Breit laufende Display-Schriften brauchen pro Buchstabe mehr Platz (Zeichenbreite in em für die Größenanpassung langer Wörter in der h1)
const CHAR_W: [RegExp, string][] = [[/Unbounded/, "1"], [/Syne|Archivo Black/, "0.84"], [/Red Hat Display|Epilogue|Sora/, "0.7"]];
const charWidth = (display: string) => CHAR_W.find(([re]) => re.test(display))?.[1] ?? "0.62";
const FONTS: Fonts[] = [
  F('"Bricolage Grotesque"', '"Figtree"', g("family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400;500;600;700")),
  F('"Sora"', '"Sora"', g("family=Sora:wght@400;500;600;700;800")),
  F('"Unbounded"', '"Manrope"', g("family=Unbounded:wght@500;600;700;800&family=Manrope:wght@400;500;600;700")),
  F('"Syne"', '"Inter Tight"', g("family=Syne:wght@600;700;800&family=Inter+Tight:wght@400;500;600;700")),
  F('"DM Serif Display"', '"DM Sans"', g("family=DM+Serif+Display&family=DM+Sans:opsz,wght@9..40,400..700")),
  F('"Familjen Grotesk"', '"Familjen Grotesk"', g("family=Familjen+Grotesk:wght@400;500;600;700")),
  F('"Schibsted Grotesk"', '"Schibsted Grotesk"', g("family=Schibsted+Grotesk:wght@400;500;600;700;800;900")),
  F('"Archivo Black"', '"Archivo"', g("family=Archivo+Black&family=Archivo:wght@400;500;600;700")),
  F('"Outfit"', '"Outfit"', g("family=Outfit:wght@400;500;600;700;800")),
  F('"Red Hat Display"', '"Red Hat Text"', g("family=Red+Hat+Display:wght@500;700;800;900&family=Red+Hat+Text:wght@400;500;600;700")),
  F('"Instrument Serif"', '"Instrument Sans"', g("family=Instrument+Serif&family=Instrument+Sans:wght@400;500;600;700")),
  F('"Epilogue"', '"Epilogue"', g("family=Epilogue:wght@400;500;600;700;800;900")),
  F('"Oswald"', '"Hanken Grotesk"', g("family=Oswald:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600;700"), true),
  F('"Anton"', '"Rethink Sans"', g("family=Anton&family=Rethink+Sans:wght@400;500;600;700"), true),
];

const HEROES: HeroVariant[] = ["editorial", "fullbleed", "banner", "split", "stack", "mosaic", "card", "minimal"];
const SERVICES: ServicesVariant[] = ["cards", "numbered", "tiles", "feature", "split", "rows"];
const PROJECTS: ProjectsStyle[] = ["feature", "strip", "masonry"];
const PROCESS: ProcessStyle[] = ["line", "vertical", "cards"];
const FAQS: FaqStyle[] = ["side", "columns", "center"];
const REVIEWS: ReviewsStyle[] = ["side", "quote"];
const ORDERS = 4;
const RADII = ["0px", "0.25rem", "0.625rem", "1rem", "1.5rem"];
const LOGOS: LogoStyle[] = ["badge", "ring", "wordmark", "block", "tile", "stamp"];
const INTROS: IntroStyle[] = ["rise", "curtain", "draw", "stamp", "letters", "split"];

function hash(s: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0);
}
const pick = <T,>(arr: T[], s: string, salt: number) => arr[hash(s, salt) % arr.length];
// Lesbarkeit (WCAG AA, Kontrast ≥ 4,5:1): eigene Akzent-Textfarben für helle und dunkle Flächen
// und eine Schriftfarbe auf Akzentflächen, die sicher lesbar ist. Arbeitet auf "r g b"-Strings der Theme-Variablen.
const trip = (v: string) => v.split(/\s+/).map(Number);
const lum = ([r, g, b]: number[]) => { const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
function readable(base: number[], bgs: number[][], toward: 0 | 255): string {
  for (let t = 0; t <= 1.0001; t += 0.04) {
    const c = base.map((v) => Math.round(v + (toward - v) * t));
    if (bgs.every((bg) => ratio(c, bg) >= 4.5)) return c.join(" ");
  }
  return toward ? "255 255 255" : "0 0 0";
}
export function withReadableColors(vars: Record<string, string>): Record<string, string> {
  let accent = trip(vars.accent);
  const dark = trip(vars.dark);
  // Mittlere Akzenttöne (weder Weiß noch Dunkel lesbar): Akzent minimal abdunkeln, bis weiße Schrift ≥ 4,5:1 hat
  if (ratio([255, 255, 255], accent) < 4.5 && ratio([20, 20, 20], accent) < 4.5) accent = trip(readable(accent, [[255, 255, 255]], 0));
  const light = [vars.bg, vars.surface].filter(Boolean).map(trip);
  const ink = trip(vars["accent-ink"]);
  const darkInk = [20, 20, 20];
  const accentInk = ratio(ink, accent) >= 4.5 ? vars["accent-ink"] : ratio([255, 255, 255], accent) >= 4.5 ? "255 255 255" : ratio(darkInk, accent) >= ratio([255, 255, 255], accent) ? darkInk.join(" ") : "255 255 255";
  return { ...vars, accent: accent.join(" "), "accent-ink": accentInk, "accent-text": readable(accent, light, 0), "accent-text-dark": readable(accent, [dark], 255) };
}

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

export const LOOK_SIZES = {
  palette: Object.fromEntries(Object.entries(PALETTES).map(([k, v]) => [k, v.length])),
  font: FONTS.length, hero: HEROES.length, services: SERVICES.length, radius: RADII.length, logo: LOGOS.length, intro: INTROS.length,
  projects: PROJECTS.length, process: PROCESS.length, faq: FAQS.length, reviews: REVIEWS.length, order: ORDERS,
};

function family(lead: Lead): string {
  const t = `${lead.company.trade} ${lead.site.heroOffer?.join(" ") ?? ""}`.toLowerCase();
  if (/hausmeister|objekt|reinigung/.test(t) && !/garten|baum/.test(t)) return "key";
  return lead.site.scene in PALETTES ? lead.site.scene : "drywall";
}

// Feste Zuteilung pro Tagesrunde (scripts/assign-looks.mjs schreibt site.look), damit innerhalb
// einer Runde keine zwei Seiten gleich aussehen. Ohne look entscheidet der Slug-Hash.
type Look = { palette?: number; font?: number; hero?: number; services?: number; radius?: number; logo?: number; intro?: number; projects?: number; process?: number; faq?: number; reviews?: number; order?: number };
const at = <T,>(arr: T[], i: number | undefined, s: string, salt: number) => (i === undefined ? pick(arr, s, salt) : arr[i % arr.length]);

export function familyOf(lead: Lead) {
  return family(lead);
}

export function resolveTheme(lead: Lead): Identity {
  const base = themes[lead.site.theme];
  const hof = (lead.site.category ?? (lead.site.theme === "hof" || lead.site.scene === "farm" ? "hof" : "handwerk")) === "hof";
  if (hof) return { ...base, vars: withReadableColors(base.vars), logo: "badge", intro: "rise", projects: "feature", process: "line", faq: "side", reviews: "side", order: 0, seed: hash(lead.slug, 9), name: lead.site.theme };
  const s = lead.slug;
  const look: Look = (lead.site as { look?: Look }).look ?? {};
  const pal = at(PALETTES[family(lead)], look.palette, s, 1);
  const fonts = at(FONTS, look.font, s, 2);
  return {
    vars: withReadableColors({
      bg: rgb(pal.bg), surface: rgb(pal.surface), ink: rgb(pal.ink), muted: rgb(pal.muted), line: rgb(pal.line),
      accent: rgb(pal.accent), "accent-ink": rgb(pal.accentInk), dark: rgb(pal.dark), "dark-ink": rgb(pal.darkInk),
      "font-display": `${fonts.display}, var(--font-sans)`, "font-body": `${fonts.body}, var(--font-sans)`, "h1-cw": charWidth(fonts.display),
      radius: at(RADII, look.radius, s, 3),
    }),
    hero: at(HEROES, look.hero, s, 4),
    services: at(SERVICES, look.services, s, 5),
    displayCase: fonts.upper ? "upper" : "normal",
    palette: pal.scene,
    fontsHref: fonts.href,
    logo: at(LOGOS, look.logo, s, 6),
    intro: at(INTROS, look.intro, s, 7),
    projects: at(PROJECTS, look.projects, s, 8),
    process: at(PROCESS, look.process, s, 10),
    faq: at(FAQS, look.faq, s, 11),
    reviews: at(REVIEWS, look.reviews, s, 12),
    order: look.order === undefined ? hash(s, 13) % ORDERS : look.order % ORDERS,
    seed: hash(s, 9),
    name: `${pal.name} · ${fonts.display.replace(/"/g, "")}`,
  };
}
