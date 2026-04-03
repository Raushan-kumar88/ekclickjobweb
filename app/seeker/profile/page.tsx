"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  PencilIcon, MapPinIcon, MailIcon, PhoneIcon, BriefcaseIcon,
  GraduationCapIcon, TagIcon, FileTextIcon, SettingsIcon,
  CheckIcon, XIcon, Loader2Icon, CameraIcon, EyeIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getUserProfile, updateUserProfile } from "@/lib/firebase/db";
import { uploadProfilePhoto } from "@/lib/firebase/storage";
import { useSeekerApplications } from "@/hooks/useApplications";
import { useSavedJobIds } from "@/hooks/useSavedJobs";
import { CITIES, STATES, POPULAR_SKILLS, JOB_TYPES, NOTICE_PERIOD_OPTIONS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProfileCompleteness } from "@/components/seeker/ProfileCompleteness";
import { useProfileViews } from "@/hooks/useProfileViews";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { WorkExperience, Education, JobType } from "@/types";

function getAvatarColor(name: string) {
  const colors = ["bg-blue-500","bg-blue-500","bg-emerald-500","bg-rose-500","bg-amber-500","bg-cyan-500"];
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

// ── Edit form state ───────────────────────────────────────────────────────────
interface EditForm {
  displayName: string;
  phone: string;
  headline: string;
  bio: string;
  city: string;
  state: string;
  preferredJobTypes: JobType[];
  salaryMin: string;
  salaryMax: string;
  noticePeriod: string;
  currentCTC: string;
  expectedCTC: string;
  openToWorkVisibility: "public" | "recruiters";
}

export default function SeekerProfilePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [togglingOTW, setTogglingOTW] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<EditForm>({
    displayName: "", phone: "", headline: "", bio: "",
    city: "", state: "", preferredJobTypes: [], salaryMin: "", salaryMax: "",
    noticePeriod: "", currentCTC: "", expectedCTC: "", openToWorkVisibility: "public",
  });

  const { data: rawProfile, isLoading } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user?.uid,
  });

  const { data: applications = [] } = useSeekerApplications();
  const { data: savedIds = [] } = useSavedJobIds();
  const { data: profileViews = [] } = useProfileViews();

  // Hydrate edit form when profile loads
  useEffect(() => {
    if (!rawProfile || !user) return;
    const p = rawProfile.profile ?? {};
    setForm({
      displayName: rawProfile.displayName ?? user.displayName ?? "",
      phone: rawProfile.phone ?? user.phone ?? "",
      headline: p.headline ?? "",
      bio: p.bio ?? "",
      city: p.location?.city ?? "",
      state: p.location?.state ?? "",
      preferredJobTypes: p.preferredJobTypes ?? [],
      salaryMin: p.expectedSalary?.min ? String(p.expectedSalary.min) : "",
      salaryMax: p.expectedSalary?.max ? String(p.expectedSalary.max) : "",
      noticePeriod: p.noticePeriod ?? "",
      currentCTC: p.currentCTC ? String(p.currentCTC) : "",
      expectedCTC: p.expectedCTC ? String(p.expectedCTC) : "",
      openToWorkVisibility: p.openToWorkVisibility ?? "public",
    });
  }, [rawProfile, user]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.uid) throw new Error("Not authenticated");
      await updateUserProfile(user.uid, {
        displayName: form.displayName,
        phone: form.phone || null,
        "profile.headline": form.headline,
        "profile.bio": form.bio,
        "profile.location": { city: form.city, state: form.state },
        "profile.preferredJobTypes": form.preferredJobTypes,
        "profile.expectedSalary": {
          min: Number(form.salaryMin) || 0,
          max: Number(form.salaryMax) || 0,
        },
        "profile.noticePeriod": form.noticePeriod || null,
        "profile.currentCTC": form.currentCTC ? Number(form.currentCTC) : null,
        "profile.expectedCTC": form.expectedCTC ? Number(form.expectedCTC) : null,
        "profile.openToWorkVisibility": form.openToWorkVisibility,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.uid] });
      setEditing(false);
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to save profile."),
  });

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    try {
      setUploadingPhoto(true);
      setPhotoProgress(0);
      const downloadURL = await uploadProfilePhoto(file, user.uid, setPhotoProgress);
      await updateUserProfile(user.uid, { photoURL: downloadURL });
      queryClient.invalidateQueries({ queryKey: ["userProfile", user.uid] });
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      setPhotoProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const profile = rawProfile?.profile ?? {} as import("@/types").SeekerProfile;
  const openToWork: boolean = !!profile.openToWork;

  async function handleToggleOTW() {
    if (!user?.uid) return;
    setTogglingOTW(true);
    try {
      await updateUserProfile(user.uid, { "profile.openToWork": !openToWork });
      queryClient.invalidateQueries({ queryKey: ["userProfile", user.uid] });
      toast.success(openToWork ? "Open to Work status removed" : "You're now marked as Open to Work!");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setTogglingOTW(false);
    }
  }

  const displayName = rawProfile?.displayName ?? user?.displayName ?? "";
  const email = rawProfile?.email ?? user?.email ?? "";
  const phone = rawProfile?.phone ?? user?.phone ?? "";
  const photoURL = rawProfile?.photoURL ?? user?.photoURL ?? null;
  const locationText = [profile.location?.city, profile.location?.state].filter(Boolean).join(", ");
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  function toggleJobType(type: JobType) {
    setForm((prev) => ({
      ...prev,
      preferredJobTypes: prev.preferredJobTypes.includes(type)
        ? prev.preferredJobTypes.filter((t) => t !== type)
        : [...prev.preferredJobTypes, type],
    }));
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* ── Header card ── */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar with photo upload + Open to Work ring */}
            <div className="relative shrink-0">
              {/* Green ring when Open to Work is active */}
              {openToWork && (
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 z-0" />
              )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className={cn(
                "group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white transition-opacity z-10",
                getAvatarColor(displayName),
                uploadingPhoto && "opacity-70"
              )}
              aria-label="Change profile photo"
            >
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                initials || "?"
              )}

              {/* Upload overlay */}
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-colors">
                {uploadingPhoto ? (
                  <Loader2Icon className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <CameraIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </span>

              {/* Progress ring */}
              {uploadingPhoto && (
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="30" fill="none" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                  <circle
                    cx="32" cy="32" r="30" fill="none" stroke="white" strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - photoProgress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-200"
                  />
                </svg>
              )}
            </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            {/* Name + meta */}
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight">{displayName || "Your Name"}</h1>
              {profile.headline && (
                <p className="mt-0.5 text-sm font-medium text-primary">{profile.headline}</p>
              )}
              {/* Open to Work badge */}
              {openToWork && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800 px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">Open to Work</span>
                </div>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {email && <span className="flex items-center gap-1"><MailIcon className="h-3 w-3" />{email}</span>}
                {phone && <span className="flex items-center gap-1"><PhoneIcon className="h-3 w-3" />{phone}</span>}
                {locationText && <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{locationText}</span>}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {/* Open to Work toggle */}
            <button
              onClick={handleToggleOTW}
              disabled={togglingOTW}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all border",
                openToWork
                  ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                  : "hover:border-green-300 hover:text-green-700 text-muted-foreground"
              )}
              title={openToWork ? "Remove Open to Work status" : "Let employers know you're open to opportunities"}
            >
              {togglingOTW ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <span className={cn("h-2 w-2 rounded-full", openToWork ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40")} />
              )}
              {openToWork ? "Open to Work" : "Set Open to Work"}
            </button>

            <button
              onClick={() => setEditing(!editing)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                editing ? "bg-muted hover:bg-muted/70" : "border hover:bg-muted/50"
              )}
            >
              {editing ? <XIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

      </div>

      {/* Profile Completeness Meter */}
      <ProfileCompleteness user={user} />

      {/* ── Edit form ── */}
      {editing && (
        <div className="rounded-2xl border bg-card p-6 space-y-5">
          <h2 className="font-semibold">Edit Profile</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Your full name"
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Professional Headline</label>
              <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="e.g. Senior React Developer · 5 years exp"
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                Bio <span className="text-muted-foreground/50">({form.bio.length}/400)</span>
              </label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                maxLength={400} rows={3} placeholder="Write a short professional summary…"
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">State</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Preferred job types */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Preferred Job Types</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {JOB_TYPES.map(({ label, value }) => (
                <button key={value} type="button"
                  onClick={() => toggleJobType(value)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors",
                    form.preferredJobTypes.includes(value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:border-primary hover:text-primary"
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Expected salary */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Expected Salary (₹ per year)</label>
            <div className="mt-1 flex items-center gap-3">
              <input value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                type="number" placeholder="Min (e.g. 600000)"
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              <span className="text-muted-foreground text-sm shrink-0">to</span>
              <input value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                type="number" placeholder="Max (e.g. 1200000)"
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          {/* Indian market fields */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 p-4 space-y-3">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Career Details (India)</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Current CTC (LPA)</label>
                <input value={form.currentCTC} onChange={(e) => setForm({ ...form, currentCTC: e.target.value })}
                  type="number" step="0.5" placeholder="e.g. 8.5"
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Expected CTC (LPA)</label>
                <input value={form.expectedCTC} onChange={(e) => setForm({ ...form, expectedCTC: e.target.value })}
                  type="number" step="0.5" placeholder="e.g. 12"
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notice Period</label>
                <select value={form.noticePeriod} onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })}
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select</option>
                  {NOTICE_PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* OTW visibility */}
            {openToWork && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Open to Work — Who can see it?</label>
                <div className="flex gap-2">
                  {(["public", "recruiters"] as const).map((v) => (
                    <button key={v} type="button"
                      onClick={() => setForm({ ...form, openToWorkVisibility: v })}
                      className={cn(
                        "flex-1 rounded-xl border py-2 text-xs font-medium transition-colors",
                        form.openToWorkVisibility === v
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "border-border text-muted-foreground hover:border-green-300"
                      )}>
                      {v === "public" ? "🌍 Everyone" : "🔒 Recruiters Only"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditing(false)}
              className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
              Cancel
            </button>
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {saveMutation.isPending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
              {saveMutation.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Applications", value: applications.length, href: "/seeker/applications" },
          { label: "Saved Jobs", value: savedIds.length, href: "/seeker/saved-jobs" },
          { label: "Skills", value: (profile.skills as string[] | undefined)?.length ?? 0, href: "/seeker/resume" },
          { label: "Experience", value: (profile.experience as unknown[] | undefined)?.length ?? 0, href: "/seeker/resume" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="flex flex-col items-center justify-center rounded-2xl border bg-card py-4 hover:border-primary/40 transition-colors">
            <span className="text-2xl font-bold text-primary">{stat.value}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">{stat.label}</span>
          </Link>
        ))}
      </div>

      {/* ── About ── */}
      {profile.bio && (
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-2 text-sm font-semibold">About</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
        </div>
      )}

      {/* ── Career Info (CTC + Notice Period) ── */}
      {(profile.currentCTC || profile.expectedCTC || profile.noticePeriod) && (
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
            <BriefcaseIcon className="h-4 w-4 text-primary" /> Career Details
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profile.currentCTC && (
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Current CTC</p>
                <p className="mt-0.5 text-base font-bold">{profile.currentCTC} LPA</p>
              </div>
            )}
            {profile.expectedCTC && (
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Expected CTC</p>
                <p className="mt-0.5 text-base font-bold">{profile.expectedCTC} LPA</p>
              </div>
            )}
            {profile.noticePeriod && (
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Notice Period</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {NOTICE_PERIOD_OPTIONS.find((o) => o.value === profile.noticePeriod)?.label ?? profile.noticePeriod}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Skills ── */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-primary" /> Skills
          </h2>
          <Link href="/seeker/resume?tab=skills" className="text-xs text-primary hover:underline">
            {(profile.skills as string[] | undefined)?.length ? "Edit" : "Add"} skills →
          </Link>
        </div>
        {(profile.skills as string[] | undefined)?.length ? (
          <div className="flex flex-wrap gap-2">
            {(profile.skills as string[]).map((skill) => (
              <span key={skill} className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No skills added yet.{" "}
            <Link href="/seeker/resume" className="text-primary hover:underline">Add skills in Resume Builder →</Link>
          </p>
        )}
      </div>

      {/* ── Work Experience ── */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <BriefcaseIcon className="h-4 w-4 text-primary" /> Work Experience
          </h2>
          <Link href="/seeker/resume?tab=experience" className="text-xs text-primary hover:underline">
            {(profile.experience as unknown[] | undefined)?.length ? "Edit" : "Add"} →
          </Link>
        </div>
        {(profile.experience as WorkExperience[] | undefined)?.length ? (
          <div className="space-y-4">
            {(profile.experience as WorkExperience[]).map((exp) => (
              <div key={exp.id} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <BriefcaseIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground/70">
                    {exp.startDate} — {exp.endDate ?? "Present"}
                  </p>
                  {exp.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No experience added.{" "}
            <Link href="/seeker/resume" className="text-primary hover:underline">Add in Resume Builder →</Link>
          </p>
        )}
      </div>

      {/* ── Education ── */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <GraduationCapIcon className="h-4 w-4 text-primary" /> Education
          </h2>
          <Link href="/seeker/resume?tab=education" className="text-xs text-primary hover:underline">
            {(profile.education as unknown[] | undefined)?.length ? "Edit" : "Add"} →
          </Link>
        </div>
        {(profile.education as Education[] | undefined)?.length ? (
          <div className="space-y-4">
            {(profile.education as Education[]).map((edu) => (
              <div key={edu.id} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <GraduationCapIcon className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{edu.degree}</p>
                  <p className="text-xs text-muted-foreground">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground/70">{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No education added.{" "}
            <Link href="/seeker/resume" className="text-primary hover:underline">Add in Resume Builder →</Link>
          </p>
        )}
      </div>

      {/* ── Job Preferences ── */}
      {((profile.preferredJobTypes as string[] | undefined)?.length ||
        profile.expectedSalary?.min ||
        profile.expectedSalary?.max) && (
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Job Preferences</h2>
          {(profile.preferredJobTypes as string[] | undefined)?.length ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {(profile.preferredJobTypes as string[]).map((t) => (
                <span key={t} className="rounded-lg border px-2.5 py-1 text-xs font-medium capitalize">{t}</span>
              ))}
            </div>
          ) : null}
          {(profile.expectedSalary?.min || profile.expectedSalary?.max) && (
            <p className="text-sm text-muted-foreground">
              Expected salary:{" "}
              <span className="font-medium text-foreground">
                ₹{(profile.expectedSalary.min / 100000).toFixed(1)}L – ₹{(profile.expectedSalary.max / 100000).toFixed(1)}L/yr
              </span>
            </p>
          )}
        </div>
      )}

      {/* ── Who Viewed My Profile ── */}
      {profileViews.length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <EyeIcon className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Who Viewed Your Profile</h2>
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {profileViews.length}
            </span>
          </div>
          <div className="space-y-3">
            {profileViews.slice(0, 5).map((view) => (
              <div key={view.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                  {view.viewerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{view.viewerName}</p>
                  {view.viewerCompany && (
                    <p className="text-xs text-muted-foreground truncate">{view.viewerCompany}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(view.viewedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick links ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: FileTextIcon, label: "Resume Builder", sub: "Build & download your resume", href: "/seeker/resume" },
          { icon: SettingsIcon, label: "Settings", sub: "Account, notifications, privacy", href: "/seeker/settings" },
        ].map(({ icon: Icon, label, sub, href }) => (
          <Link key={label} href={href}
            className="flex items-center gap-4 rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
