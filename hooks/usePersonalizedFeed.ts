"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllActiveJobs } from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import { scoreJob, deriveExperienceLevel } from "@/lib/utils/jobScoring";
import type { Job } from "@/types";

const PAGE_SIZE = 20;

function applyFilters(
  jobs: Job[],
  filterJobTypes: string[],
  filterRemotePolicy: string | null,
  filterExperienceLevel: string | null
): Job[] {
  return jobs.filter((job) => {
    if (filterJobTypes.length > 0 && !filterJobTypes.includes(job.jobType)) return false;
    if (filterRemotePolicy && job.remotePolicy !== filterRemotePolicy) return false;
    if (filterExperienceLevel && job.experienceLevel !== filterExperienceLevel) return false;
    return true;
  });
}

interface FeedFilters {
  jobTypes?: string[];
  remotePolicy?: string | null;
  experienceLevel?: string | null;
}

export function usePersonalizedFeed(filters: FeedFilters = {}) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const skills: string[] = user?.profile?.skills ?? [];
  const city: string = user?.profile?.location?.city ?? "";
  const state: string = user?.profile?.location?.state ?? "";
  const preferredJobTypes: string[] = user?.profile?.preferredJobTypes ?? [];
  const expYears = deriveExperienceLevel(user?.profile?.experience ?? []);

  const hasProfileSignals =
    isAuthenticated && (skills.length > 0 || !!city || preferredJobTypes.length > 0);

  const [page, setPage] = useState(1);

  const allJobsQuery = useQuery<Job[], Error>({
    queryKey: ["allActiveJobs"],
    queryFn: getAllActiveJobs,
    staleTime: 5 * 60 * 1000,
  });

  const sortedJobs = useMemo(() => {
    const all = allJobsQuery.data ?? [];
    if (!hasProfileSignals) return all;

    return all
      .map((job) => ({
        job,
        score: scoreJob(job, skills, city, state, preferredJobTypes, expYears),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        type HasToMillis = { toMillis: () => number };
        const timeA = (a.job.postedAt as HasToMillis | null | undefined)?.toMillis?.() ?? 0;
        const timeB = (b.job.postedAt as HasToMillis | null | undefined)?.toMillis?.() ?? 0;
        return timeB - timeA;
      })
      .map(({ job }) => job);
  }, [allJobsQuery.data, hasProfileSignals, skills, city, state, preferredJobTypes, expYears]);

  const filteredJobs = useMemo(
    () =>
      applyFilters(
        sortedJobs,
        filters.jobTypes ?? [],
        filters.remotePolicy ?? null,
        filters.experienceLevel ?? null
      ),
    [sortedJobs, filters.jobTypes, filters.remotePolicy, filters.experienceLevel]
  );

  const visibleJobs = useMemo(
    () => filteredJobs.slice(0, page * PAGE_SIZE),
    [filteredJobs, page]
  );

  const hasNextPage = visibleJobs.length < filteredJobs.length;

  const fetchNextPage = useCallback(() => {
    if (!hasNextPage) return;
    setPage((p) => p + 1);
  }, [hasNextPage]);

  const refetch = useCallback(() => {
    setPage(1);
    allJobsQuery.refetch();
  }, [allJobsQuery]);

  return {
    jobs: visibleJobs,
    totalCount: filteredJobs.length,
    isLoading: allJobsQuery.isLoading,
    isError: allJobsQuery.isError,
    error: allJobsQuery.error ?? null,
    isRefetching: allJobsQuery.isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  };
}
