"use client";

import { CalendarIcon, VideoIcon, PhoneIcon, MapPinIcon, ClockIcon, LinkIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { InterviewCard } from "@/components/interviews/InterviewCard";
import { useSeekerInterviews } from "@/hooks/useInterviews";

export default function SeekerInterviewsPage() {
  const { data: interviews = [], isLoading } = useSeekerInterviews();

  type TimestampLike = { toDate: () => Date };
  const upcoming = interviews.filter((i) => {
    try {
      const raw = i.scheduledAt as TimestampLike | string | number | null | undefined;
      const d = (raw as TimestampLike)?.toDate?.() ?? new Date(raw as string | number);
      return d > new Date() && i.status !== "cancelled";
    } catch { return false; }
  });

  const past = interviews.filter((i) => !upcoming.includes(i));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Interviews</h1>
          {upcoming.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {upcoming.length} upcoming
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Your scheduled interviews with employers
        </p>
      </div>

      {/* Tips */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border bg-primary/5 p-4">
          <p className="text-sm font-medium">Interview tips</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {[
              "Research the company before your interview",
              "Test your audio/video setup 10 minutes before",
              "Prepare questions to ask the interviewer",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-52" />
            </div>
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No interviews yet"
          description="When an employer schedules an interview with you, it will appear here."
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Upcoming
              </h2>
              <div className="space-y-3">
                {upcoming.map((i) => (
                  <InterviewCard key={i.id} interview={i} viewAs="seeker" />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Past
              </h2>
              <div className="space-y-3">
                {past.map((i) => (
                  <InterviewCard key={i.id} interview={i} viewAs="seeker" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
