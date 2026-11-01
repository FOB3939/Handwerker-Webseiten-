// sharp aus dem lokalen node_modules oder aus dem Hauptrepo laden.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let sharp;
for (const base of [import.meta.url, "file:///home/user/Handwerker-Webseiten-/package.json"]) {
  try { sharp = createRequire(base)("sharp"); break; } catch {}
}
if (!sharp) throw new Error("sharp nicht gefunden: npm i -D sharp im Ordner kmn/ ausführen.");
export default sharp;
