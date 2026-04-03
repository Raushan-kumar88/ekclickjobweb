"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmployerJobs, getJobApplications } from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import type { Job, Application } from "@/types";

export interface EmployerDashboardStats {
  activeJobs: number;
  totalApplicants: number;
  totalViews: number;
  applyRate: number;
}

async function fetchRecentApplications(uid: string): Promise<Application[]> {
  const jobs = await getEmployerJobs(uid);
  const all: Application[] = [];
  for (const j of jobs.slice(0, 5)) {
    const apps = await getJobApplications(j.id);
    all.push(...apps.map((a) => ({ ...a, jobTitle: a.jobTitle || j.title })));
  }
  type HasToMillis = { toMillis: () => number };
  all.sort((a, b) => {
    const at = (a.appliedAt as HasToMillis | null | undefined)?.toMillis?.() ?? 0;
    const bt = (b.appliedAt as HasToMillis | null | undefined)?.toMillis?.() ?? 0;
    return bt - at;
  });
  return all.slice(0, 5);
}

export function useEmployerDashboard() {
  const uid = useAuthStore((s) => s.uid);

  const jobsQ = useQuery({
    queryKey: ["employerDashboard", uid],
    queryFn: () => (uid ? getEmployerJobs(uid) : []),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  });

  const recentQ = useQuery({
    queryKey: ["employerRecent", uid],
    queryFn: () => (uid ? fetchRecentApplications(uid) : []),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  });

  const jobs: Job[] = jobsQ.data ?? [];
  const stats: EmployerDashboardStats = {
    activeJobs: jobs.filter((j) => j.status === "active").length,
    totalApplicants: jobs.reduce((s, j) => s + (j.applicationsCount ?? 0), 0),
    totalViews: jobs.reduce((s, j) => s + (j.viewsCount ?? 0), 0),
    applyRate: 0,
  };
  stats.applyRate =
    stats.totalViews > 0 ? Math.round((stats.totalApplicants / stats.totalViews) * 100) : 0;

  return {
    jobs,
    stats,
    recentApplications: recentQ.data ?? [],
    isLoading: jobsQ.isLoading,
    isError: jobsQ.isError || recentQ.isError,
    isRecentLoading: recentQ.isLoading,
    isRefetching: jobsQ.isRefetching || recentQ.isRefetching,
    refetch: () => {
      jobsQ.refetch();
      recentQ.refetch();
    },
  };
}
