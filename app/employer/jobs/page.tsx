"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircleIcon, BriefcaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { EmployerJobCard } from "@/components/employer/EmployerJobCard";
import { useEmployerJobs } from "@/hooks/useEmployerJobs";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/types";

const STATUS_TABS: { value: JobStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "closed", label: "Closed" },
];

export default function EmployerJobsPage() {
  const [activeTab, setActiveTab] = useState<JobStatus | "all">("all");
  const { data: jobs = [], isLoading } = useEmployerJobs();

  const filtered = activeTab === "all" ? jobs : jobs.filter((j) => j.status === activeTab);

  const counts = jobs.reduce(
    (acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      acc.all = (acc.all ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">My Jobs</h1>
            {jobs.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {jobs.length}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Manage your job postings</p>
        </div>
        <Link href="/employer/jobs/new">
          <Button className="gap-2">
            <PlusCircleIcon className="h-4 w-4" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border bg-muted/30 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {counts[tab.value] ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  activeTab === tab.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {counts[tab.value]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Job list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border p-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="mt-2 h-4 w-1/3" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title={activeTab === "all" ? "No jobs posted yet" : `No ${activeTab} jobs`}
          description={
            activeTab === "all"
              ? "Post your first job to start receiving applications."
              : undefined
          }
          action={
            activeTab === "all"
              ? { label: "Post a Job", href: "/employer/jobs/new" }
              : { label: "View All", onClick: () => setActiveTab("all") }
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <EmployerJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
