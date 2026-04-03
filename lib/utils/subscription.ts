import type { SubscriptionPlan } from "@/types";

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLAN_LIMITS: Record<SubscriptionPlan, {
  jobPostings: number;        // max active jobs (-1 = unlimited)
  analytics: boolean;
  candidateSearch: boolean;
  featuredJobs: number;       // featured job slots per month (-1 = unlimited)
  messaging: boolean;
  prioritySupport: boolean;
}> = {
  free: {
    jobPostings: 2,
    analytics: false,
    candidateSearch: false,
    featuredJobs: 0,
    messaging: true,
    prioritySupport: false,
  },
  pro: {
    jobPostings: 10,
    analytics: true,
    candidateSearch: true,
    featuredJobs: 1,
    messaging: true,
    prioritySupport: false,
  },
  enterprise: {
    jobPostings: -1,
    analytics: true,
    candidateSearch: true,
    featuredJobs: -1,
    messaging: true,
    prioritySupport: true,
  },
};

export const PLAN_PRICES: Record<Exclude<SubscriptionPlan, "free" | "enterprise">, {
  monthly: number;  // in paise (₹ × 100)
  display: string;
}> = {
  pro: { monthly: 299900, display: "₹2,999" },
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const PLAN_COLORS: Record<SubscriptionPlan, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-primary text-primary-foreground",
  enterprise: "bg-amber-500 text-white",
};

// ─── Feature access helpers ───────────────────────────────────────────────────

export function canPostJob(plan: SubscriptionPlan, currentActiveJobs: number): boolean {
  const limit = PLAN_LIMITS[plan].jobPostings;
  if (limit === -1) return true;
  return currentActiveJobs < limit;
}

export function canAccessAnalytics(plan: SubscriptionPlan): boolean {
  return PLAN_LIMITS[plan].analytics;
}

export function canSearchCandidates(plan: SubscriptionPlan): boolean {
  return PLAN_LIMITS[plan].candidateSearch;
}

export function getJobPostingLimit(plan: SubscriptionPlan): number {
  return PLAN_LIMITS[plan].jobPostings;
}

export function isPaidPlan(plan: SubscriptionPlan): boolean {
  return plan === "pro" || plan === "enterprise";
}
