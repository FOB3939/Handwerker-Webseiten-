// Firmendaten FOB Haustechnik Hausmeisterservice.
// Quelle: Firmenschild (Entwurf) und Instagram @fob.haustechnik, bereitgestellt vom Inhaber am 26.10.2026.
// Unbestätigt/fehlend = null → wird ausgeblendet bzw. als „Angabe folgt“ gezeigt. Offene Punkte: docs/OFFENE-PUNKTE.md

export const SITE = {
  name: "FOB Haustechnik",
  preview: (import.meta.env.PUBLIC_PREVIEW ?? "true") !== "false",
};

export const COMPANY = {
  name: "FOB Haustechnik Hausmeisterservice",
  short: "FOB Haustechnik",
  slogan: "Alles rund ums Haus – schnell, sauber, zuverlässig",
  legalName: null as string | null, // Inhaber/Rechtsform fürs Impressum
  street: "Weßlingerstr. 26c",
  zip: "82234",
  city: "Hochstadt",
  email: "info@fobhausmeisterservice.de",
  phone: null as string | null,
  phoneHref: null as string | null,
  instagram: "https://www.instagram.com/fob.haustechnik/",
  region: "rund um München",           // laut Instagram-Profil „München“ – Einsatzgebiet bestätigen
  routeUrl: "https://www.google.com/maps/dir/?api=1&destination=We%C3%9Flingerstr.%2026c%2C%2082234%20Hochstadt",
};

export const NAV = [
  { label: "Leistungen", href: "/leistungen/" },
  { label: "Wärmepumpe", href: "/waermepumpe/" },
  { label: "Referenzen", href: "/referenzen/" },
  { label: "Kontakt", href: "/kontakt/" },
];

// Leistungen laut Firmenschild (+ „und mehr“: Böden und Terrassen aus den Referenzfotos)
export const SERVICES = [
  { key: "sanitaer", title: "Sanitär & Heizung", text: "WC, Waschtisch, Armaturen und Anschlüsse – montiert, dicht und sauber hinterlassen. Dazu Arbeiten an Heizung und Leitungen.", image: "wcWand" },
  { key: "elektro", title: "Elektrotechnik", text: "Steckdosen, Schalter, Leuchten und kleinere Elektroarbeiten rund ums Haus.", image: null },
  { key: "maler", title: "Malerarbeiten", text: "Wände, Decken und Spachteltechniken innen – Fassaden gemeinsam mit unserem Partner-Malermeister.", image: "wandNachher" },
  { key: "reinigung", title: "Gebäudereinigung", text: "Treppenhäuser, Gemeinschaftsflächen und Reinigung nach Handwerksarbeiten.", image: null },
  { key: "boden", title: "Böden & Terrassen", text: "Vinyl- und Laminatböden verlegen, Holzterrassen neu aufbauen.", image: "terrasse" },
  { key: "hausmeister", title: "Hausmeisterservice", text: "Ein Ansprechpartner für die laufenden Aufgaben am Haus – von der Kontrolle bis zur Reparatur.", image: null },
] as const;

// Förderung – Stand der Recherche Oktober 2026, OHNE Gewähr; vor Veröffentlichung auf kfw.de prüfen.
export const FUNDING = {
  asOf: "Oktober 2026",
  program: "KfW 458 – Heizungsförderung für Privatpersonen (BEG EM)",
  base: "30 %",
  url: "https://www.kfw.de/458",
};
