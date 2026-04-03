"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPinIcon, UsersIcon, GlobeIcon, BadgeCheckIcon,
  BriefcaseIcon, StarIcon, PenLineIcon, BuildingIcon,
  BellIcon, BellOffIcon, MessageSquareIcon, PlusIcon,
  ChevronDownIcon, ThumbsUpIcon, CheckCircleIcon, XCircleIcon,
  ClockIcon, Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { JobCard } from "@/components/jobs/JobCard";
import { ReviewCard } from "@/components/company/ReviewCard";
import { StarRating, RatingBadge } from "@/components/company/StarRating";
import { WriteReviewModal } from "@/components/company/WriteReviewModal";
import { useCompanyReviews, useMyCompanyReview } from "@/hooks/useCompanyReviews";
import { useFollowedCompanies, useToggleFollowCompany } from "@/hooks/useFollowCompany";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import type { SerializedCompany } from "./page";
import type { DisplayJob } from "@/lib/firebase/db";

const TABS = ["Overview", "Jobs", "Reviews", "Interviews"] as const;
type Tab = typeof TABS[number];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const SUB_RATING_LABELS: Record<string, string> = {
  workLifeBalance: "Work-Life Balance",
  management: "Management",
  cultureValues: "Culture & Values",
  compensation: "Compensation",
};

type RichCompany = SerializedCompany & {
  tagline?: string;
  benefits?: string[];
  techStack?: string[];
  socialLinks?: Record<string, string>;
  founded?: string;
  funFact?: string;
  cultureHighlights?: string[];
};

interface Props {
  company: SerializedCompany;
  initialJobs: DisplayJob[];
}

// ── Interview Q&A types ──────────────────────────────────────────
type InterviewDifficulty = "easy" | "medium" | "hard";
type InterviewOutcome = "offer" | "rejected" | "withdrew" | "pending";

interface InterviewEntry {
  id: string;
  question: string;
  role?: string;
  difficulty: InterviewDifficulty;
  outcome: InterviewOutcome;
  tips?: string;
  submittedAt: string;
}

const DIFFICULTY_STYLE: Record<InterviewDifficulty, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const OUTCOME_ICON: Record<InterviewOutcome, React.ElementType> = {
  offer: CheckCircleIcon,
  rejected: XCircleIcon,
  withdrew: ClockIcon,
  pending: ClockIcon,
};

const OUTCOME_STYLE: Record<InterviewOutcome, string> = {
  offer: "text-green-600",
  rejected: "text-red-500",
  withdrew: "text-muted-foreground",
  pending: "text-amber-600",
};

// Static seed data for interview questions
const SEED_INTERVIEWS: InterviewEntry[] = [
  { id: "1", question: "Tell me about yourself and your most challenging project.", role: "Software Engineer", difficulty: "easy", outcome: "offer", tips: "Focus on impact and numbers. They love specific examples.", submittedAt: "2026-02-15" },
  { id: "2", question: "How do you handle disagreements with your manager?", role: "Product Manager", difficulty: "medium", outcome: "offer", tips: "Use the STAR method. Show empathy and communication skills.", submittedAt: "2026-01-20" },
  { id: "3", question: "Design a parking lot system from scratch.", role: "Software Engineer", difficulty: "hard", outcome: "rejected", tips: "Start with requirements, then entities, then APIs. They care more about process than perfection.", submittedAt: "2026-03-01" },
];

function InterviewCard({ entry }: { entry: InterviewEntry }) {
  const OutcomeIcon = OUTCOME_ICON[entry.outcome];
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-relaxed flex-1">&ldquo;{entry.question}&rdquo;</p>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize", DIFFICULTY_STYLE[entry.difficulty])}>
          {entry.difficulty}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {entry.role && (
          <span className="flex items-center gap-1">
            <BriefcaseIcon className="h-3 w-3" />
            {entry.role}
          </span>
        )}
        <span className={cn("flex items-center gap-1 font-medium", OUTCOME_STYLE[entry.outcome])}>
          <OutcomeIcon className="h-3 w-3" />
          {entry.outcome === "offer" ? "Got offer" : entry.outcome.charAt(0).toUpperCase() + entry.outcome.slice(1)}
        </span>
        <span>{new Date(entry.submittedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
      </div>
      {entry.tips && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-3.5 py-2.5">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">💡 Tip: </span>{entry.tips}
          </p>
        </div>
      )}
    </div>
  );
}

