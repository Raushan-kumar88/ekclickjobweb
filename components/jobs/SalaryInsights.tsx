import { BanknoteIcon, TrendingUpIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SALARY_DATA: Record<string, { min: number; avg: number; max: number; trend: string }> = {
  "IT & Software": { min: 4, avg: 14, max: 40, trend: "+12% YoY" },
  "Data Science": { min: 6, avg: 18, max: 50, trend: "+22% YoY" },
  Marketing: { min: 3, avg: 8, max: 20, trend: "+8% YoY" },
  Sales: { min: 3, avg: 7, max: 18, trend: "+6% YoY" },
  "Finance & Accounting": { min: 4, avg: 10, max: 28, trend: "+10% YoY" },
  Healthcare: { min: 3, avg: 8, max: 22, trend: "+15% YoY" },
  Education: { min: 2, avg: 5, max: 12, trend: "+5% YoY" },
  Engineering: { min: 4, avg: 12, max: 30, trend: "+9% YoY" },
  Design: { min: 3, avg: 8, max: 22, trend: "+14% YoY" },
  "Human Resources": { min: 3, avg: 6, max: 15, trend: "+7% YoY" },
  Operations: { min: 3, avg: 7, max: 18, trend: "+6% YoY" },
  Legal: { min: 5, avg: 12, max: 35, trend: "+8% YoY" },
  "Customer Support": { min: 2, avg: 4, max: 10, trend: "+5% YoY" },
  "Content & Writing": { min: 2, avg: 5, max: 15, trend: "+10% YoY" },
  Administration: { min: 2, avg: 4, max: 10, trend: "+4% YoY" },
};

interface SalaryInsightsProps {
  category: string;
  currentMin?: number;
  currentMax?: number;
}

function formatL(val: number): string {
  return `₹${val}L`;
}

export function SalaryInsights({ category, currentMin, currentMax }: SalaryInsightsProps) {
  const data = SALARY_DATA[category];
  if (!data) return null;

  const currentAvg = currentMin && currentMax ? (currentMin + currentMax) / 2 / 100000 : null;
  const comparison = currentAvg
    ? currentAvg > data.avg * 1.1
      ? { label: "Above market", color: "text-emerald-600 dark:text-emerald-400" }
      : currentAvg < data.avg * 0.9
      ? { label: "Below market", color: "text-rose-600 dark:text-rose-400" }
      : { label: "At market rate", color: "text-blue-600 dark:text-blue-400" }
    : null;

  // Positions on bar (%)
  const range = data.max - data.min;
  const minPct = 0;
  const avgPct = Math.round(((data.avg - data.min) / range) * 100);
  const maxPct = 100;
  const currentPct = currentAvg
    ? Math.min(Math.round(((currentAvg - data.min) / range) * 100), 100)
    : null;

  return (
    <div className="rounded-2xl border bg-background p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BanknoteIcon className="h-4 w-4 text-emerald-600" />
        <h3 className="font-semibold text-sm">Salary Insights — {category}</h3>
      </div>

      {/* Bar */}
      <div className="space-y-2">
        <div className="relative h-3 rounded-full bg-muted overflow-hidden">
          {/* Market range */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-muted via-emerald-200 to-muted dark:via-emerald-800/40" />
          {/* Current job marker */}
          {currentPct !== null && (
            <div
              className="absolute top-0 h-full w-1 rounded-full bg-blue-600"
              style={{ left: `${Math.max(0, Math.min(currentPct, 98))}%` }}
              title="This job's salary"
            />
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatL(data.min)} (min)</span>
          <span className="font-semibold text-emerald-600">{formatL(data.avg)} avg</span>
          <span>{formatL(data.max)} (max)</span>
        </div>
      </div>

      {/* Comparison badge */}
      {comparison && (
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", comparison.color)}>
          <TrendingUpIcon className="h-3.5 w-3.5" />
          {comparison.label} for {category}
        </div>
      )}

      <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <InfoIcon className="h-3 w-3 shrink-0" />
        <span>
          Market trend: <span className="font-semibold text-emerald-600">{data.trend}</span> — 
          <Link href="/trends" className="ml-1 text-primary hover:underline">view full report →</Link>
        </span>
      </div>
    </div>
  );
}
