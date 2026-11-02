// Gezeichnete Grafiken (SVG) für den Build: Sonnen-Signet, Fallback-Standbild der 3D-Szene, Piktogramme.
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

/** Standbild ohne WebGL: Sonne hinter dem Bauklotz-Haus, Teddy, Ballon, Wolken. viewBox 0 0 800 600 */
export function heroSVG() {
  const blocks = [];
  const col = ["#ffffff", "#CFDDFB", "#FFD45C", "#ffffff", "#F7B3A6", "#CFDDFB"];
  let k = 0;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    if (r === 0 && c === 1) continue; // Tür
    const x = 300 + c * 68, y = 452 - r * 68;
    blocks.push(`<rect x="${x}" y="${y}" width="64" height="64" rx="12" fill="${col[k++ % col.length]}" stroke="#1C2A78" stroke-opacity=".12" stroke-width="2"/>`);
  }
  const rays = Array.from({ length: N }, (_, i) => `<path d="${RAY}" transform="rotate(${((360 / N) * i).toFixed(2)})"/>`).join("");
  return `<svg class="h3d__svg" viewBox="0 0 800 600" role="img" aria-labelledby="fb-t">
<title id="fb-t">Gezeichnete Szene: Eine gelbe Sonne geht hinter einem kleinen Haus aus Bauklötzen auf, daneben ein Teddy und ein Ballon.</title>
<defs><linearGradient id="fb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4ECFD"/><stop offset="1" stop-color="#FFF7E2"/></linearGradient>
<radialGradient id="fb-glow"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".9"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient></defs>
<rect width="800" height="600" fill="url(#fb-sky)"/>
<circle cx="400" cy="250" r="230" fill="url(#fb-glow)"/>
<g transform="translate(400 250) scale(3.1)" fill="#FFC93C"><g fill="#F7B500">${rays}</g><circle r="20.5"/></g>
<g fill="#fff"><ellipse cx="150" cy="150" rx="70" ry="30"/><ellipse cx="190" cy="135" rx="45" ry="32"/><ellipse cx="640" cy="110" rx="60" ry="24"/><ellipse cx="670" cy="98" rx="38" ry="26"/></g>
<ellipse cx="400" cy="530" rx="380" ry="46" fill="#F4F7FE"/>
<ellipse cx="402" cy="520" rx="150" ry="14" fill="#1C2A78" opacity=".08"/>
${blocks.join("")}
<rect x="372" y="456" width="56" height="60" rx="10" fill="#FFE7A3"/>
<path d="M372 516V466a10 10 0 0 1 10-10h18v60z" fill="#2E46B8"/><path d="M428 516V466a10 10 0 0 0-10-10h-18v60z" fill="#3B57D0"/>
<path d="M286 384 L400 300 L514 384 Q520 392 510 392 H290 Q280 392 286 384Z" fill="#1C2A78"/>
<g transform="translate(400 356) scale(.42)" fill="#FFC93C">${rays}<circle r="20.5"/></g>
<g fill="#D9A877"><circle cx="210" cy="440" r="34"/><circle cx="186" cy="412" r="13"/><circle cx="234" cy="412" r="13"/><ellipse cx="210" cy="492" rx="40" ry="34"/><circle cx="180" cy="520" r="14"/><circle cx="240" cy="520" r="14"/></g>
<g fill="#C48F5E"><circle cx="198" cy="444" r="4"/><circle cx="222" cy="444" r="4"/><ellipse cx="210" cy="456" rx="10" ry="7" fill="#EBC9A2"/></g>
<path d="M560 330 C556 380 578 410 560 460" fill="none" stroke="#1C2A78" stroke-opacity=".35" stroke-width="2"/>
<ellipse cx="560" cy="280" rx="38" ry="46" fill="#F0715C"/><path d="M554 324h12l-6 8z" fill="#F0715C"/>
<ellipse cx="548" cy="266" rx="9" ry="14" fill="#fff" opacity=".35"/>
</svg>`;
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
