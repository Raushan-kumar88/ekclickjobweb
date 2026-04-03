"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SunIcon,
  MoonIcon,
  MonitorIcon,
  ShieldIcon,
  FileTextIcon,
  InfoIcon,
  LogOutIcon,
  Trash2Icon,
  BellIcon,
  ChevronRightIcon,
  LockIcon,
  BadgeCheckIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";
import { signOut, deleteUserAccount, updateEmailPreferences, changePassword } from "@/lib/firebase/auth";
import { updateUserProfile } from "@/lib/firebase/db";
import { APP_VERSION, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from "@/lib/utils/constants";
import type { ThemeMode } from "@/stores/appStore";

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: React.ElementType }[] = [
  { mode: "light", label: "Light", icon: SunIcon },
  { mode: "dark", label: "Dark", icon: MoonIcon },
  { mode: "system", label: "System", icon: MonitorIcon },
];

export default function EmployerSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const resetAuth = useAuthStore((s) => s.reset);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [togglingHM, setTogglingHM] = useState(false);
  const isHiringManager = !!(user as Record<string, unknown> | null)?.isHiringManager;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [emailPrefs, setEmailPrefs] = useState(
    () => user?.emailPreferences ?? {
      applicationUpdates: true,
      jobAlerts: false,
      newApplicants: true,
      marketing: false,
    }
  );

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      document.cookie = "auth-token=; path=/; max-age=0";
      document.cookie = "user-role=; path=/; max-age=0";
      await signOut();
      router.push("/");
    } catch {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword.trim()) {
      toast.error("Please enter your password to confirm");
      return;
    }
    setIsDeletingAccount(true);
    try {
      await deleteUserAccount(deletePassword);
      resetAuth();
      document.cookie = "auth-token=; path=/; max-age=0";
      document.cookie = "user-role=; path=/; max-age=0";
      setShowDeleteDialog(false);
      toast.success("Account deleted");
      router.push("/");
    } catch (error: unknown) {
      setIsDeletingAccount(false);
      const code = (error as { code?: string })?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        toast.error("Incorrect password. Please try again.");
      } else if (code === "auth/requires-recent-login") {
        toast.error("Session expired. Please sign out and sign back in, then try again.");
        setShowDeleteDialog(false);
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    }
  }

  async function handleChangePassword() {
    if (!newPassword || !currentPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        toast.error("Current password is incorrect");
      } else if (code === "auth/requires-recent-login") {
        toast.error("Please sign out and sign back in, then try again");
      } else {
        toast.error("Failed to change password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleToggleHiringManager() {
    if (!user) return;
    setTogglingHM(true);
    try {
      await updateUserProfile(user.uid, { isHiringManager: !isHiringManager });
      toast.success(isHiringManager ? "Decision Maker badge removed" : "You're now verified as a Decision Maker / Hiring Manager!");
      // Reload user data
      window.location.reload();
    } catch {
      toast.error("Failed to update. Please try again.");
    } finally {
      setTogglingHM(false);
    }
  }

  async function handleToggleEmailPref(key: keyof typeof emailPrefs, value: boolean) {
    if (!user) return;
    const previous = emailPrefs;
    const updated = { ...emailPrefs, [key]: value };
    setEmailPrefs(updated);
    try {
      await updateEmailPreferences(user.uid, updated);
      toast.success("Preferences updated");
    } catch {
      setEmailPrefs(previous);
      toast.error("Failed to update preferences");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences
        </p>
      </div>

      {/* Appearance */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Appearance
        </h2>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-sm font-medium mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ mode, label, icon: Icon }) => {
              const isActive = themeMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  className={`flex flex-col items-center gap-2 rounded-xl border py-3 transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Email Preferences */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Email Notifications
        </h2>
        <div className="rounded-xl border bg-background divide-y">
          {[
            { key: "newApplicants" as const, label: "New applicants", description: "When someone applies to your job posting" },
            { key: "applicationUpdates" as const, label: "Application updates", description: "Status changes and follow-ups" },
            { key: "marketing" as const, label: "Tips & updates", description: "Platform updates and employer tips" },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={emailPrefs[key]}
                onCheckedChange={(v) => handleToggleEmailPref(key, v)}
                aria-label={label}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Hiring Manager Badge */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Hiring Identity
        </h2>
        <div className={`rounded-xl border p-4 transition-all ${isHiringManager ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/10" : "bg-background"}`}>
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isHiringManager ? "bg-blue-100 dark:bg-blue-900/30" : "bg-muted"}`}>
              <BadgeCheckIcon className={`h-5 w-5 ${isHiringManager ? "text-blue-600" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold flex items-center gap-2">
                Decision Maker / Hiring Manager
                {isHiringManager && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                    <BadgeCheckIcon className="h-3 w-3" /> Verified
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Mark yourself as the actual Hiring Manager or Founder. Candidates see a "Decision Maker" badge on your messages, making them 2× more likely to respond.
              </p>
              <button
                onClick={handleToggleHiringManager}
                disabled={togglingHM}
                className={`mt-3 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                  isHiringManager
                    ? "border border-blue-300 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {togglingHM && <Loader2Icon className="h-4 w-4 animate-spin" />}
                {isHiringManager ? "Remove Badge" : "Claim Decision Maker Badge"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* General links */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          General
        </h2>
        <div className="rounded-xl border bg-background divide-y">
          <Link
            href="/employer/notifications"
            className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors"
          >
            <BellIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Notifications</span>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </Link>
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/40 transition-colors"
          >
            <LockIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Change Password</span>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </button>
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors"
          >
            <ShieldIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Privacy Policy</span>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </a>
          <a
            href={TERMS_OF_SERVICE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors"
          >
            <FileTextIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Terms of Service</span>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </a>
          <div className="flex items-center gap-3 p-4">
            <InfoIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-muted-foreground">
              EkClickJob v{APP_VERSION}
            </span>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Account
        </h2>
        <div className="rounded-xl border bg-background divide-y">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-destructive/5 transition-colors"
          >
            <LogOutIcon className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </span>
          </button>
          {user && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-destructive/5 transition-colors"
            >
              <Trash2Icon className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">Delete Account</span>
            </button>
          )}
        </div>
      </section>

      {/* Change password dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(o) => !isChangingPassword && setShowPasswordDialog(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LockIcon className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Change Password</DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              Enter your current password and choose a new one.
            </p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="empCurrentPw">Current password</Label>
              <Input
                id="empCurrentPw"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isChangingPassword}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="empNewPw">New password</Label>
              <Input
                id="empNewPw"
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isChangingPassword}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="empConfirmPw">Confirm new password</Label>
              <Input
                id="empConfirmPw"
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={isChangingPassword}
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full"
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete account dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(o) => !isDeletingAccount && setShowDeleteDialog(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2Icon className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete Account</DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              This will permanently delete your employer account, all job postings, and associated data. This cannot be undone.
            </p>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="deletePasswordEmp">Confirm your password</Label>
            <Input
              id="deletePasswordEmp"
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={isDeletingAccount}
              autoFocus
            />
          </div>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="w-full"
            >
              {isDeletingAccount ? "Deleting..." : "Delete My Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
