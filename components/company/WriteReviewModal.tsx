"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StarRating } from "@/components/company/StarRating";
import { useSubmitReview } from "@/hooks/useCompanyReviews";
import { cn } from "@/lib/utils";
import type { CompanyReviewInput, EmploymentStatus } from "@/types";

const schema = z.object({
  rating: z.number().min(1, "Please select an overall rating").max(5),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  pros: z.string().min(20, "Please describe pros in at least 20 characters").max(1000),
  cons: z.string().min(20, "Please describe cons in at least 20 characters").max(1000),
  position: z.string().max(80).optional(),
  employmentStatus: z.enum(["current", "former", "interviewed"]),
  // Sub-ratings (optional but encouraged)
  workLifeBalance: z.number().min(0).max(5).optional(),
  management: z.number().min(0).max(5).optional(),
  cultureValues: z.number().min(0).max(5).optional(),
  compensation: z.number().min(0).max(5).optional(),
});

type FormData = z.infer<typeof schema>;

const STATUS_OPTIONS: { value: EmploymentStatus; label: string; emoji: string }[] = [
  { value: "current", label: "Current Employee", emoji: "🟢" },
  { value: "former", label: "Former Employee", emoji: "🔵" },
  { value: "interviewed", label: "Interviewed Here", emoji: "🟡" },
];

const SUB_RATINGS = [
  { key: "workLifeBalance" as const, label: "Work-Life Balance", emoji: "⚖️" },
  { key: "management" as const, label: "Management", emoji: "👔" },
  { key: "cultureValues" as const, label: "Culture & Values", emoji: "🎯" },
  { key: "compensation" as const, label: "Compensation & Benefits", emoji: "💰" },
];

interface WriteReviewModalProps {
  companyId: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  existingReview?: {
    rating: number;
    title: string;
    pros: string;
    cons: string;
    position?: string;
    employmentStatus: EmploymentStatus;
    workLifeBalance?: number;
    management?: number;
    cultureValues?: number;
    compensation?: number;
  } | null;
}

export function WriteReviewModal({
  companyId,
  companyName,
  isOpen,
  onClose,
  existingReview,
}: WriteReviewModalProps) {
  const submit = useSubmitReview(companyId);
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [subRatings, setSubRatings] = useState({
    workLifeBalance: existingReview?.workLifeBalance ?? 0,
    management: existingReview?.management ?? 0,
    cultureValues: existingReview?.cultureValues ?? 0,
    compensation: existingReview?.compensation ?? 0,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      title: existingReview?.title ?? "",
      pros: existingReview?.pros ?? "",
      cons: existingReview?.cons ?? "",
      position: existingReview?.position ?? "",
      employmentStatus: existingReview?.employmentStatus ?? "former",
      workLifeBalance: existingReview?.workLifeBalance ?? 0,
      management: existingReview?.management ?? 0,
      cultureValues: existingReview?.cultureValues ?? 0,
      compensation: existingReview?.compensation ?? 0,
    },
  });

  const employmentStatus = watch("employmentStatus");

  if (!isOpen) return null;

  function handleSubRatingChange(key: keyof typeof subRatings, value: number) {
    setSubRatings((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  }

  async function onSubmit(data: FormData) {
    const input: CompanyReviewInput = {
      companyId,
      rating: data.rating,
      title: data.title,
      pros: data.pros,
      cons: data.cons,
      position: data.position || undefined,
      employmentStatus: data.employmentStatus,
      // Sub-ratings — only include if set (> 0)
      ...(subRatings.workLifeBalance > 0 && { workLifeBalance: subRatings.workLifeBalance }),
      ...(subRatings.management > 0 && { management: subRatings.management }),
      ...(subRatings.cultureValues > 0 && { cultureValues: subRatings.cultureValues }),
      ...(subRatings.compensation > 0 && { compensation: subRatings.compensation }),
    };
    await submit.mutateAsync(input);
    onClose();
  }

  const completedSubRatings = Object.values(subRatings).filter((v) => v > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-5 py-4">
          <div>
            <h2 className="font-semibold">Write a Review</h2>
            <p className="text-xs text-muted-foreground">{companyName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {/* Overall Rating */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Overall Rating *</label>
            <StarRating
              value={rating}
              size="lg"
              interactive
              onChange={(v) => { setRating(v); setValue("rating", v, { shouldValidate: true }); }}
            />
            {errors.rating && <p className="text-xs text-destructive">{errors.rating.message}</p>}
          </div>

          {/* Employment status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Your status *</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("employmentStatus", opt.value)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-sm transition-colors flex items-center gap-1.5",
                    employmentStatus === opt.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Job Title / Position <span className="text-muted-foreground">(optional)</span></label>
            <input
              {...register("position")}
              placeholder="e.g. Software Engineer"
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Review Title *</label>
            <input
              {...register("title")}
              placeholder="Summarise your experience in one line"
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Pros */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-green-600 dark:text-green-400">+ Pros *</label>
            <textarea
              {...register("pros")}
              rows={3}
              placeholder="What did you like? Culture, growth, work-life balance…"
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            {errors.pros && <p className="text-xs text-destructive">{errors.pros.message}</p>}
          </div>

          {/* Cons */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-red-500 dark:text-red-400">− Cons *</label>
            <textarea
              {...register("cons")}
              rows={3}
              placeholder="What could be improved? Management, salary, processes…"
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            {errors.cons && <p className="text-xs text-destructive">{errors.cons.message}</p>}
          </div>

          {/* ── Sub-ratings (Glassdoor pattern) ── */}
          <div className="rounded-2xl border bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Detailed Ratings
                <span className="ml-1.5 text-xs text-muted-foreground">(optional but helpful)</span>
              </label>
              {completedSubRatings > 0 && (
                <span className="text-xs text-primary font-medium">{completedSubRatings}/4 rated</span>
              )}
            </div>
            <div className="grid gap-3.5">
              {SUB_RATINGS.map(({ key, label, emoji }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <span className="text-base">{emoji}</span>
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <StarRating
                      value={subRatings[key]}
                      size="sm"
                      interactive
                      onChange={(v) => handleSubRatingChange(key, v)}
                    />
                    {subRatings[key] > 0 && (
                      <span className="text-xs font-bold text-amber-600 w-5 text-right">{subRatings[key]}.0</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Your review is anonymous — only your first name and last initial will be shown.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submit.isPending}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {submit.isPending ? "Submitting…" : existingReview ? "Update Review" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
