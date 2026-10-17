import { Emblem, type LogoIcon } from "./BrandLogo";

// Kurzes Logo-Intro beim Öffnen der Seite – reines CSS (keyframes in globals.css), daher auch in
// Exporten ohne JavaScript. Blockiert keine Klicks und entfällt bei „Bewegung reduzieren“.
export default function Splash({ icon, mark, name, tagline }: { icon: LogoIcon; mark: string; name: string; tagline: string }) {
  return (
    <div className="demo-splash pointer-events-none fixed inset-0 z-[60] grid place-items-center bg-t-dark text-t-dark-ink" aria-hidden="true">
      <div className="flex flex-col items-center px-6 text-center">
        <div className="demo-splash-mark"><Emblem icon={icon} mark={mark} size={104} /></div>
        <p className="demo-splash-name mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{name}</p>
        <p className="demo-splash-tag mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-t-dark-ink/70">{tagline}</p>
        <span className="demo-splash-line mt-6 block h-0.5 w-40 origin-left bg-t-accent" />
      </div>
    </div>
  );
}
