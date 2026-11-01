# Prüfprotokoll

## 01.11.2026 – Redesign „Faltkarte“ (Vorschau-Build)
| Prüfung | Ergebnis |
|---|---|
| `astro check`, `astro build` | 0 Fehler, 10 Seiten |
| `tests/qa-pages.cjs` (10 Seiten × 360/390/768/1024/1440, axe WCAG 2.2 AA, Überlauf, h1, Tippflächen, Links) | 50/50 ohne Befund, 9 interne Links erreichbar |
| `tests/qa-interaction.cjs` (Intro, Bestellbon Liefern/Abholen inkl. Tastatur, Suche, Menü, Bestell-Leiste, kein Fake-Checkout) | alle bestanden |
| `npm run prod-check` | bricht mit Liste der offenen Pflichtdaten ab (erwartet) |
| Sichtprüfung 1366/390 aller Hauptseiten | geprüft; behoben: Icons im Bon-Umschalter, Ablaufliste auf „Lieferung & Abholung“, Leerraum unter dem Fuß am Handy |

## 26.10.2026 – erste Fassung (Vorschau-Build)

| Prüfung | Werkzeug | Ergebnis |
|---|---|---|
| Build + Typprüfung | `astro build`, `astro check` | 10 Seiten, 0 Fehler |
| 10 Seiten × 360/390/768/1024/1440 px: Überlauf, axe-core (WCAG 2.0–2.2 A/AA), eine h1, Title/Description, Tippflächen ≥ 24/44 px, Konsolenfehler | `tests/qa-pages.cjs` (Playwright/Chromium) | 50/50 ohne Befund, 9 interne Links erreichbar |
| Intro: startet beim Erstbesuch, endet nach ~3 s, nicht erneut in der Sitzung, Überspringen, Escape, reduzierte Bewegung | `tests/qa-interaction.cjs` | bestanden |
| Speisekarte: Suche, leeres Ergebnis, Zurücksetzen, Label | `tests/qa-interaction.cjs` | bestanden |
| Mobiles Menü (Fokus, Escape), Bestell-Leiste verdeckt keinen Inhalt | `tests/qa-interaction.cjs` | bestanden |
| Bestellen ohne URL: kein Formular, kein toter Anbieter-Link | `tests/qa-interaction.cjs` | bestanden |
| Live-Build-Sperre | `npm run prod-check` | bricht mit Liste der offenen Pflichtdaten ab (erwartet) |
| Lighthouse mobil (simuliert), Startseite mit Intro | Lighthouse 13 | Performance 98, Barrierefreiheit 100, Best Practices 100, LCP 2,4 s, CLS 0,006, TBT 0 ms |
| Lighthouse mobil, Speisekarte | Lighthouse 13 | Performance 97, Barrierefreiheit 100, Best Practices 100, LCP 2,1 s |
| Sichtprüfung Desktop 1440 / Handy 390 (alle Seiten, Screenshots) | Playwright | geprüft, Mängel behoben (Bestellknopf im Kopf am Handy, Wortmarke doppelt, Olive im Intro kaum sichtbar) |

SEO-Wert in Lighthouse ist in der Vorschau absichtlich niedrig (noindex).

## Nicht geprüft / Grenzen
- Nur Chromium; Safari/Firefox und echte Mobilgeräte nicht getestet.
- INP ist ein Feldwert und erst mit echten Nutzerdaten messbar.
- Echte Bestelllinks konnten nicht geprüft werden (keine bestätigte URL); es wurden keine Bestellungen ausgelöst.
