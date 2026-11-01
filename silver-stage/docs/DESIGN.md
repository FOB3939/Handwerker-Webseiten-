# Gestaltung „Plakatwand“ (Redesign 01.11.2026)

Ersetzt den bisherigen Look „Lichtpult“ (dunkles Blaugraphit, Silber-Verlauf, leuchtende Punkte). Der alte Stand
diente als Anti-Referenz: dunkel mit Neon-Glühen ist der Standard jeder Musik-Website.

## Richtung
Die Website ist ein **Siebdruck-Konzertplakat**. Silver Stage kündigt seine drei Räume an wie Acts auf einem Plakat:
Tonstudio, Stageroom, Lightroom stehen als **Line-up** im Startbereich. Jeder Raum hat eine eigene **Druckfarbe**;
Fotos erscheinen dort, wo sie Raum-Stimmung tragen, als **Druckplatte** (Schwarzauszug über der Raumfarbe).
Die dunkle „Bühne“ gibt es nur dort, wo gespielt wird: Mini-Spiel, Beat Stage, Intro.

Szene: Bands, Sänger:innen, Tänzer:innen schauen tagsüber und abends am Handy nach einem Raum – ein heller, kräftiger
Plakatbogen liest sich überall und hebt sich von dunklen Studio-Seiten ab.

## Farbe (Strategie: volle Palette, Flächen statt Akzente)
| Rolle | Wert | Einsatz |
|---|---|---|
| Papier (Silberkarton) | `#e3e4e6`, Bogen `#d5d7da`, Felder `#f0f1f2` | Grund mit feiner Faser (SVG-Rauschen, lokal) |
| Druckschwarz | `#1c1a21`, Zweittext `#4d4a55` | Text, Linien, Knöpfe |
| Tonstudio | Signalgelb `#ffd21a` | Text darauf schwarz |
| Stageroom | Leuchtpink `#ff4f93` | Text darauf schwarz |
| Lightroom | Elektroblau `#2f49f5` | Text darauf weiß |
| Bühne | `#1c1a21` mit `#eceaf0` | Spiel, Intro |

Tokens in `src/styles/global.css`. `[data-room]` setzt `--room`, `--on-room`, `--on-room-2`; `.inked` macht eine
ganze Fläche zur Druckfläche, `.venue` zur dunklen Bühne, `.plate` zur Druckplatte.

## Schrift (lokal über @fontsource, OFL)
- **Anybody Variable** – Plakatschrift mit Breitenachse: Überschriften breit (`font-stretch` 108–130 %) und schwer (780–880).
- **Schibsted Grotesk Variable** – Fließtext, Formulare, Navigation.
- Logo-Wortmarke bleibt Jost (Pfade in `public/brand`, unverändert).

## Layout
Linksbündig, kräftige 2-px-Linien statt Karten, Listen als Zeilen mit Trennlinien (Line-up, Ausstattung, Preise wie
an der Abendkasse). Abschnitte wechseln zwischen Papier, Druckfläche und Bühne. Keine Etiketten über Überschriften,
keine Pfeile hinter Linktexten, keine harten Versatzschatten.

## Bewegung
Ein einziger gestalteter Moment: der **Rakelzug** – die Druckplatte wird einmal von oben nach unten „gedruckt“ (Laden
und Raumwechsel, `clip-path`, 0,75 s, exponentielles Ausklingen). Alles andere reagiert nur auf Bedienung.
Das Markenintro (einmal pro Sitzung, überspringbar) bleibt; das Logo wechselt beim Gleiten in den Kopf von Hell zu
Druckschwarz. Bei „Bewegung reduzieren“ entfallen Rakelzug und Übergänge, das Intro läuft in der ruhigen Variante.

## Was erhalten blieb
Logo und Markendateien, Intro, Beat Stage (Logik und Tests unverändert, nur Farben der Spielfläche), Soundcheck,
Anfrage- und Schnellformular samt `form-backend`, alle Seiten/URLs, Großansicht der Bildstrecke, Vorschau-Mechanik
(`PUBLIC_PREVIEW`: noindex, Entwurfshinweis, Beispielpreise gekennzeichnet).

Ersetzt bzw. zusammengelegt: das Mischpult im Startbereich und der Raumfinder → **Line-up** mit Überblick
(`#programm`); die Raumbahnen → Überblick; der 3D-Tunnel → Bildwand mit Großansicht; Laufband, Scroll-Balken,
Neigen/Magnet-Effekte und Einblend-Animationen entfallen (Dekoration ohne Funktion).
