"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldCheckIcon,
  UploadIcon,
  FileTextIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  BuildingIcon,
  PhoneIcon,
  LoaderIcon,
  LockOpenIcon,
  BadgeCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import Link from "next/link";
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
import { useMyCompany } from "@/hooks/useCompany";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedDoc {
  type: string;
  name: string;
  url: string;
  storagePath: string;
}

interface ValidationRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: { toDate: () => Date } | null;
  rejectionReason?: string;
  documents: UploadedDoc[];
  businessDetails: {
    gstin?: string;
    pan?: string;
    registrationNumber?: string;
    additionalNotes?: string;
  };
}

interface FileUploadState {
  file: File | null;
  progress: number;
  uploading: boolean;
  uploaded: UploadedDoc | null;
  error: string;
}

const DOCUMENT_TYPES = [
  {
    key: "business_registration",
    label: "Business Registration Certificate",
    description: "Certificate of Incorporation / ROC / MSME Registration",
    required: true,
  },
  {
    key: "gst_certificate",
    label: "GST Certificate",
    description: "GSTIN registration certificate",
    required: false,
  },
  {
    key: "pan_card",
    label: "PAN Card",
    description: "Company / Individual PAN card",
    required: false,
  },
  {
    key: "other",
    label: "Other Supporting Document",
    description: "Any other document that proves legitimacy",
    required: false,
  },
];

const ACCEPTED_TYPES = "image/jpeg,image/png,application/pdf";

// ─── Step Card wrapper ─────────────────────────────────────────────────────────

function StepCard({
  step,
  title,
  status,
  statusLabel,
  children,
  collapsible = false,
}: {
  step: number;
  title: string;
  status: "done" | "pending" | "rejected" | "none";
  statusLabel: string;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(status !== "done");

  const statusConfig = {
    done: { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle2Icon },
    pending: { color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: ClockIcon },
    rejected: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", icon: XCircleIcon },
    none: { color: "text-muted-foreground", bg: "bg-muted/50", icon: LockOpenIcon },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div
        className={cn(
          "flex items-center justify-between gap-4 p-5",
          collapsible && "cursor-pointer hover:bg-muted/30 transition-colors"
        )}
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              statusConfig.bg,
              statusConfig.color
            )}
          >
            {status === "done" ? <StatusIcon className="h-5 w-5" /> : step}
          </div>
          <div>
            <p className="font-semibold">{title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusIcon className={cn("h-3.5 w-3.5", statusConfig.color)} />
              <span className={cn("text-xs font-medium", statusConfig.color)}>{statusLabel}</span>
            </div>
          </div>
        </div>
        {collapsible && (
          <div className="text-muted-foreground">
            {open ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          </div>
        )}
      </div>

      {(!collapsible || open) && (
        <div className="border-t px-5 pb-5 pt-4">{children}</div>
      )}
    </div>
  );
}

// ─── Phone Verification Section ───────────────────────────────────────────────

function PhoneVerificationSection() {
  const uid = useAuthStore((s) => s.uid);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const isVerified = !!user?.phoneVerified;

  async function handleSave() {
    const cleaned = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!uid) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", uid), {
        phoneVerified: true,
        phone: cleaned,
        phoneVerifiedAt: serverTimestamp(),
      });
      if (user) setUser({ ...user, phone: cleaned, phoneVerified: true });
      toast.success("Phone number verified successfully!");
      setPhone("");
    } catch {
      toast.error("Failed to save phone number. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isVerified) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <PhoneIcon className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">Phone verified</p>
          <p className="text-xs text-muted-foreground">
            {user?.phone ? `+91 ${user.phone}` : "Your mobile number is verified"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        A verified phone number is required to post jobs and builds trust with candidates.
      </p>
      <div className="flex gap-2 max-w-sm">
        <div className="flex h-10 items-center rounded-lg border bg-muted/50 px-3 text-sm font-medium shrink-0">
          🇮🇳 +91
        </div>
        <input
          type="tel"
          placeholder="98765 43210"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSave}
          disabled={loading || phone.length !== 10}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <CheckCircle2Icon className="h-4 w-4" />}
          {loading ? "Saving…" : "Verify"}
        </button>
      </div>
    </div>
  );
}

// ─── Document Upload Row ───────────────────────────────────────────────────────

