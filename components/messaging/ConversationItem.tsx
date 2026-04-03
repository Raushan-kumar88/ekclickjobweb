"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import type { Conversation } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  currentUid: string;
  isActive?: boolean;
  basePath: string; // "/seeker/messages" or "/employer/messages"
}

export function ConversationItem({
  conversation,
  currentUid,
  isActive,
  basePath,
}: ConversationItemProps) {
  const otherId = conversation.participantIds.find((id) => id !== currentUid) ?? "";
  const other = conversation.participantInfo?.[otherId];
  const unread = conversation.unreadCount?.[currentUid] ?? 0;

  return (
    <Link
      href={`${basePath}/${conversation.id}`}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
        isActive
          ? "bg-primary/10"
          : "hover:bg-accent/60"
      )}
    >
      <div className="relative shrink-0">
        <CompanyAvatar
          name={other?.displayName ?? "User"}
          size="md"
          className="h-11 w-11"
        />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn("truncate text-sm", unread > 0 ? "font-semibold" : "font-medium")}>
            {other?.displayName ?? "Unknown"}
          </p>
          {conversation.lastMessage?.timestamp && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeTime(conversation.lastMessage.timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {conversation.jobTitle && (
            <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary truncate max-w-[80px]">
              {conversation.jobTitle}
            </span>
          )}
          {conversation.lastMessage ? (
            <p
              className={cn(
                "truncate text-xs",
                unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {conversation.lastMessage.senderId === currentUid ? "You: " : ""}
              {conversation.lastMessage.text}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">No messages yet</p>
          )}
        </div>
      </div>
    </Link>
  );
}
