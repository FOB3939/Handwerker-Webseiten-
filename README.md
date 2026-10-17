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
