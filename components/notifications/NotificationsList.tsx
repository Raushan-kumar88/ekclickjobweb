"use client";

import { useMemo } from "react";
import { isToday, isYesterday } from "date-fns";
import { BellIcon, CheckCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationCard } from "./NotificationCard";
import {
  useNotifications,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import type { Notification } from "@/types";

type Group = { label: string; items: Notification[] };

function groupByDate(notifications: Notification[]): Group[] {
  const groups: Record<string, Notification[]> = {};

  for (const n of notifications) {
    let date: Date;
    try {
      type TimestampLike = { toDate: () => Date };
      date = (n.createdAt as TimestampLike | null | undefined)?.toDate?.() ?? new Date();
    } catch {
      date = new Date();
    }

    let label: string;
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";
    else label = "Earlier";

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  const order = ["Today", "Yesterday", "Earlier"];
  return order.filter((l) => groups[l]?.length).map((l) => ({ label: l, items: groups[l] }));
}

export function NotificationsList() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const groups = useMemo(() => groupByDate(notifications), [notifications]);
  const hasUnread = notifications.some((n) => !n.read);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <BellIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div>
          <p className="font-semibold">All caught up!</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            You&apos;ll be notified here when there are updates on your applications or new matching jobs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mark all read */}
      {hasUnread && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-primary"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheckIcon className="h-3.5 w-3.5" />
            Mark all as read
          </Button>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <div className="space-y-2">
            {group.items.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
