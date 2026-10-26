// Fotos von FOB Haustechnik (vom Inhaber bereitgestellt, 26.10.2026; teils aus Instagram-Beiträgen zugeschnitten).
// Herkunft/Freigabe: docs/MEDIEN.md
import wcStand from "./wc-stand.jpg";
import wcWand from "./wc-wand.jpg";
import waschtisch from "./waschtisch.jpg";
import boden from "./boden.jpg";
import terrasse from "./terrasse.jpg";
import fassadeVorher from "./fassade-vorher.jpg";
import fassadeNachher from "./fassade-nachher.jpg";
import wandVorher from "./wand-vorher.jpg";
import wandNachher from "./wand-nachher.jpg";

export const IMAGES = {
  wcStand: { src: wcStand, alt: "Neu montiertes Stand-WC mit weißem Sitz und Spülkasten, angeschlossen über einen Edelstahl-Flexschlauch" },
  wcWand: { src: wcWand, alt: "Neues spülrandloses Wand-WC mit Geberit-Sitz vor dunklen Fliesen, darüber die Betätigungsplatte" },
  waschtisch: { src: waschtisch, alt: "Waschbecken von Laufen mit neuer verchromter Einhebelarmatur und Ablaufventil" },
  boden: { src: boden, alt: "Frisch verlegter Vinylboden in grauer Eichenoptik in einem leeren Zimmer" },
  terrasse: { src: terrasse, alt: "Neue Holzterrasse mit geriffelten Dielen hinter einem Metallgeländer" },
  fassadeVorher: { src: fassadeVorher, alt: "Vorher: Hausfassade mit verblasstem rosa Putz und Abplatzungen an der Mauer" },
  fassadeNachher: { src: fassadeNachher, alt: "Nachher: dieselbe Fassade frisch in Grau gestrichen, Mauer mit dunklem Sockel" },
  wandVorher: { src: wandVorher, alt: "Vorher: Wand mit Farbproben, abgeklebtem Boden und Malerleiter" },
  wandNachher: { src: wandNachher, alt: "Nachher: Wand oben in Grün, unten mit grauer Spachteltechnik" },
};
export type ImageKey = keyof typeof IMAGES;
