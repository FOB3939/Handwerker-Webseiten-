import type { CSSProperties } from "react";
import type { ThemeKey } from "./types";

export type HeroVariant = "editorial" | "panel" | "fullbleed" | "split" | "organic" | "banner" | "stack" | "mosaic" | "card" | "minimal" | "kante";
export type ServicesVariant = "cards" | "numbered" | "tiles" | "feature" | "split" | "rows";

export interface Theme {
  vars: Record<string, string>;
  hero: HeroVariant;
  services: ServicesVariant;
  displayCase: "normal" | "upper";
  palette: string[];
  fontsHref: string;
}


export const themes: Record<ThemeKey, Theme> = {
  // Maler: warm, hochwertig, editorial
  atelier: {
    vars: {
      bg: "250 246 240", surface: "255 255 255", ink: "33 30 28", muted: "110 102 94", line: "228 219 207",
      accent: "184 84 52", "accent-ink": "255 255 255", dark: "38 34 31", "dark-ink": "250 246 240",
      "font-display": '"Fraunces", var(--font-serif)', "font-body": '"Instrument Sans", var(--font-sans)', radius: "0.375rem",
    },
    hero: "editorial", services: "numbered", displayCase: "normal",
    palette: ["#b85434", "#d9a35f", "#7f8f86", "#e8ddd0", "#2f3b4a"],
    fontsHref: "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;800&family=Instrument+Sans:wght@400;500;600;700&display=swap",
  },
  // Hausmeisterservice: strukturiert, verlässlich, Objektbetreuung
  objekt: {
    vars: {
      bg: "244 246 249", surface: "255 255 255", ink: "17 28 45", muted: "84 97 117", line: "220 226 235",
      accent: "245 176 38", "accent-ink": "17 28 45", dark: "18 34 58", "dark-ink": "240 244 250",
      "font-display": '"Manrope", var(--font-sans)', "font-body": '"Manrope", var(--font-sans)', radius: "0.75rem",
    },
    hero: "panel", services: "cards", displayCase: "normal",
    palette: ["#12223a", "#f5b026", "#3e6a9c", "#dce2eb", "#8aa2bf"],
    fontsHref: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
  },
  // Fliesenleger: Stein, Material, Ruhe
  stein: {
    vars: {
      bg: "242 240 237", surface: "250 249 247", ink: "24 24 23", muted: "107 104 99", line: "214 210 204",
      accent: "166 132 78", "accent-ink": "255 255 255", dark: "28 28 27", "dark-ink": "242 240 237",
      "font-display": '"Archivo", var(--font-sans)', "font-body": '"Archivo", var(--font-sans)', radius: "0px",
    },
    hero: "fullbleed", services: "tiles", displayCase: "upper",
    palette: ["#d6d2cc", "#a6844e", "#5f5c57", "#ebe8e3", "#2c2c2b"],
    fontsHref: "https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700;800&display=swap",
  },
  // Garten- und Landschaftsbau: natürlich, emotional
  garten: {
    vars: {
      bg: "247 245 237", surface: "255 255 252", ink: "28 43 33", muted: "88 104 92", line: "222 226 210",
      accent: "122 154 62", "accent-ink": "255 255 255", dark: "30 58 41", "dark-ink": "240 245 232",
      "font-display": '"Young Serif", var(--font-serif)', "font-body": '"Figtree", var(--font-sans)', radius: "1.5rem",
    },
    hero: "organic", services: "cards", displayCase: "normal",
    palette: ["#1e3a29", "#7a9a3e", "#c7d59f", "#a8875a", "#eef0e2"],
    fontsHref: "https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700;800&display=swap",
  },
  // Elektriker: Sicherheit, Präzision, klare Struktur
  volt: {
    vars: {
      bg: "255 255 255", surface: "246 248 251", ink: "12 18 28", muted: "86 96 112", line: "226 231 238",
      accent: "37 99 235", "accent-ink": "255 255 255", dark: "11 17 28", "dark-ink": "236 242 252",
      "font-display": '"Barlow Condensed", var(--font-condensed)', "font-body": '"Barlow", var(--font-sans)', radius: "0.5rem",
    },
    hero: "split", services: "numbered", displayCase: "upper",
    palette: ["#2563eb", "#facc15", "#0b111c", "#e2e7ee", "#60a5fa"],
    fontsHref: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&display=swap",
  },
  // Schreiner / Innenausbau / Sanitär: Handwerk, Wärme, Präzision
  werk: {
    vars: {
      bg: "248 244 238", surface: "255 252 248", ink: "40 31 24", muted: "112 96 82", line: "230 220 206",
      accent: "176 120 52", "accent-ink": "255 255 255", dark: "45 36 29", "dark-ink": "248 240 230",
      "font-display": '"Big Shoulders Display", var(--font-condensed)', "font-body": '"Work Sans", var(--font-sans)', radius: "0.25rem",
    },
    hero: "banner", services: "tiles", displayCase: "upper",
    palette: ["#b07834", "#5b4636", "#d8c3a5", "#2d241d", "#8a9a8c"],
    fontsHref: "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800;900&family=Work+Sans:wght@400;500;600;700&display=swap",
  },
  // Sanitär / Heizung: frisch, sauber, technisch-vertrauensvoll
  aqua: {
    vars: {
      bg: "246 250 251", surface: "255 255 255", ink: "14 37 46", muted: "79 103 112", line: "218 230 233",
      accent: "8 131 149", "accent-ink": "255 255 255", dark: "10 46 58", "dark-ink": "232 244 246",
      "font-display": '"Plus Jakarta Sans", var(--font-sans)', "font-body": '"Plus Jakarta Sans", var(--font-sans)', radius: "1rem",
    },
    hero: "split", services: "cards", displayCase: "normal",
    palette: ["#0a2e3a", "#f59e0b", "#e6f2f4", "#7fc4cf", "#088395"],
    fontsHref: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
  },
  // Pferdehof / Bauernhof / Hofladen: naturnah, bodenständig, warm
  hof: {
    vars: {
      bg: "248 245 236", surface: "255 253 247", ink: "44 36 27", muted: "110 98 82", line: "228 220 202",
      accent: "158 58 38", "accent-ink": "255 255 255", dark: "52 61 38", "dark-ink": "246 242 228",
      "font-display": '"Bitter", var(--font-serif)', "font-body": '"Nunito Sans", var(--font-sans)', radius: "0.75rem",
    },
    hero: "organic", services: "tiles", displayCase: "normal",
    palette: ["#9e3a26", "#8fae5a", "#b9c98a", "#efe4cc", "#3d2b1f"],
    fontsHref: "https://fonts.googleapis.com/css2?family=Bitter:wght@500;600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap",
  },
};

export function themeStyle(theme: Theme): CSSProperties {
  return Object.fromEntries(Object.entries(theme.vars).map(([k, val]) => [`--${k}`, val])) as CSSProperties;
}
