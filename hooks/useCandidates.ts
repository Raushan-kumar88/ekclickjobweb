"use client";

import { useQuery } from "@tanstack/react-query";
import { searchCandidatesAction, type CandidateResult } from "@/app/actions/jobs";

export type { CandidateResult };

export interface CandidateFilters {
  skill?: string;
  city?: string;
  keyword?: string;
}

export function useCandidates(filters: CandidateFilters) {
  return useQuery({
    queryKey: ["candidates", filters],
    queryFn: () => searchCandidatesAction(filters),
    staleTime: 2 * 60 * 1000,
  });
}
