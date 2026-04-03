"use client";

import Link from "next/link";
import {
  MapPinIcon,
  BanknoteIcon,
  BriefcaseIcon,
  MonitorIcon,
  GraduationCapIcon,
  XIcon,
  ExternalLinkIcon,
  SparklesIcon,
} from "lucide-react";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { JobDetailActions } from "./JobDetailActions";
import { formatSalary, formatDate, formatLocation } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { DisplayJob } from "@/lib/firebase/db";
import { buttonVariants } from "@/lib/utils/button-variants";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TAG_COLORS: Record<string, string> = {
  "full-time": "bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30",
  "part-time": "bg-indigo-100 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30",
  contract: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  internship: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  freelance: "bg-teal-100 text-teal-700 ring-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:ring-teal-500/30",
  remote: "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30",
  "on-site": "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/30",
  hybrid: "bg-cyan-100 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:ring-cyan-500/30",
  fresher: "bg-orange-100 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/30",
  "1-3 years": "bg-orange-100 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/30",
  "3-5 years": "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30",
  "5-10 years": "bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30",
  "10+ years": "bg-indigo-100 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30",
};

const OVERVIEW_CARDS = [
  { key: "salary" as const, icon: BanknoteIcon, label: "Salary", gradient: "from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/5", iconColor: "text-emerald-600 dark:text-emerald-400", valueColor: "text-emerald-700 dark:text-emerald-300" },
  { key: "jobType" as const, icon: BriefcaseIcon, label: "Job Type", gradient: "from-blue-500/10 to-blue-500/5 dark:from-blue-500/10 dark:to-blue-500/5", iconColor: "text-blue-600 dark:text-blue-400", valueColor: "" },
  { key: "remotePolicy" as const, icon: MonitorIcon, label: "Work Mode", gradient: "from-violet-500/10 to-violet-500/5 dark:from-violet-500/10 dark:to-violet-500/5", iconColor: "text-violet-600 dark:text-violet-400", valueColor: "" },
  { key: "experienceLevel" as const, icon: GraduationCapIcon, label: "Experience", gradient: "from-amber-500/10 to-amber-500/5 dark:from-amber-500/10 dark:to-amber-500/5", iconColor: "text-amber-600 dark:text-amber-400", valueColor: "" },
];

interface JobDetailPreviewProps {
  job: DisplayJob;
  onClose: () => void;
}

export function JobDetailPreview({ job, onClose }: JobDetailPreviewProps) {
  const salary = formatSalary(job.salary?.min ?? 0, job.salary?.max ?? 0);
  const location = formatLocation(job.location?.city ?? "", job.location?.state);
  const postedDate = formatDate(job.postedAt);

  function getOverviewValue(key: string): string {
    switch (key) {
      case "salary": return salary;
      case "jobType": return capitalize(job.jobType);
      case "remotePolicy": return capitalize(job.remotePolicy);
      case "experienceLevel": return capitalize(job.experienceLevel);
      default: return "";
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header with gradient */}
      <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50/50 via-background to-background px-5 py-3 dark:from-blue-950/20">
        <div className="flex items-center gap-2.5 text-sm min-w-0">
          <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="xs" />
          <span className="truncate font-semibold text-foreground">{job.companyName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/jobs/${job.id}`}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300 transition-colors"
            title="Open full page"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl p-5 space-y-6">
          {/* Title area with subtle gradient bg */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50/60 via-background to-sky-50/40 p-4 ring-1 ring-blue-100/50 dark:from-blue-950/20 dark:to-sky-950/10 dark:ring-blue-800/20">
            <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {job.companyName}
              {location && (
                <span className="inline-flex items-center gap-1 ml-1">
                  · <MapPinIcon className="h-3 w-3 text-rose-500/70" /> {location}
                </span>
              )}
              {postedDate && <> · {postedDate}</>}
              {typeof job.applicationsCount === "number" && job.applicationsCount > 0 && (
                <> · <span className="font-medium text-blue-600 dark:text-blue-400">{job.applicationsCount} applicant{job.applicationsCount !== 1 ? "s" : ""}</span></>
              )}
            </p>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.remotePolicy && (
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", TAG_COLORS[job.remotePolicy] ?? "")}>
                  {capitalize(job.remotePolicy)}
                </span>
              )}
              {job.jobType && (
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", TAG_COLORS[job.jobType] ?? "")}>
                  {capitalize(job.jobType)}
                </span>
              )}
              {job.experienceLevel && (
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", TAG_COLORS[job.experienceLevel] ?? "")}>
                  {capitalize(job.experienceLevel)}
                </span>
              )}
            </div>
          </div>

          {/* Apply actions */}
          <JobDetailActions job={job} />

          {/* Overview grid with colored gradient cards */}
          <div className="grid grid-cols-2 gap-3">
            {OVERVIEW_CARDS.map(({ key, icon: Icon, label, gradient, iconColor, valueColor }) => (
              <div key={key} className={cn("rounded-xl bg-gradient-to-br p-3.5 ring-1 ring-black/5 dark:ring-white/5", gradient)}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className={cn("h-3.5 w-3.5", iconColor)} />
                  {label}
                </div>
                <div className={cn("mt-1 text-sm font-bold", valueColor)}>{getOverviewValue(key)}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15">
                <SparklesIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">About the job</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {job.description}
            </div>
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100 dark:from-blue-500/10 dark:to-sky-500/10 dark:text-blue-300 dark:ring-blue-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full page link */}
          <div className="pt-2 pb-4">
            <Link
              href={`/jobs/${job.id}`}
              className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2")}
            >
              <ExternalLinkIcon className="h-4 w-4" />
              See full job details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
