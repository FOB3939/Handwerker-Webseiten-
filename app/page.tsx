import Link from "next/link";
import { getLeadsForDate, getRunDates } from "@/lib/leads";

export default function Home() {
  const dates = getRunDates();
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 text-slate-900 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Intern · nicht öffentlich</p>
      <h1 className="mt-1 text-3xl font-bold">Handwerker-Website-Entwürfe</h1>
      <p className="mt-2 text-slate-600">Tägliche Lead-Läufe mit unverbindlichen Website-Entwürfen. Alle Seiten sind auf noindex gesetzt.</p>
      <ul className="mt-8 grid gap-4">
        {dates.map((d) => (
          <li key={d} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href={`/daily/${d}`} className="text-lg font-bold text-blue-700 underline underline-offset-4">Tageslauf {d}</Link>
            <ul className="mt-3 grid gap-1 text-sm">
              {getLeadsForDate(d).map((l) => (
                <li key={l.slug}>
                  <Link href={`/demo/${l.slug}`} className="hover:underline">{l.company.name}</Link>
                  <span className="text-slate-500"> · {l.company.trade}, {l.company.city}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
}
