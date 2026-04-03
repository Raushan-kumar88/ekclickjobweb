"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  BriefcaseIcon,
  UsersIcon,
  BarChartIcon,
  PlusCircleIcon,
  BuildingIcon,
  SettingsIcon,
  XIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmployerJobs, useEmployerApplications } from "@/hooks/useEmployerJobs";
import type { Job, Application } from "@/types";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  category: "job" | "applicant" | "page";
}

const QUICK_PAGES: SearchResult[] = [
  { id: "p-post", title: "Post a Job", subtitle: "Create a new job listing", href: "/employer/jobs/new", icon: PlusCircleIcon, category: "page" },
  { id: "p-jobs", title: "My Jobs", subtitle: "Manage your job postings", href: "/employer/jobs", icon: BriefcaseIcon, category: "page" },
  { id: "p-candidates", title: "Candidates", subtitle: "View all applicants", href: "/employer/candidates", icon: UsersIcon, category: "page" },
  { id: "p-analytics", title: "Analytics", subtitle: "View performance metrics", href: "/employer/analytics", icon: BarChartIcon, category: "page" },
  { id: "p-company", title: "Company Profile", subtitle: "Edit company information", href: "/employer/company", icon: BuildingIcon, category: "page" },
  { id: "p-settings", title: "Settings", subtitle: "Account preferences", href: "/employer/settings", icon: SettingsIcon, category: "page" },
];

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  closed: "Closed",
  draft: "Draft",
  applied: "Applied",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

export function EmployerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: jobs } = useEmployerJobs();
  const { data: applications } = useEmployerApplications();

  const results = useMemo(
    () => getFilteredResults(query, jobs ?? [], applications ?? []),
    [query, jobs, applications]
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.blur();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigate(results[activeIndex]);
    }
  }

  function navigate(result: SearchResult) {
    router.push(result.href);
    close();
  }

  return (
    <div ref={containerRef} className="relative hidden flex-1 max-w-md md:flex items-center">
      <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search jobs, applicants...  ⌘K"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-9 w-full rounded-xl border bg-muted/40 pl-9 pr-8 text-sm",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        )}
        role="combobox"
        aria-expanded={open}
        aria-controls="employer-search-results"
        aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
      />
      {query && (
        <button
          onClick={() => { setQuery(""); inputRef.current?.focus(); }}
          className="absolute right-3 text-muted-foreground hover:text-foreground z-10"
          aria-label="Clear search"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <div
          id="employer-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 max-h-80 overflow-y-auto rounded-xl border bg-background shadow-lg"
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {query ? `No results for "${query}"` : "Start typing to search..."}
            </div>
          ) : (
            <>
              {renderSection("Jobs", results.filter((r) => r.category === "job"), activeIndex, results, navigate)}
              {renderSection("Applicants", results.filter((r) => r.category === "applicant"), activeIndex, results, navigate)}
              {renderSection("Pages", results.filter((r) => r.category === "page"), activeIndex, results, navigate)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function renderSection(
  label: string,
  items: SearchResult[],
  activeIndex: number,
  allResults: SearchResult[],
  onNavigate: (r: SearchResult) => void
) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="px-3 pt-2.5 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      {items.map((item) => {
        const globalIdx = allResults.indexOf(item);
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            id={`search-result-${globalIdx}`}
            role="option"
            aria-selected={globalIdx === activeIndex}
            onClick={() => onNavigate(item)}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
              globalIdx === activeIndex
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-accent"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function getFilteredResults(query: string, jobs: Job[], applications: Application[]): SearchResult[] {
  const q = query.toLowerCase().trim();

  if (!q) return [];

  const jobResults: SearchResult[] = jobs
    .filter((job) =>
      job.title.toLowerCase().includes(q) ||
      job.companyName?.toLowerCase().includes(q) ||
      job.location?.city?.toLowerCase().includes(q) ||
      job.location?.state?.toLowerCase().includes(q) ||
      job.category?.toLowerCase().includes(q) ||
      job.status?.toLowerCase().includes(q) ||
      job.skills?.some((s) => s.toLowerCase().includes(q))
    )
    .slice(0, 5)
    .map((job) => ({
      id: `job-${job.id}`,
      title: job.title,
      subtitle: `${STATUS_LABEL[job.status] ?? job.status} · ${job.applicationsCount ?? 0} applicants`,
      href: `/employer/jobs/${job.id}/applicants`,
      icon: BriefcaseIcon,
      category: "job" as const,
    }));

  const seen = new Set<string>();
  const applicantResults: SearchResult[] = applications
    .filter((app) => {
      if (seen.has(app.applicantId)) return false;
      const match =
        app.applicantName?.toLowerCase().includes(q) ||
        app.jobTitle?.toLowerCase().includes(q);
      if (match) seen.add(app.applicantId);
      return match;
    })
    .slice(0, 5)
    .map((app) => ({
      id: `app-${app.id}`,
      title: app.applicantName,
      subtitle: `Applied for ${app.jobTitle} · ${STATUS_LABEL[app.status] ?? app.status}`,
      href: `/employer/jobs/${app.jobId}/applicants`,
      icon: UserIcon,
      category: "applicant" as const,
    }));

  const pageResults = QUICK_PAGES.filter((p) =>
    p.title.toLowerCase().includes(q) ||
    p.subtitle.toLowerCase().includes(q)
  );

  return [...jobResults, ...applicantResults, ...pageResults];
}
