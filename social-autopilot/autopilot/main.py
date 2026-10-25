"""Tageslauf: Skript erzeugen, vertonen, rendern und auf Instagram + TikTok posten.

    python -m autopilot.main               # erzeugen + posten (wo Zugangsdaten vorhanden)
    python -m autopilot.main --dry-run     # nur Video erzeugen, nichts posten
"""
import argparse
import datetime as dt
import json
import os
import sys
import traceback

from . import config, instagram, render, script, stock, tiktok, voice


def load_history() -> dict:
    if config.HISTORY_FILE.exists():
        return json.loads(config.HISTORY_FILE.read_text(encoding="utf-8"))
    return {"posts": []}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="nicht posten")
    ap.add_argument("--format", choices=list(script.FORMATS), help="Format erzwingen")
    args = ap.parse_args()

    today = dt.date.today()
    out = config.OUT_DIR
    out.mkdir(parents=True, exist_ok=True)
    history = load_history()

    fmt = args.format or script.pick_format(today)
    data = script.generate([p["topic"] for p in history["posts"]], fmt, os.environ.get("ANTHROPIC_API_KEY", ""))
    print(f"[script] {data['format']}: {data['title']} ({len(data['voiceover'].split())} Wörter)")
    (out / "script.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    words = voice.synthesize(data["voiceover"], out / "voice.mp3")
    clips = stock.fetch_clips(data["search_terms"], out)
    video = render.render(out / "voice.mp3", words, clips, out / "video.mp4")

    caption = f"{data['title']}\n\n{data['caption']}\n\n{' '.join(data['hashtags'])}"
    entry = {"date": today.isoformat(), "format": data["format"], "topic": data["topic"], "title": data["title"]}
    new_tokens: dict[str, str] = {}
    failed = False

    if args.dry_run:
        print("[main] Dry-Run – es wird nichts gepostet.")
    else:
        if config.IG_USER_ID and config.IG_ACCESS_TOKEN:
            try:
                token = instagram.refresh_token(config.IG_ACCESS_TOKEN)
                if token != config.IG_ACCESS_TOKEN:
                    new_tokens["IG_ACCESS_TOKEN"] = token
                entry["instagram"] = instagram.post_reel(video, caption, token)
            except Exception:
                traceback.print_exc()
                failed = True
        else:
            print("[instagram] Keine Zugangsdaten – übersprungen.")

        if config.TIKTOK_CLIENT_KEY and config.TIKTOK_REFRESH_TOKEN:
            try:
                access, refresh = tiktok.refresh_tokens(config.TIKTOK_REFRESH_TOKEN)
                if refresh != config.TIKTOK_REFRESH_TOKEN:
                    new_tokens["TIKTOK_REFRESH_TOKEN"] = refresh
                entry["tiktok"] = tiktok.post_video(video, f"{data['title']} {' '.join(data['hashtags'])}", access)
            except Exception:
                traceback.print_exc()
                failed = True
        else:
            print("[tiktok] Keine Zugangsdaten – übersprungen.")

        history["posts"].append(entry)
        config.HISTORY_FILE.write_text(json.dumps(history, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Erneuerte Tokens für den Workflow (wird dort in GitHub-Secrets zurückgeschrieben, nie hochgeladen)
    (out / "tokens.env").write_text("".join(f"{k}={v}\n" for k, v in new_tokens.items()), encoding="utf-8")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
