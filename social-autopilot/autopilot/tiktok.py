"""Video über die TikTok Content Posting API (Direct Post, FILE_UPLOAD) veröffentlichen."""
import time
from pathlib import Path

import requests

from . import config

API = "https://open.tiktokapis.com/v2"


def refresh_tokens(refresh_token: str) -> tuple[str, str]:
    """Liefert (access_token, neues refresh_token). Access-Token gilt 24 h."""
    r = requests.post(
        f"{API}/oauth/token/",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "client_key": config.TIKTOK_CLIENT_KEY,
            "client_secret": config.TIKTOK_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        },
        timeout=30,
    )
    data = r.json()
    if "access_token" not in data:
        raise RuntimeError(f"TikTok-Token-Refresh fehlgeschlagen: {data}")
    return data["access_token"], data.get("refresh_token", refresh_token)


def _check(resp: requests.Response, what: str) -> dict:
    data = resp.json()
    err = data.get("error", {})
    if resp.status_code != 200 or err.get("code") not in (None, "ok"):
        raise RuntimeError(f"TikTok {what} fehlgeschlagen: {resp.status_code} {data}")
    return data.get("data", {})


def post_video(video: Path, title: str, access_token: str) -> str:
    auth = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json; charset=UTF-8"}

    creator = _check(requests.post(f"{API}/post/publish/creator_info/query/", headers=auth, timeout=30), "creator_info")
    privacy = config.TIKTOK_PRIVACY
    options = creator.get("privacy_level_options") or []
    if options and privacy not in options:
        print(f"[tiktok] Privacy '{privacy}' nicht erlaubt, nutze '{options[0]}'")
        privacy = options[0]

    size = video.stat().st_size
    if size > 64 * 1024 * 1024:
        raise RuntimeError("Video > 64 MB – bitte Bitrate reduzieren.")
    init = _check(
        requests.post(
            f"{API}/post/publish/video/init/",
            headers=auth,
            json={
                "post_info": {
                    "title": title[:2200],
                    "privacy_level": privacy,
                    "disable_duet": False,
                    "disable_comment": False,
                    "disable_stitch": False,
                    "is_aigc": True,
                },
                "source_info": {
                    "source": "FILE_UPLOAD",
                    "video_size": size,
                    "chunk_size": size,
                    "total_chunk_count": 1,
                },
            },
            timeout=30,
        ),
        "init",
    )
    publish_id = init["publish_id"]

    with open(video, "rb") as f:
        up = requests.put(
            init["upload_url"],
            headers={
                "Content-Type": "video/mp4",
                "Content-Length": str(size),
                "Content-Range": f"bytes 0-{size - 1}/{size}",
            },
            data=f,
            timeout=600,
        )
    if up.status_code not in (200, 201):
        raise RuntimeError(f"TikTok-Upload fehlgeschlagen: {up.status_code} {up.text[:300]}")

    for _ in range(60):
        st = _check(
            requests.post(f"{API}/post/publish/status/fetch/", headers=auth, json={"publish_id": publish_id}, timeout=30),
            "status",
        )
        status = st.get("status")
        if status == "PUBLISH_COMPLETE":
            print(f"[tiktok] Veröffentlicht ({privacy}): {publish_id}")
            return publish_id
        if status == "FAILED":
            raise RuntimeError(f"TikTok-Veröffentlichung fehlgeschlagen: {st}")
        time.sleep(10)
    print(f"[tiktok] Status nach 10 min noch offen – publish_id {publish_id}")
    return publish_id
