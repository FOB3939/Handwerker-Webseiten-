import type { ReactNode } from "react";

// Vorher/Nachher-Regler: „Nachher“ wird über „Vorher“ per clip-path freigelegt (Skript in Enhance.tsx).
export default function BeforeAfter({ before, after, label }: { before: ReactNode; after: ReactNode; label: string }) {
  return (
    <div data-ba className="relative aspect-[16/10] w-full overflow-hidden rounded-t shadow-xl">
      <div className="absolute inset-0">{before}</div>
      <div data-ba-after className="absolute inset-0" style={{ clipPath: "inset(0 0 0 50%)" }}>{after}</div>
      <div data-ba-handle className="pointer-events-none absolute inset-y-0" style={{ left: "50%" }} aria-hidden="true">
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white shadow" />
        <div className="absolute top-1/2 -ml-5 -mt-5 grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-neutral-800 shadow-lg">⇆</div>
      </div>
      <span className="absolute left-3 top-3 rounded bg-black/65 px-2 py-1 text-xs font-semibold text-white">Vorher</span>
      <span className="absolute right-3 top-3 rounded bg-black/65 px-2 py-1 text-xs font-semibold text-white">Nachher</span>
      <input type="range" min={5} max={95} defaultValue={50} aria-label={`Vorher-Nachher-Vergleich: ${label}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
  );
}
