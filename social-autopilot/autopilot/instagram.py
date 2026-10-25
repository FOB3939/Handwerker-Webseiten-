"""Reel über die Instagram API (Instagram-Login) hochladen – per Resumable Upload, ohne Hosting."""
import time
from pathlib import Path

import requests

from . import config

GRAPH = "https://graph.instagram.com"


def refresh_token(token: str) -> str:
    """Verlängert ein Long-Lived-Token um weitere 60 Tage (Token muss >24h alt sein)."""
    r = requests.get(
        f"{GRAPH}/refresh_access_token",
        params={"grant_type": "ig_refresh_token", "access_token": token},
        timeout=30,
    )
    if r.status_code != 200:
        print(f"[instagram] Token-Refresh übersprungen: {r.text[:200]}")
        return token
    return r.json()["access_token"]


def post_reel(video: Path, caption: str, token: str) -> str:
    ver, uid = config.IG_API_VERSION, config.IG_USER_ID

    r = requests.post(
        f"{GRAPH}/{ver}/{uid}/media",
        data={
            "media_type": "REELS",
            "upload_type": "resumable",
            "caption": caption,
            "share_to_feed": "true",
            "access_token": token,
        },
        timeout=60,
    )
    r.raise_for_status()
    container = r.json()
    cid = container["id"]
    upload_uri = container.get("uri") or f"https://rupload.facebook.com/ig-api-upload/{ver}/{cid}"

    size = video.stat().st_size
    with open(video, "rb") as f:
        up = requests.post(
            upload_uri,
            headers={"Authorization": f"OAuth {token}", "offset": "0", "file_size": str(size)},
            data=f,
            timeout=600,
        )
    if up.status_code != 200:
        raise RuntimeError(f"Instagram-Upload fehlgeschlagen: {up.status_code} {up.text[:300]}")

    for _ in range(60):
        s = requests.get(
            f"{GRAPH}/{ver}/{cid}",
            params={"fields": "status_code,status", "access_token": token},
            timeout=30,
        ).json()
        code = s.get("status_code")
        if code == "FINISHED":
            break
        if code in ("ERROR", "EXPIRED"):
            raise RuntimeError(f"Instagram-Verarbeitung fehlgeschlagen: {s}")
        time.sleep(10)
    else:
        raise RuntimeError("Instagram-Verarbeitung dauert zu lange (10 min).")

    pub = requests.post(
        f"{GRAPH}/{ver}/{uid}/media_publish",
        data={"creation_id": cid, "access_token": token},
        timeout=60,
    )
    pub.raise_for_status()
    media_id = pub.json()["id"]
    print(f"[instagram] Reel veröffentlicht: {media_id}")
    return media_id
