"use client";

import { useState } from "react";
import { XIcon, FlagIcon, LoaderIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const REPORT_REASONS = [
  { id: "fake", label: "Fake or fraudulent job", description: "This job doesn't appear to be real" },
  { id: "misleading", label: "Misleading information", description: "Salary, role, or company details are inaccurate" },
  { id: "spam", label: "Spam or duplicate", description: "This listing appears multiple times" },
  { id: "offensive", label: "Offensive content", description: "Contains inappropriate or discriminatory language" },
  { id: "wrong_category", label: "Wrong category", description: "Posted in an incorrect job category" },
  { id: "scam", label: "Asking for money", description: "Employer is requesting payment from applicants" },
  { id: "other", label: "Other", description: "Something else is wrong with this listing" },
] as const;

type ReportReason = typeof REPORT_REASONS[number]["id"];

interface ReportJobModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export function ReportJobModal({ open, onClose, jobId, jobTitle, companyName }: ReportJobModalProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    if (submitting) return;
    setReason(null);
    setComment("");
    setSubmitted(false);
    onClose();
  }

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "jobReports"), {
        jobId,
        jobTitle,
        companyName,
        reason,
        comment: comment.trim(),
        reportedBy: isAuthenticated ? user?.uid : "anonymous",
        reporterEmail: isAuthenticated ? user?.email : null,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl mx-4 overflow-hidden">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          aria-label="Close"
        >
          <XIcon className="h-4 w-4" />
        </button>

        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
              <CheckIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Report submitted</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Thank you for keeping EkClickJob safe. Our team will review this report within 24 hours.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 rounded-xl bg-slate-900 dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 pr-12">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/30">
                  <FlagIcon className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Report this job</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                    {jobTitle} · {companyName}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Reason selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">What&apos;s wrong with this listing?</p>
                <div className="space-y-1.5">
                  {REPORT_REASONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setReason(r.id)}
                      className={cn(
                        "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                        reason === r.id
                          ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        reason === r.id
                          ? "border-red-500 bg-red-500"
                          : "border-slate-300 dark:border-slate-600"
                      )}>
                        {reason === r.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-medium leading-tight",
                          reason === r.id ? "text-red-800 dark:text-red-300" : "text-slate-800 dark:text-slate-200"
                        )}>
                          {r.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional comment */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Additional details <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  placeholder="Add any extra context that might help our team..."
                  rows={3}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
                <p className="text-right text-xs text-slate-400">{comment.length}/500</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors"
              >
                {submitting ? (
                  <><LoaderIcon className="h-4 w-4 animate-spin" />Submitting…</>
                ) : (
                  <><FlagIcon className="h-4 w-4" />Submit Report</>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Reports are reviewed within 24 hours. False reports may result in account restrictions.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
