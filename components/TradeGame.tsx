import type { Lead } from "@/lib/types";
import type { TradeFxKind } from "./TradeFx";

export type GameKind = "paint" | "lawn" | "sweep" | "tiles" | "planks" | "drywall" | "bricks" | "roof" | "circuit" | "water" | "kitchen";

// Reihenfolge zählt: „Dachdecker und Trockenbau“ → Dach, „Fliesenleger und Trockenbau“ → Fliesen.
// Gleiche Regeln stehen in scripts/add-games.mjs (für bereits veröffentlichte Seiten).
const GAME_RULES: [RegExp, GameKind][] = [
  [/dach|zimmerei|spengler/i, "roof"],
  [/maler|lackier|anstrich|tapezier/i, "paint"],
  [/fliese|naturstein|mosaik/i, "tiles"],
  [/sanit|installateur|heizung|klempner|bäder|badsanier|wasser|rohr/i, "water"],
  [/küche|möbel|schreiner|tischler|einbau/i, "kitchen"],
  [/elektr|strom|photovoltaik|solar|wallbox/i, "circuit"],
  [/hausmeister|objekt|reinigung|winterdienst|entrümpel/i, "sweep"],
  [/garten|rasen|landschaft|grün|hecke|baum/i, "lawn"],
  [/parkett|boden|laminat|vinyl|dielen/i, "planks"],
  [/trockenbau|innenausbau|akustik|dämm|isolier/i, "drywall"],
  [/maurer|fassade|bau\b|rohbau|pflaster|sanier|renovier/i, "bricks"],
];
const BY_FX: Record<TradeFxKind, GameKind> = {
  paint: "paint", tiles: "tiles", laser: "drywall", planks: "planks", leaves: "lawn", circuit: "circuit", bricks: "bricks", keys: "sweep",
};

export function gameFor(trade: string, fx: TradeFxKind | null): GameKind | null {
  for (const [re, k] of GAME_RULES) if (re.test(trade)) return k;
  return fx ? BY_FX[fx] : null;
}

// Platzhalter – components/Enhance bettet assets/trade-game.js ein, das hier das Spiel aufbaut.
export default function TradeGame({ lead, kind }: { lead: Lead; kind: GameKind }) {
  return (
    <section id="mitmachen" className="tg-sec" data-trade-game={kind} data-company={lead.site.brandName || lead.company.name} data-cta="#kontakt" aria-label="Zum Ausprobieren" />
  );
}
