"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookmarkIcon, ShareIcon, CheckIcon, SendIcon,
  MessageSquareIcon, MessageCircleIcon, ClockIcon,
  ZapIcon, Loader2Icon, FlagIcon, UsersIcon, PencilIcon, BriefcaseIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useSavedJobIds, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { useHasApplied, useApplyToJob } from "@/hooks/useApplications";
import { useGetOrCreateConversation } from "@/hooks/useMessaging";
import { getUserProfile } from "@/lib/firebase/db";
import { ApplyModal } from "./ApplyModal";
import { ReportJobModal } from "./ReportJobModal";
import type { DisplayJob } from "@/lib/firebase/db";

interface JobDetailActionsProps {
  job: DisplayJob;
}

/** Days until job expires (estimated from postedAt + 30 days if no deadline) */
function useDeadlineInfo(job: DisplayJob) {
  return useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deadlineStr: string | undefined = (job as any).applicationDeadline ?? (job as any).expiresAt;
    if (!deadlineStr) {
      // Estimate: jobs expire 30 days after posting
      const estimated = new Date(job.postedAt);
      estimated.setDate(estimated.getDate() + 30);
      const diff = Math.ceil((estimated.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diff > 0 && diff <= 7 ? { days: diff, isEstimated: true } : null;
    }
    const diff = Math.ceil((new Date(deadlineStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return { days: 0, expired: true, isEstimated: false };
    return { days: diff, isEstimated: false };
  }, [job]);
}

export function JobDetailActions({ job }: JobDetailActionsProps) {
  const router = useRouter();
  const { isAuthenticated, user, uid } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [quickApplying, setQuickApplying] = useState(false);

  const { data: savedIds = [] } = useSavedJobIds();
  const toggleSave = useToggleSaveJob();
  const { data: alreadyApplied } = useHasApplied(job.id);
  const getOrCreateConv = useGetOrCreateConversation();
  const applyMutation = useApplyToJob();
  const deadlineInfo = useDeadlineInfo(job);

  const isSeekerUser = isAuthenticated && user?.role === "seeker";
  const isEmployer = isAuthenticated && user?.role === "employer";
  const isJobOwner = isEmployer && uid === job.postedBy;

  // Fetch saved resume for quick apply (seekers only)
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user?.uid && isSeekerUser,
    staleTime: 2 * 60 * 1000,
  });
  const savedResumeURL: string = (userProfile?.profile?.resumeURL as string | undefined) ?? "";

  async function handleMessageEmployer() {
    if (!isAuthenticated) {
      router.push(`/login?from=/jobs/${job.id}`);
      return;
    }
    try {
      const convId = await getOrCreateConv.mutateAsync({
        otherUid: job.postedBy,
        otherInfo: {
          displayName: job.companyName,
          photoURL: job.companyLogo ?? null,
          role: "employer",
        },
        jobId: job.id,
        jobTitle: job.title,
      });
      router.push(`/seeker/messages/${convId}`);
    } catch {
      toast.error("Failed to start conversation");
    }
  }

  async function handleQuickApply() {
    if (!savedResumeURL) {
      toast.error("No saved resume found. Please use the full apply form.");
      setApplyOpen(true);
      return;
    }
    setQuickApplying(true);
    try {
      await applyMutation.mutateAsync({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        companyLogo: job.companyLogo ?? "",
        employerId: job.postedBy,
        resumeURL: savedResumeURL,
        coverLetter: "",
      });
      toast.success("⚡ Applied instantly! Check your Applications for updates.");
    } catch {
      toast.error("Quick apply failed. Please try the full apply form.");
    } finally {
      setQuickApplying(false);
    }
  }

  const isSaved = savedIds.includes(job.id);

  async function handleShare() {
    const url = `${window.location.origin}/jobs/${job.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${job.title} at ${job.companyName}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled
    }
  }

  function handleToggleSave() {
    if (!isAuthenticated) return;
    toggleSave.mutate({ jobId: job.id, isSaved });
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {isEmployer ? "Job Management" : "Apply for this role"}
          </h3>
        </div>

        <div className="p-5 space-y-3">
          {/* ── Employer view: job owner panel ── */}
          {isJobOwner ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 px-4 py-3 text-sm font-medium text-blue-700 dark:text-blue-400">
                <BriefcaseIcon className="h-4 w-4 shrink-0" />
                You posted this job
              </div>
              <Link
                href={`/employer/jobs/${job.id}/applicants`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition-colors"
              >
                <UsersIcon className="h-4 w-4" />
                View Applicants
              </Link>
              <Link
                href={`/employer/jobs/${job.id}/edit`}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Job
              </Link>
            </div>
          ) : isEmployer ? (
            /* ── Non-owner employer: can't apply ── */
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              <BriefcaseIcon className="h-4 w-4 shrink-0" />
              Employers cannot apply to job listings.
            </div>
          ) : (
            <>
              {/* ── Deadline / expired notice ── */}
              {deadlineInfo?.expired && (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  <ClockIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  This job posting may have expired
                </div>
              )}

              {deadlineInfo && !deadlineInfo.expired && (
                <div className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium",
                  deadlineInfo.days <= 3
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400"
                )}>
                  <ClockIcon className="h-4 w-4 shrink-0" />
                  {deadlineInfo.days === 1 ? "Last day to apply!" : `${deadlineInfo.days} days left to apply`}
                  {deadlineInfo.isEstimated && <span className="font-normal opacity-60"> (est.)</span>}
                </div>
              )}

              {/* ── Apply buttons (seekers + unauthenticated) ── */}
              {isAuthenticated ? (
                alreadyApplied ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckIcon className="h-5 w-5" />
                    Application submitted
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Quick Apply */}
                    {savedResumeURL && isSeekerUser && (
                      <button
                        onClick={handleQuickApply}
                        disabled={quickApplying || applyMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 px-4 py-3.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-all"
                      >
                        {quickApplying
                          ? <Loader2Icon className="h-4 w-4 animate-spin" />
                          : <ZapIcon className="h-4 w-4" />}
                        {quickApplying ? "Applying…" : "⚡  Quick Apply"}
                      </button>
                    )}

                    {/* Apply with Cover Letter */}
                    <button
                      onClick={() => setApplyOpen(true)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all",
                        savedResumeURL && isSeekerUser
                          ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          : "bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm shadow-blue-500/20"
                      )}
                    >
                      <SendIcon className="h-4 w-4" />
                      {savedResumeURL && isSeekerUser ? "Apply with Cover Letter" : "Apply Now"}
                    </button>

                    {savedResumeURL && isSeekerUser && (
                      <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                        ⚡ Quick Apply uses your saved resume instantly
                      </p>
                    )}
                  </div>
                )
              ) : (
                <Link
                  href={`/login?from=/jobs/${job.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition-colors"
                >
                  Sign in to Apply
                </Link>
              )}
            </>
          )}

          {/* ── Secondary actions: Save + Share + WhatsApp (not for job owner) ── */}
          {!isJobOwner && <div className="flex gap-2 pt-1">
            {isAuthenticated ? (
              <button
                onClick={handleToggleSave}
                disabled={toggleSave.isPending}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                  isSaved
                    ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <BookmarkIcon className={cn("h-4 w-4", isSaved && "fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400")} />
                {isSaved ? "Saved" : "Save Job"}
              </button>
            ) : (
              <Link
                href={`/login?from=/jobs/${job.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <BookmarkIcon className="h-4 w-4" />
                Save Job
              </Link>
            )}

            {/* Share */}
            <button
              onClick={handleShare}
              aria-label="Share job"
              className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shrink-0"
            >
              {copied
                ? <CheckIcon className="h-4 w-4 text-emerald-600" />
                : <ShareIcon className="h-4 w-4" />}
            </button>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.companyName} — https://ekclickjob.com/jobs/${job.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all shrink-0"
            >
              <MessageCircleIcon className="h-4 w-4" />
            </a>
          </div>}

          {copied && !isJobOwner && (
            <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Link copied to clipboard
            </p>
          )}

          {/* ── Message Employer (seekers only, not the job owner) ── */}
          {isSeekerUser && (
            <button
              onClick={handleMessageEmployer}
              disabled={getOrCreateConv.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <MessageSquareIcon className="h-4 w-4" />
              Message Employer
            </button>
          )}

          {/* ── Applicant count ── */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 pb-1">
            {typeof job.applicationsCount === "number" && job.applicationsCount > 0
              ? `${job.applicationsCount} ${job.applicationsCount === 1 ? "person has" : "people have"} already applied.`
              : "Be among the first to apply!"}
          </p>

          {/* ── Report this job ── */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <button
              onClick={() => setReportOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <FlagIcon className="h-3 w-3" />
              Report this job
            </button>
          </div>
        </div>
      </div>

      <ApplyModal job={job} open={applyOpen} onOpenChange={setApplyOpen} />
      <ReportJobModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.companyName}
      />
    </>
  );
}
