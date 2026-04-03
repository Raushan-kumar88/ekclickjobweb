"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheckIcon, XCircleIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { VerificationRequest } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "verificationRequests"),
          orderBy("submittedAt", "desc")
        );
        const snap = await getDocs(q);
        setRequests(snap.docs.map((d) => ({ ...d.data(), id: d.id } as VerificationRequest)));
      } catch {
        toast.error("Failed to load verification requests");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleDecision(request: VerificationRequest, approved: boolean) {
    const note = notes[request.id] ?? "";
    try {
      // Update verification request
      await updateDoc(doc(db, "verificationRequests", request.id), {
        status: approved ? "approved" : "rejected",
        reviewedAt: serverTimestamp(),
        notes: note,
      });

      // If approved, mark company as verified
      if (approved) {
        await updateDoc(doc(db, "companies", request.companyId), {
          verified: true,
        });
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? { ...r, status: approved ? "approved" : "rejected", notes: note }
            : r
        )
      );
      toast.success(approved ? "Company verified!" : "Request rejected");
    } catch {
      toast.error("Failed to process request");
    }
  }

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Verifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review and approve company verification requests</p>
      </div>

      <div className="flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            {f === "all" ? "All" : f}
            {f === "pending" && requests.filter((r) => r.status === "pending").length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                {requests.filter((r) => r.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            <ClockIcon className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No {filter !== "all" ? filter : ""} requests</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div key={req.id} className="rounded-xl border bg-background p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-muted-foreground" />
                    <p className="font-semibold">{req.companyName}</p>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_COLORS[req.status])}>
                      {req.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted{" "}
                    {req.submittedAt
                      ? formatDistanceToNow(req.submittedAt.toDate(), { addSuffix: true })
                      : "—"}
                  </p>
                  {req.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">Note: {req.notes}</p>
                  )}
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => handleDecision(req, false)}
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleDecision(req, true)}
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>

              {req.status === "pending" && (
                <div>
                  <Textarea
                    placeholder="Optional note for this decision..."
                    rows={2}
                    className="resize-none text-xs"
                    value={notes[req.id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                    }
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
