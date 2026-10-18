import type { SceneKind } from "./Scene";

// Strich-Symbole für Handwerks-Leistungen. Jeder Pfad hat pathLength=1, damit er beim
// Einblenden „gezeichnet“ werden kann (CSS .svc-icon in app/globals.css).
const PATHS: Record<string, string[]> = {
  roller: ["M4 4h13v5H4z", "M17 6.5h2.5V12H11v3", "M9.5 15h3v6h-3z"],
  brush: ["M14.5 3.5l6 6-7.5 7.5-6-6z", "M7 11l-3.5 3.5a2.5 2.5 0 0 0 0 3.5l2.5 2.5a2.5 2.5 0 0 0 3.5 0L13 17"],
  bucket: ["M5 8h14l-1.5 12h-11z", "M5 8a7 4 0 0 1 14 0", "M9 12v4", "M15 12v4"],
  tiles: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
  mosaic: ["M4 4h4v4H4z", "M10 4h4v4h-4z", "M16 4h4v4h-4z", "M4 10h4v4H4z", "M16 10h4v4h-4z", "M4 16h4v4H4z", "M10 16h4v4h-4z", "M16 16h4v4h-4z", "M10 10h4v4h-4z"],
  shower: ["M5 21V8a4 4 0 0 1 8 0", "M10 11h6", "M11 14v1", "M13 15v1", "M15 14v1", "M12 18v1", "M14 18v1"],
  bath: ["M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z", "M6 12V6a2 2 0 0 1 4 0", "M7 20l-1 2", "M17 20l1 2"],
  faucet: ["M4 10h9a4 4 0 0 1 4 4v2", "M8 10V6h4v4", "M6 6h8", "M17 19v.01", "M17 22v.01"],
  heat: ["M5 6h14v12H5z", "M9 6v12", "M13 6v12", "M17 3v3", "M7 3v3"],
  pipe: ["M3 8h8v8h10", "M3 5v6", "M21 13v6", "M11 8v3", "M14 16v-3"],
  bolt: ["M13 2L5 14h6l-1 8 8-12h-6z"],
  plug: ["M8 3v5", "M16 3v5", "M6 8h12v3a6 6 0 0 1-12 0z", "M12 17v5"],
  bulb: ["M9 18h6", "M10 21h4", "M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"],
  socket: ["M4 4h16v16H4z", "M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0", "M10 11v2", "M14 11v2"],
  wallbox: ["M6 3h9v18H6z", "M9 7h3", "M15 9h2a2 2 0 0 1 2 2v5a2 2 0 0 0 4 0", "M9.5 15l1.5-3h-2l1.5-3"],
  smart: ["M3 11.5L12 4l9 7.5", "M5.5 10v10h13V10", "M9.5 15.5a3.5 3.5 0 0 1 5 0", "M12 18v.01"],
  network: ["M5 3h14v6H5z", "M5 15h14v6H5z", "M8 6v.01", "M8 18v.01", "M12 9v6"],
  wall: ["M3 5h18v14H3z", "M3 9.7h18", "M3 14.3h18", "M9 5v4.7", "M15 5v4.7", "M6 9.7v4.6", "M12 9.7v4.6", "M18 9.7v4.6", "M9 14.3V19", "M15 14.3V19"],
  drywall: ["M4 3h16v18H4z", "M4 8h16", "M9 8v13", "M15 8v13", "M7 5.5h.01", "M17 5.5h.01"],
  trowel: ["M14 4l6 6-8.5 8.5-6-6z", "M8.5 12.5l-4.5 4.5", "M4 17l3 3"],
  ceiling: ["M2 6h20", "M4 6l3 4h10l3-4", "M12 10v4", "M9 17a3 3 0 0 0 6 0"],
  insulate: ["M3 5h18", "M3 19h18", "M5 8c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 2-2", "M5 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 2-2", "M5 16c2 0 2 2 4 2"],
  planks: ["M3 5h18v4H3z", "M3 10h18v4H3z", "M3 15h18v4H3z", "M10 5v4", "M15 10v4", "M7 15v4"],
  sander: ["M4 14h16v4H4z", "M7 14V9h10v5", "M10 9V5h4v4", "M4 20h16"],
  stairs: ["M3 21h4v-4h4v-4h4V9h4V5h2", "M3 21h18"],
  house: ["M3 11.5L12 4l9 7.5", "M5.5 10v10h13V10", "M10 20v-5h4v5"],
  hammer: ["M14 4l6 6-3 3-6-6z", "M12.5 8.5L4 17l3 3 8.5-8.5"],
  wrench: ["M14.7 6.3a4 4 0 0 0 5 5L22 9a6 6 0 0 1-8.5-6.5z", "M14.7 6.3L4 17a2.1 2.1 0 0 0 3 3l10.7-10.7"],
  saw: ["M3 14l12-9 2 2-9 12z", "M5 16l1 1", "M8 13.5l1 1", "M11 11l1 1", "M17 7l3-3", "M18 3l3 3"],
  ruler: ["M3 17L17 3l4 4L7 21z", "M7 13l2 2", "M10 10l2 2", "M13 7l2 2"],
  kitchen: ["M4 4h16v16H4z", "M4 10h16", "M8 7h.01", "M12 7h.01", "M9 14v3", "M15 14v3"],
  cabinet: ["M5 3h14v18H5z", "M12 3v18", "M10 11v2", "M14 11v2"],
  door: ["M6 3h12v18H6z", "M15 12h.01", "M3 21h18"],
  window: ["M5 3h14v18H5z", "M12 3v18", "M5 12h14"],
  shutter: ["M4 3h16v4H4z", "M5 7h14", "M5 10h14", "M5 13h14", "M5 16h14", "M12 16v4"],
  roof: ["M2 13L12 4l10 9", "M5 11v9h14v-9", "M15 6.5V4h3v5"],
  facade: ["M4 21V5l8-3 8 3v16", "M8 9h2v3H8z", "M14 9h2v3h-2z", "M8 15h2v3H8z", "M14 15h2v3h-2z"],
  scaffold: ["M4 3v18", "M20 3v18", "M4 8h16", "M4 14h16", "M4 20h16", "M4 8l16 6", "M4 14l16 6"],
  tree: ["M12 22v-7", "M12 15l-3-2", "M12 3a6 6 0 0 0-6 6 4 4 0 0 0 4 4h4a4 4 0 0 0 4-4 6 6 0 0 0-6-6z"],
  hedge: ["M3 20h18", "M4 20v-7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7", "M7 10a2.5 2.5 0 0 1 5 0", "M12 10a2.5 2.5 0 0 1 5 0", "M15 3l3 3", "M18 3l-3 3"],
  lawn: ["M3 20h18", "M5 20c0-3 1-5 1-7", "M8 20c0-4 1.5-6 3-9", "M12 20c0-3-1-6-2-8", "M15 20c0-4 1-7 3-9", "M19 20c0-2-.5-4-1.5-5"],
  leaf: ["M5 19c0-8.5 5.5-14 15-14 0 9.5-5.5 15-14 15", "M5 19l8-8"],
  shovel: ["M17 3l4 4", "M19 5l-8 8", "M11 13l-2-2-5 5a2.8 2.8 0 0 0 4 4l5-5z"],
  paving: ["M3 4h8v6H3z", "M13 4h8v6h-8z", "M3 14h5v6H3z", "M10 14h11v6H10z", "M3 12h18"],
  fence: ["M4 21V7l2-3 2 3v14", "M16 21V7l2-3 2 3v14", "M10 21V7l2-3 2 3v14", "M4 11h16", "M4 16h16"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 14h10l1-14", "M10 11v6", "M14 11v6"],
  truck: ["M2 6h12v10H2z", "M14 9h4l4 4v3h-8", "M6 19a2 2 0 1 0 0-.01", "M18 19a2 2 0 1 0 0-.01"],
  broom: ["M14 3l7 7", "M17.5 6.5l-6 6", "M11.5 12.5L6 14l-3 7 7-3 1.5-5.5z", "M5 18l2 2"],
  sparkle: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"],
  key: ["M8 15a4 4 0 1 0 0-.01", "M10.8 12.2L20 3", "M16 7l2 2", "M18 5l2 2"],
  snow: ["M12 2v20", "M4 7l16 10", "M20 7L4 17", "M9 3.5l3 2 3-2", "M9 20.5l3-2 3 2"],
  solar: ["M3 18l3-10h12l3 10z", "M4.5 13h15", "M10 8l-1 10", "M14 8l1 10", "M12 2v2", "M5 4l1.5 1.5", "M19 4l-1.5 1.5"],
  water: ["M12 3c-3.5 4.5-6 7.8-6 11a6 6 0 0 0 12 0c0-3.2-2.5-6.5-6-11z", "M9 15a3 3 0 0 0 3 3"],
  chat: ["M4 5h16v11H9l-5 4z", "M8 9h8", "M8 12h5"],
  clipboard: ["M8 4h8v3H8z", "M6 5H5v16h14V5h-1", "M9 12l2 2 4-4"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
};

const RULES: [RegExp, string][] = [
  [/wallbox|lades(ä|a)ule|e-?auto/i, "wallbox"],
  [/smart\s?home|knx|haussteuer/i, "smart"],
  [/netzwerk|daten|lan|kabel(verlegung)?|sat|antenne/i, "network"],
  [/licht|leuchte|beleuchtung|lampe/i, "bulb"],
  [/steckdose|schalter|zählerschrank|verteiler|sicherung/i, "socket"],
  [/photovoltaik|pv\b|solar/i, "solar"],
  [/elektr|strom|e-check|anschluss|herd/i, "bolt"],
  [/mosaik/i, "mosaic"],
  [/dusche|bodeneben/i, "shower"],
  [/bad|wanne|sanitär/i, "bath"],
  [/heiz|therme|kessel|wärmepumpe/i, "heat"],
  [/rohr|wasserleitung|installation.*wasser|abfluss|kanal/i, "pipe"],
  [/wasser|leck|feucht|trocknung/i, "water"],
  [/fliese|platten|naturstein|marmor|feinstein/i, "tiles"],
  [/treppe|stufe/i, "stairs"],
  [/schleif|versiegel|abschleif|ölen/i, "sander"],
  [/parkett|laminat|vinyl|boden|dielen|teppich|designbelag/i, "planks"],
  [/akustik|decke|abhang/i, "ceiling"],
  [/dämm|isolier|wärmeschutz|schallschutz|kälte/i, "insulate"],
  [/trockenbau|ständerwerk|rigips|gipskarton|vorwand|wände|trennwand/i, "drywall"],
  [/spachtel|q[1-4]|putz|verputz|stuck/i, "trowel"],
  [/mauer|maurer|beton|ziegel|abbruch|rohbau|sanierung/i, "wall"],
  [/fassade|außenwand|wdvs/i, "facade"],
  [/gerüst/i, "scaffold"],
  [/dach|ziegel|rinne|spengler/i, "roof"],
  [/rollladen|rolladen|jalousie|markise|sonnenschutz/i, "shutter"],
  [/fenster/i, "window"],
  [/tür|türen/i, "door"],
  [/küche/i, "kitchen"],
  [/möbel|schrank|einbau|montage|aufbau/i, "cabinet"],
  [/tapez|anstrich|streich|lackier|farbe|maler/i, "roller"],
  [/lasur|holzschutz|pinsel/i, "brush"],
  [/baum|fällung|fällen|kronen/i, "tree"],
  [/hecke|schnitt|strauch/i, "hedge"],
  [/rasen|mähen|rollrasen|vertikut/i, "lawn"],
  [/pflaster|terrasse|wege|einfahrt|naturstein/i, "paving"],
  [/zaun|sichtschutz/i, "fence"],
  [/erd|aushub|bagger|graben/i, "shovel"],
  [/garten|grün|laub|pflanz|beet/i, "leaf"],
  [/winter|schnee|räum/i, "snow"],
  [/entrümpel|entsorg|räumung|müll|sperr/i, "trash"],
  [/umzug|transport/i, "truck"],
  [/reinig|putzen|sauber|treppenhaus/i, "broom"],
  [/glas|fenster.*putz|grundreinig/i, "sparkle"],
  [/hausmeister|objekt|hausservice|haustechnik|betreuung/i, "key"],
  [/reparatur|wartung|kleinreparatur/i, "wrench"],
  [/holz|schreiner|tischler|zuschnitt/i, "saw"],
  [/aufmaß|planung|beratung|angebot|besichtigung/i, "clipboard"],
  [/renovier|ausbau|innenausbau|umbau|modernis|haus/i, "house"],
];

const SCENE_DEFAULT: Record<SceneKind, string> = {
  bath: "tiles", paint: "roller", kitchen: "kitchen", parquet: "planks", garden: "leaf",
  drywall: "drywall", electric: "bolt", facade: "facade", farm: "leaf",
};

function match(text: string) {
  for (const [re, key] of RULES) if (re.test(text)) return key;
  return null;
}

// Erst der Titel, dann die Stichpunkte – so bekommt „Trockenbau“ die Wand und nicht die Decke aus „Deckenverkleidung“.
export function serviceIcon(text: string, scene?: SceneKind, extra?: string[]): string {
  return match(text) ?? (extra && match(extra.join(" "))) ?? (scene ? SCENE_DEFAULT[scene] : "check");
}

export default function ServiceIcon({ name, size = 24, className = "" }: { name: string; size?: number; className?: string }) {
  const d = PATHS[name] ?? PATHS.check;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`svc-icon ${className}`} aria-hidden="true">
      {d.map((p, i) => <path key={i} d={p} pathLength={1} style={{ ["--i" as string]: i }} />)}
    </svg>
  );
}
