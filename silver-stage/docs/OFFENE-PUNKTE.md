# Offene Punkte und Voraussetzungen für den Livegang

## Veröffentlichungshindernisse (muss vor Livegang erledigt sein)
1. **Impressum** – Pflichtangaben nach § 5 DDG vom Betreiber (Firmierung, Rechtsform, Vertretung, Register, USt-IdNr.). Platzhalter in `/impressum/`.
2. **Datenschutzerklärung** – passend zu Hosting, Formular-Dienst und tatsächlichen Abläufen vom Betreiber erstellen/prüfen lassen. Gliederung in `/datenschutz/`.
3. **Fotos** – 12 Fotos vom Auftraggeber eingebaut. Bildrechte bestätigen; bei 5 Bildern Echtheit klären (siehe `MEDIEN.md`).
7. **Preise** – die Preisliste (`/preise/`, Raumseiten, Startseite) zeigt in der Vorschau **Beispielpreise**, gekennzeichnet. Echte Preise und Leistungen in `PRICES` (`src/config/site.ts`) eintragen, `confirmed: true` setzen; Angabe zur MwSt. ergänzen. Ohne Bestätigung zeigt der Live-Build „auf Anfrage“.
4. **Logo-Freigabe** – Vektor-Entwurf in `public/brand/` muss vom Betreiber freigegeben werden.
5. **Formular-Backend** – noch nicht angeschlossen; bis dahin öffnet das Formular das E-Mail-Programm (klar gekennzeichnet). Einrichtung: `form-backend/README.md`.
6. **Produktionsdomain** bestätigen (`SITE_URL`), dann `PUBLIC_PREVIEW=false` bauen.

## Fakten mit dem Betreiber klären
| Punkt | Stand | Quelle / Widerspruch |
|---|---|---|
| Telefonnummer | 089 / 23548214 (laut Projektbrief) | Münchner Branchenverzeichnis nennt **089 45213955** |
| Öffnungszeiten | nicht veröffentlicht („Termine nach Vereinbarung“) | Alte Website: täglich 10–22 Uhr, „Abweichungen möglich“; Verzeichnis: Mo–Fr 10–20 Uhr, Wochenende n. V. |
| Tontechniker-Betreuung | als „laut bisheriger Website“ formuliert | bestätigen, ob immer inklusive |
| Equipment-Liste | aus Projektbrief übernommen | Aktualität prüfen (Studio: ORAM, Neumann TLM 49, SM7B, BAE 1073, Tube-Tech CL 2A, API 2500; Stage: MIDAS Venice F-32) |
| Lightroom: Equipment stellen/lagern | „auf Anfrage“ | Bedingungen klären |
| Lounge | nur als Bereich gezeigt, keine Angaben erfunden | Ausstattung/Nutzung klären |
| Firmierung | „Silver-Stage“ | exakte Schreibweise und Rechtsform fürs Impressum |
| Gebäude: Barrierefreiheit, Parken, Anfahrt mit ÖPNV | nicht genannt | bei Bedarf liefern |
| Team, Referenzen, Arbeitsproben | nicht vorhanden → Abschnitt „wird ergänzt“ | freigegebene Namen, Fotos, Hörproben liefern |
| Preise und Leistungen | Beispielwerte in der Vorschau | Beträge, Einheiten, MwSt., ob Tontechniker inklusive |

## Nicht geprüft / Grenzen dieser Umsetzung
- **Die bisherige Website (silver-stage.de) und die gestalterische Referenz waren aus der Arbeitsumgebung nicht erreichbar** (Netzwerk-/DNS-Sperre). Inhalte stammen aus dem Projektbrief, die Gestaltung folgt den dort beschriebenen Merkmalen der Referenz. Ein Abgleich mit Screenshots der Referenz steht aus.
- Alte URLs (`/clients`, `/bühnenraum`, `/räume`) nicht live verifiziert → `WEITERLEITUNGEN.md`.
- Keine Tests auf echten Mobilgeräten (nur Chromium-Emulation). Audio-Latenz von Beat Stage auf echten Geräten ungeprüft; Trefferfenster ggf. nachjustieren (`SETTINGS` in `src/game/engine.js`).
- Safari/Firefox nicht getestet (nur Chromium).
- Echter Mailversand nicht getestet (nur simuliert).
- INP ist ein Feldwert und lässt sich erst mit echten Nutzerdaten messen.

## Optionale Messung (nur nach Entscheidung des Betreibers)
Mögliche Ereignisse: Aufruf Raum-Seite, Beginn Anfrage, bestätigter Anfrage-Eingang (Server-OK), Klick auf Telefon/E-Mail.
Keine Freitexte oder personenbezogenen Daten senden; Werkzeug und Rechtsgrundlage vorher klären. Derzeit ist **kein** Tracking eingebaut.
