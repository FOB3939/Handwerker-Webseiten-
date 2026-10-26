# Formular-Backend

Die Website ist statisch. Damit das Anfrageformular Nachrichten wirklich zustellt, braucht es einen kleinen Endpunkt.
`handler.js` ist eine fertige Vorlage im Web-Standard (Request → Response).

## Verhalten
- Nimmt nur `POST` mit JSON an, prüft Herkunft (`ALLOWED_ORIGIN`), Größe und alle Felder serverseitig (gleiche Regeln wie im Browser: `src/lib/validate.js`).
- Honeypot-Feld `website` gegen Bots, einfache Mengenbegrenzung je IP.
- Antwortet erst mit `200 { ok: true }`, wenn der Mail-Dienst die Nachricht angenommen hat. Nur dann zeigt die Website „Danke“.
- Bei Fehlern `4xx/5xx` → die Website zeigt eine Fehlermeldung, die Eingaben bleiben erhalten.

## Einrichten (Beispiel Cloudflare Workers)
1. Mail-Dienst wählen (Beispiel im Code: Resend), Absenderdomain dort verifizieren.
2. Worker anlegen, `handler.js` + `../src/lib/validate.js` deployen.
3. Umgebungsvariablen/Secrets setzen: `MAIL_API_KEY`, `MAIL_TO`, `MAIL_FROM`, `ALLOWED_ORIGIN`.
4. In der Website `PUBLIC_FORM_ENDPOINT=https://<worker-adresse>` setzen und neu bauen.
5. Mit einer abgesprochenen Test-Adresse prüfen – keine Testanfragen an das Studio ohne Freigabe.

Getestet ist die Logik lokal mit simuliertem Mail-Versand (`npm test`), nicht ein echter Versand.
