"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BriefcaseIcon,
  UsersIcon,
  EyeIcon,
  TrendingUpIcon,
  PlusCircleIcon,
  BuildingIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { PhoneVerificationModal } from "@/components/employer/PhoneVerificationModal";
import { useEmployerDashboard } from "@/hooks/useEmployerDashboard";
import { useMyCompany } from "@/hooks/useCompany";
import { useAuthStore } from "@/stores/authStore";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/types";

const APP_STATUS_BADGE: Record<ApplicationStatus, string> = {
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  viewed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shortlisted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  interview: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  offered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  const { user } = useAuthStore();
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const { stats, recentApplications, isLoading, isError, jobs, isRecentLoading, isRefetching, refetch } =
    useEmployerDashboard();
  const { data: company, isLoading: companyLoading } = useMyCompany();

  const hasCompany = !!company;
  const companyComplete = hasCompany && company.name && company.industry && company.description;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phoneVerified = !!(user as any)?.phoneVerified;

  if (isError) {
    return (
      <EmptyState
        icon={RefreshCwIcon}
        title="Something went wrong"
        description="We couldn't load your dashboard. Please try again."
        action={{ label: "Retry", onClick: refetch }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {hasCompany ? company.name : "Employer Dashboard"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage your jobs and applicants</p>
        </div>
        <Link href="/employer/jobs/new">
          <Button className="gap-2">
            <PlusCircleIcon className="h-4 w-4" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Phone verification banner */}
      {!phoneVerified && (
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
            <PhoneIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Phone verification required</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Verify your mobile number to post jobs and protect candidates from spam.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setPhoneModalOpen(true)}
            className="shrink-0 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <ShieldCheckIcon className="h-4 w-4" />
            Verify Now
          </Button>
        </div>
      )}

      <PhoneVerificationModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onVerified={() => { setPhoneModalOpen(false); window.location.reload(); }}
      />

      {/* Company banner */}
      {!companyLoading && !hasCompany && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <BuildingIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Create your company profile to start posting jobs
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                A complete company profile helps attract better applicants.
              </p>
            </div>
            <Link href="/employer/company">
              <Button size="sm">Set Up Company</Button>
            </Link>
          </div>
        </div>
      )}

      {!companyLoading && hasCompany && !companyComplete && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Complete your company profile to attract more applicants
              </p>
            </div>
            <Link href="/employer/company">
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                Complete
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border p-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="mt-1 h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Active Jobs"
            value={stats.activeJobs}
            icon={BriefcaseIcon}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard
            label="Total Applicants"
            value={stats.totalApplicants}
            icon={UsersIcon}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard
            label="Job Views"
            value={stats.totalViews}
            icon={EyeIcon}
            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <StatCard
            label="Apply Rate"
            value={`${stats.applyRate}%`}
            icon={TrendingUpIcon}
            color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          />
        </div>
      )}

      {/* Recent Applications */}
      <div className="rounded-xl border bg-background">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold">Recent Applications</h2>
          <Link href="/employer/jobs" className="text-xs text-primary hover:underline">
            View all jobs
          </Link>
        </div>

        {isRecentLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <UsersIcon className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium">No applications yet</p>
            <p className="text-xs text-muted-foreground">Post a job to start receiving applications</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentApplications.map((app: Application & { jobTitle?: string }) => {
              const job = jobs.find((j) => j.id === app.jobId);
              const badge = APP_STATUS_BADGE[app.status] ?? APP_STATUS_BADGE.applied;
              return (
                <div key={app.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary uppercase text-sm">
                      {app.applicantName?.charAt(0) ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{app.applicantName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {app.jobTitle ?? job?.title ?? "Job"} · {formatRelativeTime(app.appliedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", badge)}>
                      {app.status}
                    </span>
                    {job && (
                      <Link
                        href={`/employer/jobs/${app.jobId}/applicants`}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/employer/jobs"
          className="flex items-center gap-3 rounded-xl border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-accent/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <BriefcaseIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Manage Jobs</p>
            <p className="text-xs text-muted-foreground">{stats.activeJobs} active job{stats.activeJobs !== 1 ? "s" : ""}</p>
          </div>
        </Link>
        <Link
          href="/employer/company"
          className="flex items-center gap-3 rounded-xl border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-accent/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
            <BuildingIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Company Profile</p>
            <p className="text-xs text-muted-foreground">
              {hasCompany ? (companyComplete ? "Profile complete" : "Needs attention") : "Not set up"}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
