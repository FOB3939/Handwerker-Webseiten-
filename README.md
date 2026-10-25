# Handwerker-Webseiten – tägliche Lead-Demos

Interne Next.js-App (TypeScript, Tailwind CSS) mit unverbindlichen Website-Entwürfen für Handwerksbetriebe
im Raum München / Starnberg / Fürstenfeldbruck.

- `/daily/YYYY-MM-DD` – internes Lead-Dashboard eines Tageslaufs
- `/demo/[slug]` – Website-Entwurf je Betrieb
- `data/leads/YYYY-MM-DD/firma-N.json` – Recherche, Verkaufsstrategie und sämtliche Seitentexte eines Leads
- `data/lead-history.json` – dauerhafte Historie (inkl. verworfener Betriebe) zur Dublettenvermeidung

Alle Seiten sind per `<meta name="robots">`, `X-Robots-Tag`-Header und `robots.txt` auf **noindex, nofollow** gesetzt
und tragen den Hinweis „Unverbindlicher Website-Entwurf – nicht die offizielle Website des Unternehmens.“

Bilder sind selbst gezeichnete SVG-Platzhalter; jede Galerie-Kachel nennt das echte Foto, das später benötigt wird.

## Neuer Tageslauf

1. Neue Leads gegen `data/lead-history.json` prüfen (Name, Telefon, MyHammer-URL).
2. `data/leads/<datum>/firma-1.json … firma-5.json` anlegen (Schema: `lib/types.ts`, Design über `site.theme`:
   `atelier`, `objekt`, `stein`, `garten`, `volt`, `werk`, `aqua`; optional `site.motif`).
3. Historie ergänzen, dann `npm run typecheck && npm run lint && npm run build`.

## Befehle

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

## Eigenständige Vorschau-Dateien

`npm run build && npm run export:previews` erzeugt unter `previews/YYYY-MM-DD/` je Entwurf eine HTML-Datei mit
eingebettetem CSS (plus `index.html` als Dashboard), die ohne Server im Browser geöffnet werden kann.

## Private Artifact-Links für Kunden

`npm run build && npm run export:artifacts -- <zielordner> YYYY-MM-DD` erzeugt je Entwurf eine Seite im
Artifact-Format (ohne JS-Bundle, Formular zeigt nur einen Entwurfs-Hinweis). Diese werden als private
Claude-Artifacts veröffentlicht und über das Share-Menü gezielt an den jeweiligen Betrieb freigegeben.

