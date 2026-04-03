"use client";

import { create } from "zustand";
import type { User as FirebaseUser } from "firebase/auth";
import type { User, UserRole } from "@/types";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  uid: string | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  user: null,
  uid: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,

  setFirebaseUser: (firebaseUser) =>
    set({
      firebaseUser,
      uid: firebaseUser?.uid ?? null,
      isAuthenticated: !!firebaseUser,
    }),

  setUser: (user) =>
    set({
      user,
      role: user?.role ?? null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      firebaseUser: null,
      user: null,
      uid: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
    }),
}));
