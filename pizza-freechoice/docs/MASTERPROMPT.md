# Master-Prompt für Claude Code: Pizza Freechoice

Kopiere den gesamten folgenden Auftrag in Claude Code. Öffne vorher den entpackten Projektordner mit dem Unterordner bilder. Die beigefügten Bilder sind KI-bearbeitete beziehungsweise KI-inszenierte Entwürfe. Details stehen im BILDPLAN.md.

---

Du entwickelst eine vollständige, hochwertige, mehrseitige Website für den Pizza-Lieferservice „Pizza Freechoice“. Übernimm Recherche, Konzeption, UX, Design, deutsche Texte, technische Umsetzung, Bildintegration und Qualitätssicherung. Arbeite bis zur funktionierenden privaten Vorschau, statt bei einem Konzept aufzuhören.

## 1. Geschäft und belegte Ausgangslage

Die bereitgestellten Screenshots zeigen:
- Den Namen Pizza Freechoice / Free Choice.
- Eine gelbe Ladenbeschilderung mit roten und dunklen Logoakzenten.
- Die Bezeichnung Pizza Heimservice.
- Ein Pizza-Foto mit verschiedenen sichtbaren Belägen.

Die Bilder belegen keine aktuelle Speisekarte, Rezeptur, Anschrift, Telefonnummer, Öffnungszeiten oder Lieferbedingungen. Die Screenshot-Preise können veraltet sein. Nichts davon ungeprüft übernehmen.

Noch zu bestätigen:
- Vollständiger Firmenname und Betreiber.
- Stadt, Straße, Hausnummer, Postleitzahl.
- Telefonnummer und geschäftliche E-Mail.
- Aktuelle Speisekarte, Größen, Zutaten, Allergene, Zusatzstoffe und Preise.
- Öffnungszeiten, Feiertagsregeln, Abholzeiten.
- Liefergebiet, Lieferkosten und Mindestbestellwert.
- Tatsächliche Bestellplattform beziehungsweise Backend.
- Zahlungsarten, verantwortliche Rechtstexte und Bildrechte.
- Original-Logo als saubere Datei.

Leite Standort oder Bestell-URL nicht aus KI-generierten Bildbeschriftungen ab. Diese sind keine Quellen. Vermische dieses Projekt nicht mit dem früheren Silver-Stage-Studio-Projekt.

## 2. Ziel und Arbeitsmodus

Ziel: Auf dem Handy schnell verstehen, was es gibt, die passende Pizza finden und über einen echten Bestellweg bestellen können. Gleichzeitig soll die Website appetitlich und individuell wirken.

Prüfe zuerst Repository, Projektanweisungen, vorhandenen Stack, Paketmanager und Assets. Nutze bestehende Architektur, wenn sinnvoll. Vermeide unnötige Migrationen.

Fehlende Geschäftsdaten werden zentral als offen dokumentiert. Baue eine private Vorschau trotzdem vollständig. Keine erfundenen Bewertungen, Preise, Angebote, Öffnungszustände, Lieferzeiten oder Unternehmensgeschichten veröffentlichen.

Unterscheide:
- Private Demo mit ausdrücklich gekennzeichneten Testdaten.
- Produktive Website ausschließlich mit bestätigten Daten und funktionsfähiger Bestellanbindung.

Wähle standardmäßig eine schlanke Website mit bestätigtem externem Bestelllink. Einen eigenen produktiven Checkout nur implementieren, wenn Backend, Geschäftsregeln und Zahlungsanbieter tatsächlich vorliegen. Keine Bestellung an ein Restaurant und keine Zahlung auslösen, um die Vorschau zu testen.

## 3. Skill-Anforderungen

Dies sind fachliche Skill-Module, keine Behauptung, dass Plugins bereits installiert sind. Prüfe verfügbare Skills und verwende passende tatsächlich vorhandene Werkzeuge. Fehlt ein Skill, führe die beschriebenen Aufgaben direkt aus und dokumentiere Werkzeuggrenzen.

### A. Restaurant-UX und Bestellwege
Plane klare Navigation, mobile Bestellaktionen, Menü-Kategorien, Produktauswahl, Liefer-/Abholmodus und verständliche Zustände. Minimiere Schritte zur tatsächlichen Bestellung. Kein Pflichtkonto.

