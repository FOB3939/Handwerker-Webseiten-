# K.M.N Küchenmontage – Website (Einzeldatei)

Eigenständige HTML-Datei mit eingebettetem CSS, JS (GSAP 3 + ScrollTrigger, Three.js per esbuild gebündelt), Schrift und Fotos.
Keine Anfragen ins Netz zur Laufzeit, `noindex`.

## Befehle
```bash
npm install                                  # Schrift, three, gsap, esbuild
node scripts/fotos.mjs <originale> [symbolbilder]  # zuschneiden → fotos/*.webp, fotos/symbol/*.webp
node scripts/build.mjs [ziel.html]           # → dist/kmn-neu.html (+ optional Kopie)
node tests/check.cjs [html] [shots-ordner]   # Playwright: Konsole, Überlauf, axe, Tastatur, Animation
```
`sharp` und `axe-core` kommen aus dem lokalen `node_modules` oder aus dem Hauptrepo. Die Tests starten Chromium mit SwiftShader, damit WebGL headless läuft.

## Dateien
- `src/index.html` – Vorlage mit Platzhaltern (`{{img:…}}`, `{{svg:hero}}` …)
- `src/styles.css`, `src/app.js` – Gestaltung, Animation, Formular, Hash-Routen `#impressum`/`#datenschutz`
- `src/hero3d.js` – 3D-Scroll-Szene (Three.js)
- `src/kitchen.mjs` – isometrische SVG-Zeichnungen (Fallback-Standbild, Piktogramme) und Plattenmuster
- `fotos/` – zugeschnittene echte Fotos (MyHammer-Screenshots ohne Rand und Pfeile)
- `docs/DESIGN.md` – Gestaltungsrichtung

## Offen
- Impressum und Datenschutz: Vorlagentext der alten Seite mit markierten Platzhaltern „[… – vor Veröffentlichung ergänzen]“, Entwurf, noch nicht rechtlich geprüft.
- Formularversand: in der Vorschau wird nichts gesendet.
