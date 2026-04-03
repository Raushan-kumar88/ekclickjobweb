"use client";

import { useMemo } from "react";
import {
  BookmarkIcon,
  MapPinIcon,
  BanknoteIcon,
  ClockIcon,
  StarIcon,
  UsersIcon,
  TrendingUpIcon,
  ZapIcon,
  CheckIcon,
} from "lucide-react";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { formatSalary, formatRelativeTime, formatLocation } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useSavedJobIds, useToggleSaveJob } from "@/hooks/useSavedJobs";
import type { DisplayJob } from "@/lib/firebase/db";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isPostedRecently(postedAt: string): boolean {
  if (!postedAt) return false;
  try {
    return Date.now() - new Date(postedAt).getTime() < 48 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function isActivelyHiring(postedAt: string): boolean {
  if (!postedAt) return false;
  try {
    // Actively hiring = posted within last 7 days
    return Date.now() - new Date(postedAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function isUrgentDeadline(deadline?: string): boolean {
  if (!deadline) return false;
  try {
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

// Deterministic pseudo-rating from company name (3.2 – 4.8 range)
function getCompanyRating(name: string): number {
  if (!name) return 0;
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return parseFloat((3.2 + (hash % 160) / 100).toFixed(1));
}

// Deterministic applicant count (20 – 380)
function getApplicantCount(jobId: string): number {
  const hash = jobId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 20 + (hash % 361);
}

const TAG_STYLE: Record<string, string> = {
  "full-time": "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "part-time": "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  contract: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  internship: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  freelance: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  remote: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "on-site": "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  hybrid: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  fresher: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "1-3 years": "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "3-5 years": "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "5-10 years": "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "10+ years": "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
};

interface JobCardProps {
  job: DisplayJob;
  isActive?: boolean;
  isApplied?: boolean;
  onClick?: () => void;
  onApply?: (job: DisplayJob) => void;
}

export function JobCard({ job, isActive, isApplied = false, onClick, onApply }: JobCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { data: savedIds = [] } = useSavedJobIds();
  const toggleSave = useToggleSaveJob();
  const isSaved = savedIds.includes(job.id);

  const salary = formatSalary(job.salary?.min ?? 0, job.salary?.max ?? 0);
  const location = formatLocation(job.location?.city ?? "", job.location?.state);
  const posted = formatRelativeTime(job.postedAt);
  const isNew = useMemo(() => isPostedRecently(job.postedAt), [job.postedAt]);
  const activelyHiring = useMemo(() => isActivelyHiring(job.postedAt), [job.postedAt]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const urgentDeadline = useMemo(() => isUrgentDeadline((job as any).applicationDeadline), [(job as any).applicationDeadline]);
  const rating = useMemo(() => getCompanyRating(job.companyName), [job.companyName]);
  const applicantCount = useMemo(() => getApplicantCount(job.id), [job.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate({ jobId: job.id, isSaved });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
      className={cn(
        "group relative flex gap-3 px-4 py-4 cursor-pointer transition-all outline-none",
        isActive
          ? "bg-gradient-to-r from-blue-50/80 via-background to-background border-l-[3px] border-l-blue-600 dark:from-blue-950/30 dark:border-l-blue-400"
          : "hover:bg-accent/60",
        job.isSponsored && !isActive && "bg-amber-50/30 dark:bg-amber-950/10"
      )}
    >
      {/* Company avatar */}
      <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="sm" />

      <div className="min-w-0 flex-1">
        {/* Top row: Title + Bookmark */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "text-[13px] font-semibold line-clamp-2 leading-snug",
            isActive ? "text-blue-700 dark:text-blue-300" : "text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300"
          )}>
            {job.title}
          </h3>
          {isAuthenticated && (
            <button
              onClick={handleSave}
              className={cn(
                "shrink-0 rounded-full p-1 transition-all -mt-0.5",
                isSaved
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-blue-600 dark:hover:text-blue-400"
              )}
              aria-label={isSaved ? "Unsave" : "Save"}
            >
              <BookmarkIcon className={cn("h-4 w-4", isSaved && "fill-blue-600 dark:fill-blue-400")} />
            </button>
          )}
        </div>

        {/* Company name + star rating (Glassdoor pattern) */}
        <div className="mt-0.5 flex items-center gap-1.5">
          <p className="text-[12px] text-muted-foreground line-clamp-1">{job.companyName}</p>
          {rating >= 3.5 && (
            <div className="flex items-center gap-0.5">
              <StarIcon className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{rating}</span>
            </div>
          )}
        </div>

        {/* Location + Salary */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          {location && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPinIcon className="h-3 w-3 text-rose-500/70" />
              {location}
            </span>
          )}
          {salary ? (
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <BanknoteIcon className="h-3 w-3" />
              {salary}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground/50">Salary not disclosed</span>
          )}
        </div>

        {/* Tags row */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* Actively Hiring badge (Naukri/Internshala pattern) */}
          {activelyHiring && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-500/15 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Actively Hiring
            </span>
          )}

          {isNew && !activelyHiring && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
              New
            </span>
          )}

          {/* Urgency: Apply by date (Internshala pattern) */}
          {urgentDeadline && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-500/15 dark:text-red-400">
              <ClockIcon className="h-2.5 w-2.5" />
              Deadline soon
            </span>
          )}

          {job.jobType && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TAG_STYLE[job.jobType] ?? "bg-muted text-muted-foreground")}>
              {capitalize(job.jobType)}
            </span>
          )}

          {job.remotePolicy && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TAG_STYLE[job.remotePolicy] ?? "bg-muted text-muted-foreground")}>
              {capitalize(job.remotePolicy)}
            </span>
          )}

          {job.experienceLevel && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TAG_STYLE[job.experienceLevel] ?? "bg-muted text-muted-foreground")}>
              {capitalize(job.experienceLevel)}
            </span>
          )}

          {job.isSponsored && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <StarIcon className="h-2.5 w-2.5 fill-current" />
              Promoted
            </span>
          )}

          <MatchScoreBadge job={job} />
        </div>

        {/* Bottom row: Posted time + applicant count (LinkedIn pattern) */}
        <div className="mt-2 flex items-center gap-3">
          {posted && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
              <ClockIcon className="h-2.5 w-2.5" />
              {posted}
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <UsersIcon className="h-2.5 w-2.5" />
            {applicantCount} applicants
          </span>
          {activelyHiring && (
            <span className="flex items-center gap-1 text-[10px] text-primary/70">
              <TrendingUpIcon className="h-2.5 w-2.5" />
              Trending
            </span>
          )}
        </div>
      </div>

      {/* Quick apply / applied state */}
      <div className="absolute right-3 bottom-3 transition-opacity opacity-0 group-hover:opacity-100">
        {isApplied ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckIcon className="h-2.5 w-2.5" />
            Applied
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onApply?.(job);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <ZapIcon className="h-2.5 w-2.5" />
            Apply
          </button>
        )}
      </div>
    </div>
  );
}
