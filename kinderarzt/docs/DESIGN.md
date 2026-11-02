# Gestaltung: Kinderarztpraxis Dr. med. Maru Bohdansky, Grünwald

## Richtung
**„Die Sonne geht auf.“** Das gelbe Sonnen-Signet vom Praxisschild ist die Hauptfigur. Die Seite ist hell, ruhig und freundlich:
viel Weiß, Sonnengelb als Wärme und ein tiefes Schaufensterblau als Schrift. Kein Creme-Papier, keine Serifen, kein Kitsch.
Der Wow-Moment steckt an genau einer Stelle, im 3D-Hero. Alles danach bleibt ruhig und sachlich (Heilmittelwerbegesetz: keine Versprechen).

## Farben (Tokens in `src/styles.css`)
| Rolle | Wert | Einsatz |
|---|---|---|
| `--sun` | `#FFC93C` | Signet, Haupt-Buttons (Text darauf in `--ink`) |
| `--sun-soft` | `#FFF5D4` | Fläche „Schwerpunkte“, Piktogramm-Grund |
| `--ink` | `#1C2A78` | Schrift, tiefes Schaufensterblau |
| `--ink-2` | `#48527F` | Fließtext zweiter Ebene (Kontrast > 7:1 auf Weiß) |
| `--blue` | `#3B57D0` | Rollen, Fokusring, Akzente |
| `--sky` | `#EEF3FE` | Kontaktfläche, Menü-Hover |
| `--night` | `#16205F` | Rundgang und Fuß (Abendblau, Fotos leuchten darauf) |
| `--coral` | `#F0715C` | nur in der 3D-Welt (Ballon), Echo der roten Team-Pullover |

## Schrift (lokal eingebettet, @fontsource)
- **Fredoka** (variabel, Breite 75–125 %, Gewicht 300–700): weiche, runde Display-Schrift für Überschriften, leicht verbreitert (104–108 %), enge Laufweite.
- **Atkinson Hyperlegible Next**: Textschrift, für gute Lesbarkeit entwickelt. Sie passt zu einer Arztpraxis, die alle Eltern erreichen soll.

## Layout
- Hero: gepinnte Bühne über die volle Breite, Text links (Desktop) bzw. als Karte unten (Mobil), Szene rechts bzw. oben.
- Praxis: Porträt mit „Kiesel“-Maske (große, ungleiche Radien), daneben Name, Fachgebiet und Leistungsliste. Darunter drei Praxisfotos mit unterschiedlichen Formaten.
- Schwerpunkte: drei versetzte Kacheln auf Sonnengelb, Piktogramme zeichnen sich beim Erscheinen.
- Rundgang: dunkelblaue, horizontal gepinnte Bildstrecke (ab 900 px), darunter wischbar mit Knöpfen.
- Team: Gruppenfoto, sinngemäßes Zitat der alten Seite, vier Porträtkarten mit leichtem 3D-Tilt.
- Termin & Kontakt: großer Telefon-Button, Sprechzeiten-Platzhalter, Anfahrt mit Google-Maps-Link (keine eingebettete Karte), Bereitschaftsdienst 116 117 und Notruf 112.

## 3D-Ablauf (`src/hero3d.js`)
1. **Willkommen:** Morgendämmerung, verstreute Ton-Formen schweben (Bauklötze, Dach, Tür, Teddy, Stethoskop, Ballon, Wolken).
2. **Guten Morgen:** Die Sonne steigt hinter dem Horizont auf, die geschwungenen Strahlen entfalten sich und wehen sanft; Licht und Himmel werden wärmer.
3. **Alles an seinem Platz:** Die Klötze fliegen im Bogen zusammen und bilden die Praxis, Dach mit kleinem Signet, Tür; Teddy, Stethoskop und Ballon finden ihren Platz.
4. **Herein:** Die Türflügel öffnen sich, innen leuchtet warmes Licht, dann öffnet sich aus der Tür heraus das echte Foto der Außenansicht (Kreis-Maske).

Technik: ein Canvas, `devicePixelRatio` ≤ 2, matte `MeshStandardMaterial` mit RoomEnvironment-Licht, weiche Schatten, Nebel als Horizont,
Mausparallaxe (nur feiner Zeiger). Die Eigenbewegung läuft nur, solange die Szene sichtbar und der Tab aktiv ist.
`prefers-reduced-motion`: Standbild der fertigen Praxis, Kapitel als Liste, Foto daneben, keine ScrollTrigger.
Ohne WebGL: gezeichnetes SVG-Standbild (`src/art.mjs`).

## Bewegung sonst
Weiche Masken-Reveals der Fotos (clip-path + Zoom, an den Scroll gekoppelt), Kacheln einmalig gestaffelt, Tilt nur bei Hover-Geräten.
Alles ist ohne Skript sichtbar; reduzierte Bewegung schaltet die räumlichen Effekte ab.
