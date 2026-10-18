import { Emblem, type LogoIcon, type LogoStyle } from "./BrandLogo";

export type IntroStyle = "rise" | "curtain" | "draw" | "stamp" | "letters" | "split";

// Logo-Intro beim Öffnen der Seite – reines CSS (keyframes in globals.css), daher auch in Exporten
// ohne JavaScript. Je Firma eine eigene Choreografie (lib/identity.ts). Blockiert keine Klicks und
// entfällt bei „Bewegung reduzieren“.
export default function Splash({ icon, mark, name, tagline, logo = "badge", intro = "rise" }: { icon: LogoIcon; mark: string; name: string; tagline: string; logo?: LogoStyle; intro?: IntroStyle }) {
  return (
    <div className={`demo-splash iv-${intro} pointer-events-none fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-t-dark text-t-dark-ink`} aria-hidden="true">
      {intro === "curtain" && <span className="intro-curtain absolute inset-0 bg-t-accent" />}
      {intro === "split" && (<><span className="intro-half intro-half-l absolute inset-y-0 left-0 w-1/2 bg-t-dark" /><span className="intro-half intro-half-r absolute inset-y-0 right-0 w-1/2 bg-t-dark" /></>)}
      <div className="intro-stage relative flex flex-col items-center px-6 text-center">
        <div className="demo-splash-mark"><Emblem icon={icon} mark={mark} size={112} variant={logo} /></div>
        <p className="demo-splash-name mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          {intro === "letters" ? [...name].map((ch, i) => <span key={i} className="intro-ch" style={{ animationDelay: `${0.35 + i * 0.035}s` }}>{ch === " " ? "\u00a0" : ch}</span>) : name}
        </p>
        <p className="demo-splash-tag mt-3 text-sm font-medium text-t-dark-ink/70">{tagline}</p>
        <span className="demo-splash-line mt-6 block h-0.5 w-40 origin-left bg-t-accent" />
      </div>
    </div>
  );
}
