"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPinIcon, UsersIcon, BriefcaseIcon, BadgeCheckIcon, StarIcon,
  ZapIcon, BuildingIcon, GlobeIcon, ArrowLeftIcon, XIcon, PlusCircleIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { getCompany, getAllCompanies } from "@/lib/firebase/db";
import { RatingBadge } from "@/components/company/StarRating";
import type { Company } from "@/types";

function useCompanyData(id: string | null) {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompany(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

function CompanyPicker({ onSelect, exclude }: { onSelect: (id: string) => void; exclude: string[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: all = [] } = useQuery({
    queryKey: ["companies", "all"],
    queryFn: () => getAllCompanies(),
    staleTime: 5 * 60 * 1000,
  });

  const filtered = all
    .filter((c) => !exclude.includes(c.id))
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 8);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/30 p-8 text-muted-foreground hover:border-primary/40 hover:bg-accent/30 transition-all"
      >
        <PlusCircleIcon className="h-8 w-8" />
        <span className="text-sm font-medium">Add Company to Compare</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border bg-background shadow-xl">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full rounded-t-xl border-b px-4 py-3 text-sm outline-none"
          />
          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No companies found</p>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => { onSelect(c.id); setOpen(false); setSearch(""); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <CompanyAvatar name={c.name} logoUrl={c.logo} size="sm" />
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.industry}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type BrandedCompany = Company & {
  tagline?: string;
  benefits?: string[];
  techStack?: string[];
  socialLinks?: Record<string, string>;
  founded?: string;
  cultureHighlights?: string[];
};

function CompanyColumn({ company, onRemove }: { company: Company; onRemove: () => void }) {
  const branding = company as BrandedCompany;
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative rounded-2xl border bg-card p-5 text-center">
        <button
          onClick={onRemove}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <XIcon className="h-4 w-4" />
        </button>
        <CompanyAvatar name={company.name} logoUrl={company.logo} size="lg" className="mx-auto" />
        <div className="mt-3">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="font-bold">{company.name}</h2>
            {company.verified && <BadgeCheckIcon className="h-4 w-4 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground">{company.industry}</p>
          {(company.averageRating ?? 0) > 0 && (
            <div className="mt-1 flex justify-center">
              <RatingBadge rating={company.averageRating!} count={company.reviewCount} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {[
        { icon: MapPinIcon, label: "Location", value: [company.location?.city, company.location?.state].filter(Boolean).join(", ") || "N/A" },
        { icon: UsersIcon, label: "Company Size", value: `${company.size} employees` },
        { icon: BriefcaseIcon, label: "Open Jobs", value: company.jobCount ? `${company.jobCount} positions` : "None" },
        { icon: StarIcon, label: "Rating", value: company.averageRating ? `${company.averageRating.toFixed(1)}/5 (${company.reviewCount ?? 0} reviews)` : "No reviews yet" },
        { icon: ZapIcon, label: "Response Rate", value: branding.responseRate != null ? `${branding.responseRate}%` : "N/A" },
        { icon: GlobeIcon, label: "Website", value: company.website || "N/A" },
      ].map(({ icon: Icon, label, value }) => (
        <div key={label} className="rounded-xl border bg-background p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      ))}

      {/* Benefits */}
      {(branding.benefits?.length ?? 0) > 0 && (
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Benefits</p>
          <div className="flex flex-wrap gap-1.5">
            {branding.benefits!.map((b) => (
              <span key={b} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                ✓ {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tech Stack */}
      {(branding.techStack?.length ?? 0) > 0 && (
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Tech Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {branding.techStack!.map((t) => (
              <span key={t} className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <Link
        href={`/companies/${company.id}`}
        className="block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        View Full Profile
      </Link>
    </div>
  );
}

function CompareCompaniesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ids, setIds] = useState<string[]>(() => {
    const raw = searchParams.get("ids");
    return raw ? raw.split(",").slice(0, 3) : [];
  });

  const q1 = useCompanyData(ids[0] ?? null);
  const q2 = useCompanyData(ids[1] ?? null);
  const q3 = useCompanyData(ids[2] ?? null);
  const companies = [q1.data, q2.data, q3.data].filter(Boolean) as Company[];

  function addId(id: string) {
    if (ids.includes(id) || ids.length >= 3) return;
    const next = [...ids, id];
    setIds(next);
    router.replace(`/companies/compare?ids=${next.join(",")}`);
  }

  function removeId(id: string) {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    router.replace(next.length ? `/companies/compare?ids=${next.join(",")}` : "/companies/compare");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b bg-muted/30 py-4">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex items-center gap-3">
              <Link href="/companies" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
                Companies
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">Compare</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-3">
              <BuildingIcon className="h-4 w-4" />
              Company Comparison
            </div>
            <h1 className="text-3xl font-bold">Compare Companies</h1>
            <p className="mt-2 text-muted-foreground">Add up to 3 companies to compare side-by-side</p>
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.max(ids.length + (ids.length < 3 ? 1 : 0), 2)}, 1fr)` }}>
            {companies.map((company) => (
              <CompanyColumn key={company.id} company={company} onRemove={() => removeId(company.id)} />
            ))}
            {ids.length < 3 && (
              <CompanyPicker onSelect={addId} exclude={ids} />
            )}
          </div>

          {ids.length === 0 && (
            <div className="mt-8 text-center">
              <BuildingIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">Search for companies from the <Link href="/companies" className="text-primary hover:underline">Companies page</Link> and use the compare button, or select above.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CompareCompaniesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    }>
      <CompareCompaniesContent />
    </Suspense>
  );
}
