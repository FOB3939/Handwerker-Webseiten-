// Kleine Strich-Symbole für Hofladen-Produkte und Hof-Angebote, passend per Stichwort gewählt.
const PATHS: Record<string, string> = {
  egg: "M12 3c-3.5 0-6 5.2-6 9.2a6 6 0 0 0 12 0C18 8.2 15.5 3 12 3z",
  potato: "M6.5 9c1.6-4.4 9.4-4.6 11.3-.4 1.9 4.2-.4 10.2-5.3 11.1-4.9.9-7.6-6.3-6-10.7z M10 10h.01 M14 13h.01 M11 16h.01",
  jar: "M8 3h8v3H8z M7 6h10v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z M7 11h10",
  wheat: "M12 21V9 M12 9c-2.2-1-3.3-3.2-3.3-5.6 2.2 0 3.3 2.3 3.3 5.6z M12 9c2.2-1 3.3-3.2 3.3-5.6-2.2 0-3.3 2.3-3.3 5.6z M12 14.5c-2.2-1-3.3-3.2-3.3-5.6 2.2 0 3.3 2.3 3.3 5.6z M12 14.5c2.2-1 3.3-3.2 3.3-5.6-2.2 0-3.3 2.3-3.3 5.6z",
  carrot: "M14.5 9.5L4 21l11.5-10.5 M14.5 9.5c-1-1-1-2.6 0-3.6l1.5 1.5 M14.5 9.5c1 1 2.6 1 3.6 0l-1.5-1.5 M16 8l4-4",
  berry: "M12 8.5c4 0 6.2 3 6.2 6.2S15.3 21 12 21s-6.2-3.1-6.2-6.3S8 8.5 12 8.5z M12 8.5V4 M12 6l3.5-2.5 M12 6L8.5 3.5",
  bottle: "M10 2h4v4l2 3v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3z M8 13h8",
  cheese: "M3 17.5L12 6l9 11.5z M3 17.5V20h18v-2.5 M9.5 14.5h.01 M14 16h.01",
  flower: "M12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M12 8a3 3 0 1 1 0-5 3 3 0 0 1 0 5z M15 11a3 3 0 1 1 5 0 3 3 0 0 1-5 0z M9 11a3 3 0 1 1-5 0 3 3 0 0 1 5 0z M12 13v8 M12 18l-3-2",
  meat: "M15 3a6 6 0 0 1 0 12H9.5L4 20.5 9 15.5V9a6 6 0 0 1 6-6z M13 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
  horseshoe: "M7 20V11a5 5 0 0 1 10 0v9 M7 20h3 M14 20h3 M7 14.5h2 M15 14.5h2",
  fence: "M4 21V7l2-3 2 3v14 M16 21V7l2-3 2 3v14 M4 11h16 M4 16h16",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4",
  house: "M3 11.5L12 4l9 7.5 M5.5 9.5V20h13V9.5 M10 20v-5h4v5",
  leaf: "M5 19c0-8.5 5.5-14 15-14 0 9.5-5.5 15-14 15 M5 19l8-8",
  check: "M5 12.5l4.5 4.5L19 7.5",
};

const RULES: [RegExp, string][] = [
  [/ei(er|ern|nudel)?\b|^eier|freiland/i, "egg"],
  [/kartoffel|erdäpfel/i, "potato"],
  [/honig|marmelade|konfitüre|gelee|aufstrich|eingemacht/i, "jar"],
  [/nudel|mehl|getreide|dinkel|weizen|roggen|brot|backwaren|müsli/i, "wheat"],
  [/gemüse|karotte|möhre|rübe|zwiebel|salat|kraut|kürbis/i, "carrot"],
  [/obst|erdbeer|beere|johannis|apfel|äpfel|kirsch|birne|zwetsch/i, "berry"],
  [/milch|saft|likör|most|schnaps|getränk/i, "bottle"],
  [/käse|joghurt|butter|quark/i, "cheese"],
  [/blume|strauß|pflanze|kräuter/i, "flower"],
  [/fleisch|wurst|lamm|rind|schwein|geflügel|hähnchen|wild/i, "meat"],
  [/pferd|reit|box|pension|stute|pony/i, "horseshoe"],
  [/koppel|weide|auslauf|paddock/i, "fence"],
  [/ferien|urlaub|wohnung|übernacht/i, "house"],
  [/selbstbedienung|täglich|öffnung|uhr/i, "sun"],
];

export function productIcon(text: string): string {
  for (const [re, key] of RULES) if (re.test(text)) return key;
  return "leaf";
}

export default function HofIcon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name] ?? PATHS.leaf} />
    </svg>
  );
}
