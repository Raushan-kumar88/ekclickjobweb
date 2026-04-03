"use client";

import Link from "next/link";
import { TrophyIcon, ZapIcon, StarIcon, FlameIcon, AwardIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface Badge {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  earned: boolean;
  tip: string;
}

interface ActivityScoreData {
  score: number;
  level: string;
  levelColor: string;
  nextLevel: string;
  nextAt: number;
  badges: Badge[];
}

export function computeActivityScore(
  user: User | null,
  applicationsCount: number,
  savedJobsCount: number
): ActivityScoreData {
  let score = 0;
  const p = user?.profile;

  if (user?.displayName) score += 5;
  if (user?.photoURL) score += 10;
  if (p?.headline) score += 10;
  if (p?.bio) score += 10;
  if (p?.location?.city) score += 5;
  if ((p?.skills?.length ?? 0) >= 3) score += 15;
  if ((p?.skills?.length ?? 0) >= 8) score += 10;
  if ((p?.experience?.length ?? 0) >= 1) score += 15;
  if ((p?.education?.length ?? 0) >= 1) score += 10;
  if (p?.resumeURL) score += 15;
  score += Math.min(applicationsCount * 5, 30);
  score += Math.min(savedJobsCount * 2, 10);

  const badges: Badge[] = [
    {
      id: "profile_pic",
      label: "Face of the Platform",
      icon: StarIcon,
      color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30",
      earned: !!user?.photoURL,
      tip: "Upload your profile photo",
    },
    {
      id: "resume",
      label: "Resume Ready",
      icon: AwardIcon,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
      earned: !!p?.resumeURL,
      tip: "Upload your resume",
    },
    {
      id: "skills",
      label: "Skill Master",
      icon: ZapIcon,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
      earned: (p?.skills?.length ?? 0) >= 8,
      tip: "Add 8+ skills",
    },
    {
      id: "first_apply",
      label: "First Application",
      icon: FlameIcon,
      color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30",
      earned: applicationsCount >= 1,
      tip: "Apply to your first job",
    },
    {
      id: "power_applier",
      label: "Power Applier",
      icon: TrophyIcon,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
      earned: applicationsCount >= 5,
      tip: "Apply to 5+ jobs",
    },
  ];

  const levels = [
    { label: "Beginner", min: 0, next: 50, nextLabel: "Explorer", color: "text-slate-600" },
    { label: "Explorer", min: 50, next: 100, nextLabel: "Job Seeker", color: "text-blue-600" },
    { label: "Job Seeker", min: 100, next: 150, nextLabel: "Pro Seeker", color: "text-violet-600" },
    { label: "Pro Seeker", min: 150, next: 200, nextLabel: "Champion", color: "text-amber-600" },
    { label: "Champion", min: 200, next: 200, nextLabel: "Max Level", color: "text-emerald-600" },
  ];

  const current = levels.find((l, i) => score < (levels[i + 1]?.min ?? Infinity)) ?? levels[levels.length - 1];
  const next = levels.find((l) => l.min > score);

  return {
    score,
    level: current.label,
    levelColor: current.color,
    nextLevel: next?.label ?? "Max Level",
    nextAt: next?.min ?? score,
    badges,
  };
}

interface ActivityScoreProps {
  user: User | null;
  applicationsCount: number;
  savedJobsCount: number;
}

export function ActivityScore({ user, applicationsCount, savedJobsCount }: ActivityScoreProps) {
  const data = computeActivityScore(user, applicationsCount, savedJobsCount);
  const progress = Math.min(Math.round((data.score / data.nextAt) * 100), 100);
  const earnedBadges = data.badges.filter((b) => b.earned);
  const pendingBadges = data.badges.filter((b) => !b.earned);

  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <TrophyIcon className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Activity Score</h3>
            <span className={cn("text-xl font-black", data.levelColor)}>{data.score} pts</span>
          </div>
          <p className={cn("text-xs font-medium", data.levelColor)}>
            Level: {data.level}
            {data.nextLevel !== "Max Level" && (
              <span className="text-muted-foreground font-normal"> · {data.nextAt - data.score} pts to {data.nextLevel}</span>
            )}
          </p>
        </div>
      </div>

      {/* Progress */}
      {data.nextLevel !== "Max Level" && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Badges */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Badges ({earnedBadges.length}/{data.badges.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {data.badges.map((badge) => (
            <div
              key={badge.id}
              title={badge.earned ? badge.label : `Locked: ${badge.tip}`}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                badge.earned ? badge.color : "bg-muted text-muted-foreground/50 grayscale"
              )}
            >
              <badge.icon className="h-3 w-3" />
              {badge.label}
            </div>
          ))}
        </div>
      </div>

      {/* Pending actions */}
      {pendingBadges.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Earn more points:</p>
          {pendingBadges.slice(0, 3).map((badge) => (
            <div key={badge.id} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              {badge.tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