### B. Frontend-Design und Markenführung
Entwickle ein durchgängiges Designsystem mit warmer Food-Bildsprache, gelben Markenakzenten, guter Typografie und eigenständigen Komponenten. Vermeide austauschbare Template-Optik.

### C. Food-Bilder und Asset-Management
Prüfe alle zehn Einzelbilder, ordne sie gemäß BILDPLAN zu, optimiere Auslieferung und Ausschnitte. Bilder 04–10 sind illustrative Szenen derselben Pizza-Art, keine sieben verschiedenen Menüprodukte. KI-Fassadentexte sind nicht verlässlich.

### D. Deutsche Gastronomie-Texte
Schreibe konkret, freundlich und durchgehend mit Du. Keine unbelegten Aussagen wie „beste Pizza“, „seit 1995“, „Bio“, „hausgemacht“, „Steinofen“, „kostenlose Lieferung“ oder „in 20 Minuten bei dir“.

### E. Menü- und Bestelllogik
Trenne Produkte, Größen, Extras, Verfügbarkeit und Preise. Verwende Cent-Beträge für Berechnungen. Prüfe Mengen, Varianten, Liefergebühren und Bestellzustände. Kein Fake-Checkout.

### F. Responsive Entwicklung
Sauberes semantisches HTML, komponentenbasierte Struktur, TypeScript wo passend, robuste mobile Navigation und verständliche Fehlerzustände.

### G. Motion Design
Kurzes, zum Pizza-Service passendes Markenintro und dezente Interaktionen. Überspringbar, ohne ungefragten Ton und mit Reduced-Motion-Alternative.

### H. Barrierearme Bedienung
Tastaturbedienung, klare Fokuszustände, ausreichende Kontraste, echte Formularlabels, große Touch-Flächen und gut zugängliche Dialoge. Ziel WCAG 2.2 AA; keine ungeprüfte Konformität behaupten.

### I. Lokale und technische SEO
Lokale Suchbegriffe erst nach bestätigtem Standort. Individuelle Metadaten, eindeutige URLs, Restaurant-Strukturdaten mit bestätigten Angaben, Sitemap, korrekte Canonicals und Weiterleitungsplan.

### J. Performance und Medien
Responsive Bilder, reservierte Bildabmessungen, wenig JavaScript und keine blockierenden Videos. Messwerte wirklich erheben und Grenzen nennen.

### K. Datenschutz und Anwendungssicherheit
Nur notwendige Daten, sichere Backendvalidierung, serverseitige Geheimnisse, kontrollierte externe Einbettungen und keine Kundendaten im Analytics-Tracking.

### L. Browser-QA und Übergabe
Desktop und Mobilansichten visuell prüfen, Interaktionen testen, Fehler beheben und echte Testergebnisse dokumentieren. README, Konfiguration und offene Veröffentlichungspunkte liefern.

Optional: Wenn der Nutzer diese Module später als wiederverwendbare Claude-Code-Skills speichern will, unterstützt Claude Code projektbezogene Ordner unter .claude/skills/<name>/SKILL.md. Die Module in diesem Prompt funktionieren bereits ohne Installation. Nicht behaupten, dass durch das Lesen dieses Prompts Skills installiert wurden.

## 4. Designrichtung

Gestalte einen modernen lokalen Pizza-Service: appetitlich, warm, direkt und professionell. Keine Silber-/Tonstudio-Optik und keine Automobilbilder.

Palette als Ausgangspunkt:
- Warmes Creme #FFF8EB für Inhaltsflächen.
- Dunkles Braun-Anthrazit #211A16 für Hero, Footer und Text.
- Sonnengelb #F5BD22 als Bezug zum Laden.
- Tomatenrot #B83325 als sparsame Nebenfarbe.
- Weiß für helle Flächen.

Kontraste anhand realer Kombinationen prüfen; gelbe Buttons erhalten dunkle Schrift.

Typografie:
- Markante, freundliche Display-Sans für Überschriften.
- Sehr gut lesbare Schrift für Menü, Zutaten und Preise.
- Höchstens zwei lizenzierte, möglichst lokal geladene Familien.
- Fließtext ungefähr 16–18 px, klare Preis-Hierarchie.
- Keine unleserliche Schreibschrift in der Speisekarte.

