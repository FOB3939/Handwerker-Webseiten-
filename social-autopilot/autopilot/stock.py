"""Hochkant-Stockvideos von Pexels laden."""
from pathlib import Path

import requests

from . import config


def fetch_clips(terms: list[str], out_dir: Path, max_clips: int = 4) -> list[Path]:
    if not config.PEXELS_API_KEY:
        print("[stock] Kein PEXELS_API_KEY – nutze Farbhintergrund.")
        return []

    clips: list[Path] = []
    seen: set[int] = set()
    for term in terms:
        if len(clips) >= max_clips:
            break
        r = requests.get(
            "https://api.pexels.com/videos/search",
            headers={"Authorization": config.PEXELS_API_KEY},
            params={"query": term, "orientation": "portrait", "size": "medium", "per_page": 8},
            timeout=30,
        )
        if r.status_code != 200:
            print(f"[stock] Pexels-Fehler {r.status_code} für '{term}'")
            continue
        for video in r.json().get("videos", []):
            if video["id"] in seen or video.get("duration", 0) < 4:
                continue
            files = [
                f for f in video["video_files"]
                if f.get("file_type") == "video/mp4" and (f.get("height") or 0) > (f.get("width") or 0)
            ]
            if not files:
                continue
            best = min(files, key=lambda f: abs((f.get("height") or 0) - config.HEIGHT))
            path = out_dir / f"clip_{len(clips)}.mp4"
            with requests.get(best["link"], stream=True, timeout=120) as dl:
                dl.raise_for_status()
                with open(path, "wb") as f:
                    for part in dl.iter_content(1 << 20):
                        f.write(part)
            seen.add(video["id"])
            clips.append(path)
            print(f"[stock] '{term}': Pexels-Video {video['id']} ({best.get('width')}x{best.get('height')})")
            break
    return clips
