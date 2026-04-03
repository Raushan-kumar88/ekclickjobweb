"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingIcon,
  FileTextIcon,
  ShieldCheckIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  HeadphonesIcon,
  TrendingUpIcon,
  ClockIcon,
  ArrowRightIcon,
  RefreshCwIcon,
} from "lucide-react";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { StatCard } from "@/components/admin/StatCard";
import { useDashboardStats } from "@/hooks/admin/useDashboardStats";
import { formatDistanceToNow } from "date-fns";

interface RecentActivity {
  id: string;
  type: "user" | "job" | "application" | "support";
  label: string;
  sub: string;
  time: Timestamp | null;
  href: string;
}

const QUICK_ACTIONS = [
  {
    label: "Employer Validations",
    description: "Review pending employer document submissions",
    icon: BadgeCheckIcon,
    href: "/admin/employer-validation",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    label: "Company Verifications",
    description: "Approve or reject company verification requests",
    icon: ShieldCheckIcon,
    href: "/admin/verifications",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    label: "Support Tickets",
    description: "Handle open support requests from users",
    icon: HeadphonesIcon,
    href: "/admin/support",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    label: "Reports",
    description: "Review flagged and reported job postings",
    icon: FileTextIcon,
    href: "/admin/reports",
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
];

export default function AdminDashboardPage() {
  const { stats, isLoading } = useDashboardStats();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  async function fetchRecentActivity() {
    setActivityLoading(true);
    try {
      const [usersSnap, jobsSnap, ticketsSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(3))),
        getDocs(query(collection(db, "jobs"), orderBy("postedAt", "desc"), limit(3))),
        getDocs(query(collection(db, "supportTickets"), orderBy("createdAt", "desc"), limit(3))),
      ]);

      const activities: RecentActivity[] = [
        ...usersSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: `user-${doc.id}`,
            type: "user" as const,
            label: `New ${d.role ?? "user"} registered`,
            sub: d.displayName ?? d.email ?? "Unknown",
            time: d.createdAt ?? null,
            href: "/admin/users",
          };
        }),
        ...jobsSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: `job-${doc.id}`,
            type: "job" as const,
            label: "New job posted",
            sub: d.title ?? "Untitled Job",
            time: d.postedAt ?? null,
            href: "/admin/jobs",
          };
        }),
        ...ticketsSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: `ticket-${doc.id}`,
            type: "support" as const,
            label: "Support ticket opened",
            sub: d.subject ?? "No subject",
            time: d.createdAt ?? null,
            href: "/admin/support",
          };
        }),
      ];

      activities.sort((a, b) => {
        const ta = a.time?.toMillis() ?? 0;
        const tb = b.time?.toMillis() ?? 0;
        return tb - ta;
      });

      setRecentActivity(activities.slice(0, 8));
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setActivityLoading(false);
    }
  }

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  function handleRefresh() {
    setLastRefreshed(new Date());
    fetchRecentActivity();
  }

  const activityIcon: Record<string, React.ElementType> = {
    user: UsersIcon,
    job: BriefcaseIcon,
    application: FileTextIcon,
    support: HeadphonesIcon,
  };

  const activityColor: Record<string, string> = {
    user: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    job: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    application: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    support: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Real-time platform overview
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <RefreshCwIcon className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={UsersIcon}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          href="/admin/users"
          isLoading={isLoading}
        />
        <StatCard
          label="Active Jobs"
          value={stats.activeJobs}
          icon={BriefcaseIcon}
          colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          subLabel={`${stats.totalJobs} total`}
          href="/admin/jobs"
          isLoading={isLoading}
        />
        <StatCard
          label="Companies"
          value={stats.totalCompanies}
          icon={BuildingIcon}
          colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          subLabel={`${stats.verifiedCompanies} verified`}
          href="/admin/companies"
          isLoading={isLoading}
        />
        <StatCard
          label="Applications"
          value={stats.totalApplications}
          icon={FileTextIcon}
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending Validations"
          value={stats.pendingEmployerValidations}
          icon={BadgeCheckIcon}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          href="/admin/employer-validation"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending Verifications"
          value={stats.pendingVerifications}
          icon={ShieldCheckIcon}
          colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          href="/admin/verifications"
          isLoading={isLoading}
        />
        <StatCard
          label="Open Tickets"
          value={stats.openSupportTickets}
          icon={HeadphonesIcon}
          colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          href="/admin/support"
          isLoading={isLoading}
        />
        <StatCard
          label="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CreditCardIcon}
          colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
          href="/admin/subscriptions"
          isLoading={isLoading}
        />
      </div>

      {/* Bottom grid: Quick actions + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Quick Actions
            </h2>
          </div>
          <div className="grid gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 rounded-xl border bg-background p-4 hover:border-primary/30 hover:bg-accent/30 transition-all"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                </div>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Recent Activity
            </h2>
            <p className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
            </p>
          </div>
          <div className="rounded-xl border bg-background divide-y">
            {activityLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-8 w-8 animate-pulse rounded-xl bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No recent activity
              </div>
            ) : (
              recentActivity.map((item) => {
                const Icon = activityIcon[item.type] ?? TrendingUpIcon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${activityColor[item.type]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="h-3 w-3" />
                      {item.time
                        ? formatDistanceToNow(item.time.toDate(), { addSuffix: true })
                        : "—"}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
