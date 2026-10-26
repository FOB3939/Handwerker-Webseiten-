// Zentrale Inhalte und Einstellungen. Alle Fakten stammen aus der Sichtung der bisherigen Website
// (silver-stage.de) laut Projektbrief und müssen vor dem Livegang mit dem Betreiber bestätigt werden.
// Offene Punkte stehen zusätzlich in docs/OFFENE-PUNKTE.md.

export const SITE = {
  name: "SILVER STAGE",
  legalName: "Silver-Stage",            // TODO Betreiber: exakte Firmierung fürs Impressum
  district: "München-Sendling",
  claim: "Dein Sound. Dein Raum.",
  // Produktionsdomain noch nicht bestätigt → Canonicals/Sitemap nutzen SITE_URL aus der Umgebung
  url: (import.meta.env.SITE_URL as string | undefined) ?? "https://www.silver-stage.de",
  preview: (import.meta.env.PUBLIC_PREVIEW ?? "true") !== "false", // Vorschau: noindex + robots Disallow
  formEndpoint: (import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined) || "", // leer = Formular nicht angeschlossen
};

export const CONTACT = {
  street: "Flößergasse 8",
  zip: "81369",
  city: "München",
  // Achtung: ein Münchner Branchenverzeichnis nennt 089 45213955 – Nummer mit dem Betreiber klären
  phone: "089 / 23548214",
  phoneHref: "tel:+498923548214",
  email: "info@silver-stage.de",
  // Alte Website: täglich 10–22 Uhr, „Abweichungen möglich“. Verzeichnis: Mo–Fr 10–20 Uhr.
  // Erst nach Bestätigung als verbindlich veröffentlichen → bis dahin nur als Hinweis.
  hoursConfirmed: false,
  hoursNote: "Termine nach Vereinbarung – frag einfach an.",
  routeUrl: "https://www.google.com/maps/dir/?api=1&destination=Fl%C3%B6%C3%9Fergasse%208%2C%2081369%20M%C3%BCnchen",
};

export type RoomKey = "tonstudio" | "stageroom" | "lightroom";

export interface Room {
  key: RoomKey;
  name: string;
  path: string;
  kicker: string;
  title: string;          // H1 der Detailseite
  lead: string;
  short: string;          // Kartentext
  area?: string;          // nur wenn belegt
  facts: string[];        // belegte Ausstattung
  uses: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  visual: "studio" | "stage" | "light";
  seoTitle: string;
  seoDescription: string;
}

