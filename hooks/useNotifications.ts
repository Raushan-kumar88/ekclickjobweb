"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as deleteNotificationDb,
  getUnreadNotificationCount,
} from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";
import type { Notification } from "@/types";

/**
 * Real-time notifications via Firestore onSnapshot.
 * Feeds directly into React Query cache so UI updates instantly.
 */
export function useNotifications() {
  const uid = useAuthStore((s) => s.uid);
  const setUnreadCount = useAppStore((s) => s.setUnreadNotificationCount);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Notification)
        );
        queryClient.setQueryData(["notifications", uid], notifications);
        setUnreadCount(notifications.filter((n) => !n.read).length);
      },
      (error) => {
        console.warn("Notifications onSnapshot error:", error);
      }
    );

    return unsubscribe;
  }, [uid, queryClient, setUnreadCount]);

  return useQuery<Notification[]>({
    queryKey: ["notifications", uid],
    queryFn: () => (uid ? getNotifications(uid) : Promise.resolve([])),
    enabled: !!uid,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.uid);
  const decrementUnread = useAppStore((s) => s.decrementUnreadCount);

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onMutate: async (notificationId) => {
      const key = ["notifications", uid];
      const prev = queryClient.getQueryData<Notification[]>(key);
      if (prev) {
        queryClient.setQueryData(
          key,
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
      return { prev };
    },
    onSuccess: () => {
      decrementUnread();
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["notifications", uid], context.prev);
      }
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.uid);
  const setUnreadCount = useAppStore((s) => s.setUnreadNotificationCount);

  return useMutation({
    mutationFn: () => {
      if (!uid) throw new Error("Not authenticated");
      return markAllNotificationsRead(uid);
    },
    onMutate: async () => {
      const key = ["notifications", uid];
      const prev = queryClient.getQueryData<Notification[]>(key);
      if (prev) {
        queryClient.setQueryData(
          key,
          prev.map((n) => ({ ...n, read: true }))
        );
      }
      return { prev };
    },
    onSuccess: () => setUnreadCount(0),
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["notifications", uid], context.prev);
      }
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.uid);

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotificationDb(notificationId),
    onMutate: async (notificationId) => {
      const key = ["notifications", uid];
      const prev = queryClient.getQueryData<Notification[]>(key);
      if (prev) {
        queryClient.setQueryData(
          key,
          prev.filter((n) => n.id !== notificationId)
        );
      }
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["notifications", uid], context.prev);
      }
    },
  });
}

export function useUnreadNotificationCount() {
  const uid = useAuthStore((s) => s.uid);
  return useQuery({
    queryKey: ["notifications", "unreadCount", uid],
    queryFn: () => (uid ? getUnreadNotificationCount(uid) : Promise.resolve(0)),
    enabled: !!uid,
    staleTime: 30 * 1000,
  });
}
