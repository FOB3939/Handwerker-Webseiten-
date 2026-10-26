# Medieninventar

| Asset | Herkunft | Nutzungsstatus |
|---|---|---|
| Logo (Bestand, Screenshot `IMG_8624`/Upload) | vom Auftraggeber bereitgestellt | Referenz für die Verfeinerung, nicht direkt eingebunden |
| `public/brand/*.svg` | neu gezeichnet (Skript `scripts/build-logo.mjs`), Wortmarke Jost Medium (SIL OFL 1.1) | Entwurf, **Freigabe Betreiber nötig** |
| `public/og.png`, `favicon-32.png`, `apple-touch-icon.png` | aus den Logo-SVGs gerendert | wie Logo |
| Lichtstimmungen der Räume (nur noch für Lounge und als Ersatz) (Lichtkegel + Schallbögen des Signets in der Raumfarbe) | eigene CSS/SVG-Grafik in `src/components/Light.astro` | bewusst abstrakt, gibt sich nicht als Foto aus; echte Fotos später über die Prop `src` einsetzen |
| Raum-Illustrationen (Studio, Bühne, Lightroom, Lounge, Detail) | `src/components/Visual.astro` | derzeit nicht eingebunden; Reserve mit Platzhalter-Kennzeichnung |
| Schriften Jost, Inter | @fontsource (SIL OFL 1.1), lokal ausgeliefert | frei nutzbar |
| Spiel-Sounds | in Web Audio synthetisiert (`src/game/audio.js`) | keine Samples, keine Lizenzfragen |

## Fotos (vom Auftraggeber am 26.10.2026 bereitgestellt)
Liegen in `src/assets/photos/` (als JPG ohne Metadaten; Astro erzeugt AVIF/WebP in mehreren Größen). Zuordnung und Alt-Texte: `src/assets/photos/index.ts`.

| Datei | Motiv | Einsatz | Hinweis |
|---|---|---|---|
| stage-buehne-front | Bühne mit Schriftzug, Traverse | Startbereich, Stageroom-Titel | |
| stage-venice-buehne | MIDAS Venice, Sofa, Bühne | Startbereich, Über uns, Tunnel | |
| stage-pult-blick | Blick über Pult auf Bühne | Stageroom-Galerie, Tunnel | ⚠️ wirkt KI-generiert/-bearbeitet (unscharfe, unlogische Pult-Details) – Echtheit bestätigen |
| stage-rack-funk | Rack mit EQ, Funk, Hall | Stageroom-Galerie, Tunnel | ⚠️ Beschriftungen teils verzerrt – Echtheit bestätigen |
| tonstudio-aufnahmeraum | Aufnahmeraum mit Signet-Vorhang | Startbereich, Tonstudio-Titel | |
| tonstudio-mikrofon | Mikrofon mit Poppschutz | Tonstudio-Galerie, Tunnel | ⚠️ wirkt KI-generiert – Echtheit bestätigen |
| tonstudio-regie | Regie mit Pult und Monitoren | Tonstudio-Galerie, Tunnel | ⚠️ wirkt KI-generiert/stark bearbeitet – Echtheit bestätigen |
| tonstudio-rack-tubetech | Tube-Tech, SPX2000, SSL, API | Startseite (Technik), Tonstudio-Galerie | ⚠️ Beschriftungen teils verzerrt – Echtheit bestätigen |
| lightroom-raum-spots | Raum mit Spots und Spiegelwand | Lightroom-Galerie, Tunnel | |
| lightroom-raum-backline | Spiegelwand, hängende PA, Backline | Startbereich, Lightroom-Titel | |
| lightroom-drums | Schlagzeug im blauen Licht | Lightroom-Galerie, Tunnel | Raumzuordnung vermutet (LED-Leiste wie im Lightroom) |
| lightroom-yamaha-pult | Yamaha MG24/14FX | nur Tunnel (ohne Raumzuordnung) | Raum unbekannt |

Vor dem Livegang: Bildrechte bestätigen und für die mit ⚠️ markierten Bilder klären, ob es echte Fotos der Räume sind. KI-Bilder dürfen nicht als echte Raumfotos erscheinen; sonst ersetzen oder entfernen.

## Weitere Fotos (Priorität)
1. Tonstudio mit Mischpult und Lichtstimmung (Hero Startseite + Tonstudio) – quer, mind. 2400 px breit
2. Stageroom mit Bühne und räumlicher Tiefe – quer
3. Lightroom mit Spiegelwand und farbigem Licht – quer + hoch
4. Menschen bei der Arbeit (nur mit Einverständnis der Abgebildeten)
5. Equipment-Details (Pult, Mikrofone, Outboard) – quadratisch/hoch
6. Lounge

Formate: JPG/WebP, Bildrechte und Model-Releases schriftlich festhalten. Keine Fotos von fremden Websites übernehmen.
