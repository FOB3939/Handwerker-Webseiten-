# Prüfprotokoll (26.10.2026, Vorschau-Build)

| Prüfung | Ergebnis |
|---|---|
| Build + `astro check` | 8 Seiten, 0 Fehler |
| `tests/qa-pages.cjs`: 8 Seiten × 360/390/768/1024/1440 px, Überlauf, axe WCAG 2.2 AA, h1, Meta, Tippflächen, Konsole | 40/40 ohne Befund, interne Links erreichbar |
| `tests/qa-interaction.cjs`: 3D lädt, Pause-Knopf, Standbild bei reduzierter Bewegung, Vorher/Nachher per Tastatur, Formular-Validierung, Förder-Hinweis | bestanden (mailto-Aufruf selbst lässt sich im Testbrowser nicht abfangen) |
| Lighthouse mobil Startseite | Performance 99, Barrierefreiheit 100, Best Practices 100, LCP 1,9–2,0 s, CLS 0,01, TBT 0 ms – 3D-Szene lädt danach (~500 kB JS, ~125 kB gepackt) |
| Lighthouse mobil Wärmepumpe / Referenzen | 100/100/100 bzw. 98/100/100 |
| Behobene Fehler | Pause-Knopf von 3D-Fläche verdeckt; negative Zeit im ersten Animationsschritt (Konsolenfehler); Überlauf /leistungen/ bei 360 px; Kupfer-Kontrast 4,4:1 → 5,9:1 |

Grenzen: nur Chromium (WebGL per Software), keine echten Geräte, kein Safari/Firefox.