| Datum | Betrieb | Artifact |
|---|---|---|
| 2026-10-17 | Kushtrim Spahiu Malerarbeiten Holz- und Bautenschutz | https://claude.ai/artifact/DXuVGTA9p1n7X94bUKyoBP |
| 2026-10-17 | GSA-Elektrotechnik | https://claude.ai/artifact/Wemc9iFTyBfXdbvZ5DVkUF |
| 2026-10-17 | Patrick Faulhaber Küchen- & Möbelmontagen | https://claude.ai/artifact/QBXGRSms9pW8xq6zUtZnuU |
| 2026-10-17 | Agata Mangani | https://claude.ai/artifact/3rG55VCSPXjwJhVtp23NuM |
| 2026-10-17 | Paul-Ovidiu Asmarandi Garten- und Landschaftsbau | https://claude.ai/artifact/B77jY13wyBbs5CJSdmmMFH |
| 2026-10-18 | Alexander Jung Elektrotechnik | https://claude.ai/artifact/4L24mTcQfzX7STeXueskw5 |
| 2026-10-18 | Mehmet Cem Kurtoglu | https://claude.ai/artifact/QF6Q7CcxxevwaMj2t6Sk4r |
| 2026-10-18 | FKM Parkett | https://claude.ai/artifact/Tay6ass2iJKy9iGVkGWpki |
| 2026-10-18 | Hofladen Familie Wild | https://claude.ai/artifact/6fHwoyn9eGCf7jrafLFf5y |
| 2026-10-18 | Wunderlbare Holzhütte | https://claude.ai/artifact/G9TEJE1dvdUZWekN35qM3Y |
| 2026-10-18 | Hofladen Georg Eschbaumer | https://claude.ai/artifact/47yDWTPTGgxjvLVNtWoG8D |
| 2026-10-18 | Hofladen Schmid | https://claude.ai/artifact/Co81xxSwFu9Tu4JVwb9dkx |
| 2026-10-18 | Malermeister Yanko | https://claude.ai/artifact/AGvmh6WMcMdxNYdfpiBHy1 |
| 2026-10-18 | Dusko Jovic Bau | https://claude.ai/artifact/YL1afWjhMLe3zdkuEtpg6W |
| 2026-10-18 | Csaba Vikor (Fliesenleger) | https://claude.ai/artifact/Tvk3RRHk7KjWC9yauPiP85 |
| 2026-10-18 | AK Elektro & Kabelverlegung | https://claude.ai/artifact/TymAS43HGhu2tjommLcWLC |
| 2026-10-18 | Krasniqi Innenausbau | https://claude.ai/artifact/5F9oisj2ktoEA4tgPyLDQf |
| 2026-10-18 | Georg Buchner Hausmeisterservice | https://claude.ai/artifact/5vbnx1PYweQdRpHsqqJRbp |
| 2026-10-18 | Neheiders Milchhäusl | https://claude.ai/artifact/CCocfimysqssNUCCBZkAdj |
| 2026-10-18 | Hofladen Wirthmüller | https://claude.ai/artifact/CU2DGom9TKwYWN6VCJheUv |
| 2026-10-18 | Reitstall Schütz | https://claude.ai/artifact/2iexuZeyCDXFRL9N7Rryba |
| 2026-10-18 | Hofmanns Hofladen | https://claude.ai/artifact/Wvzfe9umrjA4AKqNcxw9tu |
| 2026-10-18 | Zimmerschmidhof – Familie Kreitmeir | https://claude.ai/artifact/JDQ67cTgJp7m5QLxGLUPbq |
| 2026-10-18 | Hofladen Voit / Biogärtnerei Voit | https://claude.ai/artifact/M87L6HkM4QPWMyraRcAXw3 |
| 2026-10-18 | Obsthof Seidinger | https://claude.ai/artifact/RBHf316V45FE6wk7R5i6dR |
| 2026-10-18 | Senftl's Hofladen | https://claude.ai/artifact/EM1yauAgAazKxmfHooiji1 |
| 2026-10-18 | Fatmir Sallahi Malerbetrieb | https://claude.ai/artifact/2hxFKeane4HL2KaMep6H3U |
| 2026-10-18 | Murat Özerol Elektrotechnik | https://claude.ai/artifact/5FFprzTXHr1yC8WaMPJSoJ |
| 2026-10-18 | Isoliertechnik Mering GbR | https://claude.ai/artifact/22ea7i5PNpWbXkkYJ9ZPLt |
| 2026-10-18 | Kufner & Weigl GmbH | https://claude.ai/artifact/XJwrZE4USpkNQRhRXgPWWE |
| 2026-10-18 | Klaus Fraider Fliesenverlegemeisterbetrieb (Reserve) | https://claude.ai/artifact/9pkCrxHoL1jKLSPiE2mddq |
| 2026-10-18 | Geflügelhof Ruhdorfer (Reserve) | https://claude.ai/artifact/GFUHWcZbMhBTAx3WEASmU4 |
| 2026-10-18 | Wohnsystem e.K. | https://claude.ai/artifact/4hUXmrmiFz5VUXx5EXutAM |
| 2026-10-18 | ARBau | https://claude.ai/artifact/5WZPaoCGvKN88qjFjMAThZ |
| 2026-10-18 | Baukonzepte Hermann | https://claude.ai/artifact/D5iv4Nu1oLtL3bTga2bWum |
| 2026-10-18 | Mateusz Oryszczak (Reserve) | https://claude.ai/artifact/QrJPRLbvNY2EdCQwAgFgqU |
| 2026-10-18 | Trockenbau Spehar (Reserve) | https://claude.ai/artifact/QZGq9NRqX9TeuxhpWRnkWt |
| 2026-10-18 | Antonio Di Venuta Fliesenleger (Reserve) | https://claude.ai/artifact/DSfJAByX2h6wAZzK7qBckC |
| 2026-10-18 | WIR WIR (Reserve) | https://claude.ai/artifact/Shb9dz4BStpMhMfufnzJFD |
| 2026-10-18 | BA-Haussanierungen | https://claude.ai/artifact/B3mH2pcu8nzzLihdre518f |
| 2026-10-18 | Domi Garten- und Hausmeisterservice | https://claude.ai/artifact/TbAsYUjdBsYd3BMhPLt6vk |
| 2026-10-18 | Theo-M.T.B | https://claude.ai/artifact/DbpShgr38Uv82zikuGmj5B |
| 2026-10-18 | Baumpflege Kanka | https://claude.ai/artifact/BQbMSby672SnxcphP6Ysyc |
| 2026-10-18 | Sbau Galabau | https://claude.ai/artifact/RLuxz3GD284ovdRvVT74sc |
| 2026-10-18 | Andrzej Jedraszczak Fliesenleger & Hausmeisterservice (Reserve) | https://claude.ai/artifact/NkvtaQ3L8hvrnFxaJr2EPP |
| 2026-10-18 | CM Trockenbau (Reserve) | https://claude.ai/artifact/DivRL6ZqKmKPU7V6MtTXgd |
| 2026-10-18 | Malsor Ceku – Bodenleger (Reserve) | https://claude.ai/artifact/FFGjceCu7FFxLL35r76Z8x |
| 2026-10-18 | Roland Bodenleger (Reserve) | https://claude.ai/artifact/QMHGLrewZYyCj89gNQb1SQ |
| 2026-10-18 | Koller Kraftbau | https://claude.ai/artifact/8Uu8PSGRgtps7SAcDiQ6Qu |
| 2026-10-18 | P&C InnoBau | https://claude.ai/artifact/TpyYdf6GDxi6pNca4tHHHp |
| 2026-10-18 | Trockenbau-Brian | https://claude.ai/artifact/8iYkrHV5Y9EZnUkDZyddfW |
| 2026-10-18 | Forstner Dienstleistungen & mehr | https://claude.ai/artifact/4CEDLDQngyh2oAnw5Lp1Vb |
| 2026-10-18 | Horst Bieder Trockenbau | https://claude.ai/artifact/2vfw4nme3xhfVJPBKbjHia |
| 2026-10-18 | Gabriel Pantiru Hausmeisterservice & Trockenbau (Reserve) | https://claude.ai/artifact/16UUUxxHfZPoQntdXnqeLG |
| 2026-10-18 | Marcin Liczberski Fliesenlegerei (Reserve) | https://claude.ai/artifact/MfPgHY6YBCXRhQpHyVGEUu |
| 2026-10-18 | BT-Trockenbau (Reserve) | https://claude.ai/artifact/9XcrHtDDThuEiLV36UXPWv |
| 2026-10-18 | Malereibetrieb M S (Reserve) | https://claude.ai/artifact/Dt2x4e3tqXKLBLGpLMEVbr |
| 2026-10-18 | Nerim Bau UG (haftungsbeschränkt) (Reserve) | https://claude.ai/artifact/SdDQs8LtSqZmZzGbmLMhj1 |

