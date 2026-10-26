// Interne Links mit BASE_PATH (z. B. Unterordner-Deployment)
const base = import.meta.env.BASE_URL.replace(/\/$/, "");
export const u = (path: string) => `${base}${path}`;
export const isCurrent = (current: string | undefined, href: string) => !!current && (current === href || (href !== "/" && current.startsWith(href)));
