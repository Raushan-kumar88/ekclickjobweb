"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSavedJobIds, saveJob, unsaveJob, getJob } from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import type { Job } from "@/types";

export function useSavedJobIds() {
  const uid = useAuthStore((s) => s.uid);

  return useQuery({
    queryKey: ["savedJobs", "ids", uid],
    queryFn: () => {
      if (!uid) return [];
      return getSavedJobIds(uid);
    },
    enabled: !!uid,
  });
}

export function useSavedJobs() {
  const uid = useAuthStore((s) => s.uid);
  const { data: savedIds = [] } = useSavedJobIds();

  return useQuery<Job[]>({
    queryKey: ["savedJobs", "full", uid, savedIds],
    queryFn: async () => {
      if (savedIds.length === 0) return [];
      const jobs = await Promise.all(savedIds.map((id) => getJob(id)));
      return jobs.filter((job): job is Job => job !== null);
    },
    enabled: !!uid && savedIds.length > 0,
  });
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.uid);

  return useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: string; isSaved: boolean }) => {
      if (!uid) throw new Error("Not authenticated");
      if (isSaved) {
        await unsaveJob(uid, jobId);
      } else {
        await saveJob(uid, jobId);
      }
    },
    onMutate: async ({ jobId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: ["savedJobs", "ids", uid] });
      const previousIds = queryClient.getQueryData<string[]>(["savedJobs", "ids", uid]);
      queryClient.setQueryData<string[]>(["savedJobs", "ids", uid], (old = []) => {
        return isSaved ? old.filter((id) => id !== jobId) : [...old, jobId];
      });
      return { previousIds };
    },
    onSuccess: (_data, { isSaved }) => {
      toast.success(isSaved ? "Job removed from saved" : "Job saved!");
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(["savedJobs", "ids", uid], context.previousIds);
      }
      toast.error("Could not update saved jobs. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
    },
  });
}
