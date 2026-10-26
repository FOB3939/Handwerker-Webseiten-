// Fotos von Silver Stage (vom Auftraggeber bereitgestellt, 26.10.2026). Herkunft und Freigabe: docs/MEDIEN.md
import stageBuehneFront from "./stage-buehne-front.jpg";
import stageVeniceBuehne from "./stage-venice-buehne.jpg";
import stagePultBlick from "./stage-pult-blick.jpg";
import stageRackFunk from "./stage-rack-funk.jpg";
import tonAufnahmeraum from "./tonstudio-aufnahmeraum.jpg";
import tonMikrofon from "./tonstudio-mikrofon.jpg";
import tonRegie from "./tonstudio-regie.jpg";
import tonRack from "./tonstudio-rack-tubetech.jpg";
import lightSpots from "./lightroom-raum-spots.jpg";
import lightBackline from "./lightroom-raum-backline.jpg";
import lightDrums from "./lightroom-drums.jpg";
import yamahaPult from "./lightroom-yamaha-pult.jpg";

export const PHOTOS = {
  stageBuehneFront: { src: stageBuehneFront, alt: "Stageroom: Bühne mit Silver-Stage-Schriftzug, Schlagzeug, E-Piano, Verstärkern und Lautsprechertürmen vor weißem Vorhang, darüber eine Traverse mit Scheinwerfern" },
  stageVeniceBuehne: { src: stageVeniceBuehne, alt: "Stageroom mit MIDAS-Venice-Mischpult im Vordergrund, Sofa und Bühne mit Silver-Stage-Schriftzug" },
  stagePultBlick: { src: stagePultBlick, alt: "Blick über ein Mischpult auf die Bühne mit Schlagzeug, E-Gitarre und Verstärkern" },
  stageRackFunk: { src: stageRackFunk, alt: "Rack mit Equalizern, Funkempfänger, Hallgerät und Vorverstärkern neben einem Mischpult" },
  tonAufnahmeraum: { src: tonAufnahmeraum, alt: "Aufnahmeraum des Tonstudios: Mikrofon mit Poppschutz, Akustikgitarre, Keyboard und Vorhang mit Silver-Stage-Signet, dahinter das Fenster zur Regie" },
  tonMikrofon: { src: tonMikrofon, alt: "Großmembranmikrofon mit Poppschutz im Aufnahmeraum, im Hintergrund das Regiefenster" },
  tonRegie: { src: tonRegie, alt: "Regieraum mit Analogpult, Studiomonitoren, Bildschirm und Rack" },
  tonRack: { src: tonRack, alt: "Outboard-Rack mit Tube-Tech CL 2A, Yamaha SPX2000, zwei SSL-611B-Equalizern und API-Lunchbox" },
  lightSpots: { src: lightSpots, alt: "Lightroom: heller Raum mit weißen Vorhängen, Scheinwerfern an der Traverse, Spiegelwand und blauer LED-Bodenleiste" },
  lightBackline: { src: lightBackline, alt: "Lightroom mit Spiegelwand, hängenden Lautsprechern, Verstärkern und Schlagzeug im blauen Licht" },
  lightDrums: { src: lightDrums, alt: "Schlagzeug auf einem Teppich vor weißem Vorhang im blauen Licht" },
  yamahaPult: { src: yamahaPult, alt: "Yamaha-Mischpult MG24/14FX im blauen Licht" },
} as const;
export type PhotoKey = keyof typeof PHOTOS;

// Zuordnung zu den Raumseiten: Titelbild + Galerie
export const ROOM_PHOTOS: Record<"tonstudio" | "stageroom" | "lightroom", { hero: PhotoKey; gallery: PhotoKey[] }> = {
  tonstudio: { hero: "tonAufnahmeraum", gallery: ["tonRegie", "tonRack", "tonMikrofon"] },
  stageroom: { hero: "stageBuehneFront", gallery: ["stageVeniceBuehne", "stagePultBlick", "stageRackFunk"] },
  lightroom: { hero: "lightBackline", gallery: ["lightSpots", "lightDrums"] },
};
