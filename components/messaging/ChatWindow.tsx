"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, BriefcaseIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useMessages, useSendMessage, useMarkMessagesRead } from "@/hooks/useMessaging";
import { useAuthStore } from "@/stores/authStore";
import type { Conversation } from "@/types";

interface ChatWindowProps {
  conversation: Conversation;
  backPath: string;
}

export function ChatWindow({ conversation, backPath }: ChatWindowProps) {
  const uid = useAuthStore((s) => s.uid);
  const { data: messages = [], isLoading } = useMessages(conversation.id);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherId = conversation.participantIds.find((id) => id !== uid) ?? "";
  const other = conversation.participantInfo?.[otherId];

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (uid && conversation.id) {
      markRead(conversation.id);
    }
  }, [conversation.id, uid, markRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  async function handleSend(text: string) {
    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        text,
        recipientId: otherId,
      });
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  }

  // Group messages by date
  const grouped: { date: string; msgs: typeof messages }[] = [];
  let lastDate = "";
  for (const msg of messages) {
    let dateStr = "";
    try {
      type TimestampLike = { toDate: () => Date };
      const d = (msg.createdAt as TimestampLike | null | undefined)?.toDate?.() ?? new Date();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (d.toDateString() === today.toDateString()) dateStr = "Today";
      else if (d.toDateString() === yesterday.toDateString()) dateStr = "Yesterday";
      else dateStr = d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    } catch {
      dateStr = "";
    }
    if (dateStr !== lastDate) {
      grouped.push({ date: dateStr, msgs: [] });
      lastDate = dateStr;
    }
    grouped[grouped.length - 1].msgs.push(msg);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
        <Link
          href={backPath}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors lg:hidden"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <CompanyAvatar name={other?.displayName ?? "User"} size="sm" className="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-sm">{other?.displayName ?? "Unknown"}</p>
          {conversation.jobTitle && (
            <div className="flex items-center gap-1 mt-0.5">
              <BriefcaseIcon className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="truncate text-xs text-muted-foreground">{conversation.jobTitle}</p>
            </div>
          )}
        </div>
        {conversation.jobId && (
          <Link
            href={`/jobs/${conversation.jobId}`}
            className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            View Job
          </Link>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                <Skeleton className={`h-10 max-w-[60%] rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <BriefcaseIcon className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-medium text-sm">Start a conversation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Send your first message to {other?.displayName ?? "this person"}
              </p>
            </div>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date}>
              {group.date && (
                <div className="my-4 flex items-center gap-3">
                  <div className="flex-1 border-t" />
                  <span className="text-[11px] text-muted-foreground">{group.date}</span>
                  <div className="flex-1 border-t" />
                </div>
              )}
              <div className="space-y-1.5">
                {group.msgs.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMine={msg.senderId === uid}
                    senderName={msg.senderId !== uid ? other?.displayName : undefined}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={sendMessage.isPending} />
    </div>
  );
}
