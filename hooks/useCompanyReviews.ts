"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import {
  getCompanyReviews,
  getMyCompanyReview,
  submitCompanyReview,
  markReviewHelpful,
  getAllCompanies,
} from "@/lib/firebase/db";
import type { CompanyReviewInput } from "@/types";
import { toast } from "sonner";

export function useAllCompanies(filters: { industry?: string; size?: string; city?: string } = {}) {
  return useQuery({
    queryKey: ["allCompanies", filters],
    queryFn: () => getAllCompanies(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCompanyReviews(companyId: string | undefined) {
  return useQuery({
    queryKey: ["companyReviews", companyId],
    queryFn: () => getCompanyReviews(companyId!),
    enabled: !!companyId,
  });
}

export function useMyCompanyReview(companyId: string | undefined) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["myCompanyReview", companyId, user?.uid],
    queryFn: () => getMyCompanyReview(companyId!, user!.uid),
    enabled: !!companyId && !!user?.uid,
  });
}

export function useSubmitReview(companyId: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompanyReviewInput) => {
      if (!user) throw new Error("Not authenticated");
      // Build "FirstName L." display name
      const parts = (user.displayName ?? "Anonymous").split(" ");
      const displayName =
        parts.length > 1
          ? `${parts[0]} ${parts[parts.length - 1][0]}.`
          : parts[0];
      return submitCompanyReview(input, user.uid, displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyReviews", companyId] });
      queryClient.invalidateQueries({ queryKey: ["myCompanyReview", companyId] });
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      toast.success("Review submitted successfully!");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to submit review"),
  });
}

export function useMarkReviewHelpful() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, companyId }: { reviewId: string; companyId: string }) => {
      if (!user) throw new Error("Sign in to vote");
      return markReviewHelpful(reviewId, user.uid);
    },
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ["companyReviews", companyId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
