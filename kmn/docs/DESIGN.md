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
Ein einziger inszenierter Moment: „Küche entsteht“ (GSAP-Timeline, inline).
Aufmaß und Anriss → Korpusse fallen ein → Fronten werden eingehängt und ausgerichtet → Arbeitsplatten senken sich
→ Griffe, Spüle, Kochfeld → Wasserwaage, Libelle pendelt aus, Fugen leuchten auf → echtes Foto der Kochinsel.
Nur transform/opacity. Start beim Sichtbarwerden (ScrollTrigger), Pause außerhalb des Sichtfelds,
Pause-Knopf, sechs Schritt-Knöpfe zum Springen. `prefers-reduced-motion`: sofort fertiges Standbild,
Schritt-Knöpfe zeigen das Endbild des Schritts. Ohne JS ist die fertige Küche sichtbar.
Die Arbeitsplatten-Wahl im Abschnitt „Arbeitsplatten“ färbt Musterstück und Hero-Küche um.
