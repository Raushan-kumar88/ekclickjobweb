"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { scoreJob } from "@/lib/utils/jobScoring";
import { deriveExperienceLevel } from "@/lib/utils/jobScoring";
import type { DisplayJob } from "@/lib/firebase/db";
import type { Job } from "@/types";

const MAX_SCORE = 21; // 12 skill + 4 city + 3 jobType + 2 exp

interface MatchScoreBadgeProps {
  job: DisplayJob;
  className?: string;
  size?: "sm" | "md";
}

export function MatchScoreBadge({ job, className, size = "sm" }: MatchScoreBadgeProps) {
  const { user, role } = useAuthStore();

  const pct = useMemo(() => {
    if (!user || role !== "seeker") return null;
    const p = user.profile;
    if (!p) return null;

    const expLevel = deriveExperienceLevel(p.experience ?? []);
    const raw = scoreJob(
      job as unknown as Job,
      p.skills ?? [],
      p.location?.city ?? "",
      p.location?.state ?? "",
      p.preferredJobTypes ?? [],
      expLevel
    );
    return Math.round(Math.min((raw / MAX_SCORE) * 100, 100));
  }, [user, role, job]);

  if (pct === null) return null;

  const color =
    pct >= 75 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
    : pct >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
    : "bg-muted text-muted-foreground";

  const dot =
    pct >= 75 ? "bg-emerald-500"
    : pct >= 50 ? "bg-amber-500"
    : "bg-slate-400";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        color,
        className
      )}
      title={`${pct}% match with your profile`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {pct}% match
    </span>
  );
}
