"use client";

import { BellIcon } from "lucide-react";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { useNotifications } from "@/hooks/useNotifications";

export default function SeekerNotificationsPage() {
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Application updates and job alerts
        </p>
      </div>

      <NotificationsList />
    </div>
  );
}
