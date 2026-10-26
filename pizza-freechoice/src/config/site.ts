// Zentrale Geschäftsdaten von Pizza Freechoice.
// WICHTIG: Bisher ist nur belegt: der Name „Pizza Freechoice“ / „Free Choice“, gelbe Ladenbeschilderung,
// Bezeichnung „Pizza Heimservice“ (Quelle: Fotos des Ladens). Alles andere ist offen → `null`.
// Offene Punkte: docs/OFFENE-PUNKTE.md. Vor dem Livegang: `npm run prod-check`.

export const SITE = {
  name: "Pizza Freechoice",
  /** Vorschau: noindex, Entwurfshinweis, Demo-Speisekarte sichtbar. Live nur mit PUBLIC_PREVIEW=false. */
  preview: (import.meta.env.PUBLIC_PREVIEW ?? "true") !== "false",
  locale: "de-DE",
};

export interface Hours { day: string; time: string }
export const BUSINESS = {
  name: "Pizza Freechoice",
  legalName: null as string | null,   // Firmierung / Betreiber fürs Impressum
  street: null as string | null,
  zip: null as string | null,
  city: null as string | null,
  phone: null as string | null,       // Anzeige, z. B. "0365 123456"
  phoneHref: null as string | null,   // z. B. "tel:+49365123456"
  email: null as string | null,
  hours: null as Hours[] | null,      // erst nach Bestätigung
  routeUrl: null as string | null,
};

/** Bestellweg. Standard: externer Anbieter mit bestätigter URL. Ohne URL zeigt die Seite keinen Bestellknopf. */
export const ORDER = {
  url: null as string | null,          // bestätigte Bestell-URL (z. B. Lieferando-Seite oder eigener Shop)
  provider: null as string | null,     // Anzeigename des Anbieters
};

/** Liefer- und Abholbedingungen – nur bestätigte Werte, sonst null. Beträge in Cent. */
export const DELIVERY = {
  delivery: null as boolean | null,    // „Heimservice“ steht auf dem Ladenschild, Bedingungen offen
  pickup: null as boolean | null,
  area: null as string | null,
  feeCents: null as number | null,
  minOrderCents: null as number | null,
  payment: null as string[] | null,
};

export const NAV = [
  { label: "Speisekarte", href: "/speisekarte/" },
  { label: "Lieferung & Abholung", href: "/lieferung-abholung/" },
  { label: "Über uns", href: "/ueber-uns/" },
  { label: "Kontakt", href: "/kontakt/" },
];

export const euro = (cents: number) => (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
export const address = () => (BUSINESS.street && BUSINESS.zip && BUSINESS.city ? `${BUSINESS.street}, ${BUSINESS.zip} ${BUSINESS.city}` : null);
export const OPEN = "Angabe folgt"; // Anzeige für noch nicht bestätigte Daten
