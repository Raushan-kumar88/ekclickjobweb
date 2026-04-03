"use client";

import { useState, useMemo } from "react";
import { FileTextIcon, TrendingUpIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationCard } from "@/components/jobs/ApplicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSeekerApplications } from "@/hooks/useApplications";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const STATUS_TABS: { value: ApplicationStatus | "all"; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All", icon: FileTextIcon },
  { value: "applied", label: "Applied", icon: ClockIcon },
  { value: "shortlisted", label: "Shortlisted", icon: TrendingUpIcon },
  { value: "interview", label: "Interview", icon: CheckCircleIcon },
  { value: "offered", label: "Offered", icon: CheckCircleIcon },
  { value: "rejected", label: "Not Selected", icon: XCircleIcon },
];

const STATUS_COUNTS_COLOR: Record<string, string> = {
  applied: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  shortlisted: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  interview: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  offered: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  viewed: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
};

export default function ApplicationsPage() {
  const { data: applications = [], isLoading } = useSeekerApplications();
  const [activeTab, setActiveTab] = useState<ApplicationStatus | "all">("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return applications;
    return applications.filter((a) => a.status === activeTab);
  }, [applications, activeTab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: applications.length };
    applications.forEach((a) => {
      c[a.status] = (c[a.status] ?? 0) + 1;
    });
    return c;
  }, [applications]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">My Applications</h1>
          {applications.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {applications.length}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of all your job applications
        </p>
      </div>

      {/* Stats row */}
      {!isLoading && applications.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["applied", "shortlisted", "interview", "offered"] as ApplicationStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors hover:border-primary/40",
                activeTab === s && "border-primary/40 bg-accent/30"
              )}
            >
              <p className="text-2xl font-bold">{counts[s] ?? 0}</p>
              <p
                className={cn(
                  "mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  STATUS_COUNTS_COLOR[s]
                )}
              >
                {s}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border bg-muted/30 p-1">
        {STATUS_TABS.filter((t) => counts[t.value] !== 0 || t.value === "all").map((tab) => (
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
                  activeTab === tab.value
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {counts[tab.value]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileTextIcon}
          title={
            activeTab === "all"
              ? "No applications yet"
              : `No ${activeTab} applications`
          }
          description={
            activeTab === "all"
              ? "Start applying to jobs to track your applications here."
              : `You don't have any applications with ${activeTab} status.`
          }
          action={
            activeTab === "all"
              ? { label: "Browse Jobs", href: "/jobs" }
              : { label: "View All", onClick: () => setActiveTab("all") }
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}
