# Brief Tageslauf 2026-10-21 – Handwerker ohne Website

Repo: /home/user/Handwerker-Webseiten- (Branch daily-leads/2026-10-21). Antworte/schreibe auf Deutsch.

## Ziel
Kleine Handwerksbetriebe (alle Gewerke) im Münchner Umland, die einen Google-Eintrag haben (gern neu, 1–40 Bewertungen), aber KEINE eigene Website. Für jeden angenommenen Betrieb schreibst du eine Datei `data/leads/2026-10-21/firma-N.json` (deine Nummern stehen im Auftrag).

## Regionen heute
G1 Germering, Puchheim, Gilching, Gauting, Planegg, Krailling
G2 Fürstenfeldbruck, Olching, Maisach, Emmering, Gröbenzell, Mammendorf
G3 Dachau, Karlsfeld, Bergkirchen, Markt Indersdorf, Petershausen, Hebertshausen
G4 Freising, Neufahrn, Eching, Moosburg, Allershausen, Hallbergmoos

Gewerke bunt mischen: Sanitär/Installateur, Heizung, Elektro, Schreiner/Tischler, Zimmerer, Dachdecker, Spengler, Maler, Fliesen, Boden/Parkett, Trockenbau, Innenausbau, Maurer, Fassade, Pflaster, GaLaBau/Gartenpflege, Baumpflege, Fenster/Rollladen, Küchen-/Möbelmontage, Metallbau/Schlosser, Hausmeister, Reinigung, Entrümpelung, Renovierung. Bevorzugt Gewerke, die bisher selten waren: Sanitär/Heizung, Elektro, Schreiner, Zimmerer, Dachdecker, Spengler, Metallbau, Fenster/Rollladen, Pflaster, Fassade.
Bevorzugt: öffentlich gelistete MOBILNUMMER (015x/016x/017x).

## Tabu
Datei `/tmp/claude-0/-home-user-Handwerker-Webseiten-/8a3a7cf8-d040-5109-86e0-21e953ed9fe2/scratchpad/taboo.txt` – diese Betriebe NIE verwenden (bereits Lead oder verworfen).

## Such-Playbook (WebSearch)
1. Entdeckung: 11880-Snippets (allowed_domains ["11880.com"], „<Gewerk> <Ort>“) – zeigen oft E-Mail/Handy. Freemail-Kandidaten (gmail, googlemail, web.de, gmx, t-online, yahoo, outlook, aol, icloud, mail.de) vormerken. Ebenso dasoertliche.de, gelbeseiten.de, cylex.de, Gemeinde-Branchenverzeichnisse.
2. Google-Beleg über Spiegel (trustlocal.de, firmania, rgv-bayern.de): nur kleine Betriebe (Personenname, < 40 Bewertungen).
3. Prüfung je Kandidat (max. 4 Suchen, beim ersten Website-Treffer abbrechen): (a) Name + Ort mit blocked_domains [11880.com, gelbeseiten.de, dasoertliche.de, dastelefonbuch.de, cylex.de, meinestadt.de, creditreform.de, facebook.com, instagram.com, golocal.de, my-hammer.de, northdata.de, firmenwissen.de, werkenntdenbesten.de, yelp.de, trustlocal.de, wlw.de]; (b) ein kombinierter Domain-Check (6–8 naheliegende Domains, allowed_domains); (c) Telefonnummer-Suche; (d) „Impressum“ + Inhaber + Ort.
Vermeiden: WebFetch, Privatadressen-Suchen, Betriebe > 50 Bewertungen, GmbHs, E-Mail mit Firmendomain (= verwerfen).

