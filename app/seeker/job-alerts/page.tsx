"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellIcon, PlusIcon, TrashIcon, SearchIcon, ClockIcon,
  MessageCircleIcon, MapPinIcon, BanknoteIcon, BriefcaseIcon,
  PauseIcon, PlayIcon, FilterIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSavedSearches, useSaveSearch, useDeleteSavedSearch } from "@/hooks/useSavedSearches";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { CITIES, JOB_TYPES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

const FREQUENCY_OPTIONS = [
  { value: "instant", label: "Instantly", icon: "⚡" },
  { value: "daily", label: "Daily digest", icon: "📅" },
  { value: "weekly", label: "Weekly digest", icon: "📆" },
];

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Any experience" },
  { value: "fresher", label: "Fresher (0 yrs)" },
  { value: "1-3", label: "1–3 Years" },
  { value: "3-5", label: "3–5 Years" },
  { value: "5-10", label: "5–10 Years" },
  { value: "10+", label: "10+ Years" },
];

type AlertFilters = {
  city?: string;
  jobType?: string;
  minSalary?: string;
  experienceLevel?: string;
  remotePolicy?: string;
};

function AlertFilterChips({ filters }: { filters: AlertFilters }) {
  const chips = [
    filters.city && { label: filters.city, icon: "📍" },
    filters.jobType && { label: filters.jobType.replace("-", " "), icon: "💼" },
    filters.minSalary && { label: `₹${Number(filters.minSalary).toLocaleString("en-IN")}+ salary`, icon: "💰" },
    filters.experienceLevel && { label: filters.experienceLevel, icon: "🎓" },
    filters.remotePolicy && { label: filters.remotePolicy, icon: "🏠" },
  ].filter(Boolean) as { label: string; icon: string }[];

  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {chips.map((c) => (
        <span key={c.label} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {c.icon} {c.label}
        </span>
      ))}
    </div>
  );
}

