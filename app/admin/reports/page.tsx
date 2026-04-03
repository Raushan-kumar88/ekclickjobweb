"use client";

import { useEffect, useState } from "react";
import {
  collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { formatDistanceToNow } from "date-fns";
import {
  FlagIcon, CheckCircleIcon, XCircleIcon, ExternalLinkIcon, ClockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { logAdminAction } from "@/lib/admin/auditLogger";
import { useAuthStore } from "@/stores/authStore";

const REASON_LABELS: Record<string, string> = {
  fake: "Fake or fraudulent",
  misleading: "Misleading information",
  spam: "Spam or duplicate",
  offensive: "Offensive content",
  wrong_category: "Wrong category",
  scam: "Asking for money",
  other: "Other",
};

type ReportStatus = "pending" | "reviewed" | "dismissed";

interface JobReport {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  reason: string;
  comment?: string;
  reportedBy?: string;
  reporterEmail?: string;
  status: ReportStatus;
  createdAt: { toDate: () => Date };
  reviewedAt?: { toDate: () => Date };
}

const STATUS_STYLES: Record<ReportStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  reviewed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  dismissed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export default function AdminReportsPage() {
  const { user: adminUser } = useAuthStore();
  const [reports, setReports] = useState<JobReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus | "all">("pending");

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "jobReports"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as JobReport)));
      } catch {
        toast.error("Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleAction(report: JobReport, action: "reviewed" | "dismissed") {
    try {
      await updateDoc(doc(db, "jobReports", report.id), {
        status: action,
        reviewedAt: serverTimestamp(),
      });
      setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: action } : r)));
      toast.success(action === "reviewed" ? "Marked as reviewed" : "Report dismissed");
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: `report.${action}`,
        targetCollection: "jobReports",
        targetId: report.id,
        details: { jobTitle: report.jobTitle, reason: report.reason },
      });
    } catch {
      toast.error("Failed to update report");
    }
  }

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review reports submitted by candidates about suspicious or fraudulent listings
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "reviewed", "dismissed", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            {f === "all" ? "All reports" : f}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} report{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading reports…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            <ClockIcon className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No {filter !== "all" ? filter : ""} reports</p>
          </div>
        ) : (
          filtered.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border bg-background p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/30 mt-0.5">
                    <FlagIcon className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{report.jobTitle}</p>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_STYLES[report.status])}>
                        {report.status}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {REASON_LABELS[report.reason] ?? report.reason}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.companyName}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {report.createdAt ? formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true }) : "—"}
                      </span>
                      {report.reporterEmail && (
                        <span className="text-xs text-muted-foreground">by {report.reporterEmail}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/jobs/${report.jobId}`} target="_blank">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                      View Job
                    </Button>
                  </Link>
                  {report.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/5"
                        onClick={() => handleAction(report, "dismissed")}
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction(report, "reviewed")}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Mark Reviewed
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {report.comment && (
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Reporter&apos;s comment</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{report.comment}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
