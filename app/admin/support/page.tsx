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
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { formatDistanceToNow } from "date-fns";
import {
  HeadphonesIcon,
  SearchIcon,
  RefreshCwIcon,
  XIcon,
  SendIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logAdminAction } from "@/lib/admin/auditLogger";
import { useAuthStore } from "@/stores/authStore";

interface TicketMessage {
  senderId: string;
  senderName: string;
  senderRole: "admin" | "user";
  content: string;
  timestamp: Timestamp;
}

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  messages: TicketMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  high: { label: "High", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const STATUS_CONFIG = {
  open: { label: "Open", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground" },
};

type StatusFilter = "open" | "in_progress" | "resolved" | "closed" | "all";

export default function AdminSupportPage() {
  const { user: adminUser } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "supportTickets"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket)));
      setIsLoading(false);

      // Update selected ticket if open
      if (selected) {
        const updated = snap.docs.find((d) => d.id === selected.id);
        if (updated) setSelected({ id: updated.id, ...updated.data() } as SupportTicket);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReply() {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      const msg: Omit<TicketMessage, "timestamp"> & { timestamp: ReturnType<typeof serverTimestamp> } = {
        senderId: adminUser?.uid ?? "admin",
        senderName: adminUser?.displayName ?? "Admin",
        senderRole: "admin",
        content: replyText.trim(),
        timestamp: serverTimestamp() as unknown as Timestamp,
      };

      const updatedMessages = [...(selected.messages ?? []), msg];

      await updateDoc(doc(db, "supportTickets", selected.id), {
        messages: updatedMessages,
        status: selected.status === "open" ? "in_progress" : selected.status,
        updatedAt: serverTimestamp(),
      });

      setReplyText("");
      toast.success("Reply sent");
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setReplying(false);
    }
  }

  async function handleStatusChange(ticketId: string, status: SupportTicket["status"]) {
    try {
      await updateDoc(doc(db, "supportTickets", ticketId), {
        status,
        updatedAt: serverTimestamp(),
        ...(status === "resolved" ? { resolvedAt: serverTimestamp() } : {}),
      });
      toast.success(`Ticket ${status}`);
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "support_ticket.status_changed",
        targetCollection: "supportTickets",
        targetId: ticketId,
        details: { status },
      });
    } catch {
      toast.error("Failed to update ticket");
    }
  }

  const filtered = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = q
      ? t.subject?.toLowerCase().includes(q) || t.userEmail?.toLowerCase().includes(q)
      : true;
    const matchStatus = statusFilter !== "all" ? t.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const TABS: { id: StatusFilter; label: string; count?: number }[] = [
    { id: "open", label: "Open", count: counts.open },
    { id: "in_progress", label: "In Progress", count: counts.in_progress },
    { id: "resolved", label: "Resolved" },
    { id: "closed", label: "Closed" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="flex h-full gap-0 overflow-hidden -m-4 lg:-m-6">
      {/* Left panel */}
      <div className={cn("flex flex-col border-r bg-background", selected ? "hidden lg:flex lg:w-96 shrink-0" : "flex-1")}>
        <div className="border-b p-4 lg:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Support Center</h1>
              <p className="text-xs text-muted-foreground">
                {counts.open} open · {counts.in_progress} in progress
              </p>
            </div>
          </div>
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
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    statusFilter === tab.id ? "bg-primary-foreground/20" : "bg-muted"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <HeadphonesIcon className="h-8 w-8 opacity-30" />
              <p className="text-sm">No tickets found</p>
            </div>
          ) : (
            filtered.map((ticket) => {
              const pCfg = PRIORITY_CONFIG[ticket.priority];
              const sCfg = STATUS_CONFIG[ticket.status];
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelected(ticket)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-muted/40 transition-colors",
                    selected?.id === ticket.id && "bg-muted/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold line-clamp-1">{ticket.subject}</p>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0", pCfg.color)}>
                      {pCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ticket.userEmail}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", sCfg.color)}>
                      {sCfg.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {ticket.updatedAt
                        ? formatDistanceToNow(ticket.updatedAt.toDate(), { addSuffix: true })
                        : "—"}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel - conversation */}
      {selected ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b p-4">
            <div>
              <h2 className="font-semibold line-clamp-1">{selected.subject}</h2>
              <p className="text-xs text-muted-foreground">{selected.userEmail} · {selected.category}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select
                value={selected.status}
                onValueChange={(v) => handleStatusChange(selected.id, v as SupportTicket["status"])}
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(selected.messages ?? []).length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No messages yet
              </div>
            ) : (
              selected.messages?.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    msg.senderRole === "admin" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.senderRole === "admin"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    )}
                  >
                    <p className={cn("text-[10px] font-semibold mb-1", msg.senderRole === "admin" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {msg.senderName}
                    </p>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply box */}
          <div className="border-t p-4 space-y-2">
            <Textarea
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              className="text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply();
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Ctrl+Enter to send</p>
              <Button
                onClick={handleReply}
                disabled={replying || !replyText.trim()}
                size="sm"
                className="gap-2"
              >
                <SendIcon className="h-3.5 w-3.5" />
                Send Reply
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <HeadphonesIcon className="mx-auto h-10 w-10 opacity-20" />
            <p className="mt-2 text-sm">Select a ticket to view conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
