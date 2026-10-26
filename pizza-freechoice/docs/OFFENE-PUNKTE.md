# Offene Punkte vor der Veröffentlichung (Betreiberfreigaben)

`npm run prod-check` listet die technisch erzwungenen Punkte. Ohne diese Angaben bricht der Live-Build ab.

## Muss vom Betreiber kommen
| Punkt | Wo eintragen | Stand |
|---|---|---|
| Firmierung / Betreiber, vertretungsberechtigte Person, Register, USt-IdNr. | `BUSINESS.legalName`, `/impressum/` | offen |
| Anschrift (Straße, PLZ, Ort) | `BUSINESS.street/zip/city` | offen – **nicht** aus den KI-bearbeiteten Ladenbildern ableiten |
| Telefon, E-Mail | `BUSINESS.phone/phoneHref/email` | offen |
| Öffnungszeiten, Feiertage, Abholzeiten | `BUSINESS.hours` | offen |
| Bestellweg: Anbieter und bestätigte URL | `ORDER.url`, `ORDER.provider` | offen (Bildtext „pizza-freechoice-gera.de“ ist KI-verändert und **keine** Quelle) |
| Liefergebiet, Lieferkosten, Mindestbestellwert, Zahlungsarten | `DELIVERY` | offen |
| Aktuelle Speisekarte: Kategorien, Produkte, Größen (cm), Preise, Extras | `src/config/menu.ts` | offen – derzeit nur Demo-Einträge |
| Allergene und Zusatzstoffe je Produkt | `menu.ts` → `allergens`, `additives` | offen |
| Original-Logo als Vektordatei | ersetzt Text-Wortmarke `Wordmark.astro` | offen |
| Datenschutzerklärung passend zu Hosting und Bestellanbieter | `/datenschutz/` | offen (nur Gliederung) |
| Domain und ggf. alte URLs (Weiterleitungen) | `SITE_URL`, Hosting | offen |

## Bilder (siehe `docs/BILDPLAN.md`)
- Alle zehn Motive sind KI-bearbeitet (01–03) bzw. KI-inszeniert (04–10). In der Vorschau tragen sie einen Hinweis.
- 01/02 (Ladenfront, Eingang): Kleinschriften/URLs verändert → vor Veröffentlichung Originalabgleich oder neue Fotos.
- 04–10 zeigen dieselbe Pizza-Art, **keine** verschiedenen Sorten; nicht als Produktfotos einzelner Gerichte verwenden.
- Nutzungsrechte der Vorlagen (laut Bildplan mit Yelp-Herkunftshinweis) klären.
- Betreiber bestätigt finale Motivauswahl und dass Produktbild und gelieferte Pizza zusammenpassen.

## Bewusst nicht gebaut
- Eigener Checkout / Warenkorb / Zahlung (keine Infrastruktur vorhanden).
- Filter vegetarisch/vegan/glutenfrei (keine bestätigten Rezepturen).
- Lokale SEO-Begriffe und Restaurant-Strukturdaten mit Adresse (Standort unbestätigt; JSON-LD nur im Live-Build).
- Bewertungen, „Bestseller“, Lieferzeit-Versprechen, „hausgemacht“, „Steinofen“ o. Ä. (nicht belegt).
