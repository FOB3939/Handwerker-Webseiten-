import type { APIRoute } from "astro";
import { SITE } from "../config/site";
// Vorschau: alles gesperrt. Live: freigegeben mit Sitemap.
export const GET: APIRoute = ({ site }) =>
  new Response(SITE.preview ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", site)}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
