"use client";

import Link from "next/link";
import { ZapIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UpgradeBannerProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  variant?: "banner" | "card";
  dismissible?: boolean;
  className?: string;
}

export function UpgradeBanner({
  title = "Upgrade to Pro",
  description = "You've reached your plan limit. Upgrade to unlock more features.",
  ctaText = "Upgrade Now",
  ctaHref = "/employer/billing",
  variant = "banner",
  dismissible = false,
  className,
}: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === "card") {
    return (
      <div className={cn(
        "rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6",
        className
      )}>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <ZapIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            <Link
              href={ctaHref}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ZapIcon className="h-3.5 w-3.5" />
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3",
      className
    )}>
      <ZapIcon className="h-4 w-4 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">{title}: </span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      <Link
        href={ctaHref}
        className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {ctaText}
      </Link>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
