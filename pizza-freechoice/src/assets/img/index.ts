// Bilder aus dem Auftragspaket (pizza-freechoice-paket/bilder, 26.10.2026). Herkunft und Freigabe: docs/BILDPLAN.md.
// ALLE Motive sind KI-bearbeitet bzw. KI-inszeniert – keine dokumentarischen Fotos. `status` steuert den Hinweis.
import ladenAussen from "./01-laden-aussen.jpg";
import eingang from "./02-eingang-detail.jpg";
import pizzaOriginal from "./03-pizza-original.jpg";
import heroDesktop from "./04-hero-desktop.jpg";
import heroMobil from "./05-hero-mobil.jpg";
import pizzaDraufsicht from "./06-pizza-draufsicht.jpg";
import pizzaDetail from "./07-pizza-detail.jpg";
import pizzastueck from "./08-pizzastueck.jpg";
import abholung from "./09-abholung.jpg";
import pizzaabend from "./10-pizzaabend.jpg";

type Status = "ki-bearbeitet" | "ki-inszeniert";
export const IMAGES = {
  ladenAussen: { src: ladenAussen, status: "ki-bearbeitet" as Status, alt: "Ladenfront von Pizza Freechoice mit gelbem Schild, Schaufenster mit der Aufschrift Heimservice und einem Tisch mit zwei Stühlen davor" },
  eingang: { src: eingang, status: "ki-bearbeitet" as Status, alt: "Eingang von Pizza Freechoice mit gelben Schriftbändern an Tür und Schaufenster" },
  pizzaOriginal: { src: pizzaOriginal, status: "ki-bearbeitet" as Status, alt: "Pizza mit Salami, Champignons, Paprika, Peperoni und Oliven im Karton" },
  heroDesktop: { src: heroDesktop, status: "ki-inszeniert" as Status, alt: "Pizza mit Salami, Paprika, Peperoni und Oliven auf einem Holzbrett vor dunklem Stein" },
  heroMobil: { src: heroMobil, status: "ki-inszeniert" as Status, alt: "Pizza mit Salami, Paprika, Peperoni und Oliven auf Backpapier vor dunklem Stein" },
  pizzaDraufsicht: { src: pizzaDraufsicht, status: "ki-inszeniert" as Status, alt: "Pizza von oben mit Salami, Champignons, Paprika, Peperoni und Oliven" },
  pizzaDetail: { src: pizzaDetail, status: "ki-inszeniert" as Status, alt: "Nahaufnahme einer Pizza mit Champignons, Paprika, Peperoni und Oliven" },
  pizzastueck: { src: pizzastueck, status: "ki-inszeniert" as Status, alt: "Ein Stück Pizza auf einem hellen Teller, dahinter die restliche Pizza" },
  abholung: { src: abholung, status: "ki-inszeniert" as Status, alt: "Pizza im geöffneten Pizzakarton" },
  pizzaabend: { src: pizzaabend, status: "ki-inszeniert" as Status, alt: "Geschnittene Pizza auf dunklem Tisch mit Tellern, Gläsern und gelben Servietten" },
};
export type ImageKey = keyof typeof IMAGES;
