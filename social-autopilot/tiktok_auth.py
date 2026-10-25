"""Einmalig: TikTok-Refresh-Token holen.

    TIKTOK_CLIENT_KEY=... TIKTOK_CLIENT_SECRET=... TIKTOK_REDIRECT_URI=https://... python tiktok_auth.py
"""
import os
import secrets
import urllib.parse

import requests

key = os.environ["TIKTOK_CLIENT_KEY"]
secret = os.environ["TIKTOK_CLIENT_SECRET"]
redirect = os.environ["TIKTOK_REDIRECT_URI"]

url = "https://www.tiktok.com/v2/auth/authorize/?" + urllib.parse.urlencode({
    "client_key": key,
    "response_type": "code",
    "scope": "user.info.basic,video.publish",
    "redirect_uri": redirect,
    "state": secrets.token_urlsafe(8),
})
print("1) Diese URL im Browser öffnen und mit dem Kanal-Konto anmelden:\n\n" + url + "\n")
back = input("2) Die komplette URL, auf die TikTok danach weiterleitet, hier einfügen: ").strip()
code = urllib.parse.parse_qs(urllib.parse.urlparse(back).query)["code"][0]

r = requests.post(
    "https://open.tiktokapis.com/v2/oauth/token/",
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={"client_key": key, "client_secret": secret, "code": code,
          "grant_type": "authorization_code", "redirect_uri": redirect},
    timeout=30,
).json()
if "refresh_token" not in r:
    raise SystemExit(f"Fehler: {r}")
print("\nTIKTOK_REFRESH_TOKEN (als GitHub-Secret speichern):\n" + r["refresh_token"])
