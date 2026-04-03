"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeaturedJobs, toDisplayJob } from "@/lib/firebase/db";
import { FeaturedJobCard } from "./FeaturedJobCard";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] animate-pulse">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      <div className="mt-4 h-4 w-3/4 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="mt-2 h-3 w-1/2 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="mt-1 h-3 w-1/3 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="my-4 h-px bg-slate-100 dark:bg-slate-800" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="h-5 w-14 rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function FeaturedJobs() {
  const router = useRouter();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: async () => {
      const raw = await getFeaturedJobs(6);
      return raw.map(toDisplayJob);
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!jobs?.length) {
    return (
      <div className="rounded-2xl border bg-muted/30 py-16 text-center text-muted-foreground">
        <SparklesIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="font-medium">No jobs posted yet.</p>
        <p className="text-sm mt-1">Check back soon — new jobs are added daily!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className={cn(
            "group rounded-2xl bg-white dark:bg-slate-900 overflow-hidden",
            "shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
            "transition-all hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] hover:-translate-y-1",
            job.isSponsored && "ring-1 ring-amber-200 dark:ring-amber-500/20"
          )}
          onClick={() => router.push(`/jobs/${job.id}`)}
        >
          {/* Sponsored top accent */}
          {job.isSponsored && (
            <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
          )}
          <FeaturedJobCard job={job} onClick={() => router.push(`/jobs/${job.id}`)} />
        </div>
      ))}
    </div>
  );
}
