# Silver Stage – Website

Mehrseitige, statisch vorgerenderte Website für SILVER STAGE (Tonstudio, Stageroom, Lightroom) in München-Sendling.
Stack: **Astro 5 + TypeScript**, keine Laufzeit-Frameworks. Schriften (Jost, Inter – SIL Open Font License) werden lokal ausgeliefert.

> Status: **private Vorschau**. Vor dem Livegang siehe [docs/OFFENE-PUNKTE.md](docs/OFFENE-PUNKTE.md).

## Schnellstart

```bash
npm install
npm run dev        # Entwicklung: http://localhost:4321
npm run build      # statischer Build nach dist/
npm run preview    # Build lokal ansehen
npm test           # Logiktests (Spiel, Formularprüfung, Formular-Backend)
npm run check      # Typprüfung
```

Browser-Prüfungen (benötigen Playwright und einen laufenden Build auf Port 4321):
`node tests/qa-pages.cjs` (alle Seiten × 5 Breiten, axe, Links), `node tests/qa-interaction.cjs` (Menü, Formular),
`node tests/browser-play.mjs` (Beat Stage automatisch durchspielen).

## Seiten

| URL | Inhalt |
|---|---|
| `/` | Start: Intro (Erstbesuch), Einstieg, drei Zugänge, Räume, Bilderstrecke, Technik, Ablauf, Beat-Stage-Teaser, Standort, Kontakt |
| `/tonstudio/` `/stageroom/` `/lightroom/` | Raum-Detailseiten (gemeinsame Vorlage `src/components/RoomPage.astro`) |
| `/ueber-uns/` | nur belegte Inhalte; Teamabschnitt wartet auf Freigabe |
| `/kontakt/` | Anfrageformular, `?raum=stageroom` wählt den Raum vor |
| `/beat-stage/` | Rhythmusspiel |
| `/impressum/` `/datenschutz/` | Gliederung mit markierten Platzhaltern (noindex) |

## Inhalte ändern

Alle Texte, Kontaktdaten, Räume, FAQ und Navigation stehen zentral in **`src/config/site.ts`**.
Telefonnummer, Zeiten, Ausstattung → dort ändern und neu bauen.

**Fotos einsetzen:** `src/components/Visual.astro` nimmt `src` + `alt`. Freigegebene Fotos nach `public/fotos/` legen und
z. B. `<Visual kind="studio" src="/fotos/tonstudio.jpg" alt="…" eager />` verwenden – dann entfällt der Platzhalter-Hinweis.
Medienstatus: [docs/MEDIEN.md](docs/MEDIEN.md).

## Umgebung

Siehe `.env.example`:

| Variable | Bedeutung |
|---|---|
| `SITE_URL` | Produktionsdomain für Canonicals, Sitemap, Social-Vorschau (noch zu bestätigen) |
| `BASE_PATH` | nur bei Unterverzeichnis, z. B. `/silver-stage/` |
| `PUBLIC_PREVIEW` | `true` = Vorschau (noindex, robots „Disallow“), `false` = Produktion |
| `PUBLIC_FORM_ENDPOINT` | Adresse des Formular-Backends; leer = Formular öffnet das E-Mail-Programm |

## Hosting

Reines statisches Hosting reicht (z. B. Webspace, Netlify, Cloudflare Pages). Inhalt von `dist/` hochladen.
- Die Weiterleitungen alter URLs (`/clients`, `/räume`, `/bühnenraum`) erzeugt Astro als HTML-Seiten; auf dem Server besser echte 301 einrichten – siehe [docs/WEITERLEITUNGEN.md](docs/WEITERLEITUNGEN.md).
- Formular: separates Backend nötig, Vorlage in [form-backend/](form-backend/README.md).

## Einstellungen

| Was | Wo | Standard |
|---|---|---|
| Intro-Dauer, Speicher-Schlüssel | `src/config/site.ts` → `INTRO` | 3000 ms, `sessionStorage` „ss-intro-seen“ |
| Intro-Ablauf (Phasen) | `src/components/Intro.astro` (CSS-Keyframes) | Punkt 0–0,6 s · Wellen 0,6–1,6 s · Wortmarke 1,5–2,3 s · Übergang 2,3–3 s |
| Spiel-Tempo, Rundenlänge, Trefferfenster, Punkte | `src/game/engine.js` → `SETTINGS` | 100 BPM, 30 s, Perfekt ±80 ms, Gut ±150 ms |
| Groove/Notenfolge | `src/game/engine.js` → `BARS`, `ARRANGEMENT` | fest, keine Zufallsfolgen |
| Lautstärke-Standard | `src/game/ui.js` (`beatstage-volume`) | 70 % |
| Logo-Geometrie | `scripts/build-logo.mjs` → `npm run logo` | erzeugt `public/brand/*.svg` und `src/assets/brand.ts` |
| Favicon-PNG, Social-Bild | `node scripts/render-icons.cjs` | `public/favicon-32.png`, `apple-touch-icon.png`, `og.png` |

## Logo

`public/brand/`: `logo-horizontal-{light,dark}.svg` (Header), `logo-stacked-{light,dark}.svg` (große Flächen),
`signet-{light,dark}.svg`, `favicon.svg` (reduziert auf zwei Wellen je Gruppe für kleine Größen).
Echte Vektoren, Wortmarke als Pfade (Jost Medium, OFL). **Entwurf – Freigabe durch den Betreiber nötig.**

## Barrierearmut & Datenschutz (technisch)

- Semantische Struktur, eine H1 je Seite, Skip-Link, sichtbare Fokuszustände, Tastaturbedienung für Menü, Untermenü, Formular, Spiel.
- `prefers-reduced-motion`: kein Intro, keine Einblend- und Lichtanimationen.
- Keine Cookies, keine Analyse, keine externen Schriften oder Karten. Gespeichert wird nur lokal im Browser: Intro-gesehen (Sitzung), Bestwert und Lautstärke des Spiels.
