# Weiterleitungsplan (alte → neue URLs)

Die bisherige Website konnte aus der Arbeitsumgebung nicht abgerufen werden. Die folgenden Alt-URLs stammen aus dem
Projektbrief und **müssen vor dem Livegang geprüft werden** (z. B. per Google Search Console oder Server-Logs).

| Alte URL | Neue URL | Status |
|---|---|---|
| `/clients` | `/ueber-uns/` | im Brief genannt, Ziel ggf. anpassen (Kundenreferenzen gibt es noch nicht) |
| `/bühnenraum` (auch kodiert `/b%C3%BChnenraum`) | `/stageroom/` | im Brief genannt |
| `/räume` (auch `/r%C3%A4ume`) | `/stageroom/` oder Startseite `/#raeume` | im Brief genannt |

Astro erzeugt dafür HTML-Weiterleitungsseiten (`astro.config.mjs` → `redirects`). Auf dem Server besser echte 301:

```apache
# .htaccess (Apache)
Redirect 301 /clients /ueber-uns/
Redirect 301 /bühnenraum /stageroom/
Redirect 301 /räume /stageroom/
```

```
# _redirects (Netlify / Cloudflare Pages)
/clients      /ueber-uns/   301
/bühnenraum   /stageroom/   301
/räume        /stageroom/   301
```
