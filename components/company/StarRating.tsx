"use client";

import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;          // 0–5, supports decimals for display
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const sizeMap = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-6 w-6" };

export function StarRating({
  value,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars.map((star) => {
        const filled = star <= Math.floor(value);
        const partial = !filled && star === Math.ceil(value) && value % 1 > 0;

        return (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={cn(
              "relative",
              interactive && "cursor-pointer hover:scale-110 transition-transform",
              !interactive && "cursor-default pointer-events-none"
            )}
            aria-label={interactive ? `Rate ${star} star${star !== 1 ? "s" : ""}` : undefined}
          >
            {/* Background (empty) star */}
            <StarIcon className={cn(sizeMap[size], "text-muted-foreground/30")} />
            {/* Filled star overlay */}
            {(filled || partial) && (
              <StarIcon
                className={cn(
                  sizeMap[size],
                  "absolute inset-0 text-amber-400 fill-amber-400",
                  partial && "clip-half"
                )}
                style={partial ? { clipPath: `inset(0 ${(1 - (value % 1)) * 100}% 0 0)` } : undefined}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function RatingBadge({ rating, count, size = "md" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  if (!rating) return null;
  return (
    <div className={cn("flex items-center gap-1", size === "sm" ? "text-xs" : "text-sm")}>
      <StarIcon className={cn("fill-amber-400 text-amber-400", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
