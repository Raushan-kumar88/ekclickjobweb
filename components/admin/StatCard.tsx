import { cn } from "@/lib/utils";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
  subLabel?: string;
  trend?: { value: number; label: string };
  isLoading?: boolean;
  href?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  subLabel,
  trend,
  isLoading,
  href,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-2xl border bg-background p-5 transition-all",
        href && "hover:border-primary/30 hover:shadow-sm cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              trend.value >= 0
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {trend.value >= 0 ? (
              <TrendingUpIcon className="h-3 w-3" />
            ) : (
              <TrendingDownIcon className="h-3 w-3" />
            )}
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
        ) : (
          <p className="text-3xl font-bold tabular-nums">{value}</p>
        )}
        <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
        {subLabel && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subLabel}</p>
        )}
        {trend && (
          <p className="mt-0.5 text-xs text-muted-foreground">{trend.label}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }
  return content;
}
