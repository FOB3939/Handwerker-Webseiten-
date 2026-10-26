// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Produktionsdomain per Umgebungsvariable (noch nicht bestätigt). BASE_PATH nur setzen,
// wenn die Seite in einem Unterverzeichnis liegt (z. B. /silver-stage/).
const site = process.env.SITE_URL || "https://www.silver-stage.de";
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  integrations: [sitemap({ filter: (page) => !/\/(impressum|datenschutz)\//.test(page) })],
  // Weiterleitungsplan für bekannte Alt-URLs der bisherigen Website. Vor dem Livegang die tatsächlichen
  // Alt-URLs prüfen (siehe docs/WEITERLEITUNGEN.md); auf dem Server besser als echte 301 einrichten.
  redirects: {
    "/clients": "/ueber-uns/",
    "/räume": "/stageroom/",
    "/bühnenraum": "/stageroom/",
  },
  devToolbar: { enabled: false },
});