Layout:
- Große Food-Fotos, ruhige Flächen und klare Raster.
- Gerundete Ecken sparsam und konsistent.
- Desktop maximal etwa 1200–1320 px Inhaltsbreite.
- Mobile Innenabstände etwa 20 px.
- Sticky Bestellaktion auf Mobilgeräten mit sicherem Abstand zur Browserleiste.
- Die Aktion darf weder Inhalt noch Datenschutzdialoge überdecken.

Verwende bis zum Original-Logo eine saubere Textwortmarke „Pizza Freechoice“. Keine aus KI-Fassadenbildern ausgeschnittene, möglicherweise verfälschte Logo-Datei als Original ausgeben.

## 5. Echte Seitenstruktur

Erstelle eigenständige, direkt aufrufbare Seiten:
- / — Startseite.
- /speisekarte/ — strukturierte Speisekarte.
- /bestellen/ — klarer Einstieg in den echten Bestellprozess.
- /lieferung-abholung/ — bestätigte Bedingungen und Ablauf.
- /ueber-uns/ — nur belegte Informationen, Ladenbilder nach Freigabe.
- /kontakt/ — Adresse, Telefon, Anfahrt und Öffnungszeiten nach Bestätigung.
- /allergene-zusatzstoffe/ — nur bestätigte Daten.
- /impressum/
- /datenschutz/

Hauptnavigation:
Speisekarte · Lieferung & Abholung · Über uns · Kontakt
Hervorgehobene Aktion: Jetzt bestellen.

Kein Onepager als Ersatz für echte Unterseiten. Gemeinsamer Header, Footer und konsistente aktive Navigation.

## 6. Startseite

1. Hero: 04-hero-desktop, auf schmalen Displays 05-hero-mobil.
2. Kleine Wortmarke „Pizza Freechoice“.
3. Überschrift-Vorschlag: „Dein Pizza-Moment.“
4. Text-Vorschlag: „Entdecke unsere Speisekarte und finde deine nächste Lieblingspizza.“
5. Hauptaktion „Jetzt bestellen“, Zweitaktion „Speisekarte ansehen“.
6. Bestätigte Liefer-/Abholinformation kompakt unter dem Einstieg.
7. Menüvorschau mit echten Produkten; keine „Bestseller“ ohne Daten.
8. Appetitliche Detailaufnahme 07 als ruhiger visueller Abschnitt.
9. Drei nachvollziehbare Schritte: auswählen, Bestellweg öffnen, Lieferung oder Abholung gemäß realem Angebot.
10. Über-uns-Teaser mit geprüfter Ladenaufnahme.
11. Kontakt und bestätigte Öffnungszeiten.
12. Klarer Footer mit Speisekarte, Allergenen, Rechtlichem und Bestelllink.

Die zehn Bilder sind Auswahlmaterial. Nicht alle Bilder auf die Startseite laden oder zwanghaft hintereinander zeigen.

## 7. Speisekarte und Datenmodell

Die Speisekarte muss HTML-basiert, durchsuchbar und mobil gut lesbar sein; kein PDF als einziger Zugang.

Produktfelder:
id, slug, name, description, category, image, imageStatus, variants, extras, allergens, additives, availability, verifiedAt.

Varianten:
id, label, sizeCm falls bestätigt, priceCents.

Extras:
id, label, priceCents, permittedProductIds.

Verwende nur bestätigte Kategorien. Bilder von Pasta und Desserts auf der alten Schaufensterfolie belegen keine aktuelle Produktverfügbarkeit.

Filter für vegetarisch, vegan oder glutenfrei nur mit bestätigter Rezeptur und belastbaren Betriebsangaben. Fehlende Daten bedeuten „nicht bestätigt“, niemals automatisch „allergenfrei“.

Keine Zutaten, Allergenkennzeichnungen oder Ernährungsangaben aus dem Foto ableiten. Produktbild und tatsächlich gelieferte Pizza müssen zusammenpassen.

Ohne echte Speisekarte:
- In der privaten Vorschau wenige ausdrücklich markierte Demo-Einträge.
- Demopreise und Demobestellung zentral isolieren.
- Ein Produktionscheck verhindert unbestätigte Daten und aktive Kaufbuttons.
- Keine null-Euro-Produkte als scheinbar kostenloses Angebot.

## 8. Bestellen ohne vorgetäuschte Funktion

