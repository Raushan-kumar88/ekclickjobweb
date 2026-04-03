"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SearchIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon, BuildingIcon, DownloadIcon, RefreshCwIcon, StarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logAdminAction } from "@/lib/admin/auditLogger";
import { useAuthStore } from "@/stores/authStore";
import type { Company } from "@/types";

export default function AdminCompaniesPage() {
  const { user: adminUser } = useAuthStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");

  async function load() {
    setIsLoading(true);
    try {
      const q = query(collection(db, "companies"), orderBy("createdAt", "desc"), limit(200));
      const snap = await getDocs(q);
      setCompanies(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Company)));
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleVerify(companyId: string, verified: boolean) {
    try {
      await updateDoc(doc(db, "companies", companyId), { verified });
      setCompanies((prev) => prev.map((c) => (c.id === companyId ? { ...c, verified } : c)));
      toast.success(verified ? "Company verified" : "Verification removed");
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: verified ? "company.verified" : "company.unverified",
        targetCollection: "companies",
        targetId: companyId,
        details: { companyName: companies.find((c) => c.id === companyId)?.name },
      });
    } catch {
      toast.error("Failed to update company");
    }
  }

  function handleExportCSV() {
    const rows = [
      ["Name", "Industry", "City", "Jobs", "Rating", "Verified"].join(","),
      ...filtered.map((c) =>
        [
          `"${c.name}"`,
          `"${c.industry ?? ""}"`,
          `"${c.location?.city ?? ""}"`,
          c.jobCount ?? 0,
          c.averageRating ?? 0,
          c.verified ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `companies-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  }

  const filtered = companies.filter((c) => {
    const matchSearch = searchQuery
      ? c.name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchFilter =
      filter === "all" ? true : filter === "verified" ? c.verified : !c.verified;
    return matchSearch && matchFilter;
  });

  const counts = {
    total: companies.length,
    verified: companies.filter((c) => c.verified).length,
    unverified: companies.filter((c) => !c.verified).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {counts.total} companies · {counts.verified} verified
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

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "verified", "unverified"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium capitalize transition-all",
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              )}
            >
              {f === "all" ? `All (${counts.total})` : f === "verified" ? `Verified (${counts.verified})` : `Unverified (${counts.unverified})`}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-background divide-y">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <BuildingIcon className="h-8 w-8 opacity-30" />
            <p className="text-sm">No companies found</p>
          </div>
        ) : (
          filtered.map((company) => (
            <div key={company.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
              <CompanyAvatar name={company.name} logoUrl={company.logo} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{company.name}</p>
                  {company.verified && (
                    <ShieldCheckIcon className="h-4 w-4 shrink-0 text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {company.industry} · {company.location?.city}
                </p>
                <p className="text-xs text-muted-foreground">
                  {company.jobCount ?? 0} jobs ·{" "}
                  {company.reviewCount ?? 0} reviews ·{" "}
                  {company.averageRating ? (
                    <span className="inline-flex items-center gap-0.5">
                      <StarIcon className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      {company.averageRating.toFixed(1)}
                    </span>
                  ) : "No rating"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {company.verified ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => handleVerify(company.id, false)}
                  >
                    <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                    Unverify
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                    onClick={() => handleVerify(company.id, true)}
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                    Verify
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
