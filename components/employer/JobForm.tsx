"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, XIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  JOB_CATEGORIES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  REMOTE_POLICIES,
  CITIES,
  STATES,
  POPULAR_SKILLS,
  INTERNSHIP_DURATION_OPTIONS,
} from "@/lib/utils/constants";
import type { JobCreateInput, JobType, ExperienceLevel, RemotePolicy } from "@/types";

const jobSchema = z
  .object({
    title: z.string().min(3, "Job title must be at least 3 characters"),
    category: z.string().min(1, "Category is required"),
    jobType: z.enum(["full-time", "part-time", "contract", "internship", "freelance", "walk-in"] as const),
    experienceLevel: z.enum(["fresher", "1-3 years", "3-5 years", "5-10 years", "10+ years"] as const),
    remotePolicy: z.enum(["on-site", "remote", "hybrid"] as const),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    description: z.string().min(100, "Description must be at least 100 characters"),
  })
  .refine(
    (d) => {
      if (d.salaryMin && d.salaryMax) {
        return Number(d.salaryMin) <= Number(d.salaryMax);
      }
      return true;
    },
    { message: "Minimum salary cannot exceed maximum", path: ["salaryMin"] }
  );

type JobFormData = z.infer<typeof jobSchema>;

export interface JobFormInitialValues {
  title?: string;
  category?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  remotePolicy?: RemotePolicy;
  city?: string;
  state?: string;
  salaryMin?: string;
  salaryMax?: string;
  description?: string;
  skills?: string[];
  isSponsored?: boolean;
  scheduledAt?: string | null;
  isWalkIn?: boolean;
  walkInAddress?: string;
  walkInMapLink?: string;
  walkInDates?: string[];
  walkInTiming?: string;
  // internship
  stipendMin?: string;
  stipendMax?: string;
  internshipDuration?: number;
  certificateOffered?: boolean;
  ppoRate?: string;
  isPaidInternship?: boolean;
}

interface JobFormProps {
  initialValues?: JobFormInitialValues;
  onSubmit: (data: JobCreateInput) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  canFeature?: boolean;
}

