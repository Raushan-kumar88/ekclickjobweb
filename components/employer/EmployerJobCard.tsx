"use client";

import Link from "next/link";
import {
  UsersIcon,
  EyeIcon,
  PencilIcon,
  PauseIcon,
  PlayIcon,
  XCircleIcon,
  ChevronRightIcon,
  MapPinIcon,
  BanknoteIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatSalary, formatRelativeTime, formatLocation } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { usePauseJob, useResumeJob, useCloseJob } from "@/hooks/useEmployerJobs";
import type { Job, JobStatus } from "@/types";

const STATUS_CONFIG: Record<JobStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  paused: { label: "Paused", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

interface EmployerJobCardProps {
  job: Job;
}

export function EmployerJobCard({ job }: EmployerJobCardProps) {
  const pause = usePauseJob();
  const resume = useResumeJob();
  const close = useCloseJob();

  const status = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.active;
  const salary = formatSalary(job.salary?.min ?? 0, job.salary?.max ?? 0);
  const location = formatLocation(job.location?.city ?? "", job.location?.state);

  async function handlePause() {
    try {
      await pause.mutateAsync(job.id);
      toast.success("Job paused");
    } catch {
      toast.error("Failed to pause job");
    }
  }

  async function handleResume() {
    try {
      await resume.mutateAsync(job.id);
      toast.success("Job resumed");
    } catch {
      toast.error("Failed to resume job");
    }
  }

  async function handleClose() {
    if (!confirm(`Close "${job.title}"? This will remove it from active listings.`)) return;
    try {
      await close.mutateAsync(job.id);
      toast.success("Job closed");
    } catch {
      toast.error("Failed to close job");
    }
  }

  const isBusy = pause.isPending || resume.isPending || close.isPending;

  return (
    <div className="rounded-xl border bg-background p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{job.title}</h3>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", status.className)}>
              {status.label}
            </span>
            {job.jobType && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {job.jobType}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BanknoteIcon className="h-3.5 w-3.5" />
              {salary}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <UsersIcon className="h-3.5 w-3.5" />
              {job.applicationsCount ?? 0} applicant{job.applicationsCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon className="h-3.5 w-3.5" />
              {job.viewsCount ?? 0} views
            </span>
            <span className="text-xs text-muted-foreground/70">
              Posted {formatRelativeTime(job.postedAt)}
            </span>
          </div>
        </div>

        <Link
          href={`/employer/jobs/${job.id}/applicants`}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Applicants
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Action buttons */}
      {job.status !== "closed" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
          <Link href={`/employer/jobs/${job.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          {job.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handlePause}
              disabled={isBusy}
            >
              <PauseIcon className="h-3.5 w-3.5" />
              Pause
            </Button>
          ) : job.status === "paused" ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleResume}
              disabled={isBusy}
            >
              <PlayIcon className="h-3.5 w-3.5" />
              Resume
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleClose}
            disabled={isBusy}
          >
            <XCircleIcon className="h-3.5 w-3.5" />
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
