import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadsForDate, getRunDates } from "@/lib/leads";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRunDates().map((date) => ({ date }));
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  return { title: `Lead-Dashboard ${(await params).date} (intern)`, robots: { index: false, follow: false } };
}

function fmtRating(rating: number | null, count: number | null) {
  if (rating === null) return "nicht verifizierbar";
  return `${rating.toLocaleString("de-DE")} / 5${count !== null ? ` (${count})` : ""}`;
}

export default async function DailyPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const leads = getLeadsForDate(date);
  if (leads.length === 0) notFound();
  const dateLabel = new Date(date).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-6 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Intern · nicht öffentlich</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Lead-Dashboard {dateLabel}</h1>
            <p className="mt-1 text-sm text-slate-600">{leads.length} Leads · MyHammer-Profil belegt · keine eigene Website gefunden · Google-Status je Lead</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-blue-700 underline underline-offset-4">Alle Tagesläufe</Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6">
        {leads.some((l) => l.listings.google.rating === null && l.listings.google.evidence.startsWith("NICHT")) && (
          <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <b>Achtung:</b> Bei markierten Leads konnte der Google-Unternehmenseintrag in diesem Lauf nicht verifiziert werden
            (Google war aus der Recherche-Umgebung nicht erreichbar). Vor dem Anruf bitte über den Maps-Link prüfen –
            fehlt der Eintrag oder ist dort eine Website hinterlegt, Lead verwerfen.
          </div>
        )}
        {leads.map((l, i) => (
          <article key={l.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">Lead {i + 1}</p>
                <h2 className="text-xl font-bold">{l.company.name}</h2>
                <p className="text-sm text-slate-600">{l.company.trade} · {l.company.city}{l.company.owner ? ` · ${l.company.owner}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Lead-Score</p>
                  <p className="text-3xl font-black text-blue-700">{l.sales.score}<span className="text-base font-semibold text-slate-400">/10</span></p>
                </div>
                <Link href={`/demo/${l.slug}`} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                  Website-Preview
                </Link>
              </div>
            </div>

            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-slate-500">Telefon</dt><dd className="font-semibold">{l.company.phone ? <a href={`tel:${l.company.phone.replace(/[^\d+]/g, "")}`}>{l.company.phone}</a> : "nicht öffentlich belegt"}</dd></div>
              <div><dt className="text-slate-500">Google</dt><dd><a className="font-semibold text-blue-700 underline" href={l.listings.google.url} target="_blank" rel="noopener noreferrer">In Maps prüfen</a>{l.listings.google.evidence.startsWith("NICHT") ? <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">nicht verifiziert</span> : <> · {fmtRating(l.listings.google.rating, l.listings.google.reviews)}</>}</dd></div>
              <div><dt className="text-slate-500">MyHammer</dt><dd><a className="font-semibold text-blue-700 underline" href={l.listings.myhammer.url} target="_blank" rel="noopener noreferrer">Profil öffnen</a> · {fmtRating(l.listings.myhammer.rating, l.listings.myhammer.reviews)}</dd></div>
              <div><dt className="text-slate-500">E-Mail</dt><dd className="font-semibold">{l.company.email ? <a href={`mailto:${l.company.email}`}>{l.company.email}</a> : "nicht öffentlich belegt"}</dd></div>
              <div><dt className="text-slate-500">Website-Status</dt><dd className="font-semibold">{l.websiteStatus}</dd></div>
            </dl>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold">Warum guter Lead</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {l.sales.whyGoodLead.map((w) => <li key={w}>{w}</li>)}
                </ul>
                <h3 className="mt-4 text-sm font-bold">Strategie</h3>
                <p className="mt-1 text-sm text-slate-700"><b>Zielgruppe:</b> {l.strategy.audience} · <b>Kernleistung:</b> {l.strategy.mainService} · <b>Vertrauen:</b> {l.strategy.trustSignal} · <b>Conversion:</b> {l.strategy.conversionGoal}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold">Gesprächseinstieg</h3>
                <blockquote className="mt-2 rounded-lg border-l-4 border-blue-700 bg-blue-50 p-4 text-sm leading-relaxed text-slate-800">{l.sales.pitch}</blockquote>
                {l.manualChecks.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-bold">Vor dem Anruf manuell prüfen</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                      {l.manualChecks.map((m) => <li key={m}>{m}</li>)}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <details className="mt-5 text-sm">
              <summary className="cursor-pointer font-semibold text-slate-600">Recherchequellen &amp; Website-Prüfung</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                {l.websiteChecks.map((c) => <li key={c}>{c}</li>)}
                {l.sources.map((s) => (
                  <li key={s.url}><a className="text-blue-700 underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </main>
    </div>
  );
}