## Kriterien (STRENG)
Angenommen nur mit (A) Google-Eintrag belegt ODER Freemail öffentlich belegt – UND (B) alle Prüfungen negativ.
- Verwerfen bei: eigener Domain, Baukasten-Seite (jimdo, wix, site123, .de.tl, webnode, business.site, Google Sites, one.com), Online-Shop, E-Mail auf eigener Domain, „Homepage: …“ in Verzeichnissen, Familien-/Schwesterbetrieb mit Website am Ort.
- Ohne Google-Beleg UND ohne Freemail → nur RESERVE: manualChecks[0] beginnt mit „RESERVE – weder Google-Eintrag noch Freemail-Adresse belegt: NUR versenden, wenn Google Maps einen Eintrag OHNE Website zeigt.“ Sonst manualChecks[0]: „Website-Risiko: niedrig|mittel – vor Versand in Google Maps prüfen, dass keine Website hinterlegt ist (Grund: …)“.
- Kontaktdaten nur öffentlich belegt, nie raten. Bewertungen (rating/count) nur wenn belegt, sonst weglassen.
- Keine Fakten erfinden (keine Jahre, Teamgrößen, Zertifikate, Zitate, Bewertungstexte), wenn nicht belegt. Leistungen nur, wenn belegt oder für das Gewerk selbstverständlich.
- Keine Fotos/Logos des Betriebs übernehmen.

## Datei schreiben
Lies ZUERST lib/types.ts und die Vorlage data/leads/2026-10-18/firma-75.json und halte dich EXAKT an das Schema (gleiche Felder, gleiche Struktur). Werte individuell neu, nichts von der Vorlage übernehmen außer Struktur.
- slug: kebab-case firma-ort (ASCII, ä→ae usw.).
- site.category "handwerk"; company.trade präzise (z. B. „Sanitär & Heizung“, „Elektroinstallation“, „Schreinerei“, „Dachdecker“, „Fliesenleger“, „Malerbetrieb“, „Trockenbau“, „Garten- und Landschaftsbau“, „Hausmeisterservice“).
- Texte wie von einer Agentur (Skill writing-guidelines): individuell (Ort, belegte Leistungen), aktive Sprache, konkrete Nutzen statt Werbefloskeln – verboten u. a. „Qualität zu fairen Preisen“, „Ihr zuverlässiger Partner“, „rundum sorglos“, „höchste Qualität“, „kompetent und zuverlässig“, „wir sind für Sie da“, „Nr. 1“. Hero-Überschrift höchstens 7 Wörter, Unterzeile höchstens 18 Wörter (wird von scripts/check-unique.mjs geprüft). hero.headline max. ~6 Wörter (Gewerk + Ort), hero.sub ein Satz (max. ~15 Wörter), heroOffer 4–6 Leistungen (1–2 Wörter), services[].title klare Leistungsnamen, gallery.items[].title 1–3 Wörter. 6 services, 4 why, 4 process, 5 gallery, 5 faq, region.places (Nachbarorte), 4 badges, 4 trust, site.quote gewerkspezifisch.
- Look-Felder (Palette/Schrift/Layout/Identity/site.look) aus der Vorlage übernehmen ist ok – sie werden danach per scripts/assign-looks.mjs neu vergeben (12 Merkmale: Palette, Schrift, 8 Hero-, 6 Leistungs-Layouts, Ecken, Logo, Intro, Projekte, Ablauf, FAQ, Bewertungen, Abschnittsfolge; je zwei Seiten unterscheiden sich in mind. 5).
- Danach `node -e "JSON.parse(require('fs').readFileSync('data/leads/2026-10-21/firma-N.json','utf8'))"` zur Kontrolle.

## Rückmeldung (kurz, am Ende)
Je angenommenem Lead: Datei, Name, Gewerk, Ort, Telefon (mobil ja/nein), E-Mail, Google-Beleg (Quelle/Bewertungen), Website-Prüfung (was gesucht), Risiko.
Dazu: verworfene Betriebe mit Grund (eine Zeile je Betrieb) und ungeprüfte Kandidaten (Name, Gewerk, Ort, Hinweis).
Keine Commits, keine git-Befehle.
