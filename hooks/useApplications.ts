"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSeekerApplications,
  getJobApplications,
  createApplication,
  updateApplicationStatus,
  hasApplied,
} from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import type { ApplicationCreateInput, ApplicationStatus } from "@/types";

export function useSeekerApplications() {
  const uid = useAuthStore((s) => s.uid);

  return useQuery({
    queryKey: ["applications", "seeker", uid],
    queryFn: () => {
      if (!uid) return [];
      return getSeekerApplications(uid);
    },
    enabled: !!uid,
  });
}

export function useJobApplications(jobId: string) {
  return useQuery({
    queryKey: ["applications", "job", jobId],
    queryFn: () => getJobApplications(jobId),
    enabled: !!jobId,
  });
}

export function useHasApplied(jobId: string) {
  const uid = useAuthStore((s) => s.uid);

  return useQuery({
    queryKey: ["hasApplied", jobId, uid],
    queryFn: () => {
      if (!uid || !jobId) return false;
      return hasApplied(jobId, uid);
    },
    enabled: !!uid && !!jobId,
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  const { uid, user } = useAuthStore();

  return useMutation({
    mutationFn: async (input: ApplicationCreateInput) => {
      if (!uid || !user) throw new Error("Not authenticated");
      return createApplication(input, uid, user.displayName);
    },
    onSuccess: (_applicationId, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications", "seeker", uid] });
      queryClient.invalidateQueries({ queryKey: ["hasApplied", variables.jobId, uid] });
      queryClient.invalidateQueries({ queryKey: ["job", variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ["employerJobs"] });
      queryClient.invalidateQueries({ queryKey: ["employerDashboard"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      notes,
    }: {
      applicationId: string;
      status: ApplicationStatus;
      notes?: string;
    }) => {
      return updateApplicationStatus(applicationId, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}
