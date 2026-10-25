"""Rendert das 9:16-Video mit ffmpeg: Stockclips + Voiceover + Untertitel (+ Musik)."""
import json
import random
import re
import subprocess
from pathlib import Path

from . import config
from .voice import Word

ASS_HEADER = """[Script Info]
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,DejaVu Sans,92,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,7,3,5,90,90,0,1
Style: Brand,DejaVu Sans,42,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,2,0,1,3,0,2,60,60,170,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
HIGHLIGHT = r"{\c&H00E0FF&}"  # Gelb (BGR)
RESET = r"{\c&HFFFFFF&}"


def _ts(sec: float) -> str:
    cs = max(0, int(round(sec * 100)))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def _chunks(words: list[Word], max_words: int = 3) -> list[list[Word]]:
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= max_words or re.search(r"[.!?,:;]$", w[2]):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


def write_ass(words: list[Word], duration: float, path: Path) -> None:
    lines = [ASS_HEADER.format(w=config.WIDTH, h=config.HEIGHT)]
    chunks = _chunks(words)
    for ci, chunk in enumerate(chunks):
        next_start = chunks[ci + 1][0][0] if ci + 1 < len(chunks) else duration
        for wi, (start, _end, _text) in enumerate(chunk):
            end = chunk[wi + 1][0] if wi + 1 < len(chunk) else next_start
            parts = []
            for wj, (_, _, t) in enumerate(chunk):
                t = t.upper().replace("{", "").replace("}", "")
                parts.append(f"{HIGHLIGHT}{t}{RESET}" if wj == wi else t)
            text = r"{\fad(40,0)}" + " ".join(parts)
            lines.append(f"Dialogue: 0,{_ts(start)},{_ts(end)},Sub,,0,0,0,,{text}\n")
    lines.append(f"Dialogue: 0,{_ts(0)},{_ts(duration)},Brand,,0,0,0,,{config.CHANNEL_NAME}\n")
    path.write_text("".join(lines), encoding="utf-8")


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(json.loads(out)["format"]["duration"])


def render(voice_mp3: Path, words: list[Word], clips: list[Path], out_mp4: Path) -> Path:
    work = out_mp4.parent
    duration = probe_duration(voice_mp3) + 0.6
    write_ass(words, duration, work / "subs.ass")

    w, h, fps = config.WIDTH, config.HEIGHT, config.FPS
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    filters = []
    if clips:
        seg = duration / len(clips)
        for i, clip in enumerate(clips):
            cmd += ["-stream_loop", "-1", "-t", f"{seg:.3f}", "-i", str(clip)]
            filters.append(
                f"[{i}:v]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},"
                f"fps={fps},setsar=1,trim=duration={seg:.3f},setpts=PTS-STARTPTS[v{i}]"
            )
        filters.append("".join(f"[v{i}]" for i in range(len(clips))) + f"concat=n={len(clips)}:v=1:a=0[bg]")
    else:
        cmd += ["-f", "lavfi", "-t", f"{duration:.3f}", "-i", f"color=c=0x16213e:s={w}x{h}:r={fps}"]
        filters.append("[0:v]vignette=PI/4[bg]")
    n = len(clips) or 1

    cmd += ["-i", str(voice_mp3)]
    voice_idx = n
    music = sorted(p for p in config.MUSIC_DIR.glob("*.mp3")) if config.MUSIC_DIR.exists() else []
    filters.append("[bg]eq=brightness=-0.07:saturation=1.05,ass=subs.ass[v]")
    if music:
        cmd += ["-stream_loop", "-1", "-i", str(random.choice(music))]
        filters.append(
            f"[{voice_idx + 1}:a]volume=0.12[m];[{voice_idx}:a][m]amix=inputs=2:duration=first:normalize=0[a]"
        )
    else:
        filters.append(f"[{voice_idx}:a]anull[a]")

    cmd += [
        "-filter_complex", ";".join(filters),
        "-map", "[v]", "-map", "[a]",
        "-t", f"{duration:.3f}",
        "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p",
        "-profile:v", "high", "-r", str(fps),
        "-c:a", "aac", "-b:a", "160k", "-ar", "44100",
        "-movflags", "+faststart",
        out_mp4.name,
    ]
    subprocess.run(cmd, check=True, cwd=work)
    print(f"[render] {out_mp4} ({duration:.1f}s, {out_mp4.stat().st_size / 1e6:.1f} MB)")
    return out_mp4
