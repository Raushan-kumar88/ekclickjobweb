"use client";

import { useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { BellIcon, SendIcon, UsersIcon, CheckCircleIcon } from "lucide-react";
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
import { logAdminAction } from "@/lib/admin/auditLogger";
import { useAuthStore } from "@/stores/authStore";

type Audience = "all" | "seekers" | "employers";
type NotifType = "info" | "alert" | "promotion" | "system";

const TYPE_OPTIONS: { value: NotifType; label: string }[] = [
  { value: "info", label: "Information" },
  { value: "alert", label: "Alert" },
  { value: "promotion", label: "Promotion" },
  { value: "system", label: "System Update" },
];

export default function AdminNotificationsPage() {
  const { user: adminUser } = useAuthStore();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [notifType, setNotifType] = useState<NotifType>("info");
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setIsSending(true);
    setSentCount(null);

    try {
      // Fetch target users
      const usersQuery =
        audience === "all"
          ? query(collection(db, "users"))
          : query(collection(db, "users"), where("role", "==", audience === "seekers" ? "seeker" : "employer"));

      const usersSnap = await getDocs(usersQuery);
      const userIds = usersSnap.docs.map((d) => d.id);

      // Batch create notifications (in chunks of 50 to avoid overwhelming)
      const CHUNK = 50;
      for (let i = 0; i < userIds.length; i += CHUNK) {
        const chunk = userIds.slice(i, i + CHUNK);
        await Promise.all(
          chunk.map((userId) =>
            addDoc(collection(db, "notifications"), {
              userId,
              type: notifType,
              title: title.trim(),
              message: message.trim(),
              read: false,
              createdAt: serverTimestamp(),
              sentByAdmin: true,
              sentBy: adminUser?.uid,
            })
          )
        );
      }

      setSentCount(userIds.length);
      toast.success(`Notification sent to ${userIds.length} users`);

      // Log action
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "notification.bulk_sent",
        targetCollection: "notifications",
        targetId: "bulk",
        details: { title, audience, recipientCount: userIds.length, type: notifType },
      });

      // Clear form
      setTitle("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send notifications");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Send bulk in-app notifications to users
        </p>
      </div>

      {/* Compose form */}
      <div className="rounded-2xl border bg-background p-6 space-y-5">
        <h2 className="text-sm font-semibold">Compose Notification</h2>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Target Audience</label>
              <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="seekers">Seekers Only</SelectItem>
                  <SelectItem value="employers">Employers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Notification Type</label>
              <Select value={notifType} onValueChange={(v) => setNotifType(v as NotifType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Title *</label>
            <Input
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-right text-[10px] text-muted-foreground">{title.length}/100</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Message *</label>
            <Textarea
              placeholder="Notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-right text-[10px] text-muted-foreground">{message.length}/500</p>
          </div>
        </div>

        {/* Preview */}
        {(title || message) && (
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Preview</p>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <BellIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title || "Notification Title"}</p>
                <p className="text-xs text-muted-foreground">{message || "Notification message"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <UsersIcon className="h-3.5 w-3.5" />
            Sending to{" "}
            {audience === "all"
              ? "all users"
              : audience === "seekers"
                ? "seekers only"
                : "employers only"}
          </div>
          <Button
            onClick={handleSend}
            disabled={isSending || !title.trim() || !message.trim()}
            className="gap-2"
          >
            {isSending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <SendIcon className="h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </div>

        {sentCount !== null && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircleIcon className="h-4 w-4 shrink-0" />
            Successfully sent to {sentCount} users
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">About Bulk Notifications</p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>Notifications appear in each user&apos;s notification bell</li>
          <li>Users can mark them as read from their notification page</li>
          <li>All bulk sends are logged in the Audit Logs</li>
          <li>For large audiences, sending may take a few seconds</li>
        </ul>
      </div>
    </div>
  );
}
