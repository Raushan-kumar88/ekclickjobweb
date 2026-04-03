"use client";

import { useMemo } from "react";
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/hooks/useResumeBuilder";

interface ScoreItem {
  category: string;
  earned: number;
  max: number;
  status: "pass" | "warn" | "fail";
  tip: string;
}

export function computeATSScore(resume: ResumeData): { total: number; items: ScoreItem[] } {
  const items: ScoreItem[] = [];

  // Contact Info (15 pts)
  const contactPts = [resume.email, resume.phone, resume.displayName].filter(Boolean).length * 5;
  items.push({
    category: "Contact Info",
    earned: contactPts,
    max: 15,
    status: contactPts >= 15 ? "pass" : contactPts >= 10 ? "warn" : "fail",
    tip: "Include your name, email, and phone number for ATS parsing.",
  });

  // Professional Headline (10 pts)
  const hl = resume.headline?.trim().length ?? 0;
  const hlPts = hl >= 30 ? 10 : hl >= 10 ? 6 : hl > 0 ? 3 : 0;
  items.push({
    category: "Professional Headline",
    earned: hlPts,
    max: 10,
    status: hlPts >= 10 ? "pass" : hlPts >= 6 ? "warn" : "fail",
    tip: "A strong headline (30+ chars) with role and speciality improves ATS ranking.",
  });

  // Summary / Bio (10 pts)
  const bio = resume.bio?.trim().length ?? 0;
  const bioPts = bio >= 100 ? 10 : bio >= 50 ? 6 : bio > 0 ? 3 : 0;
  items.push({
    category: "Professional Summary",
    earned: bioPts,
    max: 10,
    status: bioPts >= 10 ? "pass" : bioPts >= 6 ? "warn" : "fail",
    tip: "Write a 100+ character summary with keywords from your target roles.",
  });

  // Skills (20 pts)
  const skillCount = resume.skills?.length ?? 0;
  const skillPts = skillCount >= 8 ? 20 : skillCount >= 5 ? 14 : skillCount >= 3 ? 8 : skillCount > 0 ? 4 : 0;
  items.push({
    category: "Skills",
    earned: skillPts,
    max: 20,
    status: skillPts >= 20 ? "pass" : skillPts >= 14 ? "warn" : "fail",
    tip: "Add 8+ relevant skills that match job descriptions for best ATS performance.",
  });

  // Work Experience (25 pts)
  const expCount = resume.experience?.length ?? 0;
  const totalDesc = resume.experience?.reduce((s, e) => s + (e.description?.length ?? 0), 0) ?? 0;
  const expPts =
    expCount >= 2 && totalDesc >= 200 ? 25
    : expCount >= 1 && totalDesc >= 100 ? 18
    : expCount >= 1 ? 10
    : 0;
  items.push({
    category: "Work Experience",
    earned: expPts,
    max: 25,
    status: expPts >= 25 ? "pass" : expPts >= 18 ? "warn" : "fail",
    tip: "Describe each role with measurable achievements (200+ chars per entry).",
  });

  // Education (10 pts)
  const eduPts = (resume.education?.length ?? 0) >= 1 ? 10 : 0;
  items.push({
    category: "Education",
    earned: eduPts,
    max: 10,
    status: eduPts >= 10 ? "pass" : "fail",
    tip: "Add your highest qualification to pass education filters.",
  });

  // Resume file uploaded (10 pts)
  const resumePts = resume.resumeURL ? 10 : 0;
  items.push({
    category: "Resume File",
    earned: resumePts,
    max: 10,
    status: resumePts >= 10 ? "pass" : "fail",
    tip: "Upload a PDF or Word resume file for one-click applications.",
  });

  const total = items.reduce((s, i) => s + i.earned, 0);
  return { total, items };
}

function scoreGrade(score: number) {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", ring: "ring-emerald-500/30" };
  if (score >= 65) return { label: "Good", color: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500", ring: "ring-blue-500/30" };
  if (score >= 45) return { label: "Fair", color: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", ring: "ring-amber-500/30" };
  return { label: "Needs Work", color: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", ring: "ring-rose-500/30" };
}

interface ATSScoreCardProps {
  resume: ResumeData;
}

export function ATSScoreCard({ resume }: ATSScoreCardProps) {
  const { total, items } = useMemo(() => computeATSScore(resume), [resume]);
  const grade = scoreGrade(total);

  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4", grade.ring, "bg-background")}>
          <ShieldCheckIcon className={cn("h-5 w-5", grade.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">ATS Resume Score</h3>
            <span className={cn("text-2xl font-black", grade.color)}>{total}<span className="text-sm font-normal text-muted-foreground">/100</span></span>
          </div>
          <p className={cn("text-xs font-medium", grade.color)}>{grade.label}</p>
        </div>
      </div>

      {/* Overall bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700", grade.bar)}
          style={{ width: `${total}%` }}
        />
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.category} className="group">
            <div className="flex items-center gap-2">
              {item.status === "pass" ? (
                <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : item.status === "warn" ? (
                <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              ) : (
                <InfoIcon className="h-3.5 w-3.5 shrink-0 text-rose-500" />
              )}
              <span className="flex-1 text-xs text-foreground">{item.category}</span>
              <span className="text-xs font-semibold tabular-nums">
                <span className={item.status === "pass" ? "text-emerald-600" : item.status === "warn" ? "text-amber-600" : "text-rose-500"}>
                  {item.earned}
                </span>
                <span className="text-muted-foreground">/{item.max}</span>
              </span>
            </div>
            {item.status !== "pass" && (
              <p className="ml-5 mt-0.5 text-[10px] text-muted-foreground leading-relaxed">
                {item.tip}
              </p>
            )}
          </div>
        ))}
      </div>

      {total < 85 && (
        <Link
          href="/seeker/resume"
          className="flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <span className="flex-1">Improve your score — edit resume</span>
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
