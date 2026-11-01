# K.M.N Küchenmontage – Website (Einzeldatei)

Eigenständige HTML-Datei mit eingebettetem CSS, JS (GSAP 3 + ScrollTrigger), Schrift und Fotos.
Keine Anfragen ins Netz zur Laufzeit, `noindex`.

## Befehle
```bash
npm install                                  # @fontsource-variable/archivo
node scripts/fotos.mjs <ordner-mit-originalen>  # Screenshots zuschneiden → fotos/*.webp
node scripts/build.mjs [ziel.html]           # → dist/kmn-neu.html (+ optional Kopie)
node tests/check.cjs [html] [shots-ordner]   # Playwright: Konsole, Überlauf, axe, Tastatur, Animation
```
`sharp`, `gsap` und `axe-core` werden aus dem lokalen `node_modules` oder aus dem Hauptrepo geladen.

## Dateien
- `src/index.html` – Vorlage mit Platzhaltern (`{{img:…}}`, `{{svg:hero}}` …)
- `src/styles.css`, `src/app.js` – Gestaltung, Animation, Formular, Hash-Routen `#impressum`/`#datenschutz`
- `src/kitchen.mjs` – erzeugt die isometrischen SVG-Zeichnungen und Plattenmuster
- `fotos/` – zugeschnittene echte Fotos (MyHammer-Screenshots ohne Rand und Pfeile)
- `docs/DESIGN.md` – Gestaltungsrichtung

## Offen
- Impressum und Datenschutz: Vorlagentext der alten Seite mit markierten Platzhaltern „[… – vor Veröffentlichung ergänzen]“, Entwurf, noch nicht rechtlich geprüft.
- Formularversand: in der Vorschau wird nichts gesendet.
