# FOB Reels – automatische Instagram-Reels

Content-Baukasten für **FOB Haustechnik & Hausmeisterservice** (Weßling · München & Umgebung, fob-fm.de).
Jedes Reel: 1080×1920, 30 fps, **≈ 30 s**, Sprecher (ElevenLabs), Untertitel, Musik-Bett, Soundeffekte, Action-Übergänge.
Jeden Tag wechseln **Inhaltsformat** und **Design**, damit der Feed abwechslungsreich bleibt.

## Inhaltsformate (`"format"` in der Spec, Szenenfolge)

| format | Szenen |
|---|---|
| `problem` | hook → list(red, Ursachen) → list(Schritte) → cta |
| `top3` | hook → list(3 nummerierte Tipps) → tip → cta |
| `myth` | hook → myth → myth → cta |
| `quiz` | hook → quiz → list(check) oder tip → cta |
| `stat` | hook → stat → list(check) → cta |
| `compare` | hook → compare → tip → cta |
| `checklist` | hook → list(check, 3–4 Punkte) → cta |
| `steps` | step(Einstieg) → step 1…n (echte Fotos/Clips) → ba → cta |
| `beforeafter` | hook(photo) → ba → list(check) → cta (nur mit passenden Fotos) |

Nie zweimal hintereinander dasselbe Format.

## Design (`"style"` in der Spec)

`{"theme": dark|light|blue|gold|ice, "transition": swipe|circle|slice|zoom|glitch, "bg": speed|grid|dots|blobs|snow, "entrance": pop|slide|rise|wipe|flip}` (`ice` + `snow` passen zu Winterthemen)

## Schluss-Szene (`cta`) – ebenfalls abwechseln

| variant | Wirkung | Felder |
|---|---|---|
| *(leer)* `web` | Logo, Titel, große „fob-fm.de“, Badges | `title` |
| `book` | Kalender mit Haken, Button mit Glanz-Effekt | `title`, `button`, `note` |
| `follow` | Folgen-Button wird angetippt → „✓ Gefolgt“, @fob.haustechnik | `title`, `handle` |
| `dm` | Chat: Kundenfrage, Tipp-Punkte, FOB-Antwort | `title`, `ask`, `reply`, `note` |
| `bio` | Hüpfender Pfeil, riesiges „Link in Bio“, Logo | `title` |

Der Sprechertext der CTA passt zur Variante (z. B. follow: „Folgen Sie FOB für mehr Profi-Tipps“, dm: „Schreiben Sie uns“).
Nicht zweimal hintereinander dieselbe Variante; höchstens jedes zweite Video endet mit „fob-fm punkt de“.

Jeden Tag eine andere Kombination; theme **und** transition müssen sich vom Vortag (letzte Spec in `specs/`) unterscheiden.
Titel-Markup: `*Wort*` = Akzentfarbe, `|` = Zeilenumbruch.

## Dateien

| Pfad | Zweck |
|---|---|
| `reel.html` | Animations-Vorlage (liest `jobs/<slug>/data.js`) |
| `make_reel.py` | `script` = Sprechertext aus Spec, `build` = Video bauen |
| `render.js` | rendert Einzelbilder mit Playwright/Chromium |
| `audio.py` | erzeugt Musik-Bett und Soundeffekte (lizenzfrei, selbst synthetisiert) |
| `topics.json` | Themenliste; erledigte Themen haben `"done": "<datum>"` |
| `specs/<datum>-<id>.json` | Drehbuch je Reel, `specs/<datum>-<id>.caption.txt` = Instagram-Text |
| `assets/` | Logo, Schriften (OFL), echte Projektfotos |

## Spec-Schema

```json
{"slug":"2026-10-28-spuelkasten-laeuft","topic":"…","scenes":[
  {"type":"hook","chip":"Problem","icon":"toilet","photo":"<optional foto-id>","title":"Max. 4 Wörter?","sub":"Kurzer Zusatz",
   "vo":"Satz 1 (Frage)","items":[{"vo":"Satz 2 – erscheint mit sub"}]},
  {"type":"list","style":"red","title":"Die Ursache","vo":"…:","items":[{"text":"Max. ~28 Zeichen","icon":"drop","vo":"…"}]},
  {"type":"list","title":"So geht's","sub":"In 4 Schritten","vo":"…","items":[{"text":"…","vo":"…"}]},
  {"type":"tip","title":"Profi-Tipp","icon":"tools","text":"Max. ~90 Zeichen","vo":"…"},
  {"type":"ba","before":"wc_before","after":"wc_after","title":"Kurzer Titel","vo":"…","items":[{"vo":"Wisch startet hier"}]},
  {"type":"cta","vo":"FOB Haustechnik – jetzt kostenlos und unverbindlich anfragen","items":[{"vo":"auf fob-fm punkt de."}]}]}
```

