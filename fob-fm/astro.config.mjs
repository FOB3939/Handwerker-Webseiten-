// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Domain erst nach Bestätigung setzen (SITE_URL). Vorschau: noindex (PUBLIC_PREVIEW, Standard "true").
const site = process.env.SITE_URL || "https://www.fob-fm.de";
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  integrations: [sitemap({ filter: (page) => !/\/(impressum|datenschutz)\//.test(page) })],
  devToolbar: { enabled: false },
});
