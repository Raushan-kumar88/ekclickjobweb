"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  SearchIcon,
  BookmarkIcon,
  FileTextIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  SlidersHorizontalIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  StarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProfileCompleteness } from "@/components/seeker/ProfileCompleteness";
import { ActivityScore } from "@/components/seeker/ActivityScore";
import { usePersonalizedFeed } from "@/hooks/usePersonalizedFeed";
import { useSavedJobIds } from "@/hooks/useSavedJobs";
import { useSeekerApplications } from "@/hooks/useApplications";
import { useAuthStore } from "@/stores/authStore";
import { toDisplayJob } from "@/lib/firebase/db";
import { cn } from "@/lib/utils";

const JOB_TYPE_FILTERS = ["full-time", "part-time", "contract", "internship", "freelance"];
const REMOTE_FILTERS = ["onsite", "remote", "hybrid"];
const EXP_FILTERS = ["fresher", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

export default function SeekerDashboard() {
  const { user } = useAuthStore();
  const [activeJobTypes, setActiveJobTypes] = useState<string[]>([]);
  const [activeRemote, setActiveRemote] = useState<string | null>(null);
  const [activeExp, setActiveExp] = useState<string | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const { jobs: rawJobs, isLoading, hasNextPage, fetchNextPage, totalCount } = usePersonalizedFeed({
    jobTypes: activeJobTypes,
    remotePolicy: activeRemote,
    experienceLevel: activeExp,
  });

  const { data: savedIds = [] } = useSavedJobIds();
  const { data: applications = [] } = useSeekerApplications();

  const displayJobs = useMemo(
    () => rawJobs.map((j) => toDisplayJob(j)),
    [rawJobs]
  );

  function toggleJobType(type: string) {
    setActiveJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function toggleRemote(policy: string) {
    setActiveRemote((prev) => (prev === policy ? null : policy));
  }

  function toggleExp(level: string) {
    setActiveExp((prev) => (prev === level ? null : level));
  }

  const activeFilterCount =
    activeJobTypes.length + (activeRemote ? 1 : 0) + (activeExp ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {totalCount > 0 ? `${totalCount} jobs waiting for you` : "Explore the latest opportunities"}
        </p>
      </div>

      {/* Activity Score + Profile side-by-side on wider screens */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileCompleteness user={user} compact />
        <ActivityScore user={user} applicationsCount={applications.length} savedJobsCount={savedIds.length} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Applications"
          value={applications.length}
          icon={FileTextIcon}
          href="/seeker/applications"
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          label="Saved Jobs"
          value={savedIds.length}
          icon={BookmarkIcon}
          href="/seeker/saved-jobs"
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          label="Active Jobs"
          value={totalCount}
          icon={BriefcaseIcon}
          href="/jobs"
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Personalized Feed</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setShowMoreFilters((v) => !v)}
          >
            <SlidersHorizontalIcon className="h-3.5 w-3.5" />
            Filters
            <ChevronDownIcon
              className={cn("h-3.5 w-3.5 transition-transform", showMoreFilters && "rotate-180")}
            />
          </Button>
        </div>

        {/* Job Type chips */}
        <div className="flex flex-wrap gap-2">
          {JOB_TYPE_FILTERS.map((type) => (
            <button
              key={type}
              onClick={() => toggleJobType(type)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                activeJobTypes.includes(type)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {showMoreFilters && (
          <div className="mt-3 space-y-3 border-t pt-3">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Work Policy
              </p>
              <div className="flex flex-wrap gap-2">
                {REMOTE_FILTERS.map((policy) => (
                  <button
                    key={policy}
                    onClick={() => toggleRemote(policy)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                      activeRemote === policy
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {policy}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Experience Level
              </p>
              <div className="flex flex-wrap gap-2">
                {EXP_FILTERS.map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleExp(level)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                      activeExp === level
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setActiveJobTypes([]);
                  setActiveRemote(null);
                  setActiveExp(null);
                }}
                className="text-xs text-destructive hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Job Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayJobs.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No jobs found"
          description={
            activeFilterCount > 0
              ? "Try adjusting your filters to see more results."
              : "No active jobs match your profile yet. Check back soon!"
          }
          action={
            activeFilterCount > 0
              ? {
                  label: "Clear Filters",
                  onClick: () => {
                    setActiveJobTypes([]);
                    setActiveRemote(null);
                    setActiveExp(null);
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {displayJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
            />
          ))}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={fetchNextPage} className="gap-2">
                <RefreshCwIcon className="h-4 w-4" />
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
