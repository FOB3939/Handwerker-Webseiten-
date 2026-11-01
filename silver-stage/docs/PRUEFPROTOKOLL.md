# Prüfprotokoll (Stand 01.11.2026, nach Redesign „Plakatwand“)

Alle Prüfungen liefen automatisiert in Chromium (Playwright) in der Arbeitsumgebung.

| Prüfung | Werkzeug | Ergebnis |
|---|---|---|
| Typprüfung, Build | `npm run check`, `npm run build` | 0 Fehler, 0 Warnungen; 12 Seiten gebaut |
| Unit-Tests Spiel-Logik + Formular-Backend | `npm test` (node:test) | 16/16 bestanden |
| Spiel-Durchlauf (automatische Treffer, Pause, Autorepeat) | `tests/browser-play.mjs` | 62/62 „Perfekt“, 120 ms spät = 62 „Gut“, Pause/Fortsetzen korrekt |
| 12 Seiten × 5 Breiten (360–1440 px): kein horizontales Scrollen, axe-core (WCAG 2.2 AA), Tippflächen, interne Links | `tests/qa-pages.cjs` | 60/60 ohne Befund |
| Interaktion: Menü + Tastatur, Untermenü, Formular (ohne/mit Backend, Doppelabsenden), Line-up, Intro (überspringbar, einmal pro Sitzung) | `tests/qa-interaction.cjs` | 22/22 bestanden |

## Kontraste (WCAG 2.2 AA) – Farben „Plakatwand“
| Paar | Kontrast |
|---|---|
| Druckschwarz #1c1a21 auf Papier #e3e4e6 | 13,5:1 |
| Zweittext #4d4a55 auf Papier / auf Bogen #d5d7da | 6,8:1 / 6,0:1 |
| Druckschwarz auf Gelb #ffd21a / Zweittext #4a3d00 auf Gelb | 11,9:1 / 7,4:1 |
| Druckschwarz auf Pink #ff4f93 / Zweittext #3a0d22 auf Pink | 5,6:1 / 5,4:1 |
| Weiß auf Blau #2f49f5 / Zweittext #dfe3ff auf Blau | 6,2:1 / 4,9:1 |
| Link-Blau #2f49f5 auf Papier | 4,9:1 |
| Fehlerrot #b3123f auf Papier / auf Weiß | 5,4:1 / 6,8:1 |
| Bühne: #eceaf0 / #b5b2bd auf #1c1a21 | 13,5:1 / 8,3:1 |
| Fokus: 3 px Druckschwarz auf Papier, Weiß auf Blau, Gelb auf der Bühne | ≥ 3:1 |

## Nicht getestet
- echte Mobilgeräte (nur Emulation), Audio-Latenz von Beat Stage auf echten Geräten
- Safari und Firefox
- echter Mailversand (nur simuliert)
- INP (nur mit Felddaten messbar)
- Abgleich mit der alten Website und der Gestaltungsreferenz (beide nicht erreichbar)

## Bewegung (WCAG 2.2.2)
Automatisch läuft nur der einmalige Rakelzug der Druckplatte (0,75 s) und das Signet auf der Beat-Stage-Startseite (endet nach 4,8 s).
Bei „Bewegung reduzieren“ entfallen beide; das Intro läuft dann in der ruhigen Variante (nur Ein-/Ausblenden). Ohne Sitzungsspeicher läuft das Intro bei jedem Aufruf.
