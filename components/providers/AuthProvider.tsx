"use client";

import { useEffect } from "react";
import { onAuthStateChanged, getUserDocument } from "@/lib/firebase/auth";
import { useAuthStore } from "@/stores/authStore";

function setAuthCookies(token: string, role: string, onboardingDone: boolean) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user-role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `onboarding-done=${onboardingDone ? "true" : "false"}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookies() {
  document.cookie = "auth-token=; path=/; max-age=0";
  document.cookie = "user-role=; path=/; max-age=0";
  document.cookie = "onboarding-done=; path=/; max-age=0";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setFirebaseUser, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get ID token for the auth cookie
          const token = await firebaseUser.getIdToken();
          const userDoc = await getUserDocument(firebaseUser.uid);
          const role = userDoc?.role ?? "seeker";
          const onboardingDone = userDoc?.onboardingCompleted ?? false;

          setAuthCookies(token, role, onboardingDone);
          setUser(userDoc);
        } catch (error) {
          console.error("Error fetching user document:", error);
          clearAuthCookies();
          setUser(null);
        }
      } else {
        clearAuthCookies();
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setUser, setLoading]);

  return <>{children}</>;
}
