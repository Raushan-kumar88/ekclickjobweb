"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  MapPinIcon,
  StarIcon,
  UserIcon,
  BuildingIcon,
  RocketIcon,
  ShieldCheckIcon,
  InfoIcon,
} from "lucide-react";
import { CITIES, STATES, POPULAR_SKILLS } from "@/lib/utils/constants";
import { GSTIN_REGEX } from "@/lib/utils/validators";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { UserRole } from "@/types";

const SEEKER_STEP_COUNT = 3;
const EMPLOYER_STEP_COUNT = 4;

/** Stable empty value so Select stays controlled (Base UI rejects undefined → controlled switch) */
const SELECT_EMPTY = "__ecj_empty__";

/** Cookie set at register/login — used if auth store has not loaded role yet */
function readUserRoleCookie(): UserRole | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )user-role=([^;]+)/);
  if (!m) return null;
  const v = decodeURIComponent(m[1].trim());
  if (v === "employer" || v === "seeker" || v === "admin") return v;
  return null;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all",
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {i < current ? <CheckIcon className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={cn(
                "h-0.5 w-12 transition-all",
                i < current ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Seeker steps ─────────────────────────────────────────────────────────────

type SeekerBasicData = { headline: string; bio: string; city: string; state: string };

function SeekerStep1({
  data,
  onChange,
}: {
  data: SeekerBasicData;
  onChange: (d: Partial<SeekerBasicData>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <UserIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Tell us about yourself</h2>
          <p className="text-sm text-muted-foreground">Help employers find the right fit</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Professional headline</Label>
        <Input
          id="headline"
          placeholder="e.g. Senior React Developer at TechCorp"
          value={data.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Short bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea
          id="bio"
          placeholder="Tell employers a bit about your background, strengths, and what you're looking for..."
          rows={4}
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Select
            value={data.city ? data.city : SELECT_EMPTY}
            onValueChange={(v) => onChange({ city: (v ?? "") === SELECT_EMPTY ? "" : (v ?? "") })}
          >
            <SelectTrigger className="w-full">
              {data.city ? (
                <SelectValue placeholder="Select city" />
              ) : (
                <span className="text-muted-foreground">Select city</span>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_EMPTY} className="text-muted-foreground">
                Select city
              </SelectItem>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select
            value={data.state ? data.state : SELECT_EMPTY}
            onValueChange={(v) => onChange({ state: (v ?? "") === SELECT_EMPTY ? "" : (v ?? "") })}
          >
            <SelectTrigger className="w-full">
              {data.state ? (
                <SelectValue placeholder="Select state" />
              ) : (
                <span className="text-muted-foreground">Select state</span>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_EMPTY} className="text-muted-foreground">
                Select state
              </SelectItem>
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function SeekerStep2({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const toggleSkill = (skill: string) => {
    onChange(
      skills.includes(skill) ? skills.filter((s) => s !== skill) : [...skills, skill]
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <StarIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Your skills</h2>
          <p className="text-sm text-muted-foreground">Select all that apply — you can add more later</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
        {POPULAR_SKILLS.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => toggleSkill(skill)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-all",
              skills.includes(skill)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:border-primary/50 text-foreground"
            )}
          >
            {skill}
          </button>
        ))}
      </div>
      {skills.length > 0 && (
        <p className="text-sm text-muted-foreground">{skills.length} skill{skills.length !== 1 ? "s" : ""} selected</p>
      )}
    </div>
  );
}

function SeekerStep3({
  data,
  onChange,
}: {
  data: { jobTypes: string[]; salaryMin: string; salaryMax: string };
  onChange: (d: Partial<typeof data>) => void;
}) {
  const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance"];

  const toggleJobType = (type: string) => {
    const current = data.jobTypes;
    onChange({
      jobTypes: current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
          <BriefcaseIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Job preferences</h2>
          <p className="text-sm text-muted-foreground">We&apos;ll use this to show you better matches</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferred job types</Label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleJobType(type)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-all",
                data.jobTypes.includes(type)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Expected salary range (₹ per year)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Minimum (e.g. 500000)"
              value={data.salaryMin}
              onChange={(e) => onChange({ salaryMin: e.target.value })}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Maximum (e.g. 1000000)"
              value={data.salaryMax}
              onChange={(e) => onChange({ salaryMax: e.target.value })}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">This helps us show you relevant salary ranges</p>
      </div>
    </div>
  );
}

// ─── Employer steps ───────────────────────────────────────────────────────────

type EmployerBasicData = { companyName: string; industry: string; city: string; state: string };

function EmployerStep1({
  data,
  onChange,
}: {
  data: EmployerBasicData;
  onChange: (d: Partial<EmployerBasicData>) => void;
}) {
  const INDUSTRIES = [
    "Information Technology", "Healthcare & Pharma", "Banking & Finance",
    "Education", "Manufacturing", "Retail & E-commerce", "Consulting",
    "Media & Entertainment", "Automotive", "Telecom", "Real Estate", "Other",
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <BuildingIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Your company</h2>
          <p className="text-sm text-muted-foreground">Set up your employer profile</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">Company name <span className="text-destructive">*</span></Label>
        <Input
          id="companyName"
          placeholder="e.g. Infosys Limited"
          value={data.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Industry</Label>
        <Select
          value={data.industry ? data.industry : SELECT_EMPTY}
          onValueChange={(v) => onChange({ industry: (v ?? "") === SELECT_EMPTY ? "" : (v ?? "") })}
        >
          <SelectTrigger className="w-full">
            {data.industry ? (
              <SelectValue placeholder="Select industry" />
            ) : (
              <span className="text-muted-foreground">Select industry</span>
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SELECT_EMPTY} className="text-muted-foreground">
              Select industry
            </SelectItem>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Select
            value={data.city ? data.city : SELECT_EMPTY}
            onValueChange={(v) => onChange({ city: (v ?? "") === SELECT_EMPTY ? "" : (v ?? "") })}
          >
            <SelectTrigger className="w-full">
              {data.city ? <SelectValue placeholder="Select city" /> : <span className="text-muted-foreground">Select city</span>}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_EMPTY} className="text-muted-foreground">Select city</SelectItem>
              {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select
            value={data.state ? data.state : SELECT_EMPTY}
            onValueChange={(v) => onChange({ state: (v ?? "") === SELECT_EMPTY ? "" : (v ?? "") })}
          >
            <SelectTrigger className="w-full">
              {data.state ? <SelectValue placeholder="Select state" /> : <span className="text-muted-foreground">Select state</span>}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_EMPTY} className="text-muted-foreground">Select state</SelectItem>
              {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function EmployerStep2({
  data,
  onChange,
}: {
  data: { description: string; website: string; size: string };
  onChange: (d: Partial<typeof data>) => void;
}) {
  const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <StarIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">About your company</h2>
          <p className="text-sm text-muted-foreground">Help candidates understand who you are</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Company description</Label>
        <Textarea
          id="description"
          placeholder="What does your company do? What's your culture like? Why should people join you?"
          rows={5}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label>Company size</Label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange({ size })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                data.size === size
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50"
              )}
            >
              {size} employees
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmployerStep3({
  data,
  onChange,
  emailDomain,
}: {
  data: { gstin: string; companyWebsite: string };
  onChange: (d: Partial<typeof data>) => void;
  emailDomain: string;
}) {
  const websiteDomain = (() => {
    try {
      const url = data.companyWebsite.startsWith("http")
        ? data.companyWebsite
        : `https://${data.companyWebsite}`;
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const domainMismatch =
    websiteDomain && emailDomain && !emailDomain.endsWith(websiteDomain) && !websiteDomain.endsWith(emailDomain);

  const gstinValid = data.gstin.length === 0 || GSTIN_REGEX.test(data.gstin.toUpperCase());

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Compliance & verification</h2>
          <p className="text-sm text-muted-foreground">Helps candidates trust your company</p>
        </div>
      </div>

      {/* Company website — optional */}
      <div className="space-y-2">
        <Label htmlFor="companyWebsite">
          Company website <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="companyWebsite"
          type="url"
          placeholder="https://yourcompany.com"
          value={data.companyWebsite}
          onChange={(e) => onChange({ companyWebsite: e.target.value })}
        />
        {domainMismatch && (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <InfoIcon className="h-3.5 w-3.5 shrink-0" />
            Your website domain ({websiteDomain}) doesn&apos;t match your email domain ({emailDomain}). Please double-check.
          </p>
        )}
        {data.companyWebsite && !domainMismatch && websiteDomain && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <CheckIcon className="h-3.5 w-3.5 shrink-0" />
            Domain matches your email address
          </p>
        )}
      </div>

      {/* GSTIN — optional but strongly encouraged */}
      <div className="space-y-2">
        <Label htmlFor="gstin">
          GSTIN <span className="text-muted-foreground font-normal">(optional — strongly recommended)</span>
        </Label>
        <Input
          id="gstin"
          type="text"
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
          value={data.gstin}
          onChange={(e) => onChange({ gstin: e.target.value.toUpperCase() })}
        />
        {data.gstin.length > 0 && !gstinValid && (
          <p className="text-xs text-destructive">
            Invalid GSTIN format. Should be 15 characters, e.g. 22AAAAA0000A1Z5
          </p>
        )}
        {data.gstin.length === 15 && gstinValid && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <CheckIcon className="h-3.5 w-3.5 shrink-0" />
            Valid GSTIN format
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Companies with a verified GSTIN get a trust badge visible to candidates.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-4 flex items-start gap-3">
        <InfoIcon className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Your GSTIN will be verified by our admin team. You can still post jobs while verification is pending.
        </p>
      </div>
    </div>
  );
}

function EmployerStep4() {
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
          <RocketIcon className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
      <p className="text-muted-foreground leading-relaxed">
        Your employer profile is ready. Start posting jobs and find your next great hire.
      </p>
      <div className="rounded-xl border bg-accent/30 p-4 text-left space-y-2">
        <p className="text-sm font-semibold">What&apos;s next?</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary shrink-0" /> Verify your mobile number to post jobs</li>
          <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary shrink-0" /> Post your first job opening</li>
          <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary shrink-0" /> Set up your company profile with a logo</li>
          <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary shrink-0" /> Browse candidate profiles</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user, uid } = useAuthStore();
  const storeRole = useAuthStore((s) => s.role);
  // Read cookie synchronously via lazy initializer so the correct role is
  // available on the very first render (avoids a seeker→employer UI flash).
  const [cookieRole] = useState<UserRole | null>(readUserRoleCookie);
  const role = (user?.role ?? storeRole ?? cookieRole ?? "seeker") as UserRole;

  useEffect(() => {
    document.title = "Complete Your Profile | EkClickJob";
  }, []);

  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Seeker state
  const [seekerBasic, setSeekerBasic] = useState({
    headline: user?.profile?.headline ?? "",
    bio: user?.profile?.bio ?? "",
    city: user?.profile?.location?.city ?? "",
    state: user?.profile?.location?.state ?? "",
  });
  const [skills, setSkills] = useState<string[]>(user?.profile?.skills ?? []);
  const [seekerPrefs, setSeekerPrefs] = useState({
    jobTypes: user?.profile?.preferredJobTypes ?? [],
    salaryMin: String(user?.profile?.expectedSalary?.min ?? ""),
    salaryMax: String(user?.profile?.expectedSalary?.max ?? ""),
  });

  // Employer state
  const [employerBasic, setEmployerBasic] = useState({
    companyName: "",
    industry: "",
    city: "",
    state: "",
  });
  const [employerAbout, setEmployerAbout] = useState({
    description: "",
    website: "",
    size: "",
  });
  const [employerCompliance, setEmployerCompliance] = useState({
    gstin: "",
    companyWebsite: "",
  });

  const STEP_COUNT = role === "employer" ? EMPLOYER_STEP_COUNT : SEEKER_STEP_COUNT;

  // Extract email domain for cross-check
  const emailDomain = (() => {
    const email = user?.email ?? "";
    return email.split("@")[1]?.toLowerCase() ?? "";
  })();

  function markOnboardingCookieDone() {
    const maxAge = 60 * 60 * 24 * 7;
    document.cookie = `onboarding-done=true; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  async function handleComplete() {
    if (!uid) return;
    setIsSaving(true);
    try {
      if (role === "seeker") {
        await updateDoc(doc(db, "users", uid), {
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
          "profile.headline": seekerBasic.headline,
          "profile.bio": seekerBasic.bio,
          "profile.location": { city: seekerBasic.city, state: seekerBasic.state },
          "profile.skills": skills,
          "profile.preferredJobTypes": seekerPrefs.jobTypes,
          "profile.expectedSalary": {
            min: Number(seekerPrefs.salaryMin) || 0,
            max: Number(seekerPrefs.salaryMax) || 0,
          },
        });
        markOnboardingCookieDone();
        toast.success("Profile set up! Let's find you a job.");
        router.push("/seeker/dashboard");
      } else {
        const { collection, addDoc } = await import("firebase/firestore");
        const finalWebsite = employerCompliance.companyWebsite || employerAbout.website;
        await addDoc(collection(db, "companies"), {
          name: employerBasic.companyName,
          industry: employerBasic.industry,
          location: { city: employerBasic.city, state: employerBasic.state, country: "India" },
          description: employerAbout.description,
          website: finalWebsite,
          size: employerAbout.size,
          gstin: employerCompliance.gstin || null,
          gstinVerified: false,
          ownerId: uid,
          logo: null,
          isVerified: false,
          rating: 0,
          reviewCount: 0,
          jobCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "users", uid), {
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        });

        markOnboardingCookieDone();
        toast.success("Company profile created! Start posting jobs.");
        router.push("/employer/dashboard");
      }
    } catch (err) {
      console.error("Onboarding save error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSkip() {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid), {
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    });
    markOnboardingCookieDone();
    router.push(role === "employer" ? "/employer/dashboard" : "/seeker/dashboard");
  }

  const isLastStep = step === STEP_COUNT - 1;

  function canProceed() {
    if (role === "seeker") {
      if (step === 0) return seekerBasic.headline.trim().length > 0;
      return true;
    } else {
      if (step === 0) return employerBasic.companyName.trim().length > 0;
      return true;
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">
          {role === "seeker" ? "Job seeker setup" : "Employer setup"}
        </p>
      </div>

      <StepIndicator current={step} total={STEP_COUNT} />

      <div className="rounded-2xl border bg-background shadow-lg p-8">
        {role === "seeker" ? (
          <>
            {step === 0 && (
              <SeekerStep1 data={seekerBasic} onChange={(d) => setSeekerBasic((p) => ({ ...p, ...d }))} />
            )}
            {step === 1 && <SeekerStep2 skills={skills} onChange={setSkills} />}
            {step === 2 && (
              <SeekerStep3
                data={seekerPrefs}
                onChange={(d) => setSeekerPrefs((p) => ({ ...p, ...d }))}
              />
            )}
          </>
        ) : (
          <>
            {step === 0 && (
              <EmployerStep1
                data={employerBasic}
                onChange={(d) => setEmployerBasic((p) => ({ ...p, ...d }))}
              />
            )}
            {step === 1 && (
              <EmployerStep2
                data={employerAbout}
                onChange={(d) => setEmployerAbout((p) => ({ ...p, ...d }))}
              />
            )}
            {step === 2 && (
              <EmployerStep3
                data={employerCompliance}
                onChange={(d) => setEmployerCompliance((p) => ({ ...p, ...d }))}
                emailDomain={emailDomain}
              />
            )}
            {step === 3 && <EmployerStep4 />}
          </>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSkip}>
              Skip setup
            </Button>
          </div>

          {isLastStep ? (
            <Button onClick={handleComplete} disabled={isSaving} className="gap-2">
              {isSaving ? "Saving..." : "Get Started"}
              {!isSaving && <RocketIcon className="h-4 w-4" />}
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="gap-2">
              Continue
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Step {step + 1} of {STEP_COUNT} — you can always update this in your profile
      </p>
    </div>
  );
}
