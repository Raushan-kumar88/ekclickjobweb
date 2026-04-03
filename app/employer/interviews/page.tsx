"use client";

import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { InterviewCard } from "@/components/interviews/InterviewCard";
import { useEmployerInterviews } from "@/hooks/useInterviews";
import type { Interview } from "@/types";

type Filter = "upcoming" | "past" | "all";

type TimestampLike = { toDate: () => Date };

function isUpcoming(interview: Interview): boolean {
  try {
    const raw = interview.scheduledAt as TimestampLike | string | number | null | undefined;
    const d = (raw as TimestampLike)?.toDate?.() ?? new Date(raw as string | number);
    return d > new Date() && interview.status !== "cancelled";
  } catch { return false; }
}

export default function EmployerInterviewsPage() {
  const { data: interviews = [], isLoading } = useEmployerInterviews();
  const [filter, setFilter] = useState<Filter>("upcoming");

  const filtered = useMemo(() => {
    if (filter === "upcoming") return interviews.filter(isUpcoming);
    if (filter === "past") return interviews.filter((i) => !isUpcoming(i));
    return interviews;
  }, [interviews, filter]);

  const upcomingCount = interviews.filter(isUpcoming).length;

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "upcoming", label: `Upcoming${upcomingCount > 0 ? ` (${upcomingCount})` : ""}` },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Interviews</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your scheduled candidate interviews
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl border bg-muted/40 p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title={filter === "upcoming" ? "No upcoming interviews" : "No interviews found"}
          description={
            filter === "upcoming"
              ? "Schedule an interview from the applicants page."
              : "Interviews you schedule will appear here."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} viewAs="employer" />
          ))}
        </div>
      )}
    </div>
  );
}
