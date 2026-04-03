"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  updateDoc,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { formatDistanceToNow } from "date-fns";
import {
  SearchIcon,
  UsersIcon,
  RefreshCwIcon,
  DownloadIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import type { User, UserRole } from "@/types";

const PAGE_SIZE = 25;

const ROLE_BADGE: Record<UserRole, string> = {
  seeker: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  employer: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminUsersPage() {
  const { user: adminUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const searchRef = useRef<NodeJS.Timeout | null>(null);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);

  const fetchUsers = useCallback(
    async (reset = false) => {
      setIsLoading(true);
      try {
        const cursor = reset ? null : lastDocRef.current;
        const q = cursor
          ? query(
              collection(db, "users"),
              orderBy("createdAt", "desc"),
              startAfter(cursor),
              limit(PAGE_SIZE)
            )
          : query(collection(db, "users"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));

        const snap = await getDocs(q);
        const fetched = snap.docs.map((d) => ({ ...d.data(), uid: d.id } as User));

        setUsers(reset ? fetched : (prev) => [...prev, ...fetched]);
        lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
        setHasMore(snap.docs.length === PAGE_SIZE);
        if (reset) setTotalCount(fetched.length);
        else setTotalCount((prev) => prev + fetched.length);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(true);
  }, []);

  async function handleRoleChange(uid: string, newRole: UserRole) {
    const oldUser = users.find((u) => u.uid === uid);
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole, updatedAt: new Date() });
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
      toast.success(`Role changed to ${newRole}`);
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "user.role_changed",
        targetCollection: "users",
        targetId: uid,
        details: { from: oldUser?.role, to: newRole, userName: oldUser?.displayName },
      });
    } catch {
      toast.error("Failed to update role");
    }
  }

  async function handleBulkRoleChange(newRole: UserRole) {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(
        ids.map((uid) => updateDoc(doc(db, "users", uid), { role: newRole, updatedAt: new Date() }))
      );
      setUsers((prev) =>
        prev.map((u) => (selectedIds.has(u.uid) ? { ...u, role: newRole } : u))
      );
      setSelectedIds(new Set());
      toast.success(`Updated ${ids.length} users to ${newRole}`);
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "user.bulk_role_changed",
        targetCollection: "users",
        targetId: "bulk",
        details: { count: ids.length, newRole, ids },
      });
    } catch {
      toast.error("Failed to update users");
    }
  }

  function handleExportCSV() {
    const rows = [
      ["Name", "Email", "Role", "Joined"].join(","),
      ...filtered.map((u) =>
        [
          `"${u.displayName}"`,
          `"${u.email}"`,
          u.role,
          u.createdAt ? new Date(u.createdAt.toDate()).toISOString().split("T")[0] : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  }

  function toggleSelect(uid: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((u) => u.uid)));
    }
  }

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = q
      ? u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      : true;
    const matchRole = roleFilter !== "all" ? u.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalCount} users loaded · Manage roles and access
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchUsers(true)} className="gap-2">
            <RefreshCwIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="seeker">Seeker</SelectItem>
            <SelectItem value="employer">Employer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground">Change role to:</span>
            {(["seeker", "employer", "admin"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleBulkRoleChange(r)}
                className="rounded-lg border bg-background px-2.5 py-1 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-xl border bg-background overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-3">
          <input
            type="checkbox"
            checked={selectedIds.size === filtered.length && filtered.length > 0}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-muted-foreground/30"
            aria-label="Select all"
          />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            User
          </span>
          <span className="hidden sm:block w-28 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Role
          </span>
          <span className="hidden md:block w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Joined
          </span>
          <span className="w-28 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
            Change Role
          </span>
        </div>

        {isLoading && users.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b last:border-0 px-4 py-3">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <UsersIcon className="h-8 w-8 opacity-30" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          filtered.map((u) => (
            <div
              key={u.uid}
              className={cn(
                "flex items-center gap-4 border-b last:border-0 px-4 py-3 transition-colors",
                selectedIds.has(u.uid) ? "bg-primary/5" : "hover:bg-muted/30"
              )}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(u.uid)}
                onChange={() => toggleSelect(u.uid)}
                className="h-4 w-4 rounded border-muted-foreground/30"
                onClick={(e) => e.stopPropagation()}
              />
              <CompanyAvatar name={u.displayName} logoUrl={u.photoURL} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{u.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className="hidden sm:block w-28">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                    ROLE_BADGE[u.role] ?? ""
                  )}
                >
                  {u.role}
                </span>
              </div>
              <div className="hidden md:block w-32 text-xs text-muted-foreground">
                {u.createdAt
                  ? formatDistanceToNow(u.createdAt.toDate(), { addSuffix: true })
                  : "—"}
              </div>
              <div className="w-28 flex justify-end">
                <Select
                  value={u.role}
                  onValueChange={(v) => handleRoleChange(u.uid, v as UserRole)}
                >
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeker">Seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load more */}
      {hasMore && !isLoading && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchUsers(false)} className="w-40">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
