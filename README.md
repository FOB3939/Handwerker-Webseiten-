# Handwerker-Webseiten – tägliche Lead-Demos

Interne Next.js-App (TypeScript, Tailwind CSS) mit unverbindlichen Website-Entwürfen für Handwerksbetriebe
im Raum München / Starnberg / Fürstenfeldbruck.

- `/daily/YYYY-MM-DD` – internes Lead-Dashboard eines Tageslaufs
- `/demo/[slug]` – Website-Entwurf je Betrieb
- `data/leads/YYYY-MM-DD/firma-N.json` – Recherche, Verkaufsstrategie und sämtliche Seitentexte eines Leads
- `data/lead-history.json` – dauerhafte Historie (inkl. verworfener Betriebe) zur Dublettenvermeidung

Alle Seiten sind per `<meta name="robots">`, `X-Robots-Tag`-Header und `robots.txt` auf **noindex, nofollow** gesetzt
und tragen den Hinweis „Unverbindlicher Website-Entwurf – nicht die offizielle Website des Unternehmens.“

Bilder sind selbst gezeichnete SVG-Platzhalter; jede Galerie-Kachel nennt das echte Foto, das später benötigt wird.

## Neuer Tageslauf

1. Neue Leads gegen `data/lead-history.json` prüfen (Name, Telefon, MyHammer-URL).
2. `data/leads/<datum>/firma-1.json … firma-5.json` anlegen (Schema: `lib/types.ts`, Design über `site.theme`:
   `atelier`, `objekt`, `stein`, `garten`, `volt`, `werk`, `aqua`; optional `site.motif`).
3. Historie ergänzen, dann `npm run typecheck && npm run lint && npm run build`.

## Befehle

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

## Eigenständige Vorschau-Dateien

`npm run build && npm run export:previews` erzeugt unter `previews/YYYY-MM-DD/` je Entwurf eine HTML-Datei mit
eingebettetem CSS (plus `index.html` als Dashboard), die ohne Server im Browser geöffnet werden kann.

## Private Artifact-Links für Kunden

`npm run build && npm run export:artifacts -- <zielordner> YYYY-MM-DD` erzeugt je Entwurf eine Seite im
Artifact-Format (ohne JS-Bundle, Formular zeigt nur einen Entwurfs-Hinweis). Diese werden als private
Claude-Artifacts veröffentlicht und über das Share-Menü gezielt an den jeweiligen Betrieb freigegeben.

| Datum | Betrieb | Artifact |
|---|---|---|
| 2026-10-17 | Andreas Salamon Heizung, Sanitär, Haustechnik | https://claude.ai/artifact/9BogW54JVXkzp4xB5epKt9 |
| 2026-10-17 | Gavai Maler Trockenbau | https://claude.ai/artifact/Eb1mm9QaHHaBtKxyU1ppaE |
| 2026-10-17 | Patrick Faulhaber Küchen- & Möbelmontagen | https://claude.ai/artifact/QBXGRSms9pW8xq6zUtZnuU |
| 2026-10-17 | Agata Mangani | https://claude.ai/artifact/3rG55VCSPXjwJhVtp23NuM |
| 2026-10-17 | Paul-Ovidiu Asmarandi Garten- und Landschaftsbau | https://claude.ai/artifact/B77jY13wyBbs5CJSdmmMFH |

## Design-Standard der Entwürfe

Aufbau orientiert an führenden Handwerker-Websites: Kontaktleiste mit Bewertung/Telefon/E-Mail, Header mit
Anfrage-Button, Hero mit lokalem Keyword-H1 und Bewertungs-Badge, mehrstufige Schnellanfrage
(„Angebot in 60 Sekunden“), Qualitätsmerkmale, Leistungen mit Bild, Inhaber-/Über-uns-Bereich, Kennzahlen-Band,
Vorher/Nachher-Regler, Bewertungs-Zusammenfassung, Ablauf, CTA-Band, Karte des Einsatzgebiets, FAQ, Kontaktkarten +
Formular, Footer und mobile Sticky-Leiste. Interaktive Teile laufen über ein kleines Inline-Skript
(`components/Enhance.tsx`) und funktionieren daher auch in den Exporten.
