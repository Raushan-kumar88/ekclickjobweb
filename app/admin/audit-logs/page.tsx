"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { formatDistanceToNow, format } from "date-fns";
import {
  ScrollTextIcon,
  SearchIcon,
  DownloadIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetCollection: string;
  targetId: string;
  details: Record<string, unknown>;
  timestamp: Timestamp;
}

const ACTION_COLORS: Record<string, string> = {
  "user.role_changed": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "user.bulk_role_changed": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "job.status_changed": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "job.featured": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "job.unfeatured": "bg-muted text-muted-foreground",
  "company.verified": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "company.unverified": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "employer_validation.approved": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "employer_validation.rejected": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "subscription.plan_overridden": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "subscription.cancelled_by_admin": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "notification.bulk_sent": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

const PAGE_SIZE = 50;

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = useCallback(async (reset = false) => {
    setIsLoading(true);
    try {
      const q = reset || !lastDoc
        ? query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(PAGE_SIZE))
        : query(
            collection(db, "auditLogs"),
            orderBy("timestamp", "desc"),
            startAfter(lastDoc),
            limit(PAGE_SIZE)
          );

      const snap = await getDocs(q);
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));

      setLogs(reset ? fetched : (prev) => [...prev, ...fetched]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchLogs(true); }, []);

  function handleExportCSV() {
    const rows = [
      ["Admin", "Action", "Target", "Target ID", "Timestamp"].join(","),
      ...filtered.map((l) =>
        [
          `"${l.adminName}"`,
          l.action,
          l.targetCollection,
          l.targetId,
          l.timestamp ? format(l.timestamp.toDate(), "yyyy-MM-dd HH:mm:ss") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  }

  const filtered = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    return q
      ? l.adminName?.toLowerCase().includes(q) ||
          l.action?.toLowerCase().includes(q) ||
          l.targetCollection?.toLowerCase().includes(q) ||
          l.targetId?.toLowerCase().includes(q)
      : true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All admin actions are tracked here
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchLogs(true)} className="gap-2">
            <RefreshCwIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by admin, action, or target..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border bg-background divide-y">
        {isLoading && logs.length === 0 ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-64 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <ScrollTextIcon className="h-8 w-8 opacity-30" />
            <p className="text-sm">No audit logs found</p>
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelected(log)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {log.action}
                  </span>
                  <span className="text-xs font-medium">{log.targetCollection}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  By {log.adminName} · {log.targetId !== "bulk" ? `ID: ${log.targetId.slice(0, 12)}...` : "bulk"}
                </p>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {log.timestamp
                  ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true })
                  : "—"}
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          ))
        )}
      </div>

      {hasMore && !isLoading && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchLogs(false)}>Load More</Button>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold">Log Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { label: "Action", value: selected.action },
                { label: "Admin", value: selected.adminName },
                { label: "Admin Email", value: selected.adminEmail },
                { label: "Target Collection", value: selected.targetCollection },
                { label: "Target ID", value: selected.targetId },
                {
                  label: "Timestamp",
                  value: selected.timestamp
                    ? format(selected.timestamp.toDate(), "dd MMM yyyy, HH:mm:ss")
                    : "—",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2">
                  <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                  <span className="text-xs font-medium text-right break-all">{value}</span>
                </div>
              ))}

              <div className="rounded-xl bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground mb-1">Details</p>
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(selected.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
