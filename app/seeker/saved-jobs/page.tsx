"use client";

import { useMemo, useState } from "react";
import { BookmarkIcon, SearchIcon } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailPreview } from "@/components/jobs/JobDetailPreview";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useSeekerApplications } from "@/hooks/useApplications";
import { toDisplayJob, type DisplayJob } from "@/lib/firebase/db";
import Link from "next/link";
import { buttonVariants } from "@/lib/utils/button-variants";
import { useRouter } from "next/navigation";

export default function SavedJobsPage() {
  const { data: rawJobs = [], isLoading } = useSavedJobs();
  const { data: applications = [] } = useSeekerApplications();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const router = useRouter();

  const jobs = useMemo(() => rawJobs.map((j) => toDisplayJob(j)), [rawJobs]);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((a) => a.jobId)),
    [applications]
  );

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  function handleJobClick(job: DisplayJob) {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      router.push(`/jobs/${job.id}`);
      return;
    }
    setSelectedJobId(job.id);
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-0 overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* ── Left: saved jobs list ── */}
      <div className="flex w-full flex-col lg:w-[420px] lg:shrink-0 lg:border-r overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-background/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-bold">Saved Jobs</h1>
            {jobs.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {jobs.length}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Bookmarked to apply later
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="divide-y">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={BookmarkIcon}
                title="No saved jobs yet"
                description="Browse jobs and click the bookmark icon to save them here for later."
                action={{ label: "Browse Jobs", href: "/jobs" }}
              />
            </div>
          ) : (
            <div className="divide-y">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isActive={selectedJobId === job.id}
                  isApplied={appliedJobIds.has(job.id)}
                  onClick={() => handleJobClick(job)}
                  onApply={(j) => handleJobClick(j)}
                />
              ))}
              <div className="p-4 text-center">
                <Link href="/jobs" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <SearchIcon className="mr-2 h-3.5 w-3.5" />
                  Find More Jobs
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: detail preview panel (desktop) ── */}
      <div className="hidden lg:flex flex-1 flex-col bg-background">
        {selectedJob ? (
          <JobDetailPreview job={selectedJob} onClose={() => setSelectedJobId(null)} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-center p-10 bg-gradient-to-br from-blue-50/40 via-background to-sky-50/30 dark:from-blue-950/10 dark:to-sky-950/10">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-500/15 dark:to-sky-500/15">
                <BookmarkIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">Select a saved job</h3>
              <p className="mt-1.5 max-w-xs mx-auto text-sm text-muted-foreground">
                Click any job from the list to see its full details here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
