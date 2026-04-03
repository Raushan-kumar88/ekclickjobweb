"use client";

import { cn } from "@/lib/utils";
import { PLAN_LABELS, PLAN_COLORS } from "@/lib/utils/subscription";
import type { SubscriptionPlan } from "@/types";
import { ZapIcon, StarIcon } from "lucide-react";

interface PlanBadgeProps {
  plan: SubscriptionPlan;
  size?: "sm" | "md";
  className?: string;
}

export function PlanBadge({ plan, size = "md", className }: PlanBadgeProps) {
  const Icon = plan === "enterprise" ? StarIcon : plan === "pro" ? ZapIcon : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        PLAN_COLORS[plan],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {Icon && <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />}
      {PLAN_LABELS[plan]}
    </span>
  );
}
