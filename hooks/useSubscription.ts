"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getSubscription } from "@/lib/firebase/db";
import {
  canPostJob,
  canAccessAnalytics,
  canSearchCandidates,
  getJobPostingLimit,
  isPaidPlan,
  PLAN_LABELS,
  PLAN_PRICES,
} from "@/lib/utils/subscription";
import type { SubscriptionPlan } from "@/types";
import { toast } from "sonner";

export function useSubscription() {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ["subscription", user?.uid],
    queryFn: () => getSubscription(user!.uid),
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const plan: SubscriptionPlan = query.data?.plan ?? "free";

  // A subscription is only active if:
  // 1. It has status "active" or "trialing", AND
  // 2. If cancelAtPeriodEnd is true, the billing period hasn't ended yet
  const now = new Date();
  const periodEnd = query.data?.currentPeriodEnd
    ? (() => { try { return (query.data!.currentPeriodEnd as unknown as { toDate: () => Date }).toDate(); } catch { return null; } })()
    : null;
  const periodExpired = query.data?.cancelAtPeriodEnd && periodEnd && periodEnd < now;
  const isActive =
    !query.data ||
    (!periodExpired && (query.data.status === "active" || query.data.status === "trialing"));

  const effectivePlan: SubscriptionPlan = isActive ? plan : "free";

  return {
    subscription: query.data,
    plan: effectivePlan,
    planLabel: PLAN_LABELS[effectivePlan],
    isPaid: isPaidPlan(effectivePlan),
    isLoading: query.isLoading,
    // Feature gates
    canPostJob: (activeJobCount: number) => canPostJob(effectivePlan, activeJobCount),
    canAccessAnalytics: canAccessAnalytics(effectivePlan),
    canSearchCandidates: canSearchCandidates(effectivePlan),
    jobPostingLimit: getJobPostingLimit(effectivePlan),
  };
}

export function useCancelSubscription() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.uid] });
      toast.success("Subscription will cancel at the end of the billing period.");
    },
    onError: () => toast.error("Failed to cancel subscription. Please try again."),
  });
}

// ─── Razorpay checkout ────────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number | string;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: "pro") => {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway.");

      // Create order on server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user?.uid }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json() as { error?: string };
        throw new Error(err.error ?? "Failed to create order");
      }
      const order = await orderRes.json() as {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };

      // Open Razorpay checkout
      return new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "EkClickJob",
          description: `${PLAN_LABELS[plan]} Plan – Monthly`,
          order_id: order.orderId,
          prefill: {
            name: user?.displayName ?? "",
            email: user?.email ?? "",
          },
          theme: { color: "#6D28D9" },
          handler: async (response) => {
            try {
              const verifyRes = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  userId: user?.uid,
                  plan,
                }),
              });
              if (!verifyRes.ok) {
                const err = await verifyRes.json() as { error?: string };
                throw new Error(err.error ?? "Payment verification failed");
              }
              await queryClient.invalidateQueries({ queryKey: ["subscription", user?.uid] });
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        });
        rzp.open();
      });
    },
    onSuccess: () => {
      toast.success("🎉 Welcome to Pro! Your subscription is now active.", { duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (err: Error) => {
      if (err.message !== "Payment cancelled") {
        toast.error(err.message || "Payment failed. Please try again.");
      }
    },
  });
}

export function useBillingHistory() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["billingHistory", user?.uid],
    queryFn: async () => {
      const { getBillingHistory } = await import("@/lib/firebase/db");
      return getBillingHistory(user!.uid);
    },
    enabled: !!user?.uid,
  });
}

export { PLAN_PRICES };