## Design-Standard der Entwürfe

Aufbau orientiert an führenden Handwerker-Websites: Kontaktleiste mit Bewertung/Telefon/E-Mail, Header mit
Anfrage-Button, Hero mit lokalem Keyword-H1 und Bewertungs-Badge, mehrstufige Schnellanfrage
(„Angebot in 60 Sekunden“), Qualitätsmerkmale, Leistungen mit Bild, Inhaber-/Über-uns-Bereich, Kennzahlen-Band,
Vorher/Nachher-Regler, Bewertungs-Zusammenfassung, Ablauf, CTA-Band, Karte des Einsatzgebiets, FAQ, Kontaktkarten +
Formular, Footer und mobile Sticky-Leiste. Effekte: Logo-Intro, gestaffelter Hero-Einstieg, Parallax,
Scroll-Reveal, hochzählende Kennzahlen, Laufband, Button-Glanz, Karten-Hover, animierte Szenen je Branche,
automatischer Vorher/Nachher-Hinweis, pulsierender Standort auf der Karte, Scroll-Fortschritt. Schriften pro Theme
über Google Fonts (mit System-Fallback); „Bewegung reduzieren“ wird respektiert. Interaktive Teile laufen über ein kleines Inline-Skript
(`components/Enhance.tsx`) und funktionieren daher auch in den Exporten.

## Branchen-Design

`site.category` (`handwerk` | `hof`) steuert den Aufbau: Handwerker bekommen Leistungen, Angebots-Assistent und
Vorher/Nachher; Höfe/Hofläden bekommen Sortiment mit Produkt-Symbolen, Einkaufs-Karte (Zeiten, Adresse, Route),
Abschnitt „Besuch & Öffnungszeiten“ (`site.hours`, nur belegte Zeiten) und Hofgalerie. `site.heroOffer` zeigt im Hero
sofort, was angeboten wird.

## Branchen & Treffsicherheit

