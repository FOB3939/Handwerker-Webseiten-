import type { CSSProperties } from "react";
import type { ThemeKey } from "./types";

export type HeroVariant = "editorial" | "panel" | "fullbleed" | "split" | "organic" | "banner";
export type ServicesVariant = "cards" | "numbered" | "tiles";

export interface Theme {
  vars: Record<string, string>;
  hero: HeroVariant;
  services: ServicesVariant;
  displayCase: "normal" | "upper";
  palette: string[];
}

const font = { serif: "var(--font-serif)", sans: "var(--font-sans)", condensed: "var(--font-condensed)" };

export const themes: Record<ThemeKey, Theme> = {
  // Maler: warm, hochwertig, editorial
  atelier: {
    vars: {
      bg: "250 246 240", surface: "255 255 255", ink: "33 30 28", muted: "110 102 94", line: "228 219 207",
      accent: "184 84 52", "accent-ink": "255 255 255", dark: "38 34 31", "dark-ink": "250 246 240",
      "font-display": font.serif, "font-body": font.sans, radius: "0.375rem",
    },
    hero: "editorial", services: "numbered", displayCase: "normal",
    palette: ["#b85434", "#d9a35f", "#7f8f86", "#e8ddd0", "#2f3b4a"],
  },
  // Hausmeisterservice: strukturiert, verlässlich, Objektbetreuung
  objekt: {
    vars: {
      bg: "244 246 249", surface: "255 255 255", ink: "17 28 45", muted: "84 97 117", line: "220 226 235",
      accent: "245 176 38", "accent-ink": "17 28 45", dark: "18 34 58", "dark-ink": "240 244 250",
      "font-display": font.sans, "font-body": font.sans, radius: "0.75rem",
    },
    hero: "panel", services: "cards", displayCase: "normal",
    palette: ["#12223a", "#f5b026", "#3e6a9c", "#dce2eb", "#8aa2bf"],
  },
  // Fliesenleger: Stein, Material, Ruhe
  stein: {
    vars: {
      bg: "242 240 237", surface: "250 249 247", ink: "24 24 23", muted: "107 104 99", line: "214 210 204",
      accent: "166 132 78", "accent-ink": "255 255 255", dark: "28 28 27", "dark-ink": "242 240 237",
      "font-display": font.sans, "font-body": font.sans, radius: "0px",
    },
    hero: "fullbleed", services: "tiles", displayCase: "upper",
    palette: ["#d6d2cc", "#a6844e", "#5f5c57", "#ebe8e3", "#2c2c2b"],
  },
  // Garten- und Landschaftsbau: natürlich, emotional
  garten: {
    vars: {
      bg: "247 245 237", surface: "255 255 252", ink: "28 43 33", muted: "88 104 92", line: "222 226 210",
      accent: "122 154 62", "accent-ink": "255 255 255", dark: "30 58 41", "dark-ink": "240 245 232",
      "font-display": font.serif, "font-body": font.sans, radius: "1.5rem",
    },
    hero: "organic", services: "cards", displayCase: "normal",
    palette: ["#1e3a29", "#7a9a3e", "#c7d59f", "#a8875a", "#eef0e2"],
  },
  // Elektriker: Sicherheit, Präzision, klare Struktur
  volt: {
    vars: {
      bg: "255 255 255", surface: "246 248 251", ink: "12 18 28", muted: "86 96 112", line: "226 231 238",
      accent: "37 99 235", "accent-ink": "255 255 255", dark: "11 17 28", "dark-ink": "236 242 252",
      "font-display": font.condensed, "font-body": font.sans, radius: "0.5rem",
    },
    hero: "split", services: "numbered", displayCase: "upper",
    palette: ["#2563eb", "#facc15", "#0b111c", "#e2e7ee", "#60a5fa"],
  },
  // Schreiner / Innenausbau / Sanitär: Handwerk, Wärme, Präzision
  werk: {
    vars: {
      bg: "248 244 238", surface: "255 252 248", ink: "40 31 24", muted: "112 96 82", line: "230 220 206",
      accent: "176 120 52", "accent-ink": "255 255 255", dark: "45 36 29", "dark-ink": "248 240 230",
      "font-display": font.condensed, "font-body": font.sans, radius: "0.25rem",
    },
    hero: "banner", services: "tiles", displayCase: "upper",
    palette: ["#b07834", "#5b4636", "#d8c3a5", "#2d241d", "#8a9a8c"],
  },
  // Sanitär / Heizung: frisch, sauber, technisch-vertrauensvoll
  aqua: {
    vars: {
      bg: "246 250 251", surface: "255 255 255", ink: "14 37 46", muted: "79 103 112", line: "218 230 233",
      accent: "8 131 149", "accent-ink": "255 255 255", dark: "10 46 58", "dark-ink": "232 244 246",
      "font-display": font.sans, "font-body": font.sans, radius: "1rem",
    },
    hero: "split", services: "cards", displayCase: "normal",
    palette: ["#0a2e3a", "#f59e0b", "#e6f2f4", "#7fc4cf", "#088395"],
  },
  // Pferdehof / Bauernhof / Hofladen: naturnah, bodenständig, warm
  hof: {
    vars: {
      bg: "248 245 236", surface: "255 253 247", ink: "44 36 27", muted: "110 98 82", line: "228 220 202",
      accent: "158 58 38", "accent-ink": "255 255 255", dark: "52 61 38", "dark-ink": "246 242 228",
      "font-display": font.serif, "font-body": font.sans, radius: "0.75rem",
    },
    hero: "organic", services: "tiles", displayCase: "normal",
    palette: ["#9e3a26", "#8fae5a", "#b9c98a", "#efe4cc", "#3d2b1f"],
  },
};

export function themeStyle(theme: Theme): CSSProperties {
  return Object.fromEntries(Object.entries(theme.vars).map(([k, val]) => [`--${k}`, val])) as CSSProperties;
}
