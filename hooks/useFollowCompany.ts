import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/stores/authStore";

export function useFollowedCompanies() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["followedCompanies", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [] as string[];
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return [] as string[];
      return (snap.data().followedCompanies as string[] | undefined) ?? [];
    },
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000,
  });
}

export function useToggleFollowCompany() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, isFollowing }: { companyId: string; isFollowing: boolean }) => {
      if (!user?.uid) throw new Error("Not authenticated");
      const userRef = doc(db, "users", user.uid);
      // Use setDoc with merge:true so it works even if the field doesn't yet exist
      await setDoc(
        userRef,
        { followedCompanies: isFollowing ? arrayRemove(companyId) : arrayUnion(companyId) },
        { merge: true }
      );
    },
    onMutate: async ({ companyId, isFollowing }) => {
      await qc.cancelQueries({ queryKey: ["followedCompanies", user?.uid] });
      const prev = qc.getQueryData<string[]>(["followedCompanies", user?.uid]) ?? [];
      qc.setQueryData<string[]>(
        ["followedCompanies", user?.uid],
        isFollowing ? prev.filter((id) => id !== companyId) : [...prev, companyId]
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["followedCompanies", user?.uid], ctx?.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["followedCompanies", user?.uid] });
    },
  });
}
