// Ungefähre Ortsmittelpunkte (WGS84) für die schematische Einsatzgebiets-Karte.
export const PLACES: Record<string, [number, number]> = {
  Gilching: [48.108, 11.293],
  Argelsried: [48.098, 11.318],
  "Weßling": [48.074, 11.25],
  "Wörthsee": [48.072, 11.207],
  Starnberg: [47.999, 11.341],
  Gauting: [48.068, 11.379],
  Germering: [48.133, 11.367],
  Unterpfaffenhofen: [48.122, 11.378],
  Krailling: [48.097, 11.406],
  "München": [48.137, 11.575],
  "München-Pasing": [48.149, 11.461],
  Andechs: [47.974, 11.183],
  Herrsching: [47.999, 11.17],
  Seefeld: [48.035, 11.213],
  Tutzing: [47.909, 11.279],
  Schondorf: [48.05, 11.09],
  Inning: [48.074, 11.155],
  Puchheim: [48.172, 11.355],
  "Gräfelfing": [48.118, 11.43],
  Planegg: [48.105, 11.425],
  Martinsried: [48.11, 11.452],
  Stockdorf: [48.091, 11.405],
  Neuried: [48.093, 11.466],
  "Schöngeising": [48.141, 11.205],
  "Fürstenfeldbruck": [48.178, 11.255],
};

// Grobe Seeumrisse als Ellipsen: [lat, lon, Halbachse Nord-Süd in Grad, Halbachse Ost-West in Grad]
export const LAKES: { name: string; c: [number, number]; ry: number; rx: number }[] = [
  { name: "Ammersee", c: [47.995, 11.125], ry: 0.065, rx: 0.028 },
  { name: "Starnberger See", c: [47.91, 11.33], ry: 0.085, rx: 0.025 },
  { name: "Wörthsee", c: [48.068, 11.19], ry: 0.012, rx: 0.016 },
];
