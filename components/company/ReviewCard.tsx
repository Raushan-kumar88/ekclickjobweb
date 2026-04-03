"use client";

import { ThumbsUpIcon } from "lucide-react";
import { StarRating } from "@/components/company/StarRating";
import { useMarkReviewHelpful } from "@/hooks/useCompanyReviews";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import type { CompanyReview } from "@/types";

const STATUS_LABELS = {
  current: "Current Employee",
  former: "Former Employee",
  interviewed: "Interviewed",
};

interface ReviewCardProps {
  review: CompanyReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { user } = useAuthStore();
  const markHelpful = useMarkReviewHelpful();
  const hasVoted = user ? review.helpfulVoters?.includes(user.uid) : false;

  function formatDate(ts: CompanyReview["createdAt"]) {
    try {
      return ts.toDate().toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    } catch {
      return "";
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <StarRating value={review.rating} size="sm" />
            <span className="text-sm font-semibold">{review.title}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground/70">{review.reviewerDisplayName}</span>
            <span>·</span>
            <span className="rounded-full bg-muted px-2 py-0.5">
              {STATUS_LABELS[review.employmentStatus]}
            </span>
            {review.position && (
              <>
                <span>·</span>
                <span>{review.position}</span>
              </>
            )}
            <span>·</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-3">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1.5">
            + Pros
          </p>
          <p className="text-sm text-foreground/80 whitespace-pre-line">{review.pros}</p>
        </div>
        <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3">
          <p className="text-xs font-semibold text-red-500 dark:text-red-400 mb-1.5">
            − Cons
          </p>
          <p className="text-sm text-foreground/80 whitespace-pre-line">{review.cons}</p>
        </div>
      </div>

      {/* Helpful */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => {
            if (!user) return;
            markHelpful.mutate({ reviewId: review.id, companyId: review.companyId });
          }}
          className={cn(
            "flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 border transition-colors",
            hasVoted
              ? "border-primary/40 bg-primary/5 text-primary"
              : "text-muted-foreground hover:text-foreground hover:border-foreground/30"
          )}
        >
          <ThumbsUpIcon className="h-3.5 w-3.5" />
          Helpful {review.helpful > 0 && `(${review.helpful})`}
        </button>
      </div>
    </div>
  );
}
