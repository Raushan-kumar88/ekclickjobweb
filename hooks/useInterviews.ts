"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  scheduleInterview,
  getEmployerInterviews,
  getSeekerInterviews,
  updateInterviewStatus,
  rescheduleInterview,
  getEmployerAnalytics,
  type ScheduleInterviewInput,
} from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import type { Interview } from "@/types";

// ─── Employer: all interviews ─────────────────────────────────────────────────

export function useEmployerInterviews() {
  const uid = useAuthStore((s) => s.uid);
  return useQuery<Interview[]>({
    queryKey: ["interviews", "employer", uid],
    queryFn: () => (uid ? getEmployerInterviews(uid) : []),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Seeker: upcoming interviews ─────────────────────────────────────────────

export function useSeekerInterviews() {
  const uid = useAuthStore((s) => s.uid);
  return useQuery<Interview[]>({
    queryKey: ["interviews", "seeker", uid],
    queryFn: () => (uid ? getSeekerInterviews(uid) : []),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Schedule interview ───────────────────────────────────────────────────────

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.uid);

  return useMutation({
    mutationFn: (input: ScheduleInterviewInput) => scheduleInterview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews", "employer", uid] });
    },
  });
}

// ─── Update status ────────────────────────────────────────────────────────────

export function useUpdateInterviewStatus() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.uid);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Interview["status"] }) =>
      updateInterviewStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
    onMutate: async ({ id, status }) => {
      // Optimistic update
      const empKey = ["interviews", "employer", uid];
      const prev = queryClient.getQueryData<Interview[]>(empKey);
      if (prev) {
        queryClient.setQueryData(empKey, prev.map((i) => i.id === id ? { ...i, status } : i));
      }
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["interviews", "employer", uid], context.prev);
      }
    },
  });
}

// ─── Reschedule ───────────────────────────────────────────────────────────────

export function useRescheduleInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date, notes }: { id: string; date: Date; notes?: string }) =>
      rescheduleInterview(id, date, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function useEmployerAnalytics() {
  const uid = useAuthStore((s) => s.uid);
  return useQuery({
    queryKey: ["analytics", "employer", uid],
    queryFn: () => (uid ? getEmployerAnalytics(uid) : null),
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });
}