* Szenentypen: `hook`, `list` (`style:"red"` = Ursachen mit Icons, `"check"` = Checkliste, sonst nummeriert; max. 4 Punkte), `tip`, `ba` (Vorher/Nachher-Schieber), `cta` (immer letzte Szene), außerdem:
  * `stat`: `{"value":2000,"prefix":"","suffix":" L","title":"…","sub":"…","vo":"…","items":[{"vo":"Zahl zählt hoch"},{"vo":"sub erscheint"}]}` – nur belegbare Zahlen
  * `myth`: `{"myth":"…","fact":"…","vo":"Mythos: …","items":[{"vo":"Fakt: …"}]}` – Texte max. ~60 Zeichen
  * `quiz`: `{"question":"…","options":["A","B","C"],"answer":1,"vo":"Frage","items":[{"vo":"Richtig: …"}]}` – Optionen max. ~26 Zeichen
  * `step`: Vollbild-Foto oder Videoclip mit großer Schrittnummer, Lichtstreifen und Kamerafahrt – `{"type":"step","n":1,"photo":"<id>","title":"…","vo":"…"}` oder mit Clip `{"clip":"tiles","frames":24,"fps":12}` (Einzelbilder in `assets/clips/<name>/f01.jpg…`); ohne `n` + `chip` als Einstieg. Ideal für echte Baustellenfotos (Format `steps`).
  * `compare`: `{"title":"…","left":{"label":"…","icon":"…","text":"…"},"right":{…},"vo":"…","items":[{"vo":"rechte Seite erscheint"}]}` – Texte max. ~45 Zeichen
* Jede Szene und jeder Punkt hat einen eigenen `vo`-Satz; die Animation startet genau, wenn dieser Satz gesprochen wird.
* Gesamter Sprechertext: **52–62 Wörter** (≈ 27–30 s gesprochen, Video ≈ 30–33 s). Die Website immer als „fob-fm punkt de“ schreiben (Untertitel zeigen „fob-fm.de“).
* Icons: toilet drop faucet wrench bolt socket paint house leaf snow heatpump radiator thermo euro clock warning check key shower mold window bulb flame broom pipe phone calendar tools
* Fotos (`assets/photos/<id>.jpg`): sink_before/sink_after (Waschtisch), wc_before/wc_after (Unterputz-Spülkasten/WC), room_before/room_after (Malerarbeiten Zimmer), paint_before/paint_after (Wand grün/Spachteltechnik), facade_before/facade_after (Fassade), hedge_before/hedge_after (Heckenschnitt), courtyard (Wohnanlage/Hausmeister), stairs (Treppenhaus/Boden-Reinigung), siphon (schwarzer Designsiphon), faucet (Armatur-Montage), floor_raw (Boden ausgeglichen, Rohzustand), foil (Boden abgedeckt), radiator_before/radiator_after (Rippenheizkörper lackieren), tiles_level (Bodenfliesen mit Nivelliersystem), vinyl (Vinylboden verlegen); Clip: tiles (Fliesenspiegel verfugt)

## Ablauf je Reel

```bash
python3 make_reel.py script specs/<slug>.json          # Sprechertext
# ElevenLabs: creative_generate_speech  model eleven_v4, voice bId7l4pzWUdrCQ23uBlT ("Mark"), generations_count 1
#   -> content_url per curl nach jobs/<slug>/vo.mp3
# ElevenLabs: creative_transcribe_audio  connect_from=[node_id der Sprachausgabe], eleven_scribe_v1
#   -> words_download_url per curl nach jobs/<slug>/words.json
python3 make_reel.py build specs/<slug>.json jobs/<slug>/vo.mp3 jobs/<slug>/words.json --stills   # Kontrollbilder
python3 make_reel.py build specs/<slug>.json jobs/<slug>/vo.mp3 jobs/<slug>/words.json            # -> jobs/<slug>/reel.mp4
```

## Inhaltliche Regeln

* Fakten müssen stimmen; keine Preise oder Versprechen erfinden. Bekannte Fakten zur Firma: Netzwerk aus Meisterbetrieben
  (Sanitär, Elektro, Maler, Bad, Fassade), Hausmeisterservice, Grünpflege, Treppenhausreinigung, Luft-Wasser-Wärmepumpen,
  FOB Strom (Strom & Gas kostenlos vergleichen), über 100 positive Bewertungen auf MyHammer, kostenlose & unverbindliche Anfrage.
* Bei Strom, Gas und Heizungsanlagen **keine Heimwerker-Anleitung** – immer „vom Fachbetrieb prüfen lassen“.
* Ton: Sie-Form, freundlich, kompetent, kurze Sätze. Hook in den ersten 2 Sekunden als Frage.
