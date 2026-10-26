// Speisekarte. Datenmodell nach Masterprompt §7. Preise in Cent.
// Es liegt KEINE bestätigte Speisekarte vor. Die Einträge mit `demo: true` sind ausdrücklich Demo-Daten für die
// private Vorschau (Name, Beschreibung und Preise erfunden, als Demo gekennzeichnet). Im Live-Build werden
// Demo-Einträge nicht ausgegeben, und `npm run prod-check` bricht ab, solange keine echten Einträge vorhanden sind.
import type { ImageKey } from "../assets/img";

export interface Variant { id: string; label: string; sizeCm?: number; priceCents: number }
export interface Extra { id: string; label: string; priceCents: number; permittedProductIds: string[] }
export interface Product {
  id: string; slug: string; name: string; description: string; category: string;
  image?: ImageKey; imageStatus: "keins" | "illustrativ" | "freigegeben";
  variants: Variant[]; extras: string[];
  allergens: string[] | null; additives: string[] | null;   // null = nicht bestätigt (≠ allergenfrei)
  availability: "verfügbar" | "nicht verfügbar" | "unbestätigt";
  verifiedAt: string | null; demo: boolean;
}

export const CATEGORIES = [
  { id: "pizza", label: "Pizza", note: "Auf dem Ladenschild belegt: „Pizza Heimservice“." },
];

const DEMO = { allergens: null, additives: null, availability: "unbestätigt" as const, verifiedAt: null, demo: true, extras: [] };
export const PRODUCTS: Product[] = [
  { ...DEMO, id: "demo-1", slug: "demo-gemischt", name: "Gemischte Pizza", category: "pizza", image: "pizzaDraufsicht", imageStatus: "illustrativ",
    description: "Beispiel wie auf dem Foto: Tomatensauce, Käse, Salami, Champignons, Paprika, Peperoni, Oliven.",
    variants: [{ id: "m", label: "Mittel", priceCents: 1050 }, { id: "l", label: "Groß", priceCents: 1350 }] },
  { ...DEMO, id: "demo-2", slug: "demo-margherita", name: "Margherita", category: "pizza", imageStatus: "keins",
    description: "Beispieleintrag: Tomatensauce und Käse.",
    variants: [{ id: "m", label: "Mittel", priceCents: 750 }, { id: "l", label: "Groß", priceCents: 990 }] },
  { ...DEMO, id: "demo-3", slug: "demo-salami", name: "Salami", category: "pizza", imageStatus: "keins",
    description: "Beispieleintrag: Tomatensauce, Käse und Salami.",
    variants: [{ id: "m", label: "Mittel", priceCents: 850 }, { id: "l", label: "Groß", priceCents: 1090 }] },
  { ...DEMO, id: "demo-4", slug: "demo-funghi", name: "Funghi", category: "pizza", imageStatus: "keins",
    description: "Beispieleintrag: Tomatensauce, Käse und Champignons.",
    variants: [{ id: "m", label: "Mittel", priceCents: 850 }, { id: "l", label: "Groß", priceCents: 1090 }] },
];

export const EXTRAS: Extra[] = [];

/** Einträge, die im aktuellen Build gezeigt werden dürfen (Live: nur bestätigte, keine Demo-Daten). */
export const visibleProducts = (preview: boolean) => PRODUCTS.filter((p) => (preview ? true : !p.demo && p.verifiedAt));
/** Kleinster Preis eines Produkts – nie 0 € als scheinbar kostenloses Angebot */
export const fromPrice = (p: Product) => Math.min(...p.variants.map((v) => v.priceCents).filter((c) => c > 0));
