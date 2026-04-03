"use client";

import { useEffect, useCallback } from "react";
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
  getConversations,
  getMessages,
  sendMessage as sendMessageDb,
  markMessagesRead,
  getOrCreateConversation,
} from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import type { Conversation, Message, ParticipantInfo } from "@/types";

// ─── Conversations ────────────────────────────────────────────────────────────

export function useConversations() {
  const uid = useAuthStore((s) => s.uid);
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    if (!uid) return;

    let q;
    try {
      q = query(
        collection(db, "conversations"),
        where("participantIds", "array-contains", uid),
        orderBy("updatedAt", "desc"),
        limit(50)
      );
    } catch {
      return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const convs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
        queryClient.setQueryData(["conversations", uid], convs);
      },
      (error) => {
        console.warn("[useConversations] onSnapshot error:", error.code, error.message);
      }
    );

    return unsubscribe;
  }, [uid, queryClient]);

  return useQuery<Conversation[]>({
    queryKey: ["conversations", uid],
    queryFn: () => (uid ? getConversations(uid) : []),
    enabled: !!uid,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useTotalUnreadMessages() {
  const { data: conversations = [] } = useConversations();
  const uid = useAuthStore((s) => s.uid);
  if (!uid) return 0;
  return conversations.reduce((sum, c) => sum + (c.unreadCount?.[uid] ?? 0), 0);
}

// ─── Messages in a conversation ───────────────────────────────────────────────

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
      queryClient.setQueryData(["messages", conversationId], msgs);
    });

    return unsubscribe;
  }, [conversationId, queryClient]);

  return useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () => (conversationId ? getMessages(conversationId) : []),
    enabled: !!conversationId,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// ─── Send message ─────────────────────────────────────────────────────────────

export function useSendMessage() {
  const uid = useAuthStore((s) => s.uid);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      text,
      recipientId,
    }: {
      conversationId: string;
      text: string;
      recipientId: string;
    }) => {
      if (!uid) throw new Error("Not authenticated");
      return sendMessageDb(conversationId, uid, text, recipientId);
    },
    onSuccess: (_data, { conversationId }) => {
      // onSnapshot will push the update; also invalidate conversation list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });
}

// ─── Mark messages read ───────────────────────────────────────────────────────

export function useMarkMessagesRead() {
  const uid = useAuthStore((s) => s.uid);
  const queryClient = useQueryClient();

  return useCallback(
    (conversationId: string) => {
      if (!uid) return;
      markMessagesRead(conversationId, uid).then(() => {
        queryClient.invalidateQueries({ queryKey: ["conversations", uid] });
      });
    },
    [uid, queryClient]
  );
}

// ─── Create / get conversation ────────────────────────────────────────────────

export function useGetOrCreateConversation() {
  const uid = useAuthStore((s) => s.uid);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({
      otherUid,
      otherInfo,
      jobId,
      jobTitle,
    }: {
      otherUid: string;
      otherInfo: ParticipantInfo;
      jobId?: string;
      jobTitle?: string;
    }): Promise<string> => {
      if (!uid || !user) throw new Error("Not authenticated");

      const myInfo: ParticipantInfo = {
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role === "admin" ? "seeker" : user.role,
      };

      return getOrCreateConversation(uid, otherUid, myInfo, otherInfo, jobId, jobTitle);
    },
  });
}
