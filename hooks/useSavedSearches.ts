"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSearch, getSavedSearches, deleteSavedSearch } from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import type { SavedSearch } from "@/types";

export function useSavedSearches() {
  const uid = useAuthStore((s) => s.uid);
  return useQuery<SavedSearch[]>({
    queryKey: ["savedSearches", uid],
    queryFn: () => (uid ? getSavedSearches(uid) : []),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSaveSearch() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.uid);

  return useMutation({
    mutationFn: ({
      searchQuery,
      filters,
      frequency,
    }: {
      searchQuery: string;
      filters: Record<string, unknown>;
      frequency?: "daily" | "weekly" | "instant";
    }) => {
      if (!uid) throw new Error("Not authenticated");
      return saveSearch(uid, searchQuery, filters, frequency ?? "daily");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedSearches", uid] });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.uid);

  return useMutation({
    mutationFn: (searchId: string) => deleteSavedSearch(searchId),
    onMutate: async (searchId) => {
      const key = ["savedSearches", uid];
      const prev = queryClient.getQueryData<SavedSearch[]>(key);
      if (prev) {
        queryClient.setQueryData(key, prev.filter((s) => s.id !== searchId));
      }
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["savedSearches", uid], context.prev);
      }
    },
  });
}
