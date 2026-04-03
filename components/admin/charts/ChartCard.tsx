"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type DateRange = "7d" | "30d" | "90d" | "1y";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  showDateRange?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  isLoading?: boolean;
  className?: string;
  action?: React.ReactNode;
}

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
];

export function ChartCard({
  title,
  description,
  children,
  showDateRange,
  dateRange = "30d",
  onDateRangeChange,
  isLoading,
  className,
  action,
}: ChartCardProps) {
  return (
    <div className={cn("rounded-2xl border bg-background p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          {showDateRange && onDateRangeChange && (
            <div className="flex rounded-xl border bg-muted/40 p-0.5">
              {DATE_RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onDateRangeChange(r.value)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                    dateRange === r.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