Neben Handwerk auch Pferdehöfe/Reitställe, Bauernhöfe/Hofläden (Theme `hof`, Szene `farm`, Logo-Icons
`horseshoe`/`barn`). Website-Freiheit wird ohne Internetzugang nur über die Websuche geprüft: Pflicht sind mindestens
zwei positive Belege (z. B. Freemail-Adresse im Verzeichnis, leeres Website-Feld) und eine Suche mit ausgeschlossenen
Branchenbüchern ohne eigenen Treffer. Ein 100-%-Nachweis ist so nicht möglich – deshalb enthält jeder Lauf eine
Schnell-Check-Liste mit Google-Maps-Links und Reserve-Kandidaten.

## Entwürfe 2026-10-21

- WhatsApp-Entwürfe: https://claude.ai/artifact/9AkQPAGaGdFoEi9URcJ1SL
- Handwerker Service Oskar Pietras (Geretsried): https://claude.ai/artifact/Eg15pq9x5X1TrEoC44y1d1
- Hutter Elektroanlagen (Puchheim): https://claude.ai/artifact/HUTad1RXZEgaq9jS2dwrvL
- Elektro Arno Wörl (Olching): https://claude.ai/artifact/P2E1j2BRi6h9TS6UnkMarL
- Y.S.Gartenpflege (Hallbergmoos): https://claude.ai/artifact/KUwkg4fNea76AUtmFaZ8hX
- Marco Eder Heizung & Sanitär (Eching): https://claude.ai/artifact/S584ueoaGGRDmDoUsT9Cjq
- Florian Beka – Dienstleistungen (Wartenberg): https://claude.ai/artifact/WWHsGYPi8tU3HA3eWopTd7
- Reserve: Jimmy Müller Trockenbau (Mammendorf): https://claude.ai/artifact/Wmxg5KtyccovumYgAWtbB8
- Reserve: Attila Nemeth (Olching): https://claude.ai/artifact/KzeCpy19wdASo1ciDjgi5h
- Reserve: Muncz Spengler- und Dacharbeiten (Germering): https://claude.ai/artifact/RMVCBW5a9j1B2fvBb794Tt
- Reserve: Despa Dienstleistungen (Maisach): https://claude.ai/artifact/YKqVpgZqszYvJHkv3CfDSB

## Entwürfe 2026-10-22

- WhatsApp-Entwürfe: https://claude.ai/artifact/UB5hrLi5bvdMHWdc4chuCA
- Sezer Seymen Trockenbau (Erding): https://claude.ai/artifact/VZznR4W79e24sNA54QnHEb
- Elektroinstallation Bernd Klinder (Gröbenzell): https://claude.ai/artifact/SY9Faq132JFFWMYogn2vBV
- Winfried Drobny Gas Wasser Sanitär (Krailling): https://claude.ai/artifact/HF4vgKQEMjT3g28TnHHZK7
- Fa. Neuberger Pflasterarbeiten (Wörth): https://claude.ai/artifact/4wmBcMk8zgwSDi5GS2VkWU
- Anton Reich Zimmerei & Baumfällungen (Isen): https://claude.ai/artifact/HyckFfFfchi5XLeAEVEQEe
- Schreinerei Wolf (Geretsried): https://claude.ai/artifact/LpVZCKxfsjeqK8sTs8G67W
- Reserve: NRK HausmeisterService (Markt Schwaben): https://claude.ai/artifact/P2oJCnMoEQ7nZcybXkaPJU
- Reserve: KC Holztechnik (Ottobrunn): https://claude.ai/artifact/5XvWM6Y9zZm8YsEAQcxftj
- Reserve: SK Baumdienst (Sauerlach): https://claude.ai/artifact/AoqAoSp3R5yn91q6xQsFPz
- Reserve: Johann Hobmeier Malerbetrieb (Erding): https://claude.ai/artifact/59QUVFp8TsEiRHnFCirqav

## Entwürfe 2026-10-23

