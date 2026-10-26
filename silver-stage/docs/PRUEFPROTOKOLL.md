# Prüfprotokoll (Stand 26.10.2026)

Alle Prüfungen liefen automatisiert in Chromium (Playwright) in der Arbeitsumgebung.

| Prüfung | Werkzeug | Ergebnis |
|---|---|---|
| Unit-Tests Spiel-Logik + Formular-Backend | `npm test` (node:test) | 16/16 bestanden |
| Spiel-Durchlauf (automatische Treffer, Pause bei Tabwechsel) | `tests/browser-play.mjs` | 62/62 „Perfekt“, Pause/Fortsetzen korrekt |
| 10 Seiten × 5 Breiten (320–1440 px): kein horizontales Scrollen, axe-core, interne Links | `tests/qa-pages.cjs` | 50/50 ohne Befund |
| Interaktion: Intro (überspringen, einmal pro Sitzung, reduced motion), Navigation + Tastatur, Formular-Validierung, Doppelabsenden, Fehler-/Erfolgsfall | `tests/qa-interaction.cjs` | 17/17 bestanden |
| Lighthouse (Vorschau-Build, mobil) | lighthouse | Performance 98–100, Barrierefreiheit 100, Best Practices 100; LCP 0,4–2,0 s, CLS ≤ 0,031, TBT (Startseite mit Intro) 70 ms |
| Lighthouse SEO (Produktionskonfiguration, `PUBLIC_PREVIEW=false`) | lighthouse | 100 |
| Sitemap | Build | nur die 7 Inhaltsseiten |
| Artifact-Vorschau (Export, `scripts/artifact-export.mjs`) | Playwright | alle Seiten laden, Schriften aktiv, keine 404 |

## Kontraste (WCAG 2.2 AA, mind. 4,5:1)
| Paar | Kontrast |
|---|---|
| Haupttext auf Hintergrund | 16,7:1 |
| Haupttext auf Fläche | 15,3:1 |
| Sekundärtext auf Hintergrund | 10,0:1 |
| Sekundärtext auf Fläche | 9,1:1 |
| Silber auf Hintergrund | 11,6:1 |
| Button (dunkel auf hell) | 16,7:1 |
| Fehlertext | 9,9:1 |
| Fokusring | 9,6:1 |
| Platzhaltertext | 6,1:1 |

## Nicht getestet
- echte Mobilgeräte (nur Emulation), Audio-Latenz von Beat Stage auf echten Geräten
- Safari und Firefox
- echter Mailversand (nur simuliert)
- INP (nur mit Felddaten messbar)
- Abgleich mit der alten Website und der Gestaltungsreferenz (beide nicht erreichbar)
