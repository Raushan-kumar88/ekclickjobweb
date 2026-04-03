import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompany, getActiveJobsByCompany, toDisplayJob } from "@/lib/firebase/db";
import type { Company } from "@/types";
import type { Timestamp } from "firebase/firestore";
import { CompanyProfileClient } from "./CompanyProfileClient";

interface Props {
  params: Promise<{ id: string }>;
}

// Serialize Firestore Timestamps to plain strings so they can cross the
// Server → Client Component boundary (Timestamps have a .toJSON() method
// which Next.js refuses to serialize automatically).
function serializeCompany(company: Company): SerializedCompany {
  const tsToISO = (ts: Timestamp | null | undefined) => {
    try { return ts?.toDate?.()?.toISOString() ?? null; } catch { return null; }
  };
  return {
    ...company,
    createdAt: tsToISO(company.createdAt) ?? new Date().toISOString(),
  };
}

export type SerializedCompany = Omit<Company, "createdAt"> & { createdAt: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) return { title: "Company Not Found" };
  return {
    title: `${company.name} — Jobs & Reviews | EkClickJob`,
    description: company.description
      ? `${company.description.slice(0, 155)}…`
      : `Browse jobs at ${company.name} and read employee reviews on EkClickJob.`,
    openGraph: {
      title: company.name,
      description: company.description || "",
      images: company.logo ? [company.logo] : [],
    },
  };
}

export default async function CompanyPage({ params }: Props) {
  const { id } = await params;
  const [company, jobs] = await Promise.all([
    getCompany(id),
    getActiveJobsByCompany(id),
  ]);
  if (!company) notFound();

  // Serialize all Firestore objects before passing to Client Component
  const serializedCompany = serializeCompany(company);
  const displayJobs = jobs.map(toDisplayJob);

  return <CompanyProfileClient company={serializedCompany} initialJobs={displayJobs} />;
}
