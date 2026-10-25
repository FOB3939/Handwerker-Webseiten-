import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "out"
HISTORY_FILE = ROOT / "history.json"
MUSIC_DIR = ROOT / "music"

WIDTH, HEIGHT, FPS = 1080, 1920, 30


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, "").strip() or default


# Inhalt
LANGUAGE = env("AUTOPILOT_LANGUAGE", "Deutsch")
CHANNEL_NAME = env("AUTOPILOT_CHANNEL_NAME", "Täglich klüger")
CLAUDE_MODEL = env("AUTOPILOT_CLAUDE_MODEL", "claude-sonnet-5-5")

# Stimme: edge-tts (kostenlos) oder ElevenLabs, wenn ein Key gesetzt ist
EDGE_VOICE = env("AUTOPILOT_EDGE_VOICE", "de-DE-ConradNeural")
EDGE_RATE = env("AUTOPILOT_EDGE_RATE", "+8%")
ELEVENLABS_API_KEY = env("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = env("ELEVENLABS_VOICE_ID")
ELEVENLABS_MODEL = env("ELEVENLABS_MODEL", "eleven_multilingual_v2")

# Stockvideos
PEXELS_API_KEY = env("PEXELS_API_KEY")

# Instagram (Instagram API mit Instagram-Login)
IG_USER_ID = env("IG_USER_ID")
IG_ACCESS_TOKEN = env("IG_ACCESS_TOKEN")
IG_API_VERSION = env("IG_API_VERSION", "v23.0")

# TikTok (Content Posting API)
TIKTOK_CLIENT_KEY = env("TIKTOK_CLIENT_KEY")
TIKTOK_CLIENT_SECRET = env("TIKTOK_CLIENT_SECRET")
TIKTOK_REFRESH_TOKEN = env("TIKTOK_REFRESH_TOKEN")
# Nicht freigegebene (unaudited) Apps dürfen nur privat posten
TIKTOK_PRIVACY = env("TIKTOK_PRIVACY", "SELF_ONLY")
