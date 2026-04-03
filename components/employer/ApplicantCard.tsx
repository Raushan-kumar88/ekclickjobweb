"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLinkIcon,
  ChevronDownIcon,
  MessageSquareIcon,
  FileTextIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ScheduleInterviewModal } from "@/components/interviews/ScheduleInterviewModal";
import { ResumePreviewModal } from "@/components/employer/ResumePreviewModal";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { useUpdateApplicationStatus } from "@/hooks/useApplications";
import { useGetOrCreateConversation } from "@/hooks/useMessaging";
import type { Application, ApplicationStatus } from "@/types";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  viewed: { label: "Viewed", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shortlisted: { label: "Shortlisted", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  interview: { label: "Interview", className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  offered: { label: "Offered!", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Not Selected", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const NEXT_ACTIONS: Record<ApplicationStatus, { label: string; value: ApplicationStatus }[]> = {
  applied: [
    { label: "Mark as Viewed", value: "viewed" },
    { label: "Shortlist", value: "shortlisted" },
    { label: "Reject", value: "rejected" },
  ],
  viewed: [
    { label: "Shortlist", value: "shortlisted" },
    { label: "Reject", value: "rejected" },
  ],
  shortlisted: [
    { label: "Call for Interview", value: "interview" },
    { label: "Reject", value: "rejected" },
  ],
  interview: [
    { label: "Make an Offer", value: "offered" },
    { label: "Reject", value: "rejected" },
  ],
  offered: [],
  rejected: [],
};

interface ApplicantCardProps {
  application: Application;
}

export function ApplicantCard({ application }: ApplicantCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);
  const updateStatus = useUpdateApplicationStatus();
  const getOrCreateConv = useGetOrCreateConversation();

  async function handleMessage() {
    try {
      const convId = await getOrCreateConv.mutateAsync({
        otherUid: application.applicantId,
        otherInfo: {
          displayName: application.applicantName ?? "Applicant",
          photoURL: null,
          role: "seeker",
        },
        jobId: application.jobId,
        jobTitle: application.jobTitle,
      });
      router.push(`/employer/messages/${convId}`);
    } catch (err) {
      console.error("[ApplicantCard] Failed to start conversation:", err);
      toast.error("Failed to start conversation. Please try again.");
    }
  }

  const config = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.applied;
  const nextActions = NEXT_ACTIONS[application.status] ?? [];

  async function handleUpdateStatus(status: ApplicationStatus) {
    try {
      await updateStatus.mutateAsync({ applicationId: application.id, status });
      toast.success(`Status updated to ${STATUS_CONFIG[status]?.label ?? status}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary uppercase text-sm">
          {application.applicantName?.charAt(0) ?? "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{application.applicantName}</p>
              <p className="text-xs text-muted-foreground">
                Applied {formatRelativeTime(application.appliedAt)}
              </p>
            </div>
            <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", config.className)}>
              {config.label}
            </span>
          </div>

          {/* Resume link */}
          {application.resumeURL && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setResumePreviewOpen(true)}
              >
                <FileTextIcon className="h-3.5 w-3.5" />
                Preview resume
              </Button>
              <a
                href={application.resumeURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                <ExternalLinkIcon className="h-3 w-3" />
                Open in new tab
              </a>
            </div>
          )}

          {/* Cover letter toggle */}
          {application.coverLetter && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDownIcon className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
                {expanded ? "Hide" : "Show"} Cover Letter
              </button>
              {expanded && (
                <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.coverLetter}
                </div>
              )}
            </div>
          )}

          {/* Employer notes */}
          {application.employerNotes && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/10 dark:text-amber-400">
              Note: {application.employerNotes}
            </p>
          )}
        </div>
      </div>
          {/* Status actions + Message */}
      {/* Status actions + Message */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleMessage}
          disabled={getOrCreateConv.isPending}
        >
          <MessageSquareIcon className="h-3.5 w-3.5" />
          Message
        </Button>
        {nextActions.map((action) => (
          <Button
            key={action.value}
            variant={action.value === "rejected" ? "ghost" : "outline"}
            size="sm"
            className={cn(
              "text-xs",
              action.value === "rejected" && "text-destructive hover:bg-destructive/10 hover:text-destructive",
              action.value === "offered" && "border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/10",
              action.value === "interview" && "border-cyan-500 text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/10"
            )}
            onClick={() =>
              action.value === "interview"
                ? setScheduleOpen(true)
                : handleUpdateStatus(action.value)
            }
            disabled={updateStatus.isPending}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <ScheduleInterviewModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        applicationId={application.id}
        jobId={application.jobId}
        jobTitle={application.jobTitle}
        companyName={application.companyName}
        seekerId={application.applicantId}
        seekerName={application.applicantName}
        onSuccess={() => handleUpdateStatus("interview")}
      />

      {application.resumeURL && (
        <ResumePreviewModal
          open={resumePreviewOpen}
          onOpenChange={setResumePreviewOpen}
          resumeUrl={application.resumeURL}
          applicantName={application.applicantName}
        />
      )}
    </div>
  );
}
