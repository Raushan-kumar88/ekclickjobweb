"use client";

import { useMemo } from "react";
import {
  MapPinIcon, BanknoteIcon, ClockIcon, BookmarkIcon,
  BriefcaseIcon, CodeIcon, TrendingUpIcon, HeartIcon,
  GraduationCapIcon, PaletteIcon, DatabaseIcon, PenSquareIcon,
  ShieldIcon, BarChartIcon, HeadphonesIcon, SettingsIcon,
  UsersIcon, MonitorIcon, StarIcon, ZapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSalary, formatRelativeTime } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/authStore";
import { useSavedJobIds, useToggleSaveJob } from "@/hooks/useSavedJobs";
import type { DisplayJob } from "@/lib/firebase/db";

// Category → icon mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "IT & Software":        CodeIcon,
  "Marketing":            TrendingUpIcon,
  "Sales":                BarChartIcon,
  "Finance & Accounting": BarChartIcon,
  "Healthcare":           HeartIcon,
  "Education":            GraduationCapIcon,
  "Engineering":          SettingsIcon,
  "Design":               PaletteIcon,
  "Human Resources":      UsersIcon,
  "Operations":           SettingsIcon,
  "Legal":                ShieldIcon,
  "Customer Support":     HeadphonesIcon,
  "Data Science":         DatabaseIcon,
  "Content & Writing":    PenSquareIcon,
  "Administration":       BriefcaseIcon,
  "Other":                MonitorIcon,
};

// Category → subtle indigo/violet palette per card (all stay in the purple-blue family)
const ICON_PALETTE: Record<string, { bg: string; icon: string }> = {
  "IT & Software":        { bg: "bg-indigo-50 dark:bg-indigo-500/15",  icon: "text-indigo-600 dark:text-indigo-400" },
  "Marketing":            { bg: "bg-violet-50 dark:bg-violet-500/15",  icon: "text-violet-600 dark:text-violet-400" },
  "Sales":                { bg: "bg-blue-50 dark:bg-blue-500/15",      icon: "text-blue-600 dark:text-blue-400"     },
  "Finance & Accounting": { bg: "bg-indigo-50 dark:bg-indigo-500/15",  icon: "text-indigo-700 dark:text-indigo-400" },
  "Healthcare":           { bg: "bg-violet-50 dark:bg-violet-500/15",  icon: "text-violet-700 dark:text-violet-400" },
  "Education":            { bg: "bg-blue-50 dark:bg-blue-500/15",      icon: "text-blue-700 dark:text-blue-400"     },
  "Engineering":          { bg: "bg-indigo-50 dark:bg-indigo-500/15",  icon: "text-indigo-600 dark:text-indigo-400" },
  "Design":               { bg: "bg-violet-50 dark:bg-violet-500/15",  icon: "text-violet-600 dark:text-violet-400" },
  "Human Resources":      { bg: "bg-blue-50 dark:bg-blue-500/15",      icon: "text-blue-700 dark:text-blue-400"     },
  "Data Science":         { bg: "bg-indigo-50 dark:bg-indigo-500/15",  icon: "text-indigo-700 dark:text-indigo-400" },
};

function getCompanyRating(name: string): number {
  if (!name) return 0;
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return parseFloat((3.2 + (hash % 160) / 100).toFixed(1));
}

function getApplicantCount(jobId: string): number {
  const hash = jobId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 20 + (hash % 361);
}

interface FeaturedJobCardProps {
  job: DisplayJob;
  onClick?: () => void;
}

export function FeaturedJobCard({ job, onClick }: FeaturedJobCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { data: savedIds = [] } = useSavedJobIds();
  const toggleSave = useToggleSaveJob();
  const isSaved = savedIds.includes(job.id);

  const salary  = formatSalary(job.salary?.min ?? 0, job.salary?.max ?? 0);
  const posted  = formatRelativeTime(job.postedAt);
  const rating  = useMemo(() => getCompanyRating(job.companyName), [job.companyName]);
  const applicants = useMemo(() => getApplicantCount(job.id), [job.id]);

  const Icon    = CATEGORY_ICONS[job.category] ?? BriefcaseIcon;
  const palette = ICON_PALETTE[job.category] ?? { bg: "bg-indigo-50 dark:bg-indigo-500/15", icon: "text-indigo-600 dark:text-indigo-400" };

  const jobTypeLabel: Record<string, string> = {
    "full-time": "Full-time", "part-time": "Part-time",
    "contract": "Contract", "internship": "Internship",
    "freelance": "Freelance", "walk-in": "Walk-in Drive",
  };

  const remotePolicyLabel: Record<string, string> = {
    "on-site": "On-site", "remote": "Remote", "hybrid": "Hybrid",
  };

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate({ jobId: job.id, isSaved });
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
      className="group relative flex flex-col h-full cursor-pointer p-6 outline-none"
    >
      {/* ── Icon square (top) ── */}
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105",
          palette.bg
        )}>
          <Icon className={cn("h-6 w-6", palette.icon)} />
        </div>

        {/* Bookmark */}
        {isAuthenticated && (
          <button
            onClick={handleSave}
            className={cn(
              "rounded-full p-1.5 transition-all",
              isSaved
                ? "text-indigo-600"
                : "text-slate-300 opacity-0 group-hover:opacity-100 hover:text-indigo-500"
            )}
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            <BookmarkIcon className={cn("h-4 w-4", isSaved && "fill-indigo-600")} />
          </button>
        )}
      </div>

      {/* ── Job title ── */}
      <h3 className="mt-4 text-[15px] font-bold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
        {job.title}
      </h3>

      {/* ── Company + rating ── */}
      <div className="mt-1 flex items-center gap-1.5">
        <p className="text-sm text-slate-400 dark:text-slate-500 line-clamp-1">{job.companyName}</p>
        {rating >= 3.5 && (
          <div className="flex items-center gap-0.5">
            <StarIcon className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{rating}</span>
          </div>
        )}
      </div>

      {/* ── Open positions / applicants count ── */}
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
        {applicants}+ Open Positions
      </p>

      {/* ── Divider ── */}
      <div className="my-4 h-px bg-slate-100 dark:bg-slate-800" />

      {/* ── Footer info ── */}
      <div className="mt-auto space-y-2">
        {/* Location + Salary */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {job.location?.city && (
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
              {job.location.city}
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <BanknoteIcon className="h-3.5 w-3.5" />
              {salary}
            </span>
          )}
        </div>

        {/* Tags + posted time */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {job.jobType && (
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                {jobTypeLabel[job.jobType] ?? job.jobType}
              </span>
            )}
            {job.remotePolicy && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {remotePolicyLabel[job.remotePolicy] ?? job.remotePolicy}
              </span>
            )}
          </div>

          {posted && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
              <ClockIcon className="h-3 w-3" />
              {posted}
            </span>
          )}
        </div>
      </div>

      {/* ── Apply CTA (hover) ── */}
      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm shadow-indigo-400/30">
          <ZapIcon className="h-3 w-3" />
          Apply
        </span>
      </div>
    </div>
  );
}
