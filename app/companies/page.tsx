"use client";

import { useState, useEffect } from "react";
import { SearchIcon, BuildingIcon, FilterIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompanyCard } from "@/components/company/CompanyCard";
import { useAllCompanies } from "@/hooks/useCompanyReviews";
import { INDUSTRIES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
//
function CompanyCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-3 animate-pulse">
      <div className="flex gap-3">
        <div className="h-16 w-16 rounded-2xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-2/3 rounded bg-muted" />
    </div>
  );
}

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = "Top Companies Hiring | EkClickJob";
  }, []);

  const { data: companies = [], isLoading } = useAllCompanies({
    industry: industry || undefined,
    size: size || undefined,
  });

  const filtered = companies.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.city?.toLowerCase().includes(search.toLowerCase())
  );

  const activeFilterCount = [industry, size].filter(Boolean).length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 text-center">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm text-muted-foreground mb-4">
              <BuildingIcon className="h-3.5 w-3.5 text-primary" />
              Explore top companies
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Find Your <span className="text-primary">Dream Company</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Browse companies, read employee reviews, and discover who&apos;s hiring.
            </p>

            {/* Search */}
            <div className="mx-auto mt-6 max-w-xl">
              <div className="relative">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search companies, industries, cities…"
                  className="w-full rounded-2xl border bg-background pl-10 pr-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-10">
          <div className="container mx-auto max-w-6xl px-4">
            {/* Filter bar */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
                  showFilters || activeFilterCount > 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <FilterIcon className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {(industry || size) && (
                <button
                  onClick={() => { setIndustry(""); setSize(""); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear filters
                </button>
              )}

              <span className="ml-auto text-sm text-muted-foreground">
                {isLoading ? "Loading…" : `${filtered.length} compan${filtered.length === 1 ? "y" : "ies"}`}
              </span>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="mb-6 rounded-2xl border bg-card p-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">All Industries</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Any Size</option>
                    {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Grid */}
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => <CompanyCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <BuildingIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-medium">No companies found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
