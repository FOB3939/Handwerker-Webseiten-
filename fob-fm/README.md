# fob-fm.de – FOB Haustechnik Hausmeisterservice

Neue Website für FOB Haustechnik Hausmeisterservice (Hochstadt bei Weßling): Haustechnik-Leistungen rund um München
und – neu – Luft-Wasser-Wärmepumpen mit Beratung, Förderung und Einbau über Partner deutschlandweit.
Astro 5 (statisch), Three.js für die 3D-Szene im Startbereich, Schrift Archivo (lokal).

## Start
```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # Vorschau-Build (noindex, Entwurfshinweis) nach dist/
npm run check        # Typprüfung
npm run prod-check   # Live-Build – bricht ab, solange Telefon/Impressum fehlen
```
Tests (Server: `python3 -m http.server 4350 -d dist`): `node tests/qa-pages.cjs`, `node tests/qa-interaction.cjs`

## Seiten
`/` · `/leistungen/` · `/waermepumpe/` (Ablauf, Förderung, FAQ, Anfrage) · `/referenzen/` (Vorher/Nachher) ·
`/kontakt/` · `/impressum/` · `/datenschutz/` · `404`

## Inhalte ändern
- Firmendaten, Leistungen, Förderstand: `src/config/site.ts` (`COMPANY`, `SERVICES`, `FUNDING`)
- Fotos: `src/assets/img` + `index.ts` (Alt-Texte); Herkunft `docs/MEDIEN.md`
- 3D-Szene: `src/scripts/hero3d.ts` – wird erst nach der ersten Bewegung bzw. ~2,5 s nach dem Laden nachgeladen,
  pausiert außerhalb des Sichtbereichs, hat einen Pause-Knopf und zeigt bei reduzierter Bewegung ein Standbild.
  Ohne WebGL bleibt das Firmenzeichen als Grafik stehen.

## Anfrageformular
Kein Server: „E-Mail vorbereiten“ öffnet das Mailprogramm mit den Angaben an `COMPANY.email`. Für Versand ohne
Mailprogramm einen Formular-Dienst/Endpunkt anbinden (dann Datenschutz anpassen).

## Deployment
Statisches Hosting. `SITE_URL=https://www.fob-fm.de PUBLIC_PREVIEW=false npm run build` (gelingt erst ohne offene
Pflichtangaben) und `dist/` hochladen.
