"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface AppState {
  themeMode: ThemeMode;
  unreadNotificationCount: number;

  setThemeMode: (mode: ThemeMode) => void;
  setUnreadNotificationCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: "system",
      unreadNotificationCount: 0,

      setThemeMode: (themeMode) => set({ themeMode }),

      setUnreadNotificationCount: (count) =>
        set({ unreadNotificationCount: count }),

      incrementUnreadCount: () =>
        set((state) => ({
          unreadNotificationCount: state.unreadNotificationCount + 1,
        })),

      decrementUnreadCount: () =>
        set((state) => ({
          unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
        })),

      resetUnreadCount: () => set({ unreadNotificationCount: 0 }),
    }),
    {
      name: "ekclickjob-app",
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
);
