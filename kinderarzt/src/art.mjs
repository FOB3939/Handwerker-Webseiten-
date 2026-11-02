// Gezeichnete Grafiken (SVG) für den Build: Sonnen-Signet und Piktogramme.
// Das Signet ist eine eigene Nachzeichnung (Sonne mit geschwungenen Strahlen), keine Kopie des Logofotos.

const RAY = "M-5.2 -25.5C-7.6 -32.5 -2.6 -37.8 1.6 -47.5C6.4 -40.2 7.4 -32.6 5.2 -25.5Q0 -23.6 -5.2 -25.5Z";
const N = 11;

/** Sonnen-Signet, viewBox -50 -50 100 100 */
export function sunMark({ cls = "sun", core = "var(--sun)", ray = "var(--sun)", title = "" } = {}) {
  const rays = Array.from({ length: N }, (_, i) =>
    `<path class="sun__ray" style="--i:${i}" d="${RAY}" transform="rotate(${((360 / N) * i).toFixed(2)})"/>`).join("");
  const t = title ? `<title>${title}</title>` : "";
  const aria = title ? 'role="img"' : 'aria-hidden="true" focusable="false"';
  return `<svg class="${cls}" viewBox="-50 -50 100 100" ${aria}>${t}<g fill="${ray}" class="sun__rays">${rays}</g><circle r="20.5" fill="${core}"/></svg>`;
}

export function favicon() {
  const rays = Array.from({ length: N }, (_, i) => `<path d="${RAY}" transform="rotate(${((360 / N) * i).toFixed(2)})"/>`).join("");
  return "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"><g fill="#F7B500">${rays}</g><circle r="21" fill="#FFC93C"/></svg>`);
}

// Piktogramme, 24er-Raster, eine Strichstärke
const P = (d) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</g></svg>`;
export const ICONS = {
  phone: () => P('<path d="M5.2 3.5h3l1.6 4-2 1.3a11 11 0 0 0 5.4 5.4l1.3-2 4 1.6v3A2 2 0 0 1 16.4 19 14 14 0 0 1 3.2 5.6a2 2 0 0 1 2-2.1z"/>'),
  pin: () => P('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>'),
  clock: () => P('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  ext: () => P('<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>'),
  arrow: () => P('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  left: () => P('<path d="M15 5l-7 7 7 7"/>'),
  right: () => P('<path d="M9 5l7 7-7 7"/>'),
  // Leistungen
  vorsorge: () => P('<path d="M7 4v5a5 5 0 0 0 10 0V4"/><path d="M12 14v2.5a3.5 3.5 0 0 0 7 0V15"/><circle cx="19" cy="13" r="2"/><path d="M5.5 4H8.5M15.5 4h3"/>'),
  impfung: () => P('<path d="M17 3l4 4M19 5l-9.5 9.5M14 6l4 4M6.5 13.5l4 4M8.5 15.5L4 20"/><path d="M11 8.5l1.5 1.5M9 10.5l1.5 1.5"/>'),
  akut: () => P('<path d="M10 3.5h4v6.5h6.5v4H14v6.5h-4V14H3.5v-4H10z"/>'),
  ultraschall: () => P('<rect x="3.5" y="4" width="11" height="9" rx="2"/><path d="M6.5 10.5a3 3 0 0 1 5 0"/><path d="M9 13v3.5M5.5 19.5h7"/><path d="M17 8.5c1.6.8 2.5 2 2.5 3.5S18.6 14.7 17 15.5"/>'),
  // Schwerpunkte
  blatt: () => P('<path class="draw" d="M5 19C5 10 10 5 20 4c-.5 9.5-5.5 15-15 15z"/><path class="draw" d="M5 19c3.5-4.5 7-7.5 11-10"/>'),
  globuli: () => P('<path class="draw" d="M9 3.5h6M10 3.5v3.2L6.2 12a6.5 6.5 0 1 0 11.6 0L14 6.7V3.5"/><circle class="draw" cx="10" cy="15.5" r="1.4"/><circle class="draw" cx="14.2" cy="17" r="1.4"/><circle class="draw" cx="13" cy="13.2" r="1.2"/>'),
  stillen: () => P('<circle class="draw" cx="9" cy="5.5" r="2.5"/><path class="draw" d="M4.5 20v-5.5A4.5 4.5 0 0 1 9 10a4.5 4.5 0 0 1 4.3 3.2"/><path class="draw" d="M11 16.5c1.2 1.7 3.2 2.5 5.3 2.3 2.4-.2 3.9-1.9 3.7-3.7-.2-1.6-1.7-2.6-3.4-2.4l-5.6.6"/><circle class="draw" cx="17.5" cy="10.2" r="1.8"/>'),
};