- WhatsApp-Entwürfe: https://claude.ai/artifact/HeXoEgBuU5ZNJ31D6pZ2Gz
- Pllana Handwerk und Dienstleistung (Poing): https://claude.ai/artifact/QihVPiSbQCQtrgWctZsbow
- Bernhard Keller Metallbau und Schlosserei (Bad Tölz): https://claude.ai/artifact/C2RkgE3vw3CVc89hXkK1Nj
- ASE Serviceteam A. Haxhiu (Landsberg): https://claude.ai/artifact/QWjiBLxZmLQCeNaiBhyQBH
- Trockenbau Csekk Attila (Kirchheim): https://claude.ai/artifact/94z5FkbQJce1u2NrJQXhvP
- Reserve: Dan Suciu (Taufkirchen): https://claude.ai/artifact/A9gMsCoRakj2kF2vZK5ozf
- Reserve: Tomasz Zaluski Fliesenleger (Tutzing): https://claude.ai/artifact/EmbuvHdY4QFVZsZFZM2NkC
- Reserve: Krenz Fußbodenverlegung (Weilheim): https://claude.ai/artifact/QYtP8HuXxBTUiL13r1Rs6w
- Reserve: Hausklar Dienstleistungen (Friedberg): https://claude.ai/artifact/Y2iH3Z6Jg8F7JgzV6dKn2r
- Reserve: Mafero Sonnenschutztechnik (Garching): https://claude.ai/artifact/Tonqd1kxiSF2RSugfqK8EM
- Reserve: Construktion (Murnau): https://claude.ai/artifact/WE4uK9bc9GuUtZgFkWJwNT

## Entwürfe 2026-10-24

- WhatsApp-Entwürfe: https://claude.ai/artifact/5vZuCiZwNzakWFmqs92FWK
- Molin Josef Elektroinstallation (Vaterstetten): https://claude.ai/artifact/LNT8Nk7gKJMuUjDkBfopBu
- Schlosserei Zwerger GbR (Murnau): https://claude.ai/artifact/1jgPYJNxxwThRfzQBphrcE
- GH-Bau (Karlsfeld): https://claude.ai/artifact/C2xkHQjcZMYUJgCuBBPAUU
- Panos Reinigungsservice (Karlsfeld): https://claude.ai/artifact/MomVbWEtQtRaqU8JnXzEaG
- Bajraktari Bau (Karlsfeld): https://claude.ai/artifact/3opj3Wxhckxj9XgGAeNBnL
- Parkett Stachlewitz (Dachau): https://claude.ai/artifact/7VUQ7doyjjKnDd9XLjZTdt
- Reserve: ARICI Gebäudedienst (Gilching): https://claude.ai/artifact/XyXwD8LxdcvFhZBP6odWc8
- Reserve: Ulrich Dinkelmaier Malerbetrieb (Planegg): https://claude.ai/artifact/VxX4HVR2XA2W3qdGxL2BCr
- Reserve: Fensterreinigung Weinert (Fürstenfeldbruck): https://claude.ai/artifact/S5XihKhebxJa7vTAXDj1Qb
- Reserve: Fliesenverlegung Habermann (Freising): https://claude.ai/artifact/SNGaUoLQpq2kUxCYiMNWTu

## Entwürfe 2026-10-25

- WhatsApp-Entwürfe: https://claude.ai/artifact/CPaVDT7fqBjbYyveWLsBiV
- Michael Leech Gebäudereinigung (Emmering): https://claude.ai/artifact/1Ftnb4ESKehKiB1fBRaCax
- Hausmeisterservice & Dienstleistungen Fischer (Wolfratshausen): https://claude.ai/artifact/FWKNxgrZwVKMh5K8TzNedu
- Schön Grün Gartenpflege (Münsing): https://claude.ai/artifact/J5x8MCows35JodajWTq9YX
- Reserve: Tamara Voglar Fliesenleger (Moosburg): https://claude.ai/artifact/4N4WZ4RDz57yQLC4xCkcYN
- Reserve: Fliesenlegermeister Kuisel & Stoiber GbR (Landsberg-Erpfting): https://claude.ai/artifact/4scghzq46zmyyxWVWXcm6t
- Reserve: GeNeral-Gebäudeservice (Taufkirchen/Vils): https://claude.ai/artifact/2hcaBVWPxWH3eFBW285VE7
- Reserve: MAC Gebäudereinigung (Kirchseeon): https://claude.ai/artifact/PZKkYRaN7uk5GcrHE93Wqq
- Reserve: A1 Jukic Bau (Unterhaching): https://claude.ai/artifact/CHHYSofYFF81HTTPehnGmf
- Reserve: Thomas Sachse Bodenleger (Grasbrunn): https://claude.ai/artifact/1SqCDJSdyiEH9Q8DHqpYFN
- Reserve: Hausmeisterservice Martinhilfteuch (Geretsried): https://claude.ai/artifact/W5s4zLtNapkF6ebDvjNzYx
