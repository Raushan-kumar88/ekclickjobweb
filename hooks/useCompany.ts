"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getCompany,
  getCompanyByOwner,
  createCompany,
  updateCompany,
} from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import type { CompanyCreateInput } from "@/types";

const COMPANY_KEY = "company";
const MY_COMPANY_KEY = [COMPANY_KEY, "my"] as const;

export function useCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: [COMPANY_KEY, companyId],
    queryFn: () => (companyId ? getCompany(companyId) : null),
    enabled: !!companyId,
  });
}

export function useMyCompany() {
  const uid = useAuthStore((s) => s.uid);
  return useQuery({
    queryKey: [...MY_COMPANY_KEY, uid],
    queryFn: () => (uid ? getCompanyByOwner(uid) : null),
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.uid);
  return useMutation({
    mutationFn: (data: CompanyCreateInput) => {
      if (!uid) throw new Error("Not authenticated");
      return createCompany(data, uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] });
      queryClient.invalidateQueries({ queryKey: MY_COMPANY_KEY });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: Partial<CompanyCreateInput> & { logo?: string };
    }) => updateCompany(companyId, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_KEY, companyId] });
      queryClient.invalidateQueries({ queryKey: MY_COMPANY_KEY });
    },
  });
}
