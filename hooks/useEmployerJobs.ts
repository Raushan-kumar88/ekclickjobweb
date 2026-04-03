"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployerJobs, getJob, createJob, updateJob, getEmployerApplications } from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import type { JobCreateInput, JobStatus } from "@/types";

const KEY = "employerJobs";

function invalidateEmployerQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: [KEY] });
  qc.invalidateQueries({ queryKey: ["employerDashboard"] });
  qc.invalidateQueries({ queryKey: ["employerRecent"] });
  qc.invalidateQueries({ queryKey: ["allActiveJobs"] });
}

export function useEmployerJobs(status?: JobStatus) {
  const uid = useAuthStore((s) => s.uid);
  return useQuery({
    queryKey: [KEY, uid, status ?? "all"],
    queryFn: () => (uid ? getEmployerJobs(uid, status) : []),
    enabled: !!uid,
  });
}

export function useEmployerApplications() {
  const uid = useAuthStore((s) => s.uid);
  return useQuery({
    queryKey: ["employerApplications", uid],
    queryFn: () => (uid ? getEmployerApplications(uid) : []),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  });
}

export function useEmployerJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => (jobId ? getJob(jobId) : null),
    enabled: !!jobId,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  const uid = useAuthStore((s) => s.uid);
  return useMutation({
    mutationFn: (data: JobCreateInput) => {
      if (!uid) throw new Error("Not authenticated");
      return createJob(data, uid);
    },
    onSuccess: () => invalidateEmployerQueries(qc),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Record<string, unknown> }) =>
      updateJob(jobId, data),
    onSuccess: (_, { jobId }) => {
      qc.invalidateQueries({ queryKey: ["job", jobId] });
      invalidateEmployerQueries(qc);
    },
  });
}

export function usePauseJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => updateJob(jobId, { status: "paused" }),
    onSuccess: () => invalidateEmployerQueries(qc),
  });
}

export function useResumeJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => updateJob(jobId, { status: "active" }),
    onSuccess: () => invalidateEmployerQueries(qc),
  });
}

export function useCloseJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => updateJob(jobId, { status: "closed" }),
    onSuccess: () => invalidateEmployerQueries(qc),
  });
}
