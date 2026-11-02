# Kinderarztpraxis Dr. med. Maru Bohdansky, Grünwald – Website-Entwurf (Einzeldatei)

Unverbindlicher Entwurf, private Vorschau (`noindex`, Entwurfshinweis). Eine eigenständige HTML-Datei mit eingebettetem CSS,
JS (GSAP 3 + ScrollTrigger, Three.js per esbuild gebündelt), zwei Schriften und Fotos. Keine Anfragen ins Netz zur Laufzeit.

## Befehle
```bash
npm install                                  # Schriften, three, gsap, esbuild
node scripts/fotos.mjs <ordner-mit-originalen>   # zuschneiden → fotos/*.webp; Fahrt-Fassungen, Vordergrund-Ebenen → fotos/hero/
node scripts/build.mjs [ziel.html]           # → dist/kinderarzt-gruenwald.html (+ optional Kopie)
node tests/check.cjs [html] [shots-ordner]   # Playwright: Konsole/Netz, Überlauf, Tippflächen, axe, Tastatur, 3D, Fallbacks
```
`sharp`, `playwright` und `axe-core` kommen aus dem Hauptrepo. Die Tests starten Chromium mit SwiftShader, damit WebGL headless läuft,
ein zweites Chromium mit abgeschaltetem WebGL für die CSS-Variante und ein Standard-Chromium für Ganzseiten-Screenshots.

## Dateien
- `src/index.html` – Vorlage mit Platzhaltern (`{{img:…}}`, `{{svg:…}}`, `{{icon:…}}`)
- `src/styles.css`, `src/app.js` – Gestaltung, Menü, Hash-Routen `#impressum`/`#datenschutz`, Masken-Reveals, Rundgang, Tilt
- `src/hero3d.js` – Kamerafahrt durch die Praxisfotos (Three.js-Shader + ScrollTrigger)
- `src/art.mjs` – Sonnen-Signet (eigene Nachzeichnung), Piktogramme
- `fotos/` – zugeschnittene echte Fotos (Google-Maps- und Website-Screenshots ohne Statusleiste, Kopfzeile und Knöpfe)
- `fotos/hero/` – hochskalierte Fassungen für die Fahrt, von Hand maskierte Vordergrund-Ebenen, `layers.json`
- `docs/DESIGN.md` – Gestaltungsrichtung und 3D-Ablauf

## Offen vor einer Veröffentlichung
- Anschrift und Telefon stammen aus dem Münchner Branchenbuch: bitte prüfen.
- Sprechzeiten fehlen (Platzhalter „bitte telefonisch erfragen“).
- Porträt im Abschnitt „Dr. med. Maru Bohdansky“: Es ist nicht belegt, wen das Foto zeigt. Bitte bestätigen.
- Einwilligungen und Bildrechte für alle Fotos klären, besonders für die Fotos mit Kindern.
- Impressum und Datenschutz sind Vorlagen mit markierten Platzhaltern (Kammer, Berufsbezeichnung, Aufsichtsbehörde KV Bayerns, Berufsordnung, Hosting).
- Texte zu Naturheilkunde und Homöopathie mit der Praxis abstimmen (Heilmittelwerbegesetz).
