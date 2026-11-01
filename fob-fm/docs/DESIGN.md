# Gestaltung „Strangschema“ (Redesign November 2026)

Ersetzt den bisherigen Look „Bauplan“ (Graphit, Gold, Kartenraster). Der alte Stand dient nur als Anti-Referenz.

## Idee
Die Website sieht aus wie die Haustechnik selbst: Heizkreisverteiler, Rohrkennzeichnung und Strangschema.
FOB ist die Hauptleitung (ein Ansprechpartner), die Gewerke sind die Abgänge. Vorlauf (rot) und Rücklauf/Außenluft
(blau) sind keine Deko-Farben, sondern tragen Bedeutung: Wärme fließt rot, Luft und Rückfluss blau.
Abgelehnt: dunkle Seite mit einer Akzentfarbe, gleich große Icon-Karten, Überzeilen über Überschriften.

## Farben (Strategie: Committed, Tannengrün trägt ganze Flächen)
| Rolle | Wert | Einsatz |
|---|---|---|
| Putz (Grund) | `#E7EAE4` | kühles Kalkweiß, Seitengrund |
| Weiß | `#F8FAF7` | Flächen, Formular |
| Tanne | `#1D3A2E` | Startbereich, Wärmepumpe, Fußzeile (30–40 % der Fläche) |
| Messing | `#D9A21B` | aus dem Firmenzeichen: Hauptaktion, Ventilgriffe |
| Vorlauf | `#B3301B` | Wärme, Hinweise, Fehlermeldungen |
| Rücklauf | `#205E98` | Außenluft, Rückfluss, Links in Grafiken |
| Tinte | `#15201A` / `#47544C` | Text / Nebentext (≥ 7:1 auf Putz) |

## Schrift
Sofia Sans Condensed (800) für Überschriften wie Beschriftungen auf Typenschildern und Rohrmarkierungen,
Sofia Sans für Text. Beide lokal per @fontsource. Keine Versalien-Labels, keine Monospace-Kostüme.

## Bausteine
- **Rohrmarkierung** (`.pipe-tag`): Schild mit Farbfeld des Mediums und Pfeilspitze in Flussrichtung, nur wo ein Fluss
  oder eine Richtung gemeint ist (Kurzfakten, Wärmepumpen-Ablauf).
- **Verteiler** (Startseite): sechs Abgänge eines Heizkreisverteilers als Registerkarten; der gewählte Abgang „öffnet“
  (Ventilgriff dreht, Abgang färbt sich rot) und zeigt Leistung, Foto und typische Aufgaben. Ohne JS stehen alle offen.
- **Doppelleitung** (`.pipes`): Vorlauf/Rücklauf als Abschluss der Seitenköpfe.
- **Vorher/Nachher**: Regler mit Messing-Ventilgriff.

## Bewegung
Ein inszenierter Moment: die 3D-Schnittmodell-Szene im Startbereich (Wärmepumpe, Vorlauf/Rücklauf bis zu den
Heizkörpern). Sonst nur Rückmeldungen auf Eingaben (Ventil dreht beim Auswählen). Reduzierte Bewegung: Standbild,
Ventile ohne Drehung.

## Raster
Max. 1240 px, linksbündig, Abstände 8er-Raster; mehr Luft über Überschriften als darunter. Ecken: 2 px an Schildern,
10 px an Fotos, Knöpfe eckig mit Messing-Unterkante.
