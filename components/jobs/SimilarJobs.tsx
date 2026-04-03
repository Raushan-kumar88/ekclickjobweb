"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MapPinIcon, BanknoteIcon, BriefcaseIcon, ArrowRightIcon } from "lucide-react";
import { getJobsByCategory } from "@/lib/firebase/db";
import { formatSalary, formatLocation } from "@/lib/utils/formatters";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DisplayJob } from "@/lib/firebase/db";

interface SimilarJobsProps {
  currentJobId: string;
  category: string;
  skills?: string[];
}

export function SimilarJobs({ currentJobId, category, skills = [] }: SimilarJobsProps) {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["similarJobs", category],
    queryFn: () => getJobsByCategory(category, 10),
    staleTime: 5 * 60 * 1000,
  });

  const similar = useMemo(() => {
    return jobs
      .filter((j: DisplayJob) => j.id !== currentJobId)
      .sort((a: DisplayJob, b: DisplayJob) => {
        const aMatch = skills.filter((s) =>
          (a.skills ?? []).some((js) => js.toLowerCase().includes(s.toLowerCase()))
        ).length;
        const bMatch = skills.filter((s) =>
          (b.skills ?? []).some((js) => js.toLowerCase().includes(s.toLowerCase()))
        ).length;
        return bMatch - aMatch;
      })
      .slice(0, 4);
  }, [jobs, currentJobId, skills]);

  if (!isLoading && similar.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Similar Jobs</h3>
        <Link
          href={`/jobs?category=${encodeURIComponent(category)}`}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View all <ArrowRightIcon className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border p-3">
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {similar.map((job: DisplayJob) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group flex items-start gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-accent/30"
            >
              <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                  {job.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{job.companyName}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                  {job.location?.city && (
                    <span className="flex items-center gap-0.5">
                      <MapPinIcon className="h-2.5 w-2.5" />
                      {formatLocation(job.location.city, job.location.state)}
                    </span>
                  )}
                  {(job.salary?.min || job.salary?.max) && (
                    <span className="flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      <BanknoteIcon className="h-2.5 w-2.5" />
                      {formatSalary(job.salary.min ?? 0, job.salary.max ?? 0)}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <BriefcaseIcon className="h-2.5 w-2.5" />
                    {job.jobType}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
