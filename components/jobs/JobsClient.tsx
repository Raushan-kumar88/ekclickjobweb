"use client";

import { useState, useMemo, useCallback, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
  MapPinIcon,
  Loader2Icon,
  NavigationIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { JobCard } from "./JobCard";
import { JobCardSkeleton } from "./JobCardSkeleton";
import { JobDetailPreview } from "./JobDetailPreview";
import { EmptyState } from "@/components/shared/EmptyState";
import type { DisplayJob } from "@/lib/firebase/db";
import {
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  REMOTE_POLICIES,
  JOB_CATEGORIES,
  CITIES,
  SALARY_RANGE,
} from "@/lib/utils/constants";
import { formatSalary } from "@/lib/utils/formatters";

interface JobsClientProps {
  initialJobs: DisplayJob[];
  initialQuery?: string;
  initialCategory?: string;
  initialCity?: string;
  initialExp?: string;
  initialRemote?: string;
  initialFresher?: boolean;
}

export function JobsClient({
  initialJobs,
  initialQuery = "",
  initialCategory = "",
  initialCity = "",
  initialExp,
  initialRemote,
  initialFresher = false,
}: JobsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") ?? initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
    const t = searchParams.get("type");
    return t ? t.split(",") : [];
  });
  const [selectedExp, setSelectedExp] = useState<string | null>(searchParams.get("exp") ?? initialExp ?? null);
  const [selectedRemote, setSelectedRemote] = useState<string | null>(searchParams.get("remote") ?? initialRemote ?? null);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? initialCategory);
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") ?? initialCity);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([SALARY_RANGE.MIN, SALARY_RANGE.MAX]);
  const [fresherOnly, setFresherOnly] = useState(() => searchParams.get("fresher") === "true" || initialFresher);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // GPS / "Jobs Near Me"
  const [gpsCity, setGpsCity] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Approximate city from GPS coordinates using a city-coordinate map
  const CITY_COORDS: Record<string, [number, number]> = {
    Mumbai: [19.076, 72.877], Delhi: [28.704, 77.102], Bangalore: [12.972, 77.594],
    Hyderabad: [17.385, 78.487], Chennai: [13.083, 80.270], Kolkata: [22.572, 88.363],
    Pune: [18.520, 73.856], Ahmedabad: [23.023, 72.572], Jaipur: [26.913, 75.787],
    Lucknow: [26.847, 80.947], Noida: [28.535, 77.391], Gurgaon: [28.459, 77.026],
    Chandigarh: [30.733, 76.779], Bhubaneswar: [20.296, 85.825],
    Kochi: [9.939, 76.270], Trivandrum: [8.524, 76.937],
  };

  function findNearestCity(lat: number, lon: number): string {
    let bestCity = "Mumbai";
    let bestDist = Infinity;
    for (const [city, [clat, clon]] of Object.entries(CITY_COORDS)) {
      const dist = Math.sqrt((lat - clat) ** 2 + (lon - clon) ** 2);
      if (dist < bestDist) { bestDist = dist; bestCity = city; }
    }
    return bestCity;
  }

  function handleJobsNearMe() {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const city = findNearestCity(pos.coords.latitude, pos.coords.longitude);
        setGpsCity(city);
        setSelectedCity(city);
        updateURL({ city });
        setGpsLoading(false);
      },
      () => {
        setGpsError("Unable to detect your location. Please allow location access.");
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  }

  function clearGps() {
    setGpsCity(null);
    setSelectedCity("");
    updateURL({ city: null });
  }

  const updateURL = useCallback(
    (params: Record<string, string | null>) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) current.set(key, value);
        else current.delete(key);
      });
      startTransition(() => {
        router.replace(`/jobs?${current.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  const filteredJobs = useMemo(() => {
    let jobs = [...initialJobs];
    const q = query.trim().toLowerCase();
    if (q) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q)) ||
          j.category.toLowerCase().includes(q)
      );
    }
    if (selectedTypes.length > 0) jobs = jobs.filter((j) => selectedTypes.includes(j.jobType));
    if (selectedExp) jobs = jobs.filter((j) => j.experienceLevel === selectedExp);
    if (selectedRemote) jobs = jobs.filter((j) => j.remotePolicy === selectedRemote);
    if (selectedCategory) jobs = jobs.filter((j) => j.category === selectedCategory);
    if (selectedCity) jobs = jobs.filter((j) => j.location?.city === selectedCity);
    if (salaryRange[0] > SALARY_RANGE.MIN || salaryRange[1] < SALARY_RANGE.MAX) {
      jobs = jobs.filter(
        (j) => (j.salary?.min ?? 0) >= salaryRange[0] && (j.salary?.max ?? 0) <= salaryRange[1]
      );
    }
    if (fresherOnly) {
      jobs = jobs.filter((j) =>
        j.experienceLevel === "fresher" || j.jobType === "internship"
      );
    }
    return jobs;
  }, [initialJobs, query, selectedTypes, selectedExp, selectedRemote, selectedCategory, selectedCity, salaryRange, fresherOnly]);

  const selectedJob = useMemo(
    () => filteredJobs.find((j) => j.id === selectedJobId) ?? null,
    [filteredJobs, selectedJobId]
  );

  const activeFilterCount = [
    selectedTypes.length > 0,
    !!selectedExp,
    !!selectedRemote,
    !!selectedCategory,
    !!selectedCity,
    salaryRange[0] > SALARY_RANGE.MIN || salaryRange[1] < SALARY_RANGE.MAX,
    fresherOnly,
  ].filter(Boolean).length;

  function clearFilters() {
    setSelectedTypes([]);
    setSelectedExp(null);
    setSelectedRemote(null);
    setSelectedCategory("");
    setSelectedCity("");
    setSalaryRange([SALARY_RANGE.MIN, SALARY_RANGE.MAX]);
    setFresherOnly(false);
    updateURL({ type: null, exp: null, remote: null, category: null, city: null, fresher: null });
  }

  function handleJobClick(jobId: string) {
    // On mobile, navigate to job detail page; on desktop, show inline preview
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      router.push(`/jobs/${jobId}`);
      return;
    }
    setSelectedJobId(jobId);
  }

  const renderFilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 font-semibold">Job Type</h4>
        <div className="space-y-2">
          {JOB_TYPES.map(({ label, value }) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`type-${value}`}
                checked={selectedTypes.includes(value)}
                onCheckedChange={(checked) => {
                  const next = checked ? [...selectedTypes, value] : selectedTypes.filter((t) => t !== value);
                  setSelectedTypes(next);
                  updateURL({ type: next.length ? next.join(",") : null });
                }}
              />
              <Label htmlFor={`type-${value}`} className="cursor-pointer font-normal">{label}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="mb-3 font-semibold">Experience</h4>
        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map(({ label, value }) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox id={`exp-${value}`} checked={selectedExp === value} onCheckedChange={(checked) => { const next = checked ? value : null; setSelectedExp(next); updateURL({ exp: next }); }} />
              <Label htmlFor={`exp-${value}`} className="cursor-pointer font-normal">{label}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="mb-3 font-semibold">Work Mode</h4>
        <div className="space-y-2">
          {REMOTE_POLICIES.map(({ label, value }) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox id={`remote-${value}`} checked={selectedRemote === value} onCheckedChange={(checked) => { const next = checked ? value : null; setSelectedRemote(next); updateURL({ remote: next }); }} />
              <Label htmlFor={`remote-${value}`} className="cursor-pointer font-normal">{label}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold">Salary Range</h4>
          <span className="text-xs text-muted-foreground">{formatSalary(salaryRange[0], salaryRange[1])}</span>
        </div>
        <Slider min={SALARY_RANGE.MIN} max={SALARY_RANGE.MAX} step={SALARY_RANGE.STEP} value={salaryRange} onValueChange={(v) => setSalaryRange(v as [number, number])} className="mt-2" />
      </div>
      <Separator />
      <div>
        <h4 className="mb-3 font-semibold">Category</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {JOB_CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox id={`cat-${cat}`} checked={selectedCategory === cat} onCheckedChange={(checked) => { const next = checked ? cat : ""; setSelectedCategory(next); updateURL({ category: next || null }); }} />
              <Label htmlFor={`cat-${cat}`} className="cursor-pointer font-normal text-sm">{cat}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="mb-3 font-semibold">City</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {CITIES.slice(0, 20).map((city) => (
            <div key={city} className="flex items-center gap-2">
              <Checkbox id={`city-${city}`} checked={selectedCity === city} onCheckedChange={(checked) => { const next = checked ? city : ""; setSelectedCity(next); updateURL({ city: next || null }); }} />
              <Label htmlFor={`city-${city}`} className="cursor-pointer font-normal text-sm">{city}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="mb-3 font-semibold">Special Filters</h4>
        <div className="flex items-center gap-2">
          <Checkbox
            id="fresher-only"
            checked={fresherOnly}
            onCheckedChange={(checked) => {
              setFresherOnly(!!checked);
              updateURL({ fresher: checked ? "true" : null });
            }}
          />
          <Label htmlFor="fresher-only" className="cursor-pointer font-normal">
            🎓 Freshers / Campus Only
          </Label>
        </div>
      </div>
      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full gap-2">
          <XIcon className="h-4 w-4" />
          Clear all filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-screen-2xl">
      {/* ── Left: Job list panel ── */}
      <div className="flex w-full flex-col lg:w-[460px] xl:w-[500px] lg:shrink-0 lg:border-r">
        {/* Search + filter toggle */}
        <div className="flex flex-col gap-2 border-b bg-background/80 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => {
                    updateURL({ q: val || null });
                  }, 350);
                }}
                placeholder="Search jobs..."
                className="h-9 pl-9 text-sm rounded-xl"
              />
            </div>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger render={<Button variant="outline" size="sm" className="gap-1.5 shrink-0" />}>
                <SlidersHorizontalIcon className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="destructive" className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-6">
                <h3 className="mb-6 text-lg font-semibold">Filters</h3>
                {renderFilterPanel()}
              </SheetContent>
            </Sheet>
          </div>

          {/* GPS Jobs Near Me */}
          <div className="flex items-center gap-2">
            {gpsCity ? (
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-1.5 text-xs">
                <NavigationIcon className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  Showing jobs near <strong>{gpsCity}</strong>
                </span>
                <button onClick={clearGps} className="ml-auto text-blue-500 hover:text-blue-700">
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleJobsNearMe}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-60"
              >
                {gpsLoading
                  ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                  : <MapPinIcon className="h-3.5 w-3.5" />}
                {gpsLoading ? "Detecting location…" : "Jobs near me"}
              </button>
            )}
            {gpsError && (
              <p className="text-xs text-destructive">{gpsError}</p>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b px-4 py-2">
            {selectedTypes.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1 pr-1 text-[10px]">
                {t}
                <button onClick={() => { const next = selectedTypes.filter((x) => x !== t); setSelectedTypes(next); updateURL({ type: next.length ? next.join(",") : null }); }} className="ml-0.5 rounded-full hover:bg-muted"><XIcon className="h-2.5 w-2.5" /></button>
              </Badge>
            ))}
            {selectedExp && (
              <Badge variant="secondary" className="gap-1 pr-1 text-[10px]">
                {selectedExp}
                <button onClick={() => { setSelectedExp(null); updateURL({ exp: null }); }} className="ml-0.5 rounded-full hover:bg-muted"><XIcon className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {selectedRemote && (
              <Badge variant="secondary" className="gap-1 pr-1 text-[10px]">
                {selectedRemote}
                <button onClick={() => { setSelectedRemote(null); updateURL({ remote: null }); }} className="ml-0.5 rounded-full hover:bg-muted"><XIcon className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1 pr-1 text-[10px]">
                {selectedCategory}
                <button onClick={() => { setSelectedCategory(""); updateURL({ category: null }); }} className="ml-0.5 rounded-full hover:bg-muted"><XIcon className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {selectedCity && (
              <Badge variant="secondary" className="gap-1 pr-1 text-[10px]">
                {selectedCity}
                <button onClick={() => { setSelectedCity(""); updateURL({ city: null }); }} className="ml-0.5 rounded-full hover:bg-muted"><XIcon className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {fresherOnly && (
              <Badge variant="secondary" className="gap-1 pr-1 text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                🎓 Fresher / Campus
                <button onClick={() => { setFresherOnly(false); updateURL({ fresher: null }); }} className="ml-0.5 rounded-full hover:bg-muted"><XIcon className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="px-4 py-2 text-xs text-muted-foreground border-b">
          {isPending ? "Searching..." : (
            <span>
              <span className="font-semibold text-green-700 dark:text-green-400">{filteredJobs.length}</span>
              {" "}result{filteredJobs.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Job list */}
        <div className="flex-1 overflow-y-auto">
          {isPending ? (
            <div className="divide-y">
              {Array.from({ length: 8 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No jobs found" description="Try adjusting your search or filters." />
            </div>
          ) : (
            <div className="divide-y">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isActive={selectedJobId === job.id}
                  onClick={() => handleJobClick(job.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Detail preview panel (desktop only) ── */}
      <div className="hidden lg:flex flex-1 flex-col bg-background max-w-2xl">
        {selectedJob ? (
          <JobDetailPreview job={selectedJob} onClose={() => setSelectedJobId(null)} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-center p-10 bg-gradient-to-br from-blue-50/40 via-background to-sky-50/30 dark:from-blue-950/10 dark:to-sky-950/10">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-500/15 dark:to-sky-500/15">
                <SearchIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">Select a job to preview</h3>
              <p className="mt-1.5 max-w-xs mx-auto text-sm text-muted-foreground">Click on any job from the list to see its full details here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
