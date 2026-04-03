"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getProfileViews } from "@/lib/firebase/db";

export function useProfileViews() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["profileViews", user?.uid],
    queryFn: () => getProfileViews(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}