function DocumentUploadRow({
  docType,
  state,
  onUpload,
  onRemove,
  disabled,
}: {
  docType: (typeof DOCUMENT_TYPES)[0];
  state: FileUploadState;
  onUpload: (file: File) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {docType.label}
            {docType.required && <span className="ml-1 text-red-500">*</span>}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{docType.description}</p>

          {state.uploaded && (
            <div className="mt-2 flex items-center gap-2">
              <FileTextIcon className="h-4 w-4 shrink-0 text-green-600" />
              <a
                href={state.uploaded.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs text-primary hover:underline"
              >
                {state.uploaded.name}
              </a>
              <ExternalLinkIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
            </div>
          )}

          {state.uploading && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Uploading… {state.progress}%</p>
            </div>
          )}

          {state.error && <p className="mt-1 text-xs text-red-500">{state.error}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {state.uploaded ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <TrashIcon className="h-3 w-3" />
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || state.uploading}
              className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
            >
              <UploadIcon className="h-3 w-3" />
              {state.uploading ? "Uploading…" : "Upload"}
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Company Verification Form ────────────────────────────────────────────────

function CompanyVerificationForm({
  uid,
  company,
  request,
  canResubmit,
  onSubmitted,
}: {
  uid: string;
  company: { id: string; name: string };
  request: ValidationRequest | null;
  canResubmit: boolean;
  onSubmitted: (req: ValidationRequest) => void;
}) {
  const [gstin, setGstin] = useState(request?.businessDetails?.gstin ?? "");
  const [pan, setPan] = useState(request?.businessDetails?.pan ?? "");
  const [regNumber, setRegNumber] = useState(request?.businessDetails?.registrationNumber ?? "");
  const [notes, setNotes] = useState(request?.businessDetails?.additionalNotes ?? "");
  const [submitting, setSubmitting] = useState(false);

  const [docStates, setDocStates] = useState<Record<string, FileUploadState>>(() => {
    const initial: Record<string, FileUploadState> = Object.fromEntries(
      DOCUMENT_TYPES.map((d) => [
        d.key,
        { file: null, progress: 0, uploading: false, uploaded: null, error: "" } as FileUploadState,
      ])
    );
    if (canResubmit && request?.documents) {
      for (const uploaded of request.documents) {
        if (initial[uploaded.type]) {
          initial[uploaded.type].uploaded = uploaded;
        }
      }
    }
    return initial;
  });

  const handleUpload = async (docKey: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setDocStates((prev) => ({ ...prev, [docKey]: { ...prev[docKey], error: "File size must be less than 5 MB." } }));
      return;
    }
    setDocStates((prev) => ({ ...prev, [docKey]: { ...prev[docKey], uploading: true, error: "", progress: 0 } }));
    try {
      const result = await uploadVerificationDocument(file, uid, docKey, (pct) => {
        setDocStates((prev) => ({ ...prev, [docKey]: { ...prev[docKey], progress: pct } }));
      });
      setDocStates((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          uploading: false,
          progress: 100,
          uploaded: { type: docKey, name: file.name, url: result.downloadURL, storagePath: result.storagePath },
        },
      }));
    } catch (err: unknown) {
      const e = err as { code?: string };
      console.error("[VerificationCenter] Upload error:", e.code);
      const msg =
        e.code === "storage/unauthorized"
          ? "Permission denied — check Firebase Storage rules."
          : `Upload failed (${e.code ?? "unknown"}). Try again.`;
      setDocStates((prev) => ({ ...prev, [docKey]: { ...prev[docKey], uploading: false, error: msg } }));
    }
  };

  const handleRemove = (docKey: string) => {
    setDocStates((prev) => ({ ...prev, [docKey]: { file: null, progress: 0, uploading: false, uploaded: null, error: "" } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uploadedDocs = Object.values(docStates).filter((s) => s.uploaded).map((s) => s.uploaded!);
    if (uploadedDocs.length === 0) { toast.error("Please upload at least one verification document."); return; }
    if (!docStates["business_registration"]?.uploaded) { toast.error("Business Registration Certificate is required."); return; }

    setSubmitting(true);
    try {
      const payload = {
        companyId: company.id,
        companyName: company.name,
        ownerId: uid,
        status: "pending",
        submittedAt: serverTimestamp(),
        documents: uploadedDocs,
        businessDetails: {
          gstin: gstin.trim() || null,
          pan: pan.trim() || null,
          registrationNumber: regNumber.trim() || null,
          additionalNotes: notes.trim() || null,
        },
        rejectionReason: null,
      };

      if (request && canResubmit) {
        await updateDoc(doc(db, "employerValidations", request.id), payload);
        toast.success("Verification request resubmitted!");
      } else {
        await addDoc(collection(db, "employerValidations"), payload);
        toast.success("Verification request submitted!");
      }
      onSubmitted({
        id: request?.id ?? "",
        status: "pending",
        submittedAt: { toDate: () => new Date() },
        documents: uploadedDocs,
        businessDetails: { gstin: gstin.trim() || undefined, pan: pan.trim() || undefined, registrationNumber: regNumber.trim() || undefined, additionalNotes: notes.trim() || undefined },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isUploading = Object.values(docStates).some((s) => s.uploading);
  const disabled = submitting || isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Business details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            GSTIN <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="22AAAAA0000A1Z5" maxLength={15} disabled={disabled}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            PAN Number <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F" maxLength={10} disabled={disabled}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">
            Registration / CIN Number <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)}
            placeholder="U12345MH2020PTC123456" disabled={disabled}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">
            Additional Notes <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional context for the verification team…"
            rows={2} disabled={disabled}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
          />
        </div>
      </div>

      {/* Documents */}
      <div>
        <p className="mb-1 text-sm font-medium">Documents</p>
        <p className="mb-3 text-xs text-muted-foreground">PDF, JPG, PNG — Max 5 MB each</p>
        <div className="space-y-3">
          {DOCUMENT_TYPES.map((docType) => (
            <DocumentUploadRow
              key={docType.key}
              docType={docType}
              state={docStates[docType.key]}
              onUpload={(file) => handleUpload(docType.key, file)}
              onRemove={() => handleRemove(docType.key)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      <button
        type="submit" disabled={disabled}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? <RefreshCwIcon className="h-4 w-4 animate-spin" /> : <BadgeCheckIcon className="h-4 w-4" />}
        {submitting ? "Submitting…" : canResubmit ? "Resubmit for Review" : "Submit for Verification"}
      </button>
    </form>
  );
}

// ─── Submitted docs viewer ─────────────────────────────────────────────────────

function SubmittedDocs({ documents }: { documents: UploadedDoc[] }) {
  return (
    <div className="space-y-2">
      {documents.map((d) => (
        <div key={d.storagePath} className="flex items-center gap-3 text-sm">
          <FileTextIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <a href={d.url} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline">
            {d.name}
          </a>
          <ExternalLinkIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function EmployerVerificationPage() {
  const uid = useAuthStore((s) => s.uid);
  const user = useAuthStore((s) => s.user);
  const { data: company, isLoading: companyLoading } = useMyCompany();

  const [request, setRequest] = useState<ValidationRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [canResubmit, setCanResubmit] = useState(false);

  const isPhoneVerified = !!user?.phoneVerified;

  useEffect(() => {
    if (!uid || !company) { setLoadingRequest(false); return; }
    const fetchRequest = async () => {
      try {
        const q = query(collection(db, "employerValidations"), where("ownerId", "==", uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const data = docSnap.data() as Omit<ValidationRequest, "id">;
          const req = { id: docSnap.id, ...data };
          setRequest(req);
          if (req.status === "rejected") setCanResubmit(true);
        }
      } catch (err) {
        console.error("Failed to fetch validation request:", err);
      } finally {
        setLoadingRequest(false);
      }
    };
    fetchRequest();
  }, [uid, company?.id]);

  // Loading
  if (companyLoading || loadingRequest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Verification Center</h1>
        </div>
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    );
  }

  // No company
  if (!company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Verification Center</h1>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-muted/20 py-16 text-center">
          <BuildingIcon className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="font-semibold">No Company Profile Found</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your company profile first to request verification.</p>
          </div>
          <Link href="/employer/company" className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Set Up Company Profile
          </Link>
        </div>
      </div>
    );
  }

  // Status labels for company verification
  const companyVerifStatus = !request
    ? { status: "none" as const, label: "Not submitted" }
    : request.status === "approved"
    ? { status: "done" as const, label: "Approved — verified badge active" }
    : request.status === "pending"
    ? { status: "pending" as const, label: "Under review (2–3 business days)" }
    : { status: "rejected" as const, label: "Rejected — resubmit required" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Verification Center</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete both verifications to unlock all features and build candidate trust.
        </p>
      </div>

      {/* Progress overview */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            label: "Phone Verified",
            done: isPhoneVerified,
            desc: isPhoneVerified ? "Required to post jobs — complete" : "Required to post jobs",
          },
          {
            label: "Company Verified",
            done: request?.status === "approved",
            desc:
              request?.status === "approved"
                ? "Verified badge active on your profile"
                : request?.status === "pending"
                ? "Under review"
                : "Boosts trust with candidates",
          },
        ].map(({ label, done, desc }) => (
          <div
            key={label}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4",
              done ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/20" : "border-border bg-muted/20"
            )}
          >
            <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", done ? "bg-green-100 dark:bg-green-900/40" : "bg-muted")}>
              {done ? <CheckCircle2Icon className="h-4 w-4 text-green-600" /> : <ClockIcon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div>
              <p className={cn("text-sm font-semibold", done ? "text-green-700 dark:text-green-400" : "")}>{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1 — Phone */}
      <StepCard
        step={1}
        title="Phone Verification"
        status={isPhoneVerified ? "done" : "none"}
        statusLabel={isPhoneVerified ? `Verified — +91 ${user?.phone ?? ""}` : "Not verified — required to post jobs"}
        collapsible={isPhoneVerified}
      >
        <PhoneVerificationSection />
      </StepCard>

      {/* Step 2 — Company documents */}
      <StepCard
        step={2}
        title="Company Document Verification"
        status={companyVerifStatus.status}
        statusLabel={companyVerifStatus.label}
        collapsible={request?.status === "approved"}
      >
        {/* Rejection banner */}
        {request?.status === "rejected" && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
            <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">Verification rejected</p>
              {request.rejectionReason && (
                <p className="mt-0.5 text-xs text-red-700 dark:text-red-500">
                  Reason: {request.rejectionReason}
                </p>
              )}
              <p className="mt-1 text-xs text-red-700 dark:text-red-500">
                Please update your documents and resubmit.
              </p>
            </div>
          </div>
        )}

        {/* Pending — read-only view */}
        {request?.status === "pending" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/40 dark:bg-yellow-950/20">
              <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">Under review</p>
                <p className="mt-0.5 text-xs text-yellow-700 dark:text-yellow-500">
                  Submitted on{" "}
                  {request.submittedAt?.toDate().toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                  . Review takes 2–3 business days.
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Submitted Documents</p>
              <SubmittedDocs documents={request.documents ?? []} />
            </div>
            {request.businessDetails && (
              <div>
                <p className="mb-2 text-sm font-medium">Business Details</p>
                <dl className="grid gap-2 sm:grid-cols-2 text-xs">
                  {request.businessDetails.gstin && (<><dt className="text-muted-foreground">GSTIN</dt><dd className="font-medium">{request.businessDetails.gstin}</dd></>)}
                  {request.businessDetails.pan && (<><dt className="text-muted-foreground">PAN</dt><dd className="font-medium">{request.businessDetails.pan}</dd></>)}
                  {request.businessDetails.registrationNumber && (<><dt className="text-muted-foreground">Registration No.</dt><dd className="font-medium">{request.businessDetails.registrationNumber}</dd></>)}
                </dl>
              </div>
            )}
          </div>
        )}

        {/* Approved — summary */}
        {request?.status === "approved" && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Submitted Documents</p>
            <SubmittedDocs documents={request.documents ?? []} />
          </div>
        )}

        {/* Not submitted or rejected — show form */}
        {(!request || canResubmit) && (
          <>
            {!request && (
              <div className="mb-5 rounded-xl bg-primary/5 p-4">
                <p className="text-sm font-medium mb-2">Benefits of verification</p>
                <ul className="space-y-1.5">
                  {[
                    "Verified badge on your company profile and job listings",
                    "Higher trust score — candidates apply more to verified companies",
                    "Priority placement in search results",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <BadgeCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <CompanyVerificationForm
              uid={uid!}
              company={company}
              request={request}
              canResubmit={canResubmit}
              onSubmitted={(req) => { setRequest(req); setCanResubmit(false); }}
            />
          </>
        )}
      </StepCard>
    </div>
  );
}