export function JobForm({ initialValues = {}, onSubmit, isLoading, submitLabel = "Post Job", canFeature = false }: JobFormProps) {
  const [skills, setSkills] = useState<string[]>(initialValues.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [skillError, setSkillError] = useState("");
  const [isSponsored, setIsSponsored] = useState(initialValues.isSponsored ?? false);
  const [scheduledAt, setScheduledAt] = useState(initialValues.scheduledAt ?? "");
  const [isWalkIn, setIsWalkIn] = useState(initialValues.isWalkIn ?? false);
  const [walkInAddress, setWalkInAddress] = useState(initialValues.walkInAddress ?? "");
  const [walkInMapLink, setWalkInMapLink] = useState(initialValues.walkInMapLink ?? "");
  const [walkInDates, setWalkInDates] = useState<string[]>(initialValues.walkInDates ?? []);
  const [walkInTiming, setWalkInTiming] = useState(initialValues.walkInTiming ?? "10:00 AM – 5:00 PM");
  // internship
  const [stipendMin, setStipendMin] = useState(initialValues.stipendMin ?? "");
  const [stipendMax, setStipendMax] = useState(initialValues.stipendMax ?? "");
  const [internshipDuration, setInternshipDuration] = useState<number>(initialValues.internshipDuration ?? 3);
  const [certificateOffered, setCertificateOffered] = useState(initialValues.certificateOffered ?? true);
  const [ppoRate, setPpoRate] = useState(initialValues.ppoRate ?? "");
  const [isPaidInternship, setIsPaidInternship] = useState(initialValues.isPaidInternship ?? true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialValues.title ?? "",
      category: initialValues.category ?? "",
      jobType: initialValues.jobType ?? "full-time",
      experienceLevel: initialValues.experienceLevel ?? "fresher",
      remotePolicy: initialValues.remotePolicy ?? "on-site",
      city: initialValues.city ?? "",
      state: initialValues.state ?? "",
      salaryMin: initialValues.salaryMin ?? "",
      salaryMax: initialValues.salaryMax ?? "",
      description: initialValues.description ?? "",
    },
  });

  const description = watch("description") ?? "";
  const watchedJobType = watch("jobType");

  function addSkill(s: string) {
    const t = s.trim();
    if (!t) return;
    if (skills.includes(t)) {
      setSkillInput("");
      return;
    }
    setSkills([...skills, t]);
    setSkillInput("");
    setSkillError("");
  }

  function removeSkill(s: string) {
    setSkills(skills.filter((x) => x !== s));
  }

  const suggested = POPULAR_SKILLS.filter(
    (sk) =>
      skillInput.length > 0 &&
      sk.toLowerCase().includes(skillInput.toLowerCase()) &&
      !skills.includes(sk)
  ).slice(0, 6);

  async function onFormSubmit(data: JobFormData) {
    if (skills.length === 0) {
      setSkillError("At least one skill is required");
      return;
    }
    const isInternship = data.jobType === "internship";
    const isWalkInJob = data.jobType === "walk-in" || isWalkIn;
    const payload: JobCreateInput = {
      title: data.title.trim(),
      description: data.description.trim(),
      companyId: "",
      companyName: "",
      companyLogo: "",
      location: { city: data.city, state: data.state, country: "India" },
      salary: isInternship
        ? { min: 0, max: 0, currency: "INR", period: "per month" }
        : {
            min: data.salaryMin ? Number(data.salaryMin) * 1_00_000 : 0,
            max: data.salaryMax ? Number(data.salaryMax) * 1_00_000 : 0,
            currency: "INR",
            period: "per year",
          },
      jobType: data.jobType,
      experienceLevel: data.experienceLevel,
      remotePolicy: data.remotePolicy,
      skills,
      category: data.category,
      isSponsored: canFeature ? isSponsored : false,
      scheduledAt: scheduledAt || null,
      isWalkIn: isWalkInJob,
      walkInAddress: isWalkInJob ? walkInAddress || null : null,
      walkInMapLink: isWalkInJob ? walkInMapLink || null : null,
      walkInDates: isWalkInJob && walkInDates.length > 0 ? walkInDates : null,
      walkInTiming: isWalkInJob ? walkInTiming || null : null,
      internshipDetails: isInternship
        ? {
            isPaid: isPaidInternship,
            stipendMin: isPaidInternship && stipendMin ? Number(stipendMin) : 0,
            stipendMax: isPaidInternship && stipendMax ? Number(stipendMax) : 0,
            durationMonths: internshipDuration,
            certificateOffered,
            ppoRate: ppoRate ? Number(ppoRate) : 0,
          }
        : null,
    };
    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Job Title <span className="text-destructive">*</span></Label>
        <Input id="title" placeholder="e.g. Senior React Developer" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Category + Job Type */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Category <span className="text-destructive">*</span></Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Job Type <span className="text-destructive">*</span></Label>
          <Controller
            name="jobType"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Experience + Remote Policy */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Experience Level <span className="text-destructive">*</span></Label>
          <Controller
            name="experienceLevel"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Work Mode <span className="text-destructive">*</span></Label>
          <Controller
            name="remotePolicy"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {REMOTE_POLICIES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* City + State */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>City <span className="text-destructive">*</span></Label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>State <span className="text-destructive">*</span></Label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
        </div>
      </div>

      {/* Salary */}
      <div className="space-y-1.5">
        <Label>Salary Range (LPA) — optional</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            placeholder="Min (e.g. 5)"
            min={0}
            {...register("salaryMin")}
            className="flex-1"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max (e.g. 15)"
            min={0}
            {...register("salaryMax")}
            className="flex-1"
          />
        </div>
        {errors.salaryMin && <p className="text-xs text-destructive">{errors.salaryMin.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground">(min 100 chars)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          rows={7}
          {...register("description")}
          className={errors.description ? "border-destructive" : ""}
        />
        <div className="flex justify-between">
          {errors.description ? (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${description.length < 100 ? "text-muted-foreground" : "text-green-600"}`}>
            {description.length} / 100+
          </span>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-1.5">
        <Label>
          Required Skills <span className="text-destructive">*</span>
        </Label>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-0.5 rounded-full hover:text-destructive"
                  aria-label={`Remove ${skill}`}
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
            placeholder="Type a skill and press Enter"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addSkill(skillInput)}
            aria-label="Add skill"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        {suggested.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggested.map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => addSkill(sk)}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                + {sk}
              </button>
            ))}
          </div>
        )}
        {skillError && <p className="text-xs text-destructive">{skillError}</p>}
      </div>

      {/* Featured Job Toggle (Pro/Enterprise only) */}
      {canFeature && (
        <div
          className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
            isSponsored
              ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/10"
              : "border-border hover:border-amber-300/50"
          }`}
          onClick={() => setIsSponsored((v) => !v)}
          role="checkbox"
          aria-checked={isSponsored}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setIsSponsored((v) => !v);
            }
          }}
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSponsored ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"}`}>
            <StarIcon className={`h-5 w-5 ${isSponsored ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Featured Job</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Featured jobs appear at the top of search results and are highlighted across the platform. Uses 1 of your monthly featured slots.
            </p>
          </div>
          <div
            className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
              isSponsored ? "border-amber-500 bg-amber-500" : "border-muted-foreground/30"
            }`}
          >
            {isSponsored && (
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Walk-in Job Toggle */}
      <div className="space-y-3 rounded-xl border p-4">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setIsWalkIn((v) => !v)}
          role="checkbox"
          aria-checked={isWalkIn}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setIsWalkIn((v) => !v); } }}
        >
          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${isWalkIn ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
            {isWalkIn && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
          <div>
            <p className="text-sm font-medium">Walk-in Interview</p>
            <p className="text-xs text-muted-foreground">Candidates can walk in without prior appointment</p>
          </div>
        </div>
        {isWalkIn && (
          <div className="space-y-3 pl-8">
            <div className="space-y-1.5">
              <Label>Walk-in Address</Label>
              <Input
                placeholder="e.g. 4th Floor, Pinnacle Tower, Bandra Kurla Complex, Mumbai"
                value={walkInAddress}
                onChange={(e) => setWalkInAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Google Maps Link <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                placeholder="https://maps.google.com/?q=..."
                value={walkInMapLink}
                onChange={(e) => setWalkInMapLink(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Walk-in Timing</Label>
              <Input
                placeholder="e.g. 10:00 AM – 5:00 PM"
                value={walkInTiming}
                onChange={(e) => setWalkInTiming(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Walk-in Date(s) <span className="text-muted-foreground text-xs">(add one or more dates)</span></Label>
              <div className="flex gap-2">
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  onChange={(e) => {
                    if (e.target.value && !walkInDates.includes(e.target.value)) {
                      setWalkInDates((prev) => [...prev, e.target.value].sort());
                      e.target.value = "";
                    }
                  }}
                />
              </div>
              {walkInDates.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {walkInDates.map((d) => (
                    <span key={d} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      <button type="button" onClick={() => setWalkInDates((prev) => prev.filter((x) => x !== d))} className="hover:text-destructive">
                        <XIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Internship-specific fields */}
      {watchedJobType === "internship" && (
        <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10 p-4">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">🎓 Internship Details</p>

          {/* Paid / Unpaid */}
          <div className="flex gap-3">
            {[true, false].map((paid) => (
              <button
                key={String(paid)}
                type="button"
                onClick={() => setIsPaidInternship(paid)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${isPaidInternship === paid ? "border-amber-500 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" : "border-border text-muted-foreground hover:border-amber-300"}`}
              >
                {paid ? "💰 Paid" : "🤝 Unpaid"}
              </button>
            ))}
          </div>

          {isPaidInternship && (
            <div className="space-y-1.5">
              <Label>Monthly Stipend (₹)</Label>
              <div className="flex items-center gap-3">
                <Input type="number" placeholder="Min (e.g. 10000)" min={0} value={stipendMin} onChange={(e) => setStipendMin(e.target.value)} className="flex-1" />
                <span className="text-muted-foreground">–</span>
                <Input type="number" placeholder="Max (e.g. 25000)" min={0} value={stipendMax} onChange={(e) => setStipendMax(e.target.value)} className="flex-1" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <select
                value={internshipDuration}
                onChange={(e) => setInternshipDuration(Number(e.target.value))}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                {INTERNSHIP_DURATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>PPO Rate (%) <span className="text-muted-foreground text-xs">optional</span></Label>
              <Input type="number" placeholder="e.g. 60" min={0} max={100} value={ppoRate} onChange={(e) => setPpoRate(e.target.value)} />
            </div>
          </div>

          {/* Certificate */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCertificateOffered((v) => !v)}
          >
            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${certificateOffered ? "border-amber-500 bg-amber-500" : "border-muted-foreground/30"}`}>
              {certificateOffered && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div>
              <p className="text-sm font-medium">Certificate Offered</p>
              <p className="text-xs text-muted-foreground">Interns will receive a certificate on completion</p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Post */}
      <div className="space-y-1.5">
        <Label htmlFor="scheduledAt">
          Schedule Post <span className="text-muted-foreground text-xs">(optional — leave blank to post immediately)</span>
        </Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
        />
        {scheduledAt && (
          <p className="text-xs text-muted-foreground">
            ⏰ This job will be published on {new Date(scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : scheduledAt ? `Schedule for ${new Date(scheduledAt).toLocaleDateString("en-IN")}` : submitLabel}
      </Button>
    </form>
  );
}
