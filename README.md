# FOB Reels – automatische Instagram-Reels

Content-Baukasten für **FOB Haustechnik & Hausmeisterservice** (Weßling · München & Umgebung, fob-fm.de).
Jedes Reel: 1080×1920, 30 fps, 30–45 s, Sprecher (ElevenLabs), Untertitel, Musik-Bett, Soundeffekte, Action-Übergänge.
Aufbau immer **Problem → Ursache → Lösung → (Vorher/Nachher) → Call-to-Action**.

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

* Szenentypen: `hook`, `list` (`style:"red"` = Problem/Ursache mit Icons, sonst nummerierte Schritte; max. 4 Punkte), `tip`, `ba` (Vorher/Nachher-Schieber), `cta` (immer letzte Szene).
* Jede Szene und jeder Punkt hat einen eigenen `vo`-Satz; die Animation startet genau, wenn dieser Satz gesprochen wird.
* Gesamter Sprechertext: **60–85 Wörter** (≈ 30–42 s). Die Website immer als „fob-fm punkt de“ schreiben (Untertitel zeigen „fob-fm.de“).
* Icons: toilet drop faucet wrench bolt socket paint house leaf snow heatpump radiator thermo euro clock warning check key shower mold window bulb flame broom pipe phone calendar tools
* Fotos (`assets/photos/<id>.jpg`): sink_before/sink_after (Waschtisch), wc_before/wc_after (Unterputz-Spülkasten/WC), room_before/room_after (Malerarbeiten Zimmer), paint_before/paint_after (Wand grün/Spachteltechnik), facade_before/facade_after (Fassade), hedge_before/hedge_after (Heckenschnitt), courtyard (Wohnanlage/Hausmeister), stairs (Treppenhaus/Boden-Reinigung), siphon (schwarzer Designsiphon), faucet (Armatur-Montage)

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
