# Designrichtung „Faltkarte“

Stand: 01.11.2026 · ersetzt das frühere System „Ladenschild“ (dunkler Foto-Hero, gelbes Band, cremefarbene Karten).

## Idee
Die Website ist der Lieferzettel, den man bei einem Pizza-Heimservice aus dem Briefkasten zieht und an den
Kühlschrank hängt: sonnengelber Karton, zwei Druckfarben (Espresso und Tomate), eine Speisekarte mit
Punktführern zwischen Sorte und Preis, Falzlinien zwischen den Feldern und ein Bestellbon.
Das Gelb kommt direkt vom Ladenschild über dem Schaufenster. Es ist hier keine Akzentfarbe: Es trägt ganze Flächen.
Abgelehnt wird der Lieferdienst-Standard aus dunklem Vollbild-Foto, gelbem Knopf und gleich großen Karten.

## Farben (Tokens in `src/styles/global.css`)
| Token | Wert | Rolle |
|---|---|---|
| `--sun` | `#FFC52E` | Flyer-Karton, Kopf, Seitenköpfe, Bon-Feld (Fläche, nicht Akzent) |
| `--espresso` | `#2B1A10` | Druckfarbe 1: Text, Fuß, Ablauf-Feld |
| `--tomato` | `#B8261B` | Druckfarbe 2: Bestellaktion, Preise, Hinweise. Auf Gelb nur ab großer Schrift (3,97:1) |
| `--paper` | `#FFFDF7` | Papier: Lesetexte, Speisekarte |
| `--kraft` | `#EBD6B2` | Karton der Pizzaschachtel: Nebenflächen, Tabellenkopf |
| `--ink-soft` | `#5A3A12` | Zweittext auf Gelb (6,4:1) und Papier |

Kontraste gemessen: Espresso auf Gelb 10,6:1 · Weiß auf Tomate 6,3:1 · Tomate auf Papier 6,3:1.

## Schrift
- **Bagel Fat One** (lokal, @fontsource): runde, fette Plakatschrift wie auf Pizzakartons. Nur für Überschriften,
  Sortennamen und die Wortmarke. Nie für Fließtext.
- **Schibsted Grotesk** (variabel, lokal): Text, Preise (tabellarische Ziffern), Bedienelemente.
- Keine Versal-Etiketten, keine Kicker über Überschriften.

## Layoutsprache
- Felder wie bei einem gefalzten Flyer: volle Breite, kräftige Farbfläche, getrennt durch eine Falzlinie (`.fold`).
- Speisekarte als Liste mit Punktführern statt Karten. Preise rechtsbündig, tabellarisch.
- Bestellbon (`.bon`): weißes Papier mit gezacktem Abriss unten. Er trägt die Liefer-/Abholangaben.
- Fotos in Papierrahmen (10 px Papierkante, weicher Schatten). Rundungen klein (6 px); Knöpfe als Pillen.

## Bewegung
- Ein einziger inszenierter Moment: das Intro (rund 3 s). Auf Gelb zeichnet sich ein tomatenroter Stempelring,
  drei Zutaten fallen hinein, die Wortmarke wird aufgedruckt, dann rollt der Karton nach oben weg.
  Einmal pro Sitzung, überspringbar, entfällt bei reduzierter Bewegung.
- Sonst nur Rückmeldung auf Bedienung: Bon-Umschalter (Liefern/Abholen), Knopfdruck, Menü.

## Wiederkehrende Bausteine
`Wordmark` · `Bon` (Liefern/Abholen, funktioniert ohne JavaScript per Radio + `:has`) · `MenuItem` (Punktführer) ·
`PageHead` (gelber Seitenkopf mit optionalem Rahmenfoto) · `.fold` · `.notice` (gestrichelter Kasten für Vorschau- und
Datenhinweise) · `.img-note` (KI-Hinweis auf Bildern, nur Vorschau).