export function CompanyProfileClient({ company, initialJobs }: Props) {
  const { user } = useAuthStore();
  const richCompany = company as RichCompany;
  const [tab, setTab] = useState<Tab>("Overview");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviews, setInterviews] = useState<InterviewEntry[]>(SEED_INTERVIEWS);
  const [newQuestion, setNewQuestion] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<InterviewDifficulty>("medium");
  const [newOutcome, setNewOutcome] = useState<InterviewOutcome>("offer");
  const [newTips, setNewTips] = useState("");
  const [submittingInterview, setSubmittingInterview] = useState(false);

  const { data: reviews = [], isLoading: reviewsLoading } = useCompanyReviews(company.id);
  const { data: myReview } = useMyCompanyReview(company.id);
  const { data: followedIds = [] } = useFollowedCompanies();
  const toggleFollow = useToggleFollowCompany();

  const displayJobs = initialJobs;
  const rating = company.averageRating ?? 0;
  const reviewCount = company.reviewCount ?? reviews.length;
  const isFollowing = followedIds.includes(company.id);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter((r) => Math.round(r.rating) === star).length / reviews.length) * 100)
      : 0,
  }));

  // Sub-rating averages from reviews
  const subRatingKeys = ["workLifeBalance", "management", "cultureValues", "compensation"] as const;
  const subRatingAverages = subRatingKeys.reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals = reviews.map((r) => (r as any)[key]).filter((v): v is number => typeof v === "number");
    acc[key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return acc;
  }, {} as Record<string, number>);

  function handleFollow() {
    if (!user) {
      toast.error("Sign in to follow companies");
      return;
    }
    toggleFollow.mutate(
      { companyId: company.id, isFollowing },
      {
        onSuccess: () => {
          toast.success(isFollowing ? `Unfollowed ${company.name}` : `Following ${company.name}! You'll get job alerts.`);
        },
        onError: () => toast.error("Failed to update follow status"),
      }
    );
  }

  async function handleSubmitInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) { toast.error("Please enter an interview question"); return; }
    setSubmittingInterview(true);
    await new Promise((r) => setTimeout(r, 600));
    setInterviews((prev) => [{
      id: String(Date.now()),
      question: newQuestion.trim(),
      role: newRole.trim() || undefined,
      difficulty: newDifficulty,
      outcome: newOutcome,
      tips: newTips.trim() || undefined,
      submittedAt: new Date().toISOString().split("T")[0],
    }, ...prev]);
    setSubmittingInterview(false);
    setShowInterviewForm(false);
    setNewQuestion(""); setNewRole(""); setNewTips("");
    setNewDifficulty("medium"); setNewOutcome("offer");
    toast.success("Interview experience shared! Thank you.");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero banner */}
        <div className="border-b bg-card">
          <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <CompanyAvatar name={company.name} logoUrl={company.logo} size="xl" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold">{company.name}</h1>
                  {company.verified && (
                    <span title="Verified Company">
                      <BadgeCheckIcon className="h-5 w-5 text-primary" />
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-muted-foreground">{company.industry}</p>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {company.location?.city && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {company.location.city}, {company.location.state}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <UsersIcon className="h-3.5 w-3.5" />
                    {company.size} employees
                  </span>
                  {(company.jobCount ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <BriefcaseIcon className="h-3.5 w-3.5" />
                      {company.jobCount} open {company.jobCount === 1 ? "job" : "jobs"}
                    </span>
                  )}
                  {company.website && (
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <GlobeIcon className="h-3.5 w-3.5" />
                      Website
                    </a>
                  )}
                </div>

                {rating > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <RatingBadge rating={rating} count={reviewCount} />
                    <span className="text-sm text-muted-foreground">· {RATING_LABELS[Math.round(rating)]}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 shrink-0">
                {/* Follow Company button */}
                <button
                  onClick={handleFollow}
                  disabled={toggleFollow.isPending}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                    isFollowing
                      ? "border-primary bg-primary/10 text-primary hover:bg-primary/5"
                      : "hover:bg-muted/50 hover:border-primary/40"
                  )}
                >
                  {toggleFollow.isPending ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    <BellIcon className="h-4 w-4 fill-primary/30" />
                  ) : (
                    <BellOffIcon className="h-4 w-4" />
                  )}
                  {isFollowing ? "Following" : "Follow"}
                </button>

                {/* Write review */}
                {user?.role === "seeker" && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
                  >
                    <PenLineIcon className="h-4 w-4" />
                    {myReview ? "Edit Review" : "Write a Review"}
                  </button>
                )}
              </div>
            </div>

            {/* Following tip */}
            {isFollowing && (
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary flex items-center gap-2">
                <BellIcon className="h-4 w-4 shrink-0" />
                You&apos;re following {company.name} — you&apos;ll be notified when they post new jobs.
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="container mx-auto max-w-5xl px-4">
            <div className="flex gap-1 overflow-x-auto scroll-x">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors shrink-0",
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                  {t === "Jobs" && displayJobs.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">{displayJobs.length}</span>
                  )}
                  {t === "Reviews" && reviewCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">{reviewCount}</span>
                  )}
                  {t === "Interviews" && (
                    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">{interviews.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="container mx-auto max-w-5xl px-4 py-8">
          {/* ── Overview ── */}
          {tab === "Overview" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {company.description ? (
                  <div className="rounded-2xl border bg-card p-5">
                    <h2 className="mb-3 font-semibold">About {company.name}</h2>
                    {richCompany.tagline && (
                      <p className="mb-2 text-base font-medium text-primary">{richCompany.tagline}</p>
                    )}
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {company.description}
                    </p>
                  </div>
                ) : null}

                {(richCompany.benefits?.length ?? 0) > 0 && (
                  <div className="rounded-2xl border bg-card p-5">
                    <h2 className="mb-3 font-semibold">Benefits & Perks</h2>
                    <div className="flex flex-wrap gap-2">
                      {richCompany.benefits!.map((b) => (
                        <span key={b} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(richCompany.techStack?.length ?? 0) > 0 && (
                  <div className="rounded-2xl border bg-card p-5">
                    <h2 className="mb-3 font-semibold">Tech Stack</h2>
                    <div className="flex flex-wrap gap-2">
                      {richCompany.techStack!.map((t) => (
                        <span key={t} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {displayJobs.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-semibold">Open Positions</h2>
                      <button onClick={() => setTab("Jobs")} className="text-sm text-primary hover:underline">
                        View all
                      </button>
                    </div>
                    <div className="space-y-3">
                      {displayJobs.slice(0, 3).map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="rounded-2xl border bg-card p-5 space-y-3 text-sm">
                  <h3 className="font-semibold">Company Info</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Industry</span>
                      <span className="text-foreground">{company.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size</span>
                      <span className="text-foreground">{company.size} employees</span>
                    </div>
                    {company.location?.city && (
                      <div className="flex justify-between">
                        <span>Location</span>
                        <span className="text-foreground">{company.location.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating summary with sub-ratings */}
                {reviews.length > 0 && (
                  <div className="rounded-2xl border bg-card p-5 space-y-4">
                    <h3 className="font-semibold">Ratings</h3>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-4xl font-extrabold">{rating.toFixed(1)}</p>
                        <StarRating value={rating} size="sm" />
                        <p className="text-xs text-muted-foreground mt-1">{reviewCount} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {ratingBreakdown.map(({ star, pct }) => (
                          <div key={star} className="flex items-center gap-1.5 text-xs">
                            <span className="w-3 text-right text-muted-foreground">{star}</span>
                            <StarIcon className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-6 text-muted-foreground">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sub-ratings (Glassdoor pattern) */}
                    {subRatingKeys.some((k) => subRatingAverages[k] > 0) && (
                      <div className="border-t pt-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Sub-ratings</p>
                        {subRatingKeys.map((key) => {
                          const val = subRatingAverages[key];
                          if (!val) return null;
                          return (
                            <div key={key} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{SUB_RATING_LABELS[key]}</span>
                              <div className="flex items-center gap-1">
                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${(val / 5) * 100}%` }} />
                                </div>
                                <span className="font-semibold w-6 text-right">{val.toFixed(1)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button onClick={() => setTab("Reviews")} className="w-full text-sm text-primary hover:underline">
                      Read all reviews →
                    </button>
                  </div>
                )}

                {/* Interview stats */}
                {interviews.length > 0 && (
                  <div className="rounded-2xl border bg-card p-5 space-y-2">
                    <h3 className="font-semibold text-sm">Interview Insights</h3>
                    <div className="flex gap-4 text-xs">
                      {(["easy", "medium", "hard"] as InterviewDifficulty[]).map((d) => {
                        const count = interviews.filter((i) => i.difficulty === d).length;
                        return (
                          <div key={d} className="text-center">
                            <p className="font-bold">{count}</p>
                            <p className={cn("capitalize", DIFFICULTY_STYLE[d], "rounded px-1")}>{d}</p>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => setTab("Interviews")} className="w-full text-xs text-primary hover:underline mt-1">
                      View all questions →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Jobs ── */}
          {tab === "Jobs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Open Positions at {company.name}</h2>
                <span className="text-sm text-muted-foreground">{displayJobs.length} jobs</span>
              </div>
              {displayJobs.length === 0 ? (
                <div className="py-16 text-center">
                  <BriefcaseIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="font-medium">No open positions right now</p>
                  <p className="mt-1 text-sm text-muted-foreground">Check back later or browse other companies</p>
                  <Link href="/jobs" className="mt-4 inline-block text-sm text-primary hover:underline">
                    Browse all jobs →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayJobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              )}
            </div>
          )}

          {/* ── Reviews ── */}
          {tab === "Reviews" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-semibold">Employee Reviews</h2>
                  <p className="text-sm text-muted-foreground">
                    {reviewCount} {reviewCount === 1 ? "review" : "reviews"} from employees & candidates
                  </p>
                </div>
                {user?.role === "seeker" && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <PenLineIcon className="h-4 w-4" />
                    {myReview ? "Edit Your Review" : "Write a Review"}
                  </button>
                )}
              </div>

              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border p-5 space-y-3 animate-pulse">
                      <div className="h-4 w-40 rounded bg-muted" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 rounded-xl bg-muted" />
                        <div className="h-16 rounded-xl bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-16 text-center border rounded-2xl">
                  <StarIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="font-medium">No reviews yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Be the first to share your experience</p>
                  {user?.role === "seeker" && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      <PenLineIcon className="h-4 w-4" />
                      Write First Review
                    </button>
                  )}
                  {!user && (
                    <Link href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
                      Sign in to write a review
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {myReview && (
                    <div className="relative">
                      <div className="absolute -top-2 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground z-10">
                        Your Review
                      </div>
                      <ReviewCard review={myReview} />
                    </div>
                  )}
                  {reviews.filter((r) => r.id !== myReview?.id).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Interviews ── */}
          {tab === "Interviews" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-semibold">Interview Experiences</h2>
                  <p className="text-sm text-muted-foreground">
                    {interviews.length} shared experiences from candidates
                  </p>
                </div>
                {user && (
                  <button
                    onClick={() => setShowInterviewForm(!showInterviewForm)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Share Interview
                  </button>
                )}
              </div>

              {/* Interview difficulty summary */}
              {interviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {(["easy", "medium", "hard"] as InterviewDifficulty[]).map((d) => {
                    const count = interviews.filter((i) => i.difficulty === d).length;
                    const pct = Math.round((count / interviews.length) * 100);
                    return (
                      <div key={d} className={cn("rounded-2xl border p-4 text-center", DIFFICULTY_STYLE[d])}>
                        <p className="text-2xl font-black">{pct}%</p>
                        <p className="text-xs font-semibold capitalize">{d}</p>
                        <p className="text-[10px] opacity-70">{count} {count === 1 ? "report" : "reports"}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Offer rate */}
              {interviews.length > 0 && (
                <div className="rounded-2xl border bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUpIcon className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">Offer rate from shared experiences</span>
                  </div>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    {Math.round((interviews.filter((i) => i.outcome === "offer").length / interviews.length) * 100)}%
                  </span>
                </div>
              )}

              {/* Share Interview form */}
              {showInterviewForm && (
                <form onSubmit={handleSubmitInterview} className="rounded-2xl border bg-card p-5 space-y-4">
                  <h3 className="font-semibold text-sm">Share Your Interview Experience</h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Interview Question *</label>
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      rows={2}
                      placeholder="What question were you asked?"
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Role Applied For</label>
                      <input
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Outcome</label>
                      <select
                        value={newOutcome}
                        onChange={(e) => setNewOutcome(e.target.value as InterviewOutcome)}
                        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="offer">Got Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrew">Withdrew</option>
                        <option value="pending">Still Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
                    <div className="flex gap-2">
                      {(["easy", "medium", "hard"] as InterviewDifficulty[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setNewDifficulty(d)}
                          className={cn(
                            "flex-1 rounded-xl border py-2 text-xs font-semibold capitalize transition-all",
                            newDifficulty === d ? DIFFICULTY_STYLE[d] + " border-transparent" : "text-muted-foreground hover:border-foreground/20"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Tips for Others (optional)</label>
                    <textarea
                      value={newTips}
                      onChange={(e) => setNewTips(e.target.value)}
                      rows={2}
                      placeholder="Any advice for future candidates?"
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowInterviewForm(false)}
                      className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingInterview}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      {submittingInterview ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <MessageSquareIcon className="h-4 w-4" />}
                      {submittingInterview ? "Sharing…" : "Share Experience"}
                    </button>
                  </div>
                </form>
              )}

              {/* Interview list */}
              {interviews.length === 0 ? (
                <div className="py-16 text-center border rounded-2xl">
                  <MessageSquareIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="font-medium">No interview experiences shared yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Help future candidates by sharing your experience</p>
                  {!user && (
                    <Link href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
                      Sign in to share →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.map((entry) => (
                    <InterviewCard key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <WriteReviewModal
        companyId={company.id}
        companyName={company.name}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        existingReview={myReview ?? null}
      />
    </div>
  );
}
