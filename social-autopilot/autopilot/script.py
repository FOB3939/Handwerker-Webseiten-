"""Erzeugt per Claude ein kurzes Video-Skript (Motivation oder Fakten)."""
import datetime as dt
import json
import re

from . import config

FORMATS = {
    "fakten": (
        "Ein überraschender, gut belegter Fakt (Natur, Weltall, Körper, Geschichte, Tiere, Psychologie). "
        "Nur Fakten, die in seriösen Quellen allgemein anerkannt sind – keine erfundenen Zahlen, "
        "keine Mythen. Bei Unsicherheit lieber ein anderes Thema wählen."
    ),
    "motivation": (
        "Ein kurzer, kraftvoller Motivations-Impuls (Disziplin, Durchhalten, Mindset, Gewohnheiten). "
        "Konkret und bildhaft statt Kalenderspruch. Keine Zitate, die realen Personen falsch zugeschrieben werden."
    ),
}

PROMPT = """Du schreibst das Skript für ein faceless Kurzvideo (Instagram Reel / TikTok) für den Kanal „{channel}“.
Sprache: {language}. Format heute: {fmt_name} – {fmt_desc}

Regeln:
- Erster Satz ist ein Hook, der in unter 2 Sekunden neugierig macht.
- Gesprochener Text: 90–130 Wörter (ca. 35–50 Sekunden), kurze Sätze, keine Emojis, keine Hashtags.
- Letzter Satz: kurze Aufforderung zum Folgen/Speichern.
- Diese Themen gab es schon, wähle etwas klar anderes: {used}
- search_terms: 4 englische Suchbegriffe für passende Hochkant-Stockvideos (Pexels), jeweils 1–3 Wörter, visuell konkret.

Antworte ausschließlich mit JSON in genau diesem Format:
{{"topic": "...", "title": "kurzer Titel, max 60 Zeichen", "voiceover": "...",
"search_terms": ["...", "...", "...", "..."], "caption": "1–2 Sätze für die Beschreibung",
"hashtags": ["#...", "..."]}}
Maximal 6 Hashtags."""

SAMPLE = {
    "topic": "Oktopus-Herzen",
    "title": "Dieses Tier hat drei Herzen",
    "voiceover": (
        "Wusstest du, dass ein Oktopus drei Herzen hat? Zwei davon pumpen Blut nur durch die Kiemen. "
        "Das dritte versorgt den restlichen Körper. Und jetzt wird es verrückt: Wenn der Oktopus schwimmt, "
        "hört genau dieses Herz auf zu schlagen. Deshalb kriechen Oktopusse lieber über den Meeresboden, "
        "Schwimmen ist für sie richtig anstrengend. Ihr Blut ist übrigens blau, weil es Kupfer statt Eisen "
        "transportiert. Folge für mehr Fakten, die dich staunen lassen."
    ),
    "search_terms": ["octopus", "ocean underwater", "coral reef", "deep sea"],
    "caption": "Drei Herzen und blaues Blut – der Oktopus ist ein echtes Wunder.",
    "hashtags": ["#fakten", "#wissen", "#oktopus", "#natur", "#lernen"],
}


def pick_format(day: dt.date) -> str:
    return "fakten" if day.toordinal() % 2 == 0 else "motivation"


def generate(used_topics: list[str], fmt: str, api_key: str) -> dict:
    if not api_key:
        print("[script] Kein ANTHROPIC_API_KEY – nutze Beispielskript.")
        return dict(SAMPLE, format="fakten")

    import anthropic

    client = anthropic.Anthropic(api_key=api_key)
    prompt = PROMPT.format(
        channel=config.CHANNEL_NAME,
        language=config.LANGUAGE,
        fmt_name=fmt,
        fmt_desc=FORMATS[fmt],
        used=", ".join(used_topics[-60:]) or "keine",
    )
    msg = client.messages.create(
        model=config.CLAUDE_MODEL,
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(b.text for b in msg.content if b.type == "text")
    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        raise RuntimeError(f"Claude hat kein JSON geliefert: {text[:300]}")
    data = json.loads(match.group(0))
    for key in ("topic", "title", "voiceover", "search_terms", "caption", "hashtags"):
        if not data.get(key):
            raise RuntimeError(f"Feld fehlt im Skript: {key}")
    data["format"] = fmt
    return data
