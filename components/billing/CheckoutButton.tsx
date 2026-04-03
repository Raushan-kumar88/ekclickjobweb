"use client";

import { ZapIcon, Loader2Icon } from "lucide-react";
import { useRazorpayCheckout } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  plan: "pro";
  className?: string;
  label?: string;
  variant?: "primary" | "outline";
}

export function CheckoutButton({
  plan,
  className,
  label = "Upgrade to Pro",
  variant = "primary",
}: CheckoutButtonProps) {
  const checkout = useRazorpayCheckout();

  return (
    <button
      onClick={() => checkout.mutate(plan)}
      disabled={checkout.isPending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-60",
        variant === "primary"
          ? "bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-primary/90 shadow-sm"
          : "border border-primary px-5 py-2.5 text-sm text-primary hover:bg-primary/5",
        className
      )}
    >
      {checkout.isPending ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <ZapIcon className="h-4 w-4" />
      )}
      {checkout.isPending ? "Processing…" : label}
    </button>
  );
}
