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
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { formatDistanceToNow, format } from "date-fns";
import {
  FileTextIcon,
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  XIcon,
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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: "published" | "draft" | "archived";
  category: string;
  tags: string[];
  coverImage?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  targetAudience: "all" | "seekers" | "employers";
  status: "active" | "scheduled" | "expired";
  startDate?: Timestamp;
  endDate?: Timestamp;
  createdAt?: Timestamp;
  createdBy?: string;
  type: "info" | "warning" | "success";
}

type Tab = "blog" | "announcements";

export default function AdminContentPage() {
  const { user: adminUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("announcements");

  // Blog state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editPost, setEditPost] = useState<Partial<BlogPost> | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [editAnnouncement, setEditAnnouncement] = useState<Partial<Announcement> | null>(null);

  useEffect(() => { loadPosts(); loadAnnouncements(); }, []);

  async function loadPosts() {
    setPostsLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "blogPosts"), orderBy("createdAt", "desc")));
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost)));
    } catch { /* no posts yet */ }
    finally { setPostsLoading(false); }
  }

  async function loadAnnouncements() {
    setAnnouncementsLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "announcements"), orderBy("createdAt", "desc")));
      setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
    } catch { /* no announcements yet */ }
    finally { setAnnouncementsLoading(false); }
  }

  async function savePost(post: Partial<BlogPost>) {
    if (!post.title?.trim()) { toast.error("Title is required"); return; }
    try {
      if (post.id) {
        await updateDoc(doc(db, "blogPosts", post.id), { ...post, updatedAt: serverTimestamp() });
        toast.success("Post updated");
      } else {
        await addDoc(collection(db, "blogPosts"), {
          ...post,
          slug: post.title.toLowerCase().replace(/\s+/g, "-"),
          status: post.status ?? "draft",
          author: adminUser?.displayName ?? "Admin",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Post created");
      }
      setEditPost(null);
      loadPosts();
    } catch { toast.error("Failed to save post"); }
  }

  async function deletePost(id: string) {
    try {
      await deleteDoc(doc(db, "blogPosts", id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
    } catch { toast.error("Failed to delete post"); }
  }

  async function saveAnnouncement(ann: Partial<Announcement>) {
    if (!ann.title?.trim() || !ann.message?.trim()) {
      toast.error("Title and message are required");
      return;
    }
    try {
      if (ann.id) {
        await updateDoc(doc(db, "announcements", ann.id), { ...ann, updatedAt: serverTimestamp() });
        toast.success("Announcement updated");
      } else {
        await addDoc(collection(db, "announcements"), {
          ...ann,
          status: ann.status ?? "active",
          createdAt: serverTimestamp(),
          createdBy: adminUser?.uid,
        });
        toast.success("Announcement created");
      }
      setEditAnnouncement(null);
      loadAnnouncements();
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: ann.id ? "announcement.updated" : "announcement.created",
        targetCollection: "announcements",
        targetId: ann.id ?? "new",
        details: { title: ann.title },
      });
    } catch { toast.error("Failed to save announcement"); }
  }

  async function deleteAnnouncement(id: string) {
    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success("Announcement deleted");
    } catch { toast.error("Failed to delete announcement"); }
  }

  const STATUS_COLORS: Record<string, string> = {
    published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    draft: "bg-muted text-muted-foreground",
    archived: "bg-slate-100 text-slate-600",
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    scheduled: "bg-blue-100 text-blue-700",
    expired: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Management</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage blog posts and announcements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
        {([
          { id: "announcements", label: "Announcements", icon: BellIcon },
          { id: "blog", label: "Blog Posts", icon: FileTextIcon },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setEditAnnouncement({ type: "info", targetAudience: "all", status: "active" })}
              className="gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              New Announcement
            </Button>
          </div>

          {/* Edit form */}
          {editAnnouncement !== null && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {editAnnouncement.id ? "Edit Announcement" : "New Announcement"}
                </h3>
                <button onClick={() => setEditAnnouncement(null)} className="text-muted-foreground hover:text-foreground">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <Input
                placeholder="Announcement title"
                value={editAnnouncement.title ?? ""}
                onChange={(e) => setEditAnnouncement((p) => ({ ...p, title: e.target.value }))}
              />
              <Textarea
                placeholder="Announcement message..."
                value={editAnnouncement.message ?? ""}
                onChange={(e) => setEditAnnouncement((p) => ({ ...p, message: e.target.value }))}
                rows={3}
              />
              <div className="flex gap-3">
                <Select
                  value={editAnnouncement.type ?? "info"}
                  onValueChange={(v) => setEditAnnouncement((p) => ({ ...p, type: v as Announcement["type"] }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={editAnnouncement.targetAudience ?? "all"}
                  onValueChange={(v) => setEditAnnouncement((p) => ({ ...p, targetAudience: v as Announcement["targetAudience"] }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="seekers">Seekers Only</SelectItem>
                    <SelectItem value="employers">Employers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditAnnouncement(null)}>Cancel</Button>
                <Button size="sm" onClick={() => saveAnnouncement(editAnnouncement)}>Save</Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-background divide-y">
            {announcementsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <BellIcon className="h-8 w-8 opacity-30" />
                <p className="text-sm">No announcements yet</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{ann.title}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_COLORS[ann.status])}>
                        {ann.status}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
                        {ann.targetAudience}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ann.message}</p>
                    {ann.createdAt && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(ann.createdAt.toDate(), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditAnnouncement(ann)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Blog Tab */}
      {activeTab === "blog" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setEditPost({ status: "draft" })}
              className="gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              New Blog Post
            </Button>
          </div>

          {/* Edit form */}
          {editPost !== null && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{editPost.id ? "Edit Post" : "New Blog Post"}</h3>
                <button onClick={() => setEditPost(null)} className="text-muted-foreground hover:text-foreground">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <Input
                placeholder="Post title"
                value={editPost.title ?? ""}
                onChange={(e) => setEditPost((p) => ({ ...p, title: e.target.value }))}
              />
              <Input
                placeholder="Short excerpt"
                value={editPost.excerpt ?? ""}
                onChange={(e) => setEditPost((p) => ({ ...p, excerpt: e.target.value }))}
              />
              <Textarea
                placeholder="Post content (supports Markdown)..."
                value={editPost.content ?? ""}
                onChange={(e) => setEditPost((p) => ({ ...p, content: e.target.value }))}
                rows={8}
                className="font-mono text-sm"
              />
              <div className="flex gap-3">
                <Input
                  placeholder="Category"
                  value={editPost.category ?? ""}
                  onChange={(e) => setEditPost((p) => ({ ...p, category: e.target.value }))}
                  className="flex-1"
                />
                <Select
                  value={editPost.status ?? "draft"}
                  onValueChange={(v) => setEditPost((p) => ({ ...p, status: v as BlogPost["status"] }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditPost(null)}>Cancel</Button>
                <Button size="sm" onClick={() => savePost(editPost)}>Save Post</Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-background divide-y">
            {postsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <FileTextIcon className="h-8 w-8 opacity-30" />
                <p className="text-sm">No blog posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{post.title}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_COLORS[post.status])}>
                        {post.status}
                      </span>
                      {post.category && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.excerpt}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      By {post.author} ·{" "}
                      {post.createdAt
                        ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditPost(post)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
