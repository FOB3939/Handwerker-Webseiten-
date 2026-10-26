# Pizza Freechoice – Website (private Vorschau)

Mehrseitige, statische Website für den Pizza-Heimservice „Pizza Freechoice“. Astro 5, TypeScript, kein Framework im
Browser, lokal geladene Schriften (Bricolage Grotesque, Figtree). Grundlage: `docs/MASTERPROMPT.md`, `docs/BILDPLAN.md`.

**Stand:** Vorschau mit klar gekennzeichneten Demo-Inhalten. Geschäftsdaten (Adresse, Telefon, Öffnungszeiten,
Speisekarte, Preise, Liefer­bedingungen, Bestell-URL) sind **noch nicht bestätigt** → `docs/OFFENE-PUNKTE.md`.

## Start
```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # Vorschau-Build nach dist/ (noindex, Entwurfshinweis, Demo-Speisekarte)
npm run check        # Typprüfung
npm run prod-check   # Live-Build (PUBLIC_PREVIEW=false) – bricht ab, solange Pflichtdaten fehlen
```
Tests (Server auf :4340 mit `python3 -m http.server 4340 -d dist`):
```bash
node tests/qa-pages.cjs        # 10 Seiten × 5 Breiten: Überlauf, axe WCAG 2.2 AA, h1, Meta, Tippflächen, Links
node tests/qa-interaction.cjs  # Intro, Suche, mobiles Menü, Bestell-Leiste, kein Fake-Checkout
```

## Seiten
`/` · `/speisekarte/` · `/bestellen/` · `/lieferung-abholung/` · `/ueber-uns/` · `/kontakt/` ·
`/allergene-zusatzstoffe/` · `/impressum/` · `/datenschutz/` · `404`

## Inhalte ändern
- **Geschäftsdaten, Bestellweg, Lieferung:** `src/config/site.ts` (`BUSINESS`, `ORDER`, `DELIVERY`). Unbestätigt = `null`
  → die Seite zeigt „Angabe folgt“ bzw. blendet Knöpfe (Telefon, Bestellanbieter) aus.
- **Speisekarte:** `src/config/menu.ts`. Preise in Cent, Varianten/Extras getrennt, `allergens: null` = nicht bestätigt.
  Demo-Einträge (`demo: true`) erscheinen nur in der Vorschau; echte Einträge brauchen `verifiedAt`.
- **Bilder:** `src/assets/img` (JPEG-Arbeitsfassungen der PNG-Master aus dem Paket; Ausgabe als WebP in passenden
  Breiten). Zuordnung und Freigabestatus: `src/assets/img/index.ts`, `docs/BILDPLAN.md`.

## Bestellen
Standard laut Auftrag: **externer Bestellanbieter** (Modus A). Sobald die bestätigte URL in `ORDER.url` steht, zeigt
`/bestellen/` den Wechsel zum Anbieter (neuer Tab, klar beschriftet). Ohne URL: kein Bestellknopf, kein Warenkorb, keine
vorgetäuschte Bestätigung. Ein eigener Checkout (Modus B) ist **nicht** gebaut – dafür fehlen Backend, Zahlungsanbieter
und Geschäftsregeln.

## Deployment
Statisches Hosting (beliebiger Webspace). Live-Build: `SITE_URL=https://… PUBLIC_PREVIEW=false npm run build` –
gelingt erst, wenn `npm run prod-check` keine offenen Punkte mehr meldet. Inhalt von `dist/` hochladen.
Vorschau-Builds sind per `<meta name="robots">` und `robots.txt` gesperrt.

## Intro
~3 s, einmal pro Sitzung (`sessionStorage`), „Überspringen“/Escape/Scrollen beendet es, bei reduzierter Bewegung
entfällt es. Liegt über der bereits geladenen Seite. Erneut ansehen: Adresse mit `#intro` öffnen.
