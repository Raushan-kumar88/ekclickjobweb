"use client";

import { useState } from "react";
import { VideoIcon, PhoneIcon, MapPinIcon, CalendarIcon, ClockIcon, LinkIcon, CheckCircleIcon, XCircleIcon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpdateInterviewStatus } from "@/hooks/useInterviews";
import type { Interview } from "@/types";

const TYPE_CONFIG = {
  video: { icon: VideoIcon, label: "Video Call", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  phone: { icon: PhoneIcon, label: "Phone Call", color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  "in-person": { icon: MapPinIcon, label: "In Person", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
};

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  rescheduled: { label: "Rescheduled", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

interface InterviewCardProps {
  interview: Interview;
  viewAs: "employer" | "seeker";
}

type TimestampLike = { toDate: () => Date };

function formatInterviewDate(ts: Interview["scheduledAt"]): { date: string; time: string } {
  try {
    const raw = ts as TimestampLike | string | number | null | undefined;
    const d = (raw as TimestampLike)?.toDate?.() ?? new Date(raw as string | number);
    return {
      date: d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  } catch {
    return { date: "—", time: "—" };
  }
}

export function InterviewCard({ interview, viewAs }: InterviewCardProps) {
  const [showActions, setShowActions] = useState(false);
  const updateStatus = useUpdateInterviewStatus();

  const typeConfig = TYPE_CONFIG[interview.type];
  const statusConfig = STATUS_CONFIG[interview.status];
  const { date, time } = formatInterviewDate(interview.scheduledAt);
  const TypeIcon = typeConfig.icon;

  const isActive = interview.status === "scheduled" || interview.status === "rescheduled";

  async function handleStatus(status: Interview["status"]) {
    try {
      await updateStatus.mutateAsync({ id: interview.id, status });
      toast.success(`Interview marked as ${status}`);
      setShowActions(false);
    } catch {
      toast.error("Failed to update interview status");
    }
  }

  return (
    <div className={cn("rounded-xl border bg-background p-4", !isActive && "opacity-70")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Type icon */}
          <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", typeConfig.color)}>
            <TypeIcon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="font-semibold truncate">
              {viewAs === "employer" ? interview.seekerName : interview.companyName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{interview.jobTitle}</p>

            {/* Date & time */}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-foreground">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {date}
              </span>
              <span className="flex items-center gap-1 text-xs text-foreground">
                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {time} · {interview.duration} min
              </span>
            </div>

            {/* Meeting link */}
            {interview.meetingLink && (
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <LinkIcon className="h-3 w-3" />
                Join Meeting
              </a>
            )}
            {interview.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPinIcon className="h-3 w-3" />
                {interview.location}
              </p>
            )}
            {interview.notes && (
              <p className="mt-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                {interview.notes}
              </p>
            )}
          </div>
        </div>

        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", statusConfig.className)}>
          {statusConfig.label}
        </span>
      </div>

      {/* Employer actions */}
      {viewAs === "employer" && isActive && (
        <div className="mt-3 border-t pt-3">
          {!showActions ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowActions(true)}
            >
              Update Status
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-green-500 text-green-700 hover:bg-green-50"
                onClick={() => handleStatus("completed")}
                disabled={updateStatus.isPending}
              >
                <CheckCircleIcon className="h-3.5 w-3.5" />
                Mark Completed
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-amber-500 text-amber-700 hover:bg-amber-50"
                onClick={() => handleStatus("rescheduled")}
                disabled={updateStatus.isPending}
              >
                <RotateCcwIcon className="h-3.5 w-3.5" />
                Rescheduled
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleStatus("cancelled")}
                disabled={updateStatus.isPending}
              >
                <XCircleIcon className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
