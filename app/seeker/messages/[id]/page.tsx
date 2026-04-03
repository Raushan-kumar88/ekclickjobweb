"use client";

import { use } from "react";
import { useConversations } from "@/hooks/useMessaging";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SeekerChatPage({ params }: Props) {
  const { id } = use(params);
  const { data: conversations = [], isLoading } = useConversations();
  const conversation = conversations.find((c) => c.id === id);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border bg-background overflow-hidden">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
              <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-xl border bg-background">
        <p className="text-muted-foreground text-sm">Conversation not found</p>
      </div>
    );
  }

  return <ChatWindow conversation={conversation} backPath="/seeker/messages" />;
}
