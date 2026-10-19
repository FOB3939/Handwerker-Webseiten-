import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PhotoRef } from "@/lib/types";

const DIR = join(process.cwd(), "data/photos");

/** Liefert das Foto als data:-URI (Seiten werden als einzelne HTML-Datei exportiert) oder null, wenn es lokal fehlt. */
export function photoSrc(ref: PhotoRef | null | undefined): string | null {
  if (!ref) return null;
  const path = join(DIR, ref.file);
  if (!existsSync(path)) return null;
  return `data:image/jpeg;base64,${readFileSync(path).toString("base64")}`;
}

interface Props {
  photo: PhotoRef;
  src: string;
  className?: string;
  eager?: boolean;
  badge?: boolean;
}

// Lizenzfreies Beispielfoto (Pexels-Lizenz). Klar als Beispiel gekennzeichnet, damit es nicht als Arbeit des Betriebs gilt.
export default function Photo({ photo, src, className = "", eager = false, badge = true }: Props) {
  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative"} overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={photo.alt} loading={eager ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      {badge && (
        <span className="absolute right-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white/90">Beispielfoto</span>
      )}
    </div>
  );
}
