"use client";

import { CheckIcon, ZapIcon, StarIcon, CreditCardIcon, CalendarIcon, AlertCircleIcon } from "lucide-react";
import { useSubscription, useCancelSubscription, useBillingHistory } from "@/hooks/useSubscription";
import { useEmployerJobs } from "@/hooks/useEmployerJobs";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { PLAN_LIMITS, PLAN_PRICES } from "@/lib/utils/subscription";
import { cn } from "@/lib/utils";

function formatAmount(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(ts: import("firebase/firestore").Timestamp | undefined | null) {
  if (!ts) return "—";
  try {
    return ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function BillingPage() {
  const { subscription, plan, planLabel, isLoading } = useSubscription();
  const cancelSub = useCancelSubscription();
  const { data: billingHistory = [], isLoading: historyLoading } = useBillingHistory();
  const { data: jobs = [] } = useEmployerJobs();

  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const jobLimit = PLAN_LIMITS[plan].jobPostings;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-40 rounded-2xl bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="mt-1 text-muted-foreground">Manage your plan, payments, and usage.</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              plan === "pro" ? "bg-primary/10" : plan === "enterprise" ? "bg-amber-500/10" : "bg-muted"
            )}>
              {plan === "pro" ? <ZapIcon className="h-6 w-6 text-primary" /> :
               plan === "enterprise" ? <StarIcon className="h-6 w-6 text-amber-500" /> :
               <CreditCardIcon className="h-6 w-6 text-muted-foreground" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{planLabel} Plan</h2>
                <PlanBadge plan={plan} size="sm" />
              </div>
              {subscription?.status === "active" && subscription.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Renews {formatDate(subscription.currentPeriodEnd)}
                </p>
              )}
              {subscription?.cancelAtPeriodEnd && (
                <p className="text-sm text-orange-500 flex items-center gap-1 mt-0.5">
                  <AlertCircleIcon className="h-3.5 w-3.5" />
                  Pro access ends {formatDate(subscription.currentPeriodEnd)} — reverts to Free plan
                </p>
              )}
            </div>
          </div>
          {plan === "free" && <CheckoutButton plan="pro" />}
          {plan === "pro" && !subscription?.cancelAtPeriodEnd && (
            <button
              onClick={() => cancelSub.mutate()}
              disabled={cancelSub.isPending}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              {cancelSub.isPending ? "Cancelling…" : "Cancel plan"}
            </button>
          )}
        </div>

        {/* Usage bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Job Postings</span>
            <span className="font-medium">
              {activeJobs} / {jobLimit === -1 ? "Unlimited" : jobLimit}
            </span>
          </div>
          {jobLimit !== -1 && (
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  activeJobs >= jobLimit ? "bg-destructive" : "bg-primary"
                )}
                style={{ width: `${Math.min((activeJobs / jobLimit) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b p-5">
          <h2 className="font-semibold">Plans</h2>
        </div>
        <div className="grid divide-y md:divide-y-0 md:grid-cols-3 md:divide-x">
          {(["free", "pro"] as const).map((p) => {
            const limits = PLAN_LIMITS[p];
            const isCurrent = plan === p;
            const features = [
              { label: `${limits.jobPostings === -1 ? "Unlimited" : limits.jobPostings} active jobs`, ok: true },
              { label: "Applicant management", ok: true },
              { label: "Analytics dashboard", ok: limits.analytics },
              { label: "Candidate search", ok: limits.candidateSearch },
              { label: `Featured jobs: ${limits.featuredJobs === -1 ? "Unlimited" : limits.featuredJobs === 0 ? "None" : `${limits.featuredJobs}/mo`}`, ok: limits.featuredJobs > 0 },
              { label: "Priority support", ok: limits.prioritySupport },
            ];
            return (
              <div key={p} className={cn("p-5", p === "pro" && "bg-primary/3")}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">{p}</span>
                      {isCurrent && <PlanBadge plan={p} size="sm" />}
                    </div>
                    <div className="mt-1">
                      {p === "free" ? (
                        <span className="text-xl font-bold">₹0</span>
                      ) : (
                        <span className="text-xl font-bold">{PLAN_PRICES.pro.display}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                      )}
                    </div>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2 text-sm">
                      <CheckIcon className={cn("mt-0.5 h-4 w-4 shrink-0", f.ok ? "text-green-500" : "text-muted-foreground/30")} />
                      <span className={cn(!f.ok && "text-muted-foreground/50")}>{f.label}</span>
                    </li>
                  ))}
                </ul>
                {!isCurrent && p === "pro" && (
                  <div className="mt-4">
                    <CheckoutButton plan="pro" className="w-full" />
                  </div>
                )}
              </div>
            );
          })}
          {/* Enterprise */}
          <div className="p-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Enterprise</span>
                {plan === "enterprise" && <PlanBadge plan="enterprise" size="sm" />}
              </div>
              <span className="text-xl font-bold">Custom</span>
            </div>
            <ul className="mt-4 space-y-2">
              {[
                "Unlimited active jobs",
                "Full applicant management",
                "Analytics dashboard",
                "Candidate search",
                "Unlimited featured listings",
                "Dedicated account manager",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:sales@ekclickjob.com"
              className="mt-4 flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b p-5">
          <h2 className="font-semibold">Billing History</h2>
        </div>
        {historyLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : billingHistory.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <CreditCardIcon className="mx-auto mb-3 h-8 w-8 opacity-30" />
            <p className="text-sm">No billing history yet.</p>
          </div>
        ) : (
          <div className="divide-y">
            {billingHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{record.plan} Plan</p>
                    <p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatAmount(record.amount)}</p>
                  <p className="text-xs text-muted-foreground uppercase">{record.currency}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
