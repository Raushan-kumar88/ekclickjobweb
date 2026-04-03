"use client";

import { useRouter } from "next/navigation";
import { BriefcaseIcon, BellIcon, UserIcon, InfoIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/formatters";
import {
  useMarkNotificationRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import type { Notification, NotificationType } from "@/types";

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  application_update: {
    icon: BriefcaseIcon,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  new_applicant: {
    icon: UserIcon,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  job_alert: {
    icon: BriefcaseIcon,
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  system: {
    icon: InfoIcon,
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
};

interface NotificationCardProps {
  notification: Notification;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const deleteNotif = useDeleteNotification();

  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system;
  const Icon = config.icon;

  function handleClick() {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }
    // Navigate based on type/data
    if (notification.data?.jobId) {
      router.push(`/jobs/${notification.data.jobId}`);
    } else if (
      notification.type === "application_update" ||
      notification.data?.applicationId
    ) {
      router.push("/seeker/applications");
    } else if (notification.type === "new_applicant" && notification.data?.jobId) {
      router.push(`/employer/jobs/${notification.data.jobId}/applicants`);
    }
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    deleteNotif.mutate(notification.id);
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/30",
        !notification.read && "border-primary/20 bg-primary/5"
      )}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          config.bg
        )}
      >
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pr-6">
        <p
          className={cn(
            "text-sm leading-snug",
            !notification.read ? "font-semibold text-foreground" : "text-foreground/80"
          )}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-muted-foreground/60">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deleteNotif.isPending}
        className="absolute right-3 top-3 hidden rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:flex"
        aria-label="Delete notification"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
