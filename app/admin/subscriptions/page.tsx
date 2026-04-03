"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { formatDistanceToNow, format } from "date-fns";
import {
  CreditCardIcon,
  SearchIcon,
  RefreshCwIcon,
  DownloadIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  XIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logAdminAction } from "@/lib/admin/auditLogger";
import { useAuthStore } from "@/stores/authStore";
import { StatCard } from "@/components/admin/StatCard";

interface Subscription {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "expired" | "cancelled" | "trialing";
  currentPeriodStart?: Timestamp;
  currentPeriodEnd?: Timestamp;
  cancelledAt?: Timestamp;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  createdAt?: Timestamp;
}

const PLAN_PRICES: Record<string, number> = { pro: 2999, enterprise: 9999 };

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  expired: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  trialing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function AdminSubscriptionsPage() {
  const { user: adminUser } = useAuthStore();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Subscription | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "subscriptions"), orderBy("createdAt", "desc"), limit(300))
      );
      setSubs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subscription)));
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleOverridePlan(subId: string, userId: string, plan: "free" | "pro" | "enterprise") {
    try {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      await updateDoc(doc(db, "subscriptions", subId), {
        plan,
        status: plan === "free" ? "active" : "active",
        currentPeriodStart: serverTimestamp(),
        currentPeriodEnd: Timestamp.fromDate(endDate),
        updatedAt: serverTimestamp(),
      });
      setSubs((prev) => prev.map((s) => (s.id === subId ? { ...s, plan, status: "active" } : s)));
      setSelected(null);
      toast.success(`Plan overridden to ${plan}`);
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "subscription.plan_overridden",
        targetCollection: "subscriptions",
        targetId: subId,
        details: { userId, newPlan: plan },
      });
    } catch {
      toast.error("Failed to override plan");
    }
  }

  async function handleCancelSubscription(subId: string, userId: string) {
    try {
      await updateDoc(doc(db, "subscriptions", subId), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSubs((prev) => prev.map((s) => (s.id === subId ? { ...s, status: "cancelled" } : s)));
      setSelected(null);
      toast.success("Subscription cancelled");
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "subscription.cancelled_by_admin",
        targetCollection: "subscriptions",
        targetId: subId,
        details: { userId },
      });
    } catch {
      toast.error("Failed to cancel subscription");
    }
  }

  function handleExportCSV() {
    const rows = [
      ["User Email", "Plan", "Status", "Start", "End"].join(","),
      ...filtered.map((s) =>
        [
          `"${s.userEmail ?? ""}"`,
          s.plan,
          s.status,
          s.currentPeriodStart ? format(s.currentPeriodStart.toDate(), "yyyy-MM-dd") : "",
          s.currentPeriodEnd ? format(s.currentPeriodEnd.toDate(), "yyyy-MM-dd") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  }

  const filtered = subs.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = q ? s.userEmail?.toLowerCase().includes(q) || s.userName?.toLowerCase().includes(q) : true;
    const matchStatus = statusFilter !== "all" ? s.status === statusFilter : true;
    const matchPlan = planFilter !== "all" ? s.plan === planFilter : true;
    return matchSearch && matchStatus && matchPlan;
  });

  const activeSubs = subs.filter((s) => s.status === "active");
  const mrr = activeSubs.reduce((sum, s) => sum + (PLAN_PRICES[s.plan] ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage user subscriptions and billing
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCwIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Active"
          value={activeSubs.length}
          icon={CheckCircleIcon}
          colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          isLoading={isLoading}
        />
        <StatCard
          label="MRR"
          value={`₹${mrr.toLocaleString("en-IN")}`}
          icon={TrendingUpIcon}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          isLoading={isLoading}
        />
        <StatCard
          label="Pro Plans"
          value={subs.filter((s) => s.plan === "pro" && s.status === "active").length}
          icon={CreditCardIcon}
          colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          isLoading={isLoading}
        />
        <StatCard
          label="Enterprise"
          value={subs.filter((s) => s.plan === "enterprise" && s.status === "active").length}
          icon={CreditCardIcon}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          isLoading={isLoading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={(v) => setPlanFilter(v ?? "all")}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions list */}
      <div className="rounded-xl border bg-background divide-y">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <CreditCardIcon className="h-8 w-8 opacity-30" />
            <p className="text-sm">No subscriptions found</p>
          </div>
        ) : (
          filtered.map((sub) => (
            <div
              key={sub.id}
              onClick={() => setSelected(sub)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <CompanyAvatar name={sub.userName ?? sub.userEmail ?? "U"} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{sub.userName ?? sub.userEmail ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground truncate">{sub.userEmail}</p>
                <p className="text-xs text-muted-foreground">
                  {sub.currentPeriodEnd
                    ? `Expires ${formatDistanceToNow(sub.currentPeriodEnd.toDate(), { addSuffix: true })}`
                    : "No expiry"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", PLAN_COLORS[sub.plan])}>
                  {sub.plan}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_COLORS[sub.status])}>
                  {sub.status}
                </span>
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold">Subscription Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                {[
                  { label: "User", value: selected.userName ?? "Unknown" },
                  { label: "Email", value: selected.userEmail ?? "—" },
                  { label: "Plan", value: selected.plan },
                  { label: "Status", value: selected.status },
                  {
                    label: "Period Start",
                    value: selected.currentPeriodStart
                      ? format(selected.currentPeriodStart.toDate(), "dd MMM yyyy")
                      : "—",
                  },
                  {
                    label: "Period End",
                    value: selected.currentPeriodEnd
                      ? format(selected.currentPeriodEnd.toDate(), "dd MMM yyyy")
                      : "—",
                  },
                  { label: "Razorpay Sub ID", value: selected.razorpaySubscriptionId ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium text-right truncate max-w-[200px]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Override Plan
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["free", "pro", "enterprise"] as const).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => handleOverridePlan(selected.id, selected.userId, plan)}
                      className={cn(
                        "rounded-xl border py-2 text-xs font-semibold capitalize transition-all",
                        selected.plan === plan
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:border-primary/50 hover:text-primary"
                      )}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selected.status !== "cancelled" && (
              <div className="border-t p-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => handleCancelSubscription(selected.id, selected.userId)}
                >
                  <XCircleIcon className="h-4 w-4" />
                  Cancel Subscription
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
