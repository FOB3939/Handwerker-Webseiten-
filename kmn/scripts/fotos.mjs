// Schneidet die MyHammer-Screenshots auf den reinen Bildbereich zu und exportiert WebP.
// Aufruf: node scripts/fotos.mjs <ordner-mit-originalen>
import sharp from "./sharp.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = process.argv[2];
if (!src) { console.error("Bitte den Ordner mit den Originalfotos angeben."); process.exit(1); }
const out = path.join(here, "..", "fotos");

// Ausschnitte in Originalpixeln. Die Handy-Screenshots (1170×2532) zeigen das Foto
// bei y 533–1964, x 48–1121; links/rechts liegen Blätterpfeile im Bild, darum x 140–1035.
const PHONE = { left: 140, top: 541, width: 895, height: 1415 };
const jobs = [
  ["1-kochinsel-nah.png", "kochinsel-nah", PHONE],
  ["2-kuechenzeile-beton.png", "kuechenzeile-beton", { left: 140, top: 803, width: 895, height: 892 }],
  ["3-kochinsel-raum.png", "kochinsel-raum", PHONE],
  ["4-musterwand-fronten.jpg", "musterwand-fronten", { left: 45, top: 0, width: 905, height: 922 }],
  ["5-zeile-eiche-regal.png", "zeile-eiche-regal", PHONE],
  ["6-l-kueche-weiss.png", "l-kueche-weiss", PHONE],
  ["7-musterwand-arbeitsplatten.jpg", "musterwand-arbeitsplatten", { left: 80, top: 8, width: 925, height: 811 }],
];
for (const [file, name, box] of jobs) {
  const info = await sharp(path.join(src, file)).extract(box).webp({ quality: 80, effort: 6 })
    .toFile(path.join(out, name + ".webp"));
  console.log(name, info.width + "×" + info.height, Math.round(info.size / 1024) + " KB");
}
