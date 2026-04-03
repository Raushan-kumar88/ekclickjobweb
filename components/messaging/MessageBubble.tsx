"use client";

import { cn } from "@/lib/utils";
import { CheckCheckIcon, CheckIcon, BadgeCheckIcon } from "lucide-react";
import type { Message } from "@/types";
import type { Timestamp } from "firebase/firestore";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderIsDecisionMaker?: boolean;
}

function formatTime(ts: Timestamp | null | undefined): string {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function MessageBubble({ message, isMine, senderName, senderIsDecisionMaker }: MessageBubbleProps) {
  return (
    <div className={cn("flex gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("max-w-[75%] sm:max-w-[60%]", isMine ? "items-end" : "items-start")}>
        {!isMine && senderName && (
          <p className="mb-1 px-1 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            {senderName}
            {senderIsDecisionMaker && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 dark:text-blue-300">
                <BadgeCheckIcon className="h-2.5 w-2.5" /> Decision Maker
              </span>
            )}
          </p>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isMine
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-muted text-foreground"
          )}
        >
          {message.text}
        </div>
        <div
          className={cn(
            "mt-1 flex items-center gap-1 px-1",
            isMine ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
          {isMine && (
            message.read ? (
              <CheckCheckIcon className="h-3 w-3 text-primary" />
            ) : (
              <CheckIcon className="h-3 w-3 text-muted-foreground" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
