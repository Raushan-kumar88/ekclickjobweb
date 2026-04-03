"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { formatDistanceToNow } from "date-fns";
import {
  SearchIcon,
  StarIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DownloadIcon,
  RefreshCwIcon,
  BriefcaseIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logAdminAction } from "@/lib/admin/auditLogger";
import { useAuthStore } from "@/stores/authStore";
import type { Job, JobStatus } from "@/types";

const STATUS_COLORS: Record<JobStatus, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  closed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function AdminJobsPage() {
  const { user: adminUser } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");

  async function loadJobs() {
    setIsLoading(true);
    try {
      const q = query(collection(db, "jobs"), orderBy("postedAt", "desc"), limit(200));
      const snap = await getDocs(q);
      setJobs(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Job)));
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadJobs(); }, []);

  async function handleStatusChange(jobId: string, status: JobStatus) {
    const job = jobs.find((j) => j.id === jobId);
    try {
      await updateDoc(doc(db, "jobs", jobId), { status });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
      toast.success(`Job ${status}`);
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "job.status_changed",
        targetCollection: "jobs",
        targetId: jobId,
        details: { from: job?.status, to: status, jobTitle: job?.title },
      });
    } catch {
      toast.error("Failed to update job");
    }
  }

  async function handleToggleFeatured(jobId: string, current: boolean) {
    try {
      await updateDoc(doc(db, "jobs", jobId), { isSponsored: !current });
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSponsored: !current } : j))
      );
      toast.success(current ? "Removed from featured" : "Marked as featured");
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: current ? "job.unfeatured" : "job.featured",
        targetCollection: "jobs",
        targetId: jobId,
        details: { jobTitle: jobs.find((j) => j.id === jobId)?.title },
      });
    } catch {
      toast.error("Failed to update job");
    }
  }

  function handleExportCSV() {
    const rows = [
      ["Title", "Company", "Status", "Location", "Applicants", "Posted"].join(","),
      ...filtered.map((j) =>
        [
          `"${j.title}"`,
          `"${j.companyName}"`,
          j.status,
          `"${j.location?.city ?? ""}"`,
          j.applicationsCount ?? 0,
          j.postedAt ? new Date(j.postedAt.toDate()).toISOString().split("T")[0] : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  }

  const filtered = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = q
      ? j.title?.toLowerCase().includes(q) || j.companyName?.toLowerCase().includes(q)
      : true;
    const matchStatus = statusFilter !== "all" ? j.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "active").length,
    paused: jobs.filter((j) => j.status === "paused").length,
    closed: jobs.filter((j) => j.status === "closed").length,
    featured: jobs.filter((j) => j.isSponsored).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Moderate all job postings · {counts.active} active, {counts.paused} paused, {counts.featured} featured
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadJobs} className="gap-2">
            <RefreshCwIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Total", value: counts.total, color: "text-foreground" },
          { label: "Active", value: counts.active, color: "text-green-600" },
          { label: "Paused", value: counts.paused, color: "text-amber-600" },
          { label: "Closed", value: counts.closed, color: "text-muted-foreground" },
          { label: "Featured", value: counts.featured, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 rounded-xl border bg-background px-3 py-1.5">
            <span className={cn("text-lg font-bold tabular-nums", s.color)}>{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as JobStatus | "all")}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs list */}
      <div className="rounded-xl border bg-background divide-y">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <BriefcaseIcon className="h-8 w-8 opacity-30" />
            <p className="text-sm">No jobs found</p>
          </div>
        ) : (
          filtered.map((job) => (
            <div key={job.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
              <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold truncate">{job.title}</p>
                  {job.isSponsored && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-900/20">
                      <StarIcon className="h-3 w-3 fill-amber-500" />
                      Featured
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      STATUS_COLORS[job.status]
                    )}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {job.companyName} · {job.location?.city}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.applicationsCount ?? 0} applicants ·{" "}
                  {job.postedAt
                    ? formatDistanceToNow(job.postedAt.toDate(), { addSuffix: true })
                    : "—"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title={job.isSponsored ? "Remove featured" : "Mark featured"}
                  onClick={() => handleToggleFeatured(job.id, job.isSponsored)}
                >
                  <StarIcon
                    className={cn(
                      "h-4 w-4",
                      job.isSponsored ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                    )}
                  />
                </Button>
                {job.status === "active" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Pause job"
                    onClick={() => handleStatusChange(job.id, "paused")}
                  >
                    <PauseCircleIcon className="h-4 w-4 text-amber-500" />
                  </Button>
                )}
                {job.status === "paused" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Activate job"
                    onClick={() => handleStatusChange(job.id, "active")}
                  >
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  </Button>
                )}
                {job.status !== "closed" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Close job"
                    onClick={() => handleStatusChange(job.id, "closed")}
                  >
                    <XCircleIcon className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
