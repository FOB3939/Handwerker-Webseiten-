import type { APIRoute } from "astro";
import { SITE } from "../config/site";

// Vorschau: komplett sperren. Produktion (PUBLIC_PREVIEW=false): alles erlauben + Sitemap.
export const GET: APIRoute = () => {
  const body = SITE.preview
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL(`${import.meta.env.BASE_URL}sitemap-index.xml`.replace(/\/{2,}/g, "/"), SITE.url).href}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
