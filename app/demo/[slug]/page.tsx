import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoSite from "@/components/DemoSite";
import { getAllLeads, getLeadBySlug } from "@/lib/leads";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLeads().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const lead = getLeadBySlug((await params).slug);
  if (!lead) return {};
  return {
    title: `${lead.site.seoTitle} (Entwurf)`,
    description: lead.site.seoDescription,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const lead = getLeadBySlug((await params).slug);
  if (!lead) notFound();
  return <DemoSite lead={lead} />;
}
