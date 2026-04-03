"use client";

import { usePathname } from "next/navigation";
import { MessageSquareIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "@/hooks/useMessaging";
import { useAuthStore } from "@/stores/authStore";

interface ConversationListProps {
  basePath: string;
}

export function ConversationList({ basePath }: ConversationListProps) {
  const uid = useAuthStore((s) => s.uid);
  const pathname = usePathname();
  const { data: conversations = [], isLoading } = useConversations();

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <MessageSquareIcon className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <div>
          <p className="font-medium text-sm">No conversations yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Messages with employers or candidates will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 p-2">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          currentUid={uid ?? ""}
          isActive={pathname === `${basePath}/${conv.id}`}
          basePath={basePath}
        />
      ))}
    </div>
  );
}
