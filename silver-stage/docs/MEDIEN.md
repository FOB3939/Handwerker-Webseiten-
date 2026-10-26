# Medieninventar

| Asset | Herkunft | Nutzungsstatus |
|---|---|---|
| Logo (Bestand, Screenshot `IMG_8624`/Upload) | vom Auftraggeber bereitgestellt | Referenz für die Verfeinerung, nicht direkt eingebunden |
| `public/brand/*.svg` | neu gezeichnet (Skript `scripts/build-logo.mjs`), Wortmarke Jost Medium (SIL OFL 1.1) | Entwurf, **Freigabe Betreiber nötig** |
| `public/og.png`, `favicon-32.png`, `apple-touch-icon.png` | aus den Logo-SVGs gerendert | wie Logo |
| Raum-Illustrationen (Studio, Bühne, Lightroom, Lounge, Detail) | eigene Vektorgrafiken in `src/components/Visual.astro` | **Platzhalter**, sichtbar gekennzeichnet; keine angeblich echten Fotos, keine KI-Bilder |
| Karte im Standort-Abschnitt | eigene schematische Grafik | dekorativ; keine eingebettete Fremdkarte |
| Schriften Jost, Inter | @fontsource (SIL OFL 1.1), lokal ausgeliefert | frei nutzbar |
| Spiel-Sounds | in Web Audio synthetisiert (`src/game/audio.js`) | keine Samples, keine Lizenzfragen |

## Benötigte Fotos (Priorität)
1. Tonstudio mit Mischpult und Lichtstimmung (Hero Startseite + Tonstudio) – quer, mind. 2400 px breit
2. Stageroom mit Bühne und räumlicher Tiefe – quer
3. Lightroom mit Spiegelwand und farbigem Licht – quer + hoch
4. Menschen bei der Arbeit (nur mit Einverständnis der Abgebildeten)
5. Equipment-Details (Pult, Mikrofone, Outboard) – quadratisch/hoch
6. Lounge

Formate: JPG/WebP, Bildrechte und Model-Releases schriftlich festhalten. Keine Fotos von fremden Websites übernehmen.
