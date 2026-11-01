# K.M.N Küchenmontage – Gestaltung

## Richtung: Montageblatt
Die Seite sieht aus wie eine Aufbauanleitung: isometrische Strichzeichnungen auf Rasterpapier, Schritte in
echter Reihenfolge, dazu die Materialien aus den echten Montagefotos (Korpusweiß, Anthrazit der Arbeitsplatte,
Eichenparkett). Der alte dunkle Graphit-Look und die „Symbolbilder“ sind ersetzt.

## Farben
| Token | Hex | Rolle |
|---|---|---|
| `--ground` | #EEF0EC | Korpusweiß, Seitengrund |
| `--paper` | #F9FAF8 | Raster-/Formblatt, erhöhte Flächen |
| `--ink` | #22272B | Anthrazit: Text, Linien, Hauptknopf, dunkle Abschnitte |
| `--ink-2` | #4C5459 | Nebentext (6,6:1 auf `--ground`) |
| `--oak` | #C99254 | Eiche: vollflächig im Bewertungsblock und im Anfrage-Abschnitt (Text dort immer `--ink`) |
| `--oak-deep` | #7E5221 | Sterne, Schreibmarke |
| `--signal` | #C9DB3A | Libellengrün der Wasserwaage: Schrittnummer, Markierungen A/B/C, Fugenprüfung. Nie als Textfarbe auf Hell. |

## Schrift
Archivo (variabel, Breite 62–125 %, Gewicht 100–900), lokal per `@fontsource-variable/archivo`, als data-URI eingebettet.
Überschriften breit (118–125 %) und schwer (750–850), Fließtext normal breit. Keine zweite Familie.

## Form
- Ecken 4–6 px, Linien 1–2 px in Anthrazit, Rasterpapier nur in der Hero-Bühne.
- Leistungen als Stückliste mit eigenen isometrischen Piktogrammen (gleiche Projektion wie die Hero-Küche).
- Nummern nur dort, wo eine Reihenfolge besteht (Hero-Schritte, Ablauf, Formular).
- Keine Eyebrows über Überschriften.

## Bewegung
Ein einziger inszenierter Moment: die 3D-Scroll-Szene „Küche entsteht“ (Three.js, ein Canvas, plus GSAP ScrollTrigger,
alles inline gebündelt). Die Szene ist über rund fünf Bildschirmhöhen gepinnt; der Scroll führt die Kamera:
0 Grundriss von oben mit Maßketten → 1 „Nach Plan aufbauen“ (Aufmaß vor Ort, keine Planung) → 2 Stellfüße, Korpusse
wachsen aus dem Grundriss, Insel wird mit der Wasserwaage nivelliert → 3 Arbeitshöhe als Maßlinie, „mit Ihnen abgestimmt“,
ohne Zahl → 4 Arbeitsplatten senken sich, Ausschnitte für Kochfeld und Spüle, Nahfahrt auf Stoß und Wandanschluss →
5 Fronten und Griffe, Fugen leuchten libellengrün → 6 Rückfahrt, Karte mit dem echten Foto der Kochinsel.
Look: Lambert-Flächen mit Anthrazit-Strichkanten, Eiche-Boden als Canvas-Textur, Platte in der gewählten Optik.
Maßbeschriftungen sind HTML-Etiketten (aria-hidden), die Kapiteltexte echte Überschriften und Absätze.
Rendern nur bei Scroll-Änderung (keine Dauerschleife), devicePixelRatio max. 2.
`prefers-reduced-motion`: kein Pinning, Standbild der fertigen Küche, Kapitel als normale Liste.
Ohne WebGL oder ohne JS: die gezeichnete isometrische SVG-Küche als Standbild.
Die Arbeitsplatten-Wahl im Abschnitt „Arbeitsplatten“ färbt Musterstück und 3D-Platte um.

## Bilder
Echte Montagefotos nur in „Fertig montiert.“, im Detail-Abschnitt und auf der Foto-Karte des Heros.
Die Symbolbilder der alten Seite (inszeniert) tragen immer sichtbar „Symbolbild“ und stehen getrennt davon.
