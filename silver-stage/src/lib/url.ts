// Interne Links immer über u() bauen, damit ein Unterverzeichnis (BASE_PATH) funktioniert.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const u = (path: string) => `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
export const isCurrent = (current: string | undefined, href: string) => !!current && (current === href || (href !== "/" && current.startsWith(href)));