export default function JobAlertsPage() {
  const { data: savedSearches = [], isLoading } = useSavedSearches();
  const saveSearch = useSaveSearch();
  const deleteSearch = useDeleteSavedSearch();

  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("daily");
  const [paused, setPaused] = useState<Set<string>>(new Set());

  // Extended filters
  const [alertCity, setAlertCity] = useState("");
  const [alertJobType, setAlertJobType] = useState("");
  const [alertMinSalary, setAlertMinSalary] = useState("");
  const [alertExperience, setAlertExperience] = useState("");
  const [alertRemote, setAlertRemote] = useState("");

  function resetForm() {
    setSearchQuery("");
    setFrequency("daily");
    setAlertCity("");
    setAlertJobType("");
    setAlertMinSalary("");
    setAlertExperience("");
    setAlertRemote("");
  }

  async function handleCreate() {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search keyword");
      return;
    }

    const filters: AlertFilters = {};
    if (alertCity) filters.city = alertCity;
    if (alertJobType) filters.jobType = alertJobType;
    if (alertMinSalary) filters.minSalary = alertMinSalary;
    if (alertExperience) filters.experienceLevel = alertExperience;
    if (alertRemote) filters.remotePolicy = alertRemote;

    try {
      await saveSearch.mutateAsync({
        searchQuery: searchQuery.trim(),
        filters,
        frequency,
      });
      toast.success("Job alert created! You'll get notified when matching jobs are posted.");
      setCreateOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to create job alert. Please try again.");
    }
  }

  async function handleDelete(searchId: string) {
    try {
      await deleteSearch.mutateAsync(searchId);
      toast.success("Alert removed");
    } catch {
      toast.error("Failed to remove alert");
    }
  }

  function togglePause(id: string) {
    setPaused((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success("Alert resumed");
      } else {
        next.add(id);
        toast.success("Alert paused");
      }
      return next;
    });
  }

  function buildSearchHref(search: { query: string; filters?: AlertFilters }) {
    const params = new URLSearchParams({ q: search.query });
    const f = search.filters as AlertFilters | undefined;
    if (f?.city) params.set("city", f.city);
    if (f?.jobType) params.set("type", f.jobType);
    if (f?.minSalary) params.set("minSalary", f.minSalary);
    if (f?.experienceLevel) params.set("exp", f.experienceLevel);
    if (f?.remotePolicy) params.set("remote", f.remotePolicy);
    return `/jobs?${params.toString()}`;
  }

  const activeCount = savedSearches.filter((s) => !paused.has(s.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Job Alerts</h1>
            {savedSearches.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {activeCount} active
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Get notified when new jobs match your saved searches
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          New Alert
        </Button>
      </div>

      {/* How it works */}
      <div className="rounded-xl border bg-primary/5 p-4">
        <p className="text-sm font-medium text-foreground">How job alerts work</p>
        <ul className="mt-2 space-y-1">
          {[
            "Save a keyword with optional filters (location, salary, job type)",
            "Choose how often you want to be notified",
            "Get an in-app + email notification when matching jobs are posted",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      ) : savedSearches.length === 0 ? (
        <EmptyState
          icon={BellIcon}
          title="No job alerts yet"
          description="Create your first alert to get notified about new job openings."
          action={{ label: "Create Alert", onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {savedSearches.map((search) => {
            const isPaused = paused.has(search.id);
            const filters = search.filters as AlertFilters | undefined;
            return (
              <div
                key={search.id}
                className={cn(
                  "flex items-start justify-between gap-4 rounded-xl border bg-background p-4 transition-opacity",
                  isPaused && "opacity-50"
                )}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isPaused ? "bg-muted" : "bg-primary/10"
                  )}>
                    {isPaused
                      ? <PauseIcon className="h-5 w-5 text-muted-foreground" />
                      : <BellIcon className="h-5 w-5 text-primary" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{search.query}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                        {FREQUENCY_OPTIONS.find((f) => f.value === search.frequency)?.icon}{" "}
                        {FREQUENCY_OPTIONS.find((f) => f.value === search.frequency)?.label ?? search.frequency}
                      </span>
                      {search.lastNotifiedAt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon className="h-3 w-3" />
                          Last alert {formatRelativeTime(search.lastNotifiedAt)}
                        </span>
                      )}
                      {isPaused && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                          Paused
                        </Badge>
                      )}
                    </div>
                    {/* Filter chips */}
                    {filters && <AlertFilterChips filters={filters} />}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link href={buildSearchHref({ query: search.query, filters })}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      <SearchIcon className="h-3 w-3 mr-1" />
                      Search
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => togglePause(search.id)}
                    title={isPaused ? "Resume alert" : "Pause alert"}
                  >
                    {isPaused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
                  </Button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Looking for ${search.query} jobs? Check out EkClickJob: https://ekclickjob.com${buildSearchHref({ query: search.query, filters })}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20" aria-label="Share on WhatsApp">
                      <MessageCircleIcon className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(search.id)}
                    disabled={deleteSearch.isPending}
                    aria-label="Delete alert"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create alert dialog — enhanced with filters */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) resetForm(); setCreateOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellIcon className="h-4 w-4 text-primary" />
              Create Job Alert
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Keyword */}
            <div className="space-y-1.5">
              <Label htmlFor="alertQuery">
                <SearchIcon className="inline h-3 w-3 mr-1" />
                Keyword <span className="text-destructive">*</span>
              </Label>
              <Input
                id="alertQuery"
                placeholder='e.g. "React Developer" or "Product Manager"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>

            {/* Filters section */}
            <div className="rounded-xl border bg-muted/30 p-3.5 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <FilterIcon className="h-3 w-3" />
                Filters (optional)
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* City */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    <MapPinIcon className="inline h-3 w-3 mr-0.5" />
                    City
                  </Label>
                  <Select value={alertCity} onValueChange={(v) => setAlertCity(v ?? "")}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Any city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any city</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      {CITIES.slice(0, 20).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Job type */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    <BriefcaseIcon className="inline h-3 w-3 mr-0.5" />
                    Job Type
                  </Label>
                  <Select value={alertJobType} onValueChange={(v) => setAlertJobType(v ?? "")}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      {JOB_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min salary */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    <BanknoteIcon className="inline h-3 w-3 mr-0.5" />
                    Min Salary (₹/yr)
                  </Label>
                  <Select value={alertMinSalary} onValueChange={(v) => setAlertMinSalary(v ?? "")}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Any salary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any salary</SelectItem>
                      <SelectItem value="300000">₹3 LPA+</SelectItem>
                      <SelectItem value="500000">₹5 LPA+</SelectItem>
                      <SelectItem value="800000">₹8 LPA+</SelectItem>
                      <SelectItem value="1000000">₹10 LPA+</SelectItem>
                      <SelectItem value="1500000">₹15 LPA+</SelectItem>
                      <SelectItem value="2000000">₹20 LPA+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <Label className="text-xs">Experience</Label>
                  <Select value={alertExperience} onValueChange={(v) => setAlertExperience(v ?? "")}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Any experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Work mode */}
              <div className="flex flex-wrap gap-2">
                {["", "remote", "hybrid", "on-site"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAlertRemote(mode)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      alertRemote === mode
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {mode === "" ? "Any work mode" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <Label>Notification Frequency</Label>
              <div className="grid grid-cols-3 gap-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value as typeof frequency)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-xl border p-2.5 text-xs font-medium transition-all",
                      frequency === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <span className="text-base">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleCreate} disabled={saveSearch.isPending} className="gap-2">
              <BellIcon className="h-4 w-4" />
              {saveSearch.isPending ? "Creating..." : "Create Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
