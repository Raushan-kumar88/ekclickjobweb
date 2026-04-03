"use client";

import { BarChart2Icon, TrendingUpIcon, UsersIcon, EyeIcon, BriefcaseIcon, ActivityIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEmployerAnalytics } from "@/hooks/useInterviews";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeBanner } from "@/components/billing/UpgradeBanner";
import { APPLICATION_STATUS_CONFIG } from "@/lib/utils/constants";

// ─── Tiny bar chart (CSS only) ────────────────────────────────────────────────

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  // Show only last 14 days for readability
  const visible = data.slice(-14);

  return (
    <div className="flex items-end gap-0.5 h-16">
      {visible.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count} applications`}
          className="group relative flex-1 min-w-0 cursor-default"
        >
          <div
            className="rounded-t bg-primary/70 hover:bg-primary transition-colors"
            style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 2)}%` }}
          />
          {d.count > 0 && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background whitespace-nowrap z-10">
              {d.count}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Status breakdown bar ─────────────────────────────────────────────────────

function StatusBreakdown({ breakdown, total }: { breakdown: Record<string, number>; total: number }) {
  if (total === 0) return <p className="text-sm text-muted-foreground">No applications yet</p>;

  const statuses = ["applied", "viewed", "shortlisted", "interview", "offered", "rejected"] as const;

  return (
    <div className="space-y-2.5">
      {statuses.map((s) => {
        const count = breakdown[s] ?? 0;
        if (count === 0) return null;
        const pct = Math.round((count / total) * 100);
        const config = APPLICATION_STATUS_CONFIG[s];

        return (
          <div key={s} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium capitalize">{s}</span>
              <span className="text-muted-foreground">{count} ({pct}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: config.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Top jobs bar chart ───────────────────────────────────────────────────────

function TopJobsChart({ jobs }: { jobs: { jobId: string; title: string; applications: number; views: number }[] }) {
  if (jobs.length === 0) return <p className="text-sm text-muted-foreground">No jobs yet</p>;
  const maxApps = Math.max(...jobs.map((j) => j.applications), 1);

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div key={job.jobId} className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium truncate max-w-[65%]">{job.title}</p>
            <span className="text-xs text-muted-foreground shrink-0">
              {job.applications} applicants · {job.views} views
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(job.applications / maxApps) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, sub, color = "text-primary",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-primary/10", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function EmployerAnalyticsPage() {
  const { data: analytics, isLoading } = useEmployerAnalytics();
  const { canAccessAnalytics, isLoading: subLoading } = useSubscription();

  if (!subLoading && !canAccessAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BarChart2Icon className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-semibold">Analytics is a Pro Feature</h2>
        <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
          Upgrade to the Pro plan to unlock detailed analytics on your job postings, applicants, and conversion rates.
        </p>
        <UpgradeBanner
          variant="card"
          title="Unlock Analytics"
          description="See detailed insights — application trends, status breakdowns, and top-performing jobs."
          ctaHref="/employer/billing"
          className="max-w-md w-full text-left"
        />
      </div>
    );
  }

  const conversionRate =
    analytics && analytics.totalViews > 0
      ? Math.round((analytics.totalApplications / analytics.totalViews) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BarChart2Icon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Analytics</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your job postings and application performance
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Jobs"
          value={analytics.totalJobs}
          icon={BriefcaseIcon}
          sub={`${analytics.activeJobs} active`}
        />
        <StatCard
          label="Total Applications"
          value={analytics.totalApplications}
          icon={UsersIcon}
          color="text-blue-600"
        />
        <StatCard
          label="Total Views"
          value={analytics.totalViews.toLocaleString()}
          icon={EyeIcon}
          color="text-green-600"
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={TrendingUpIcon}
          sub="Views → Applications"
          color="text-amber-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Applications over time */}
        <div className="rounded-xl border bg-background p-4">
          <div className="mb-4 flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Applications — Last 14 Days</h2>
          </div>
          {analytics.applicationsByDay.every((d) => d.count === 0) ? (
            <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
              No applications in this period
            </div>
          ) : (
            <MiniBarChart data={analytics.applicationsByDay} />
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">Hover bars to see counts</p>
        </div>

        {/* Application status breakdown */}
        <div className="rounded-xl border bg-background p-4">
          <div className="mb-4 flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Application Status Breakdown</h2>
          </div>
          <StatusBreakdown
            breakdown={analytics.statusBreakdown}
            total={analytics.totalApplications}
          />
        </div>
      </div>

      {/* Top performing jobs */}
      <div className="rounded-xl border bg-background p-4">
        <div className="mb-4 flex items-center gap-2">
          <BriefcaseIcon className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Top Jobs by Applications</h2>
        </div>
        <TopJobsChart jobs={analytics.topJobs} />
      </div>
    </div>
  );
}
