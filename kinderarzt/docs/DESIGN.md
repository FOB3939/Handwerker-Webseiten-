# Gestaltung: Kinderarztpraxis Dr. med. Maru Bohdansky, Grünwald

## Richtung
**„Ein Rundgang durch die Praxis.“** Der Startbereich ist eine filmische Kamerafahrt durch die echten Fotos der Praxis,
ohne Spielzeugwelt, ohne KI-Bilder. Die übrige Seite bleibt hell, ruhig und freundlich: viel Weiß, Sonnengelb als Wärme,
tiefes Schaufensterblau als Schrift. Das Sonnen-Signet erscheint nur dezent als Logo und als Lichtakzent.
Texte sind sachlich (Heilmittelwerbegesetz: keine Versprechen).

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

## Schrift (lokal eingebettet, @fontsource)
- **Fredoka** (variabel, Breite 75–125 %, Gewicht 300–700): weiche, runde Display-Schrift für Überschriften, leicht verbreitert (104–108 %), enge Laufweite.
- **Atkinson Hyperlegible Next**: Textschrift, für gute Lesbarkeit entwickelt. Sie passt zu einer Arztpraxis, die alle Eltern erreichen soll.

## Layout
- Hero: gepinnte Bühne über die volle Breite auf tiefem Abendblau, Text links (Desktop) bzw. als Karte unten (Mobil), Fotos rechts bzw. oben.
- Praxis: Porträt mit „Kiesel“-Maske (große, ungleiche Radien), daneben Name, Fachgebiet und Leistungsliste.
- Schwerpunkte: drei versetzte Kacheln auf Sonnengelb, Piktogramme zeichnen sich beim Erscheinen.
- Aus dem Praxisalltag: dunkelblaue, horizontal gepinnte Bildstrecke (ab 900 px), darunter wischbar mit Knöpfen.
- Team: Gruppenfoto, sinngemäßes Zitat der alten Seite, vier Porträtkarten mit leichtem 3D-Tilt.
- Termin & Kontakt: großer Telefon-Button, Sprechzeiten-Platzhalter, Anfahrt mit Google-Maps-Link (keine eingebettete Karte), Bereitschaftsdienst 116 117 und Notruf 112.

## Kamerafahrt (`src/hero3d.js`)
Ein Canvas, Three.js mit eigenem Shader je Bildebene, an ScrollTrigger gekoppelt (gepinnt, etwa 6,5 Bildschirmhöhen).
1. **Willkommen:** Außenansicht groß, langsamer Ken-Burns.
2. **Tür:** Die Kamera fährt auf die Eingangstür zu; die Tür wird zur Bildmaske, dahinter steht schon der Empfang. Die Maske weitet sich mit warmem Licht am Rand, die Fassade verschwimmt, man fliegt hinein.
3. **Empfang → Wartebereich → Sprechzimmer → Untersuchung (Behandlungsraum):** Jedes Foto ist eine Ebene im Raum, seitlich versetzt und leicht gedreht. Die Kamera gleitet im Bogen von Raum zu Raum; das Ziel wird scharf, das verlassene Foto weich, dazu wischt eine warme Lichtfahne durchs Bild.
4. **Ende:** Teamfoto, Überschrift „Kinderärztin in Grünwald“ mit Telefon-Knopf.

- **2,5D:** Vordergrund-Ebenen sind von Hand ausgeschnitten (Polygone bzw. ein Helligkeits-Schlüssel für die Blätter vor der hellen Wand, `scripts/fotos.mjs`): Blätter und Pflanzkübel an der Fassade, Empfangstresen mit Kind und Schultüte, Sitzhocker, Kindersitze und Wandstück im Wartebereich. Sie liegen vor ihrem Foto und sind von der Station aus deckungsgleich, beim Fahren und mit der Maus entsteht echter Parallax. Unter den Ausschnitten ist das Hintergrundbild aus der Umgebung aufgefüllt (Push-Pull), damit keine Doppelkanten sichtbar werden.
- **Look:** Farbkorrektur leicht warm, Vignette, feines bewegtes Filmkorn, weiche gerundete Bildkanten, Fokusunschärfe über Mip-Stufen, Lichtfahne auf tiefem Abendblau.
- **Schärfe:** Die Fotos sind Handy-Screenshots; die Fahrt nutzt mit Lanczos hochskalierte, leicht nachgeschärfte Fassungen (max. 1600 px) und zeigt die Räume nicht größer als nötig.
- **Leistung:** `devicePixelRatio` ≤ 2, bei dauerhaft langsamen Bildern automatisch weniger; außerhalb des Bildes und bei verstecktem Tab wird nicht gerendert.
- **Reduzierte Bewegung:** keine Fahrt; die Stationen erscheinen als Liste mit Standfotos.
- **Ohne WebGL 2:** dieselbe Liste, Fotos mit Ken-Burns per CSS (nur solange sichtbar).
- **Tastatur:** Erhält ein Element in einem gerade ausgeblendeten Kapitel den Fokus, fährt die Szene zu diesem Kapitel.

## Bewegung sonst
Weiche Masken-Reveals der Fotos (clip-path + Zoom, an den Scroll gekoppelt) mit sanftem Parallax im Bildausschnitt, Kacheln einmalig gestaffelt, Tilt nur bei Hover-Geräten.
Alles ist ohne Skript sichtbar; reduzierte Bewegung schaltet die räumlichen Effekte ab.