export const ROOMS: Room[] = [
  {
    key: "tonstudio",
    name: "Tonstudio",
    path: "/tonstudio/",
    kicker: "Aufnehmen",
    title: "Tonstudio in München-Sendling",
    lead: "Musik, Gesang und Sprache – aufgenommen in einem akustisch optimierten Raum, mit analoger und digitaler Technik.",
    short: "Musik-, Gesangs- und Sprachaufnahmen mit analoger und digitaler Technik.",
    facts: [
      "ORAM T-Series, 32-Kanal-Analogpult",
      "Neumann TLM 49 und Shure SM7B",
      "BAE Audio 1073 (Stereo)",
      "Tube-Tech CL 2A",
      "API Audio 2500",
      "Cubase, Logic und Reaper",
    ],
    uses: [
      { title: "Musikaufnahmen", text: "Für Bands, Solo-Projekte und einzelne Spuren." },
      { title: "Gesang", text: "Vocals aufnehmen – vom ersten Take bis zur fertigen Spur." },
      { title: "Sprache", text: "Sprachaufnahmen für Hörspiel, Podcast oder Werbung." },
    ],
    faq: [
      { q: "Was kostet eine Aufnahme?", a: "Die Preise werden projektbezogen kalkuliert. Beschreib kurz dein Vorhaben – du bekommst ein individuelles Angebot." },
      { q: "Ist jemand für die Technik da?", a: "Laut bisheriger Studio-Website begleitet dich ein Tontechniker bei der Aufnahme. Die Details stimmen wir bei deiner Anfrage ab." },
      { q: "Mit welcher Software wird gearbeitet?", a: "Im Studio stehen Cubase, Logic und Reaper zur Verfügung." },
    ],
    visual: "studio",
    seoTitle: "Tonstudio München-Sendling – Musik, Gesang & Sprache aufnehmen | Silver Stage",
    seoDescription: "Akustisch optimiertes Tonstudio in München-Sendling: Musik-, Gesangs- und Sprachaufnahmen mit ORAM-Analogpult, Neumann TLM 49 und analoger wie digitaler Technik. Jetzt anfragen.",
  },
  {
    key: "stageroom",
    name: "Stageroom",
    path: "/stageroom/",
    kicker: "Proben",
    title: "Stageroom: Proberaum mit Bühne",
    lead: "80 m² mit Bühne, Lichtanlage, Konzertanlage und Monitoring – für Bandproben, Showproben und Live-Sessions.",
    short: "80 m² mit Bühne, Licht, Konzertanlage und Monitoring. Live-Aufnahme möglich.",
    area: "80 m²",
    facts: [
      "80 m² Fläche",
      "Bühne mit Lichtanlage",
      "Konzertanlage und Monitoring",
      "Mischpult MIDAS Venice F-32",
      "Beamer und Leinwand",
      "Live-Aufnahme möglich",
    ],
    uses: [
      { title: "Bandprobe", text: "Proben wie auf der echten Bühne – mit Licht und Monitoring." },
      { title: "Live-Session", text: "Den Auftritt mitschneiden: Live-Aufnahme ist möglich." },
      { title: "Showprobe", text: "Abläufe, Licht und Präsentation vor dem Gig durchspielen." },
    ],
    faq: [
      { q: "Wie groß ist der Stageroom?", a: "Der Raum hat 80 m² und eine Bühne mit Licht- und Konzertanlage." },
      { q: "Kann die Probe aufgenommen werden?", a: "Ja, eine Live-Aufnahme ist laut bisheriger Studio-Website möglich. Sag in der Anfrage Bescheid, was du brauchst." },
      { q: "Was kostet der Raum?", a: "Preise gibt es auf Anfrage – abhängig von Dauer und Bedarf." },
    ],
    visual: "stage",
    seoTitle: "Proberaum mit Bühne in München – Stageroom 80 m² | Silver Stage",
    seoDescription: "Proberaum mit Bühne in München-Sendling: 80 m², Lichtanlage, Konzertanlage, Monitoring, MIDAS Venice F-32, Beamer und Live-Aufnahme. Jetzt Probe anfragen.",
  },
  {
    key: "lightroom",
    name: "Lightroom",
    path: "/lightroom/",
    kicker: "Gestalten",
    title: "Lightroom: Raum für Tanz, Gesang & Fotoshootings",
    lead: "55 m² mit farbiger Lichtanlage, hängender PA und Spiegelwand – für Tanzgruppen, Gesangsunterricht und Fotoshootings.",
    short: "55 m² mit farbigem Licht, hängender PA und Spiegelwand.",
    area: "55 m²",
    facts: [
      "55 m² Fläche",
      "Farbige Lichtanlage",
      "Hängende PA",
      "Spiegelwand",
      "Equipment auf Anfrage stellbar und lagerbar",
    ],
    uses: [
      { title: "Tanz", text: "Training und Choreografie vor der Spiegelwand." },
      { title: "Gesangsunterricht", text: "Unterricht mit PA – laut und klar." },
      { title: "Fotoshooting", text: "Farbiges Licht als Kulisse für Porträts und Musikerfotos." },
    ],
    faq: [
      { q: "Für wen eignet sich der Lightroom?", a: "Für Tanzgruppen, Gesangsunterricht und Fotoshootings." },
      { q: "Kann ich eigenes Equipment lagern?", a: "Laut bisheriger Studio-Website kann Equipment auf Anfrage gestellt und gelagert werden. Kläre die Details in deiner Anfrage." },
      { q: "Was kostet der Raum?", a: "Preise gibt es auf Anfrage – abhängig von Dauer und Nutzung." },
    ],
    visual: "light",
    seoTitle: "Tanzraum & Raum für Fotoshootings in München – Lightroom | Silver Stage",
    seoDescription: "Lightroom in München-Sendling: 55 m² mit farbiger Lichtanlage, hängender PA und Spiegelwand – für Tanzgruppen, Gesangsunterricht und Fotoshootings.",
  },
];

export const roomByKey = (k: RoomKey) => ROOMS.find((r) => r.key === k)!;

export const NAV = [
  { label: "Tonstudio", href: "/tonstudio/" },
  { label: "Räume", href: "/stageroom/", children: [
    { label: "Stageroom", href: "/stageroom/", note: "Proberaum mit Bühne · 80 m²" },
    { label: "Lightroom", href: "/lightroom/", note: "Tanz, Gesang & Foto · 55 m²" },
  ] },
  { label: "Beat Stage", href: "/beat-stage/" },
  { label: "Über uns", href: "/ueber-uns/" },
  { label: "Kontakt", href: "/kontakt/" },
];

// Intro-Einstellungen (siehe README → Intro)
export const INTRO = { durationMs: 3000, storageKey: "ss-intro-seen" };
