"use client";

import Link from "next/link";
import { CheckCircle2Icon, CircleIcon, ChevronRightIcon, UserCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface CheckItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
  points: number;
}

export function computeProfileScore(user: User | null): { score: number; items: CheckItem[] } {
  if (!user) return { score: 0, items: [] };
  const p = user.profile;

  const items: CheckItem[] = [
    {
      key: "basic",
      label: "Add your name & photo",
      done: !!(user.displayName && user.photoURL),
      href: "/seeker/profile",
      points: 15,
    },
    {
      key: "headline",
      label: "Write a professional headline",
      done: !!(p?.headline && p.headline.length > 5),
      href: "/seeker/resume",
      points: 10,
    },
    {
      key: "bio",
      label: "Add a bio / summary",
      done: !!(p?.bio && p.bio.length > 20),
      href: "/seeker/resume",
      points: 10,
    },
    {
      key: "location",
      label: "Set your location",
      done: !!(p?.location?.city),
      href: "/seeker/profile",
      points: 10,
    },
    {
      key: "skills",
      label: "Add at least 3 skills",
      done: (p?.skills?.length ?? 0) >= 3,
      href: "/seeker/resume",
      points: 15,
    },
    {
      key: "experience",
      label: "Add work experience",
      done: (p?.experience?.length ?? 0) >= 1,
      href: "/seeker/resume",
      points: 15,
    },
    {
      key: "education",
      label: "Add education",
      done: (p?.education?.length ?? 0) >= 1,
      href: "/seeker/resume",
      points: 10,
    },
    {
      key: "resume",
      label: "Upload your resume",
      done: !!(p?.resumeURL),
      href: "/seeker/resume",
      points: 15,
    },
  ];

  const earned = items.filter((i) => i.done).reduce((s, i) => s + i.points, 0);
  const total = items.reduce((s, i) => s + i.points, 0);
  const score = Math.round((earned / total) * 100);

  return { score, items };
}

function scoreColor(score: number) {
  if (score >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Excellent" };
  if (score >= 60) return { bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", label: "Good" };
  if (score >= 40) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", label: "Fair" };
  return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", label: "Needs work" };
}

interface ProfileCompletenessProps {
  user: User | null;
  compact?: boolean;
}

export function ProfileCompleteness({ user, compact = false }: ProfileCompletenessProps) {
  const { score, items } = computeProfileScore(user);
  const colors = scoreColor(score);
  const pending = items.filter((i) => !i.done);

  if (score >= 100) return null;

  if (compact) {
    return (
      <div className="rounded-xl border bg-background p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <UserCircleIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Profile strength</span>
          </div>
          <span className={cn("text-sm font-bold", colors.text)}>{score}% — {colors.label}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-700", colors.bar)}
            style={{ width: `${score}%` }}
          />
        </div>
        {pending[0] && (
          <Link href={pending[0].href} className="mt-2 flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors">
            <span>Next: {pending[0].label}</span>
            <ChevronRightIcon className="h-3 w-3" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Profile Strength</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete your profile to get 5× more visibility
          </p>
        </div>
        <div className={cn("text-2xl font-bold", colors.text)}>{score}%</div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-700", colors.bar)}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className={cn("mt-1 text-xs font-medium", colors.text)}>{colors.label}</p>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {item.done ? (
                <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <CircleIcon className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
              <span className={cn("text-sm truncate", item.done ? "line-through text-muted-foreground" : "text-foreground")}>
                {item.label}
              </span>
            </div>
            {!item.done && (
              <Link href={item.href}>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary">
                  +{item.points}pts
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