Modus A — externer Bestellanbieter:
- Nur bestätigte URL verwenden.
- Link als Wechsel zum Anbieter verständlich machen.
- Keine behauptete Warenkorbübergabe ohne echte Schnittstelle.
- Preise und Zustände nur synchronisiert anzeigen oder Änderungen beim Anbieter klar berücksichtigen.

Modus B — eigener Checkout, nur bei verfügbarer Infrastruktur:
- Liefer-/Abholmodus.
- Liefergebietsprüfung anhand bestätigter Regeln.
- Produktvarianten, Extras, Mengen und Entfernen.
- Lieferkosten, Mindestbestellwert und vollständige Summe vor Abschluss.
- Betriebszeiten, Ausnahmezeiten und Nichtverfügbarkeit berücksichtigen.
- Serverseitige Preisberechnung, kein Vertrauen in Clientpreise.
- Bestell-Idempotenz gegen Doppelbestellungen.
- Zahlungsstatus über bestätigte Provider-Rückmeldung/Webhook.
- Erfolgsseite erst nach tatsächlicher serverseitiger Bestätigung.
- Zahlungsanbieter gehostet anbinden; keine selbst gespeicherten Kartendaten.
- Fehlgeschlagene Zahlung, abgelaufene Sitzung und Wiederholungen sauber behandeln.

Ohne Anbindung:
Demo eindeutig kennzeichnen und keine Bestellung als eingegangen bestätigen. Telefonaktion nur mit bestätigter Telefonnummer aktivieren. Keine Daten an improvisierte Empfänger senden.

## 9. Kurzer Pizza-Wow-Einstieg

Übernimm den Wunsch nach einem etwa dreisekündigen, geschäftlich passenden Einstieg:
- 0–0,7 s: warmer Lichtakzent und eine dünne kreisförmige Linie als Pizza-Andeutung.
- 0,7–1,7 s: zwei bis drei reduzierte Zutatenformen oder ein dezenter Pizza-Slice-Akzent bewegen sich in Position.
- 1,7–2,8 s: Wortmarke erscheint und geht in den sichtbaren Hero über.
- Spätestens ungefähr 3 s ist die Animation abgeschlossen.

Der Bestellweg bleibt sofort erreichbar. Kein Vollbild-Zwang, keine künstliche Ladeanzeige, kein Autoplay-Sound. Die Animation läuft einmal pro Sitzung, nicht auf jedem Unterseitenaufruf. „Überspringen“ und Escape funktionieren. Bei reduzierter Bewegung sofort statischer Hero.

Nutze CSS/SVG oder eine kleine vorhandene Animationsbibliothek. Kein schweres 3D-System nur für den Einstieg. Der Hero darf nicht erst nach dem Intro geladen werden. Messe Performance auch beim Erstbesuch.

Ein zusätzliches Spiel ist für dieses Pizza-Projekt kein Pflichtbestandteil: Die Bestellfunktion hat Vorrang. Ein Pizza-Konfigurator darf nur reale Varianten anbieten, kein fiktives Sortiment.

## 10. Bilder richtig einsetzen

Lies BILDPLAN.md vor der Integration. Nutze die zehn nummerierten Einzeldateien aus bilder/.

- 01 und 02: KI-bearbeitete Ladenansichten mit veränderten Kleinschriften. Nur als Entwurf; vor Veröffentlichung Originalabgleich oder echte neue Fotos.
- 03: KI-optimierte Pizza auf Basis der Vorlage, ebenfalls kein pixelgetreues Original.
- 04–10: neu inszenierte KI-Motive, keine dokumentarischen Aufnahmen.
- Nicht als verschiedene Pizzasorten labeln.
- Keine künstlichen Szenen als reale Küche, Personal oder tatsächliche Verpackung ausgeben.
- Prüfe Nutzungsrechte der auf Screenshots als Yelp-Bilder bezeichneten Vorlagen. KI-Bearbeitung ersetzt keine Rechteklärung.
- Der Betreiber muss Produktdarstellung und finale Motivauswahl bestätigen.

Für die Website:
- Erzeuge bei verfügbaren Bildwerkzeugen WebP/AVIF plus passende Fallbacks.
- Responsive Größen ohne unnötiges Hochskalieren.
- Desktop- und Mobil-Hero über picture/art direction passend ausliefern.
- Hauptmotiv nicht unvorteilhaft beschneiden.
- LCP-Bild priorisieren, andere Bilder lazy laden.
- Bildabmessungen setzen, Alt-Texte sachlich formulieren.
- Kein Text in das Bild einbrennen; Headlines und Buttons bleiben HTML.

