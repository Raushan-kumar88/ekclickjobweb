"use client";

import { MessageSquareIcon } from "lucide-react";
import { ConversationList } from "@/components/messaging/ConversationList";
import { useTotalUnreadMessages } from "@/hooks/useMessaging";

export default function SeekerMessagesPage() {
  const unread = useTotalUnreadMessages();

  return (
    <>
      {/* Mobile: show conversation list */}
      <div className="lg:hidden">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Messages</h1>
            {unread > 0 && (
              <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-medium text-destructive-foreground">
                {unread}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your conversations with employers
          </p>
        </div>
        <div className="rounded-xl border bg-background overflow-hidden">
          <ConversationList basePath="/seeker/messages" />
        </div>
      </div>

      {/* Desktop: empty state when no conversation selected */}
      <div className="hidden h-full lg:flex items-center justify-center rounded-xl border bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MessageSquareIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-semibold">Select a conversation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a conversation from the left to start chatting
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
