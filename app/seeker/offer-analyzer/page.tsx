"use client";

import { useState, useMemo } from "react";
import {
  BarChart3Icon, TrendingUpIcon, TrendingDownIcon, InfoIcon,
  CheckCircleIcon, AlertCircleIcon, LightbulbIcon, ArrowRightIcon,
} from "lucide-react";
import { JOB_CATEGORIES, CITIES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

// ── Salary benchmark data (₹ LPA) ────────────────────────────────────────────
// p25 = 25th percentile, p50 = median, p75 = 75th percentile
const SALARY_BENCHMARKS: Record<string, { p25: number; p50: number; p75: number; p90: number }> = {
  "IT & Software":         { p25: 6,  p50: 12, p75: 22, p90: 40 },
  "Data Science":          { p25: 8,  p50: 15, p75: 28, p90: 50 },
  "Design":                { p25: 4,  p50: 8,  p75: 16, p90: 28 },
  "Marketing":             { p25: 4,  p50: 7,  p75: 14, p90: 24 },
  "Sales":                 { p25: 3,  p50: 6,  p75: 12, p90: 20 },
  "Finance & Accounting":  { p25: 5,  p50: 9,  p75: 18, p90: 30 },
  "Healthcare":            { p25: 4,  p50: 8,  p75: 15, p90: 25 },
  "Education":             { p25: 3,  p50: 5,  p75: 10, p90: 18 },
  "Human Resources":       { p25: 4,  p50: 7,  p75: 13, p90: 22 },
  "Operations":            { p25: 4,  p50: 8,  p75: 15, p90: 25 },
  "Legal":                 { p25: 5,  p50: 10, p75: 20, p90: 35 },
  "Customer Support":      { p25: 2,  p50: 4,  p75: 8,  p90: 14 },
  "Engineering":           { p25: 5,  p50: 10, p75: 20, p90: 35 },
  "Content & Writing":     { p25: 3,  p50: 5,  p75: 10, p90: 18 },
  "Administration":        { p25: 3,  p50: 5,  p75: 10, p90: 16 },
  "Other":                 { p25: 3,  p50: 6,  p75: 12, p90: 20 },
};

// City cost multiplier vs. Bangalore baseline
const CITY_MULTIPLIER: Record<string, number> = {
  "Bangalore":    1.00,
  "Mumbai":       1.08,
  "Delhi":        0.98,
  "Noida":        0.94,
  "Gurgaon":      0.97,
  "Hyderabad":    0.92,
  "Pune":         0.90,
  "Chennai":      0.88,
  "Kolkata":      0.80,
  "Ahmedabad":    0.78,
  "Jaipur":       0.72,
  "Indore":       0.68,
};

function getCityMultiplier(city: string) {
  return CITY_MULTIPLIER[city] ?? 0.75;
}

function getPercentile(ctc: number, bench: { p25: number; p50: number; p75: number; p90: number }) {
  if (ctc >= bench.p90) return 90;
  if (ctc >= bench.p75) return Math.round(75 + ((ctc - bench.p75) / (bench.p90 - bench.p75)) * 15);
  if (ctc >= bench.p50) return Math.round(50 + ((ctc - bench.p50) / (bench.p75 - bench.p50)) * 25);
  if (ctc >= bench.p25) return Math.round(25 + ((ctc - bench.p25) / (bench.p50 - bench.p25)) * 25);
  return Math.max(5, Math.round((ctc / bench.p25) * 25));
}

function formatLPA(n: number) {
  return n >= 100 ? `₹${(n / 100).toFixed(1)}Cr` : `₹${n.toFixed(1)}L`;
}

type CompanySize = "startup" | "mid" | "mnc";
type Experience = "0-2" | "2-5" | "5-10" | "10+";

interface AnalysisResult {
  percentile: number;
  marketMedian: number;
  marketP25: number;
  marketP75: number;
  verdict: "below" | "fair" | "above" | "excellent";
  negotiationBump: number;
  tips: string[];
}

const EXPERIENCE_FACTOR: Record<Experience, number> = {
  "0-2": 0.8,
  "2-5": 1.0,
  "5-10": 1.3,
  "10+": 1.6,
};

const COMPANY_FACTOR: Record<CompanySize, number> = {
  startup: 0.85,
  mid: 1.0,
  mnc: 1.2,
};

export default function OfferAnalyzerPage() {
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [offeredCTC, setOfferedCTC] = useState("");
  const [experience, setExperience] = useState<Experience>("2-5");
  const [companySize, setCompanySize] = useState<CompanySize>("mid");
  const [analyzed, setAnalyzed] = useState(false);

  const result = useMemo<AnalysisResult | null>(() => {
    if (!analyzed || !category || !offeredCTC) return null;

    const baseBench = SALARY_BENCHMARKS[category] ?? SALARY_BENCHMARKS["Other"];
    const cityMult = getCityMultiplier(city);
    const expFactor = EXPERIENCE_FACTOR[experience];
    const compFactor = COMPANY_FACTOR[companySize];

    const adjusted = {
      p25: baseBench.p25 * cityMult * expFactor,
      p50: baseBench.p50 * cityMult * expFactor,
      p75: baseBench.p75 * cityMult * expFactor,
      p90: baseBench.p90 * cityMult * expFactor,
    };

    const ctc = Number(offeredCTC);
    const percentile = getPercentile(ctc, adjusted);
    const diff = ((ctc - adjusted.p50) / adjusted.p50) * 100;

    let verdict: AnalysisResult["verdict"];
    let negotiationBump: number;
    let tips: string[];

    if (percentile >= 75) {
      verdict = "excellent";
      negotiationBump = 0;
      tips = [
        "This is an excellent offer — you're in the top 25% for your role and city.",
        "You can still negotiate for non-salary perks: extra leave, WFH days, faster appraisal cycle.",
        `Ask for ${companySize === "startup" ? "ESOPs or equity" : "signing bonus or joining bonus"} if not included.`,
      ];
    } else if (percentile >= 50) {
      verdict = "fair";
      negotiationBump = Math.round(diff < 0 ? 0 : 5);
      tips = [
        `This offer is at or above the market median of ${formatLPA(adjusted.p50)} for your profile.`,
        `You can reasonably negotiate ${5 + Math.round((75 - percentile) / 5)}–15% higher citing your experience.`,
        "Use competing offers (even exploratory) to strengthen your position.",
        "Negotiate annual increment percentage in writing — aim for 15–20% guaranteed.",
      ];
    } else {
      const gap = Math.round(((adjusted.p50 - ctc) / ctc) * 100);
      verdict = "below";
      negotiationBump = Math.min(35, gap + 10);
      tips = [
        `This offer is ${gap}% below market median (${formatLPA(adjusted.p50)}) for ${experience} years experience in ${category} in ${city || "your city"}.`,
        `Counter with at least ${formatLPA(adjusted.p50 * (companySize === "startup" ? 0.9 : 1))} as your target.`,
        "Quote the market rate data — use Ambitionbox, Levels.fyi, or EkClickJob Salary Insights as references.",
        "If they can't meet your salary, negotiate for faster appraisal (3 months instead of 12) with a guaranteed hike.",
        "Ask for a performance bonus to bridge the gap.",
      ];
    }

    return {
      percentile,
      marketMedian: adjusted.p50,
      marketP25: adjusted.p25,
      marketP75: adjusted.p75,
      verdict,
      negotiationBump,
      tips,
    };
  }, [analyzed, category, city, offeredCTC, experience, companySize]);

  const verdictConfig = {
    below:     { color: "text-red-600",   bg: "bg-red-50 dark:bg-red-900/20",    border: "border-red-200 dark:border-red-800",    icon: AlertCircleIcon,  label: "Below Market" },
    fair:      { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", icon: InfoIcon,         label: "Fair Offer" },
    above:     { color: "text-blue-600",  bg: "bg-blue-50 dark:bg-blue-900/20",   border: "border-blue-200 dark:border-blue-800",   icon: TrendingUpIcon,   label: "Above Market" },
    excellent: { color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", icon: CheckCircleIcon,  label: "Excellent Offer" },
  };

  function handleAnalyze() {
    if (!category || !offeredCTC) return;
    setAnalyzed(true);
  }

  function handleReset() {
    setAnalyzed(false);
    setRole(""); setCategory(""); setCity(""); setOfferedCTC("");
    setExperience("2-5"); setCompanySize("mid");
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3Icon className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Salary Offer Analyzer</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your job offer details to see how it compares to market rates and get personalized negotiation tips.
        </p>
      </div>

      {/* Input form */}
      {!analyzed ? (
        <div className="rounded-2xl border bg-card p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Role</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select category</option>
                {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Offered CTC (LPA) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">₹</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={offeredCTC}
                onChange={(e) => setOfferedCTC(e.target.value)}
                placeholder="e.g. 14.5"
                className="w-full rounded-xl border bg-background py-2.5 pl-7 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">LPA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Years of Experience</label>
              <div className="grid grid-cols-2 gap-2">
                {(["0-2", "2-5", "5-10", "10+"] as Experience[]).map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperience(exp)}
                    className={cn(
                      "rounded-xl border py-2 text-sm font-medium transition-all",
                      experience === exp
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {exp} yrs
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Type</label>
              <div className="space-y-2">
                {([
                  { value: "startup", label: "🚀 Startup" },
                  { value: "mid", label: "🏢 Mid-size" },
                  { value: "mnc", label: "🌐 MNC / Large Corp" },
                ] as { value: CompanySize; label: string }[]).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCompanySize(value)}
                    className={cn(
                      "w-full rounded-xl border py-2 text-sm font-medium transition-all text-left px-3",
                      companySize === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!category || !offeredCTC}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <BarChart3Icon className="h-4 w-4" />
            Analyze My Offer
          </button>
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* Verdict card */}
          {(() => {
            const cfg = verdictConfig[result.verdict];
            const Icon = cfg.icon;
            return (
              <div className={cn("rounded-2xl border p-6", cfg.bg, cfg.border)}>
                <div className="flex items-start gap-4">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", cfg.bg, cfg.border, "border")}>
                    <Icon className={cn("h-6 w-6", cfg.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={cn("text-lg font-bold", cfg.color)}>{cfg.label}</h2>
                      {role && <span className="text-sm text-muted-foreground">for {role}</span>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your offer of <span className="font-semibold">{formatLPA(Number(offeredCTC))}</span> is at the{" "}
                      <span className={cn("font-bold", cfg.color)}>{result.percentile}th percentile</span>{" "}
                      {city ? `in ${city}` : ""} for {experience} years experience in {category}.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Market range visualization */}
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4 text-primary" /> Market Salary Range
            </h3>
            <div className="space-y-3">
              {/* Bar */}
              <div className="relative h-8 rounded-full bg-muted overflow-hidden">
                {/* Market range bar */}
                <div
                  className="absolute top-0 h-full rounded-full bg-gradient-to-r from-red-300 via-amber-300 to-green-400"
                  style={{ width: "100%" }}
                />
                {/* Offer marker */}
                <div
                  className="absolute top-0 h-full w-1 bg-primary z-10"
                  style={{
                    left: `${Math.min(95, Math.max(2, result.percentile))}%`,
                  }}
                />
                <div
                  className="absolute -top-5 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap"
                  style={{ left: `${Math.min(92, Math.max(8, result.percentile))}%` }}
                >
                  Your offer
                </div>
              </div>

              {/* Labels */}
              <div className="flex justify-between text-xs text-muted-foreground px-1 mt-1">
                <span>P25 {formatLPA(result.marketP25)}</span>
                <span className="font-medium text-foreground">Median {formatLPA(result.marketMedian)}</span>
                <span>P75 {formatLPA(result.marketP75)}</span>
              </div>
            </div>

            {/* Numbers grid */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "25th %ile", value: formatLPA(result.marketP25), highlight: false },
                { label: "Median", value: formatLPA(result.marketMedian), highlight: true },
                { label: "75th %ile", value: formatLPA(result.marketP75), highlight: false },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={cn("rounded-xl p-3 text-center", highlight ? "bg-primary/10 border border-primary/20" : "bg-muted/40")}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={cn("mt-0.5 font-bold", highlight ? "text-primary" : "")}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Negotiation tips */}
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LightbulbIcon className="h-4 w-4 text-amber-500" /> Negotiation Tips
            </h3>
            {result.negotiationBump > 0 && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-2.5">
                <TrendingUpIcon className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Aim to negotiate {result.negotiationBump}–{result.negotiationBump + 10}% higher
                </p>
              </div>
            )}
            <ul className="space-y-2.5">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Comparison to current CTC if any */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Analyze Another Offer
            </button>
            <a
              href="/jobs"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Better Offers
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : null}

      {/* Info footer */}
      {!analyzed && (
        <p className="text-center text-xs text-muted-foreground">
          Data based on aggregated salary reports across Indian companies. Results are indicative and vary by company, skills, and negotiation.
        </p>
      )}
    </div>
  );
}
