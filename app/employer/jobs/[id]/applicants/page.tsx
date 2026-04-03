"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeftIcon, UsersIcon, LayoutListIcon, LayoutDashboardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ApplicantCard } from "@/components/employer/ApplicantCard";
import { KanbanBoard } from "@/components/employer/KanbanBoard";
import { useEmployerJob } from "@/hooks/useEmployerJobs";
import { useJobApplications } from "@/hooks/useApplications";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const STATUS_FILTERS: (ApplicationStatus | "all")[] = [
  "all", "applied", "viewed", "shortlisted", "interview", "offered", "rejected",
];

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  applied: "Applied",
  viewed: "Viewed",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  rejected: "Not Selected",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicantsPage({ params }: PageProps) {
  const { id } = use(params);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const { data: job, isLoading: jobLoading } = useEmployerJob(id);
  const {
    data: applications = [],
    isLoading: appsLoading,
    refetch,
  } = useJobApplications(id ?? "");

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? applications
        : applications.filter((a) => a.status === statusFilter),
    [applications, statusFilter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: applications.length };
    applications.forEach((a) => {
      c[a.status] = (c[a.status] ?? 0) + 1;
    });
    return c;
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/employer/jobs">
          <Button variant="ghost" size="icon" className="mt-1 h-8 w-8 shrink-0">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          {jobLoading ? (
            <>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-1 h-4 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold">{job?.title ?? "Applicants"}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {applications.length} applicant{applications.length !== 1 ? "s" : ""}
                {job?.companyName && ` · ${job.companyName}`}
              </p>
            </>
          )}
        </div>
        {/* View mode toggle */}
        <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
          <button
            onClick={() => setViewMode("list")}
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <LayoutListIcon className="h-3.5 w-3.5" /> List
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "kanban" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <LayoutDashboardIcon className="h-3.5 w-3.5" /> Kanban
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      {viewMode === "list" && <div className="flex gap-1 overflow-x-auto rounded-xl border bg-muted/30 p-1">
        {STATUS_FILTERS.filter((s) => counts[s] !== 0 || s === "all").map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === s
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {STATUS_LABELS[s] ?? s}
            {counts[s] != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  statusFilter === s
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>}

      {/* Kanban view */}
      {viewMode === "kanban" && (
        appsLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex w-52 shrink-0 flex-col gap-2 rounded-2xl border p-2">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No applicants yet"
            description="Share your job listing to attract candidates."
          />
        ) : (
          <KanbanBoard applications={applications} />
        )
      )}

      {/* List view */}
      {viewMode === "list" && (appsLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={statusFilter === "all" ? "No applicants yet" : `No ${STATUS_LABELS[statusFilter]} applicants`}
          description={
            statusFilter === "all"
              ? "Share your job listing to attract candidates."
              : undefined
          }
          action={
            statusFilter !== "all"
              ? { label: "View All", onClick: () => setStatusFilter("all") }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((application) => (
            <ApplicantCard key={application.id} application={application} />
          ))}
        </div>
      ))}
    </div>
  );
}
