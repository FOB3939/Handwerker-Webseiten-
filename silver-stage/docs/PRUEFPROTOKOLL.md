# Prüfprotokoll (Stand 26.10.2026, nach Redesign „Lichtpult“)

Alle Prüfungen liefen automatisiert in Chromium (Playwright) in der Arbeitsumgebung.

| Prüfung | Werkzeug | Ergebnis |
|---|---|---|
| Unit-Tests Spiel-Logik + Formular-Backend | `npm test` (node:test) | 16/16 bestanden |
| Spiel-Durchlauf (automatische Treffer, Pause bei Tabwechsel) | `tests/browser-play.mjs` | 62/62 „Perfekt“, Pause/Fortsetzen korrekt |
| 10 Seiten × 5 Breiten (320–1440 px): kein horizontales Scrollen, axe-core, interne Links | `tests/qa-pages.cjs` | 50/50 ohne Befund |
| Interaktion: Intro (überspringen, einmal pro Sitzung, reduced motion), Navigation + Tastatur, Formular-Validierung, Doppelabsenden, Fehler-/Erfolgsfall | `tests/qa-interaction.cjs` | 17/17 bestanden |
| Lighthouse (Vorschau-Build, mobil) | lighthouse | Startseite: Performance 95–98, Barrierefreiheit 100, Best Practices 100, LCP 2,1 s, CLS 0, TBT 0 ms; Tonstudio: 98 / 100 / 100, LCP 2,0 s, CLS 0,04 |
| Lighthouse SEO (Produktionskonfiguration, `PUBLIC_PREVIEW=false`) | lighthouse | 100 |
| Sitemap | Build | nur die 7 Inhaltsseiten |
| Artifact-Vorschau (Export, `scripts/artifact-export.mjs`) | Playwright | alle Seiten laden, Schriften aktiv, keine 404 |

## Kontraste (WCAG 2.2 AA, mind. 4,5:1) – Farben des Redesigns
| Paar | Kontrast |
|---|---|
| Haupttext #f2f3f5 auf Hintergrund #0d0f14 | 17,3:1 |
| Sekundärtext #a9b0bb auf Hintergrund | 8,8:1 |
| Sekundärtext auf Fläche #141820 | 8,1:1 |
| Silber #d5dae1 auf Hintergrund | 13,6:1 |
| Raumfarbe Bernstein #f2a65a auf Hintergrund | 9,5:1 |
| Raumfarbe Magenta #c98bff auf Hintergrund | 7,9:1 |
| Fokusring #c9bfff auf Hintergrund | 11,3:1 |

## Nicht getestet
- echte Mobilgeräte (nur Emulation), Audio-Latenz von Beat Stage auf echten Geräten
- Safari und Firefox
- echter Mailversand (nur simuliert)
- INP (nur mit Felddaten messbar)
- Abgleich mit der alten Website und der Gestaltungsreferenz (beide nicht erreichbar)

## Bewegung (WCAG 2.2.2)
Automatisch laufende Animationen (Schallbögen, Rack-LEDs, D-F-J-K-Tasten) enden nach höchstens 4,8 s; bei „Bewegung reduzieren“ laufen sie gar nicht.
Bei „Bewegung reduzieren“ gibt es ruhige Varianten statt keiner Effekte: Intro (5 s) nur mit Ein-/Ausblenden, Fotowechsel im Startbereich als Überblenden ohne Zoom (pausierbar), 3D-Tunnel als normales Bildraster. Ohne Sitzungsspeicher läuft das Intro bei jedem Aufruf. Getestet in Handy-Emulation (Pixel 7): normal, reduzierte Bewegung, gesperrter Speicher.
