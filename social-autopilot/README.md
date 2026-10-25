# Social Autopilot – faceless Reels & TikToks, täglich automatisch

Jeden Tag erzeugt ein GitHub-Actions-Job ein 35–50 s langes Hochkant-Video und postet es auf Instagram (Reel) und TikTok.
Die Formate wechseln täglich zwischen **Fakten** und **Motivation**.

```
Claude (Skript, JSON)  →  Stimme (edge-tts gratis / ElevenLabs)  →  Pexels-Stockclips
        →  ffmpeg: 1080×1920, Wort-für-Wort-Untertitel, optional Musik  →  Instagram + TikTok
```

`history.json` merkt sich alle Themen, damit sich nichts wiederholt. Jedes Video wird zusätzlich 14 Tage als
Workflow-Artefakt gespeichert (zum Prüfen oder manuellen Posten).

## Kosten (ca.)

| Dienst | Kosten |
| --- | --- |
| GitHub Actions | gratis (ca. 3–5 min/Tag) |
| Claude API (Skript) | wenige Cent pro Monat |
| Pexels (Stockvideos) | gratis |
| edge-tts (Stimme) | gratis · optional ElevenLabs ab ca. 5 $/Monat für eine bessere Stimme |

## Einrichtung

### 1. Instagram
1. Instagram-Konto für den Kanal anlegen und in den Einstellungen auf **Professionelles Konto** (Creator oder Business) umstellen.
2. Auf <https://developers.facebook.com> eine App anlegen, Anwendungsfall **„Instagram API mit Instagram-Login“**.
3. Unter *API-Einrichtung* das Kanal-Konto hinzufügen und einen **Zugriffstoken generieren**
   (Berechtigungen `instagram_business_basic`, `instagram_business_content_publish`). Das ist ein 60-Tage-Token –
   der Workflow verlängert ihn bei jedem Lauf automatisch (siehe `GH_PAT`).
4. Die Konto-ID abrufen:
   `curl "https://graph.instagram.com/me?fields=user_id,username&access_token=DEIN_TOKEN"` → `user_id`.

### 2. TikTok
1. TikTok-Konto anlegen, dann auf <https://developers.tiktok.com> eine App erstellen.
2. Produkte **Login Kit** und **Content Posting API** hinzufügen, dort **Direct Post** aktivieren,
   Scopes `user.info.basic` und `video.publish`, eine Redirect-URI eintragen (z. B. eure Website).
3. Refresh-Token einmalig holen:
   ```bash
   pip install requests
   TIKTOK_CLIENT_KEY=... TIKTOK_CLIENT_SECRET=... TIKTOK_REDIRECT_URI=https://eure-url.de/ python tiktok_auth.py
   ```
4. **Wichtig:** Solange TikTok die App nicht geprüft hat (*Audit*), sind alle per API geposteten Videos
   **nur für dich sichtbar** (`SELF_ONLY`). Nach dem Audit die Repo-Variable `TIKTOK_PRIVACY=PUBLIC_TO_EVERYONE` setzen.
   Bis dahin kannst du die Videos in der TikTok-App öffnen und manuell auf „Öffentlich“ stellen.

### 3. Weitere Schlüssel
- **Claude API-Key:** <https://console.anthropic.com> → `ANTHROPIC_API_KEY`
- **Pexels API-Key (gratis):** <https://www.pexels.com/api/> → `PEXELS_API_KEY`
- **Optional ElevenLabs:** `ELEVENLABS_API_KEY` (Secret) + `ELEVENLABS_VOICE_ID` (Variable)
- **GH_PAT:** Fine-grained Personal Access Token nur für dieses Repo mit *Secrets: Read and write*.
  Damit speichert der Workflow erneuerte Instagram-/TikTok-Tokens selbst – ohne ihn laufen die Tokens nach 60 Tagen
  (Instagram) bzw. spätestens nach einem Jahr (TikTok) ab.

### 4. In GitHub eintragen
*Settings → Secrets and variables → Actions*

| Secrets | Variables (optional) |
| --- | --- |
| `ANTHROPIC_API_KEY`, `PEXELS_API_KEY` | `AUTOPILOT_CHANNEL_NAME` (Wasserzeichen im Video) |
| `IG_USER_ID`, `IG_ACCESS_TOKEN` | `TIKTOK_PRIVACY` (Standard `SELF_ONLY`) |
| `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REFRESH_TOKEN` | `ELEVENLABS_VOICE_ID` |
| `GH_PAT`, optional `ELEVENLABS_API_KEY` | |

Fehlen die Zugangsdaten einer Plattform, wird sie einfach übersprungen.

### 5. Starten
- Der Zeitplan (täglich 16:17 UTC) läuft nur auf dem **Standard-Branch** des Repos – den Branch also dorthin mergen.
- Erst testen: *Actions → Social Autopilot → Run workflow* mit „Nur Video erzeugen“ = an.
  Das Video unter *Artifacts* herunterladen und anschauen.
- Danach einmal mit „Nur Video erzeugen“ = aus laufen lassen und auf beiden Plattformen prüfen.

## Anpassen
- **Musik:** lizenzfreie `.mp3`-Dateien (z. B. YouTube Audio Library, Pixabay Music) in `music/` legen –
  pro Video wird zufällig eine leise unterlegt.
- **Stimme:** Variable `AUTOPILOT_EDGE_VOICE`, z. B. `de-DE-KillianNeural` oder `de-DE-SeraphinaMultilingualNeural`.
- **Themen/Ton:** `autopilot/script.py` (`FORMATS` und `PROMPT`).
- **Uhrzeit:** `cron` in `.github/workflows/social-autopilot.yml`.

## Lokal testen
```bash
cd social-autopilot
pip install -r requirements.txt   # plus ffmpeg
ANTHROPIC_API_KEY=... PEXELS_API_KEY=... python -m autopilot.main --dry-run
# Ergebnis: out/video.mp4
```

## Hinweise
- Videos sind KI-generiert und bei TikTok entsprechend gekennzeichnet (`is_aigc`); auf Instagram ggf. das Label „KI-Info“ beachten.
- Fakten-Videos ab und zu stichprobenartig prüfen – das Prompt verlangt belegte Fakten, Fehler sind trotzdem möglich.
- Reine Massen-Automatisierung ohne Variation kann von den Plattformen gedrosselt werden. Gelegentlich Titel,
  Hook und Musik variieren und auf Kommentare reagieren hilft der Reichweite.