## 11. Technik, SEO und Rechtstext-Vorbereitung

Nutze den vorhandenen Stack. Bei einem neuen Informationsauftritt ist eine schlanke vorgerenderte Lösung sinnvoll; bei einem echten eigenen Checkout muss die Architektur die vorhandene Backendintegration unterstützen. Wähle nach Anforderungen, nicht nach maximaler Komplexität.

Zentrale Konfiguration für Geschäftsdaten, Bestell-URL, Betriebszeiten und Lieferbedingungen. Keine sensiblen Werte im Frontend oder Repository. Beispiel-Umgebungsdatei ohne Geheimnisse.

SEO:
- Pro Seite eigener Title, Description und H1.
- Lokale Begriffe erst nach bestätigter Stadt.
- Keine Standortdaten von Silver Stage übernehmen.
- Restaurant-/Menu-Strukturdaten nur mit belegten Angaben.
- Keine erfundenen Bewertungssterne.
- Sitemap, Canonicals und Robots passend zu Vorschau/Produktion.
- Preview nicht indexieren, bei Veröffentlichung bewusst umstellen.
- Vorhandene Domain und Alt-URLs erst prüfen, dann Weiterleitungen planen.

Datenschutz/Rechtliches:
- Betriebsdaten und tatsächliche Dienste für Impressum und Datenschutzhinweise erfassen.
- Allergene und Zusatzstoffe vom Betreiber übernehmen und prüfen lassen.
- Keine pauschale Zusage rechtlicher Konformität.
- Externe Karte zunächst durch Routenlink oder bewusstes Nachladen ersetzen.
- Keine unnötigen Trackingdienste oder bedeutungslosen Cookie-Banner.
- Keine E-Mail-Adressen, Lieferadressen oder Bestellnotizen in Analyseereignisse schreiben.
- Rechtstexte und Checkout-Beschriftung vor Livegang passend zum realen Betrieb prüfen lassen.

## 12. Tests und Abnahme

Mindestens 360, 390, 768, 1024 und 1440 px prüfen.
- Keine horizontalen Überläufe.
- Alle Routen direkt erreichbar.
- Navigation und Sticky-Aktionen verdecken keinen Inhalt.
- Intro überspringbar; wiederholte Besuche und Reduced Motion funktionieren.
- Bilder korrekt zugeordnet, keine kaputten Pfade.
- Speisekarte, Suche und leere Suchergebnisse verständlich.
- Tastatur, Fokus, Dialoge und Formularlabels prüfen.
- Echte Bestelllinks prüfen, keine realen Testbestellungen abschicken.
- Bei eigenem Checkout: Preislogik, Varianten, Gebühren, Limits, Doppelbestellungen und Fehlerpfade mit Sandboxdaten testen.
- Konsole, Build und Typechecks ohne bekannte Fehler.
- Mobile Ladezeiten messen und dokumentieren.
- Zielwerte: LCP höchstens 2,5 s, CLS höchstens 0,1; INP als Feldziel höchstens 200 ms. Keine garantierten oder erfundenen Werte.
- Desktop-/Mobil-Screenshots erstellen, visuell kontrollieren und sichtbare Mängel beheben.

Lieferumfang:
1. Vollständiger Quellcode und startbare private Vorschau.
2. Verwendete und optimierte Assets.
3. Zentrale Inhaltsdaten und Konfiguration.
4. README mit Start, Build, Deployment und Inhaltsänderungen.
5. Dokumentierte Bestellanbindung oder eindeutig benannter Anschlussbedarf.
6. Testprotokoll mit durchgeführten und offenen Prüfungen.
7. Liste der Betreiberfreigaben vor Veröffentlichung.

Beginne jetzt mit dem vorhandenen Ordner, dem Bildplan und den verfügbaren Skills. Entscheide kurz die Architektur und setze anschließend die komplette private Vorschau um. Frage nur bei echten Blockern; arbeite bei fehlenden Geschäftsdaten mit klar getrennten Demo-Inhalten weiter. Veröffentliche erst nach ausdrücklichem Auftrag.

---

Technische Referenz zur optionalen Skill-Einrichtung:
https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
Die Skill-Module oben sind Projektanweisungen, kein vorinstalliertes Pluginpaket.

