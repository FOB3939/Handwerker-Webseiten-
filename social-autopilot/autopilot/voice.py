"""Voiceover inkl. Wort-Zeitstempeln (für Untertitel)."""
import base64
from pathlib import Path

import requests

from . import config

Word = tuple[float, float, str]  # start, ende (Sekunden), Wort


def synthesize(text: str, out_mp3: Path) -> list[Word]:
    if config.ELEVENLABS_API_KEY and config.ELEVENLABS_VOICE_ID:
        return _elevenlabs(text, out_mp3)
    return _edge(text, out_mp3)


def _edge(text: str, out_mp3: Path) -> list[Word]:
    import edge_tts

    comm = edge_tts.Communicate(
        text, config.EDGE_VOICE, rate=config.EDGE_RATE, boundary="WordBoundary",
        connect_timeout=20, receive_timeout=90,
    )
    words: list[Word] = []
    with open(out_mp3, "wb") as f:
        for chunk in comm.stream_sync():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7
                words.append((start, start + chunk["duration"] / 1e7, chunk["text"]))
    print(f"[voice] edge-tts ({config.EDGE_VOICE}): {len(words)} Wörter")
    return words


def _elevenlabs(text: str, out_mp3: Path) -> list[Word]:
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{config.ELEVENLABS_VOICE_ID}/with-timestamps",
        headers={"xi-api-key": config.ELEVENLABS_API_KEY},
        json={"text": text, "model_id": config.ELEVENLABS_MODEL},
        timeout=120,
    )
    r.raise_for_status()
    data = r.json()
    out_mp3.write_bytes(base64.b64decode(data["audio_base64"]))

    al = data["alignment"]
    words: list[Word] = []
    buf, start, end = "", None, 0.0
    for ch, s, e in zip(
        al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    ):
        if ch.isspace():
            if buf:
                words.append((start, end, buf))
            buf, start = "", None
            continue
        if start is None:
            start = s
        buf += ch
        end = e
    if buf:
        words.append((start, end, buf))
    print(f"[voice] ElevenLabs: {len(words)} Wörter")
    return words
