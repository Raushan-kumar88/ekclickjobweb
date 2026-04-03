"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BuildingIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  BadgeCheckIcon,
  UploadIcon,
  FileTextIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  TrashIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  LoaderIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { uploadVerificationDocument } from "@/lib/firebase/storage";
import { Button } from "@/components/ui/button";
import { JobForm } from "@/components/employer/JobForm";
import { useCreateJob, useEmployerJobs } from "@/hooks/useEmployerJobs";
import { useMyCompany } from "@/hooks/useCompany";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuthStore } from "@/stores/authStore";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { JobCreateInput } from "@/types";

// ─── Verification types ───────────────────────────────────────────────────────

type VerifStatus = "none" | "pending" | "approved" | "rejected";

interface UploadedDoc {
  type: string;
  name: string;
  url: string;
  storagePath: string;
}

interface VerifRequest {
  id: string;
  status: VerifStatus;
  rejectionReason?: string;
  documents: UploadedDoc[];
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepRow({
  n,
  label,
  done,
  active,
}: {
  n: number;
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2 transition-all",
          done
            ? "border-green-500 bg-green-500 text-white"
            : active
            ? "border-primary bg-primary/10 text-primary"
            : "border-muted text-muted-foreground bg-background"
        )}
      >
        {done ? <CheckCircle2Icon className="h-4 w-4" /> : n}
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          done ? "text-green-600 dark:text-green-400" : active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Inline document upload for the gate ─────────────────────────────────────

function VerificationGate({
  uid,
  company,
  request,
  onVerified,
}: {
  uid: string;
  company: { id: string; name: string };
  request: VerifRequest | null;
  onVerified: (req: VerifRequest) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [gstin, setGstin] = useState(
    request?.documents?.find((d) => d.type === "business_gstin")?.name ?? ""
  );
  const [uploadState, setUploadState] = useState<{
    uploaded: UploadedDoc | null;
    progress: number;
    uploading: boolean;
    error: string;
  }>({
    uploaded:
      request?.documents?.find((d) => d.type === "business_registration") ?? null,
    progress: 0,
    uploading: false,
    error: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isRejected = request?.status === "rejected";

  async function handleFileChange(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setUploadState((s) => ({ ...s, error: "File must be less than 5 MB." }));
      return;
    }
    setUploadState({ uploaded: null, progress: 0, uploading: true, error: "" });
    try {
      const result = await uploadVerificationDocument(file, uid, "business_registration", (pct) => {
        setUploadState((s) => ({ ...s, progress: pct }));
      });
      setUploadState({
        uploaded: {
          type: "business_registration",
          name: file.name,
          url: result.downloadURL,
          storagePath: result.storagePath,
        },
        progress: 100,
        uploading: false,
        error: "",
      });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      console.error("[VerificationGate] Upload error:", e.code, e.message);
      const msg =
        e.code === "storage/unauthorized"
          ? "Permission denied. Please check Firebase Storage rules."
          : e.code === "storage/canceled"
          ? "Upload cancelled."
          : e.code === "storage/unknown"
          ? "Network error. Check your connection and try again."
          : `Upload failed (${e.code ?? "unknown"}). Try again.`;
      setUploadState({ uploaded: null, progress: 0, uploading: false, error: msg });
    }
  }

  async function handleSubmit() {
    if (!uploadState.uploaded) {
      toast.error("Please upload your Business Registration Certificate.");
      return;
    }
    setSubmitting(true);
    try {
      const docs: UploadedDoc[] = [uploadState.uploaded];
      const payload = {
        companyId: company.id,
        companyName: company.name,
        ownerId: uid,
        status: "pending",
        submittedAt: serverTimestamp(),
        documents: docs,
        businessDetails: { gstin: gstin.trim() || null },
        rejectionReason: null,
      };

      let docId = request?.id;
      if (request && isRejected) {
        await updateDoc(doc(db, "employerValidations", request.id), payload);
      } else {
        const ref = await addDoc(collection(db, "employerValidations"), payload);
        docId = ref.id;
      }

      toast.success("Documents submitted! You can now post jobs.");
      onVerified({ id: docId!, status: "pending", documents: docs });
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border bg-background p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <BadgeCheckIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold">
            {isRejected ? "Resubmit Company Documents" : "Verify Your Company to Post Jobs"}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isRejected
              ? `Rejected reason: ${request?.rejectionReason ?? "See Verification page for details."}`
              : "Upload a business document to unlock job posting. Takes 2–3 business days to approve, but you can post immediately after submission."}
          </p>
        </div>
      </div>

      {/* What you need */}
      {!isRejected && (
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: BadgeCheckIcon, text: "Verified badge on all your jobs" },
            { icon: ShieldCheckIcon, text: "Builds trust with candidates" },
            { icon: CheckCircle2Icon, text: "Post jobs immediately after submission" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              {text}
            </div>
          ))}
        </div>
      )}

      {/* Business Registration Upload */}
      <div>
        <p className="mb-1 text-sm font-medium">
          Business Registration Certificate <span className="text-red-500">*</span>
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          Certificate of Incorporation / ROC / MSME registration — PDF, JPG, PNG (max 5 MB)
        </p>

        {uploadState.uploaded ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileTextIcon className="h-4 w-4 shrink-0 text-green-600" />
              <a
                href={uploadState.uploaded.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-green-700 dark:text-green-400 hover:underline"
              >
                {uploadState.uploaded.name}
              </a>
              <ExternalLinkIcon className="h-3 w-3 shrink-0 text-green-500" />
            </div>
            <button
              type="button"
              onClick={() => setUploadState({ uploaded: null, progress: 0, uploading: false, error: "" })}
              className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 shrink-0"
            >
              <TrashIcon className="h-3 w-3" />
              Remove
            </button>
          </div>
        ) : uploadState.uploading ? (
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <LoaderIcon className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Uploading… {uploadState.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
          >
            <UploadIcon className="h-5 w-5" />
            Click to upload document
          </button>
        )}

        {uploadState.error && <p className="mt-1 text-xs text-red-500">{uploadState.error}</p>}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileChange(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* GSTIN (optional) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          GSTIN <span className="text-xs text-muted-foreground">(optional — strongly recommended)</span>
        </label>
        <input
          type="text"
          value={gstin}
          onChange={(e) => setGstin(e.target.value.toUpperCase())}
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
          className="w-full max-w-xs rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-muted-foreground">
          You can add more documents later from{" "}
          <Link href="/employer/verification" className="text-primary hover:underline">
            Verification Center
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || uploadState.uploading || !uploadState.uploaded}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? (
            <><RefreshCwIcon className="h-4 w-4 animate-spin" /> Submitting…</>
          ) : (
            <><BadgeCheckIcon className="h-4 w-4" /> Submit & Unlock Job Posting</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PostJobPage() {
  const router = useRouter();
  const { uid, isLoading: authLoading, isAuthenticated } = useAuthStore();
  const { data: company, isLoading: companyLoading } = useMyCompany();
  const { data: allJobs = [] } = useEmployerJobs();
  const createJob = useCreateJob();
  const { canPostJob, jobPostingLimit, plan } = useSubscription();

  const [verifRequest, setVerifRequest] = useState<VerifRequest | null>(null);
  const [verifLoading, setVerifLoading] = useState(true);

  const isPageLoading = authLoading || !isAuthenticated || companyLoading;

  const activeJobCount = allJobs.filter(
    (j) => j.status === "active" || j.status === "paused"
  ).length;
  const isAtLimit = !canPostJob(activeJobCount);

  // Fetch company verification status
  useEffect(() => {
    if (!uid || !company) {
      setVerifLoading(false);
      return;
    }
    const fetchVerif = async () => {
      try {
        const q = query(
          collection(db, "employerValidations"),
          where("ownerId", "==", uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = d.data() as Omit<VerifRequest, "id">;
          setVerifRequest({ id: d.id, ...data });
        }
      } catch (err) {
        console.error("Failed to fetch verification:", err);
      } finally {
        setVerifLoading(false);
      }
    };
    fetchVerif();
  }, [uid, company?.id]);

  // Can post: approved or pending (submitted at least once)
  const canPost =
    verifRequest?.status === "approved" || verifRequest?.status === "pending";

  async function handleSubmit(data: JobCreateInput) {
    if (!company) {
      toast.error("Please set up your company profile first.");
      return;
    }
    try {
      const payload: JobCreateInput = {
        ...data,
        companyId: company.id,
        companyName: company.name,
        companyLogo: company.logo ?? "",
      };
      await createJob.mutateAsync(payload);
      toast.success("Job posted successfully! Your listing is now live.");
      router.push("/employer/jobs");
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to post job. Please try again.");
    }
  }

  // ─── Step indicator data ─────────────────────────────────────────────────────
  const step1Done = !!company;
  const step2Done = canPost;
  const step3Active = step1Done && step2Done && !isAtLimit;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link href="/employer/jobs">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Post a Job</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Fill in the details to create your listing</p>
        </div>
      </div>

      {/* Step tracker */}
      {!isPageLoading && (
        <div className="flex items-center gap-4 rounded-xl border bg-muted/20 px-5 py-4">
          <StepRow n={1} label="Company Profile" done={step1Done} active={!step1Done} />
          <div className={cn("h-px flex-1 bg-border", step1Done && "bg-primary/40")} />
          <StepRow n={2} label="Company Verification" done={step2Done} active={step1Done && !step2Done} />
          <div className={cn("h-px flex-1 bg-border", step2Done && "bg-primary/40")} />
          <StepRow n={3} label="Post Your Job" done={false} active={step3Active} />
        </div>
      )}

      {/* Loading */}
      {isPageLoading || verifLoading ? (
        <div className="space-y-4 rounded-xl border p-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !company ? (
        /* Step 1: No company */
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800/50 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <BuildingIcon className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 dark:text-amber-300">Company profile required</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                Set up your company profile before posting jobs. It takes less than 2 minutes.
              </p>
              <Link href="/employer/company" className="mt-3 inline-block">
                <Button size="sm">
                  <BuildingIcon className="mr-1.5 h-4 w-4" />
                  Set Up Company
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : !canPost ? (
        /* Step 2: Verification required */
        <VerificationGate
          uid={uid!}
          company={company}
          request={verifRequest}
          onVerified={(req) => setVerifRequest(req)}
        />
      ) : isAtLimit ? (
        /* Plan limit */
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800/50 dark:bg-blue-900/10">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold text-blue-800 dark:text-blue-300">
                {plan === "free" ? "Free plan limit reached" : "Plan limit reached"}
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                You have {activeJobCount}/{jobPostingLimit} active jobs.
                {plan === "free" && " Upgrade to Pro to post up to 10 jobs."}
              </p>
              {plan === "free" && (
                <div className="mt-3">
                  <CheckoutButton plan="pro" label="Upgrade to Pro" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Step 3: Job form */
        <div className="space-y-4">
          {/* Soft verification notice */}
          {verifRequest?.status === "pending" && (
            <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 dark:border-yellow-900/40 dark:bg-yellow-950/20">
              <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Company verification under review
                </p>
                <p className="mt-0.5 text-xs text-yellow-700 dark:text-yellow-500">
                  Your documents are being reviewed (2–3 business days). You can post jobs now — verified badge will appear once approved.
                </p>
              </div>
              <Link
                href="/employer/verification"
                className="text-xs text-yellow-700 hover:underline dark:text-yellow-500 shrink-0"
              >
                View status →
              </Link>
            </div>
          )}
          {verifRequest?.status === "approved" && (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-3 dark:border-green-900/40 dark:bg-green-950/20">
              <BadgeCheckIcon className="h-5 w-5 shrink-0 text-green-600" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Company verified — verified badge will appear on all your job listings.
              </p>
            </div>
          )}

          <div className="rounded-xl border bg-background p-6">
            <JobForm
              onSubmit={handleSubmit}
              isLoading={createJob.isPending}
              submitLabel="Post Job"
            />
          </div>
        </div>
      )}
    </div>
  );
}
