"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { formatDistanceToNow } from "date-fns";
import {
  BadgeCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FileTextIcon,
  BuildingIcon,
  SearchIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logAdminAction } from "@/lib/admin/auditLogger";
import { useAuthStore } from "@/stores/authStore";

interface EmployerValidation {
  id: string;
  employerId: string;
  companyId?: string;
  companyName: string;
  employerName: string;
  employerEmail: string;
  status: "pending" | "approved" | "rejected" | "resubmitted";
  documents: {
    type: string;
    url: string;
    fileName: string;
    uploadedAt?: Timestamp;
  }[];
  companyProfile: {
    name: string;
    website?: string;
    industry?: string;
    size?: string;
    description?: string;
    gstin?: string;
    pan?: string;
  };
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  rejectionReason?: string;
  reviewNotes?: string;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: ClockIcon,
  },
  resubmitted: {
    label: "Resubmitted",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: RefreshCwIcon,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircleIcon,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircleIcon,
  },
};

type StatusFilter = "pending" | "resubmitted" | "approved" | "rejected" | "all";

export default function EmployerValidationPage() {
  const { user: adminUser } = useAuthStore();
  const [validations, setValidations] = useState<EmployerValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<EmployerValidation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  async function loadValidations() {
    setIsLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "employerValidations"), orderBy("submittedAt", "desc"))
      );
      setValidations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmployerValidation)));
    } catch (err) {
      toast.error("Failed to load validations");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadValidations(); }, []);

  async function handleApprove(v: EmployerValidation) {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "employerValidations", v.id), {
        status: "approved",
        reviewedAt: serverTimestamp(),
        reviewedBy: adminUser?.uid,
        reviewNotes: reviewNotes || null,
      });

      // Also mark company as verified if companyId exists
      if (v.companyId) {
        await updateDoc(doc(db, "companies", v.companyId), { verified: true });
      }

      // Notify employer via notification
      await addDoc(collection(db, "notifications"), {
        userId: v.employerId,
        type: "employer_validated",
        title: "Your employer account has been approved!",
        message: "You can now post jobs and access all employer features.",
        read: false,
        createdAt: serverTimestamp(),
      });

      setValidations((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, status: "approved" } : item))
      );
      setSelectedItem(null);
      setReviewNotes("");
      toast.success("Employer approved successfully");

      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "employer_validation.approved",
        targetCollection: "employerValidations",
        targetId: v.id,
        details: { companyName: v.companyName, employerEmail: v.employerEmail, notes: reviewNotes },
      });
    } catch {
      toast.error("Failed to approve employer");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(v: EmployerValidation) {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "employerValidations", v.id), {
        status: "rejected",
        reviewedAt: serverTimestamp(),
        reviewedBy: adminUser?.uid,
        rejectionReason: rejectionReason,
        reviewNotes: reviewNotes || null,
      });

      // Notify employer
      await addDoc(collection(db, "notifications"), {
        userId: v.employerId,
        type: "employer_validation_rejected",
        title: "Employer validation rejected",
        message: `Reason: ${rejectionReason}. Please resubmit with corrections.`,
        read: false,
        createdAt: serverTimestamp(),
      });

      setValidations((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, status: "rejected" } : item))
      );
      setSelectedItem(null);
      setRejectionReason("");
      setReviewNotes("");
      setShowRejectForm(false);
      toast.success("Employer rejected and notified");

      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "employer_validation.rejected",
        targetCollection: "employerValidations",
        targetId: v.id,
        details: { companyName: v.companyName, reason: rejectionReason },
      });
    } catch {
      toast.error("Failed to reject employer");
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = validations.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = q
      ? v.companyName?.toLowerCase().includes(q) || v.employerEmail?.toLowerCase().includes(q)
      : true;
    const matchStatus = statusFilter !== "all" ? v.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const counts = {
    pending: validations.filter((v) => v.status === "pending").length,
    resubmitted: validations.filter((v) => v.status === "resubmitted").length,
    approved: validations.filter((v) => v.status === "approved").length,
    rejected: validations.filter((v) => v.status === "rejected").length,
  };

  const TABS: { id: StatusFilter; label: string; count?: number }[] = [
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "resubmitted", label: "Resubmitted", count: counts.resubmitted },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="flex h-full gap-0 overflow-hidden -m-4 lg:-m-6">
      {/* Left panel - list */}
      <div
        className={cn(
          "flex flex-col border-r bg-background transition-all",
          selectedItem ? "hidden lg:flex lg:w-96 shrink-0" : "flex-1"
        )}
      >
        {/* Header */}
        <div className="border-b p-4 lg:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Employer Validation</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Review and validate employer registrations
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadValidations}>
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      statusFilter === tab.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search company or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <BadgeCheckIcon className="h-8 w-8 opacity-30" />
              <p className="text-sm">No validations found</p>
            </div>
          ) : (
            filtered.map((v) => {
              const cfg = STATUS_CONFIG[v.status];
              const StatusIcon = cfg.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedItem(v);
                    setShowRejectForm(false);
                    setRejectionReason("");
                    setReviewNotes("");
                  }}
                  className={cn(
                    "w-full text-left p-4 hover:bg-muted/40 transition-colors",
                    selectedItem?.id === v.id && "bg-muted/60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{v.companyName}</p>
                        <span
                          className={cn(
                            "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold shrink-0",
                            cfg.color
                          )}
                        >
                          <StatusIcon className="h-2.5 w-2.5" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{v.employerEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.documents?.length ?? 0} documents ·{" "}
                        {v.submittedAt
                          ? formatDistanceToNow(v.submittedAt.toDate(), { addSuffix: true })
                          : "—"}
                      </p>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel - detail */}
      {selectedItem ? (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
          {/* Detail header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">{selectedItem.companyName}</h2>
              <p className="text-sm text-muted-foreground">{selectedItem.employerEmail}</p>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Status badge */}
          {(() => {
            const cfg = STATUS_CONFIG[selectedItem.status];
            const Icon = cfg.icon;
            return (
              <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold w-fit", cfg.color)}>
                <Icon className="h-4 w-4" />
                {cfg.label}
              </div>
            );
          })()}

          {/* Company profile */}
          <section className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <h3 className="text-sm font-semibold">Company Profile</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                { label: "Company Name", value: selectedItem.companyProfile?.name },
                { label: "Industry", value: selectedItem.companyProfile?.industry },
                { label: "Size", value: selectedItem.companyProfile?.size },
                { label: "GSTIN", value: selectedItem.companyProfile?.gstin },
                { label: "PAN", value: selectedItem.companyProfile?.pan },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ) : null
              )}
              {selectedItem.companyProfile?.website && (
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Website</dt>
                  <dd>
                    <a
                      href={selectedItem.companyProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {selectedItem.companyProfile.website}
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  </dd>
                </div>
              )}
              {selectedItem.companyProfile?.description && (
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Description</dt>
                  <dd className="text-xs mt-0.5 leading-relaxed text-muted-foreground">
                    {selectedItem.companyProfile.description}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Documents */}
          {selectedItem.documents?.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Documents ({selectedItem.documents.length})</h3>
              <div className="space-y-2">
                {selectedItem.documents.map((docItem, i) => (
                  <a
                    key={i}
                    href={docItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border bg-background p-3 hover:border-primary/30 hover:bg-muted/30 transition-all"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <FileTextIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">
                        {docItem.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{docItem.fileName}</p>
                    </div>
                    <ExternalLinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Rejection reason if already rejected */}
          {selectedItem.status === "rejected" && selectedItem.rejectionReason && (
            <section className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                Rejection Reason
              </p>
              <p className="mt-1 text-sm">{selectedItem.rejectionReason}</p>
            </section>
          )}

          {/* Review notes */}
          {(selectedItem.status === "pending" || selectedItem.status === "resubmitted") && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Review Notes (optional)</h3>
              <Textarea
                placeholder="Internal notes about this review..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </section>
          )}

          {/* Rejection form */}
          {showRejectForm && (
            <section className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <h3 className="text-sm font-semibold text-destructive">Rejection Reason *</h3>
              <Textarea
                placeholder="Explain why this employer is being rejected (visible to employer)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="text-sm border-destructive/30 focus:border-destructive/50"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(selectedItem)}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1"
                >
                  Confirm Rejection
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowRejectForm(false); setRejectionReason(""); }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
              </div>
            </section>
          )}

          {/* Action buttons */}
          {(selectedItem.status === "pending" || selectedItem.status === "resubmitted") && !showRejectForm && (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleApprove(selectedItem)}
                disabled={actionLoading}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Approve Employer
              </Button>
              <Button
                onClick={() => setShowRejectForm(true)}
                disabled={actionLoading}
                variant="outline"
                className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <XCircleIcon className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Submitted{" "}
            {selectedItem.submittedAt
              ? formatDistanceToNow(selectedItem.submittedAt.toDate(), { addSuffix: true })
              : "—"}
          </p>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BadgeCheckIcon className="mx-auto h-10 w-10 opacity-20" />
            <p className="mt-2 text-sm">Select a validation to review</p>
          </div>
        </div>
      )}
    </div>
  );
}
