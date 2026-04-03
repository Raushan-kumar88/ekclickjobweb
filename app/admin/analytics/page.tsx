"use client";

import { useState } from "react";
import { UsersIcon, BriefcaseIcon, CreditCardIcon, TrendingUpIcon } from "lucide-react";
import { ChartCard } from "@/components/admin/charts/ChartCard";
import { LineChart } from "@/components/admin/charts/LineChart";
import { BarChart } from "@/components/admin/charts/BarChart";
import { PieChart } from "@/components/admin/charts/PieChart";
import { StatCard } from "@/components/admin/StatCard";
import {
  useUserAnalytics,
  useJobAnalytics,
  useRevenueAnalytics,
  useApplicationFunnel,
} from "@/hooks/admin/useAnalytics";
import { cn } from "@/lib/utils";

type DateRange = "7d" | "30d" | "90d" | "1y";
type Tab = "users" | "jobs" | "revenue" | "engagement";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "User Analytics", icon: UsersIcon },
  { id: "jobs", label: "Job Analytics", icon: BriefcaseIcon },
  { id: "revenue", label: "Revenue", icon: CreditCardIcon },
  { id: "engagement", label: "Engagement", icon: TrendingUpIcon },
];

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [userRange, setUserRange] = useState<DateRange>("30d");
  const [jobRange, setJobRange] = useState<DateRange>("30d");
  const [revenueRange, setRevenueRange] = useState<DateRange>("30d");

  const { data: userData, isLoading: userLoading } = useUserAnalytics(userRange);
  const { data: jobData, isLoading: jobLoading } = useJobAnalytics(jobRange);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics(revenueRange);
  const { data: funnelData, isLoading: funnelLoading } = useApplicationFunnel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Platform performance metrics and trends
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 rounded-xl border bg-muted/30 p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* User Analytics Tab */}
      {activeTab === "users" && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Seekers"
              value={userData?.totalSeekers ?? 0}
              icon={UsersIcon}
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              isLoading={userLoading}
            />
            <StatCard
              label="Total Employers"
              value={userData?.totalEmployers ?? 0}
              icon={UsersIcon}
              colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              isLoading={userLoading}
            />
            <StatCard
              label="Total Admins"
              value={userData?.totalAdmins ?? 0}
              icon={UsersIcon}
              colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              isLoading={userLoading}
            />
          </div>

          <ChartCard
            title="New User Registrations"
            description="Number of new users who signed up in the selected period"
            showDateRange
            dateRange={userRange}
            onDateRangeChange={setUserRange}
            isLoading={userLoading}
          >
            <LineChart
              labels={userData?.growth.map((p) => p.label) ?? []}
              datasets={[
                {
                  label: "New Users",
                  data: userData?.growth.map((p) => p.value) ?? [],
                  color: "#3b82f6",
                },
              ]}
              height={250}
            />
          </ChartCard>

          <ChartCard
            title="Users by Role"
            description="Distribution of users across different roles"
            isLoading={userLoading}
          >
            <PieChart
              labels={userData?.byRole.map((r) => r.label) ?? []}
              data={userData?.byRole.map((r) => r.value) ?? []}
              colors={["#3b82f6", "#10b981", "#8b5cf6"]}
              height={220}
            />
          </ChartCard>
        </div>
      )}

      {/* Job Analytics Tab */}
      {activeTab === "jobs" && (
        <div className="space-y-5">
          <ChartCard
            title="Jobs Posted Over Time"
            showDateRange
            dateRange={jobRange}
            onDateRangeChange={setJobRange}
            isLoading={jobLoading}
          >
            <LineChart
              labels={jobData?.growth.map((p) => p.label) ?? []}
              datasets={[
                {
                  label: "Jobs Posted",
                  data: jobData?.growth.map((p) => p.value) ?? [],
                  color: "#10b981",
                },
              ]}
              height={250}
            />
          </ChartCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="Jobs by Category"
              description="Top job categories on the platform"
              isLoading={jobLoading}
            >
              <BarChart
                labels={jobData?.byCategory.map((c) => c.label) ?? []}
                datasets={[
                  {
                    label: "Jobs",
                    data: jobData?.byCategory.map((c) => c.value) ?? [],
                    color: "#10b981",
                  },
                ]}
                height={220}
                horizontal
              />
            </ChartCard>

            <ChartCard
              title="Jobs by Type"
              description="Full-time, part-time, contract distribution"
              isLoading={jobLoading}
            >
              <PieChart
                labels={jobData?.byType.map((t) => t.label) ?? []}
                data={jobData?.byType.map((t) => t.value) ?? []}
                height={220}
              />
            </ChartCard>
          </div>

          {/* Application Funnel */}
          <ChartCard
            title="Application Funnel"
            description="How applicants progress through the hiring stages"
            isLoading={funnelLoading}
          >
            <BarChart
              labels={funnelData.map((d) => d.label)}
              datasets={[
                {
                  label: "Applications",
                  data: funnelData.map((d) => d.value),
                  color: "#8b5cf6",
                },
              ]}
              height={220}
            />
          </ChartCard>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Active Subscriptions"
              value={revenueData?.totalActiveSubscriptions ?? 0}
              icon={CreditCardIcon}
              colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
              isLoading={revenueLoading}
            />
            <StatCard
              label="MRR (Monthly)"
              value={revenueData ? `₹${revenueData.mrr.toLocaleString("en-IN")}` : "—"}
              icon={TrendingUpIcon}
              colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              isLoading={revenueLoading}
            />
            <StatCard
              label="ARR (Annual)"
              value={revenueData ? `₹${(revenueData.mrr * 12).toLocaleString("en-IN")}` : "—"}
              icon={TrendingUpIcon}
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              isLoading={revenueLoading}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="Subscriptions by Plan"
              description="Active subscription distribution across plans"
              isLoading={revenueLoading}
            >
              <PieChart
                labels={revenueData?.byPlan.map((p) => p.label) ?? []}
                data={revenueData?.byPlan.map((p) => p.value) ?? []}
                colors={["#3b82f6", "#f59e0b"]}
                height={220}
              />
            </ChartCard>

            <ChartCard
              title="Revenue Info"
              description="Subscription revenue at a glance"
              isLoading={revenueLoading}
            >
              <div className="space-y-3 pt-2">
                {revenueData?.byPlan.map((plan) => (
                  <div
                    key={plan.label}
                    className="flex items-center justify-between rounded-xl border bg-muted/30 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold capitalize">{plan.label} Plan</p>
                      <p className="text-xs text-muted-foreground">{plan.value} active subscribers</p>
                    </div>
                    <p className="text-sm font-bold text-green-600">
                      ₹{(plan.value * (plan.label === "pro" ? 2999 : 9999)).toLocaleString("en-IN")}/mo
                    </p>
                  </div>
                ))}
                {(!revenueData?.byPlan.length) && (
                  <p className="text-sm text-center text-muted-foreground py-8">
                    No paid subscriptions yet
                  </p>
                )}
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === "engagement" && (
        <div className="space-y-5">
          <div className="rounded-xl border bg-background p-8 text-center">
            <TrendingUpIcon className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Engagement analytics coming soon
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Search terms, peak usage, most viewed jobs, and more
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
