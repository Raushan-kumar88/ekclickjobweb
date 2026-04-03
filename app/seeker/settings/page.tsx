"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SunIcon,
  MoonIcon,
  MonitorIcon,
  LockIcon,
  ShieldIcon,
  FileTextIcon,
  InfoIcon,
  LogOutIcon,
  Trash2Icon,
  BellIcon,
  SearchIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircle2Icon,
  XCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";
import { signOut, deleteUserAccount, updateEmailPreferences, changePassword } from "@/lib/firebase/auth";
import { APP_VERSION, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from "@/lib/utils/constants";
import type { ThemeMode } from "@/stores/appStore";

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: React.ElementType }[] = [
  { mode: "light", label: "Light", icon: SunIcon },
  { mode: "dark", label: "Dark", icon: MoonIcon },
  { mode: "system", label: "System", icon: MonitorIcon },
];

export default function SeekerSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const resetAuth = useAuthStore((s) => s.reset);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [emailPrefs, setEmailPrefs] = useState(
    () => user?.emailPreferences ?? {
      applicationUpdates: true,
      jobAlerts: true,
      newApplicants: false,
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
          Manage your account preferences and privacy
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
            { key: "applicationUpdates" as const, label: "Application status updates", description: "When employers update your application status" },
            { key: "jobAlerts" as const, label: "Job alerts", description: "New jobs matching your saved searches" },
            { key: "marketing" as const, label: "Tips & updates", description: "Career tips, platform updates and promotions" },
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

      {/* General links */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          General
        </h2>
        <div className="rounded-xl border bg-background divide-y">
          <Link
            href="/seeker/notifications"
            className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors"
          >
            <BellIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Notifications</span>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            href="/seeker/job-alerts"
            className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors"
          >
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Job Alerts</span>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </Link>
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="flex w-full items-center gap-3 p-4 hover:bg-accent/40 transition-colors text-left"
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
      <Dialog open={showPasswordDialog} onOpenChange={(o) => {
        if (!isChangingPassword) {
          setShowPasswordDialog(o);
          if (!o) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setShowCurrentPw(false);
            setShowNewPw(false);
            setShowConfirmPw(false);
          }
        }
      }}>
        <DialogContent className="sm:max-w-sm" showCloseButton>
          <DialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <LockIcon className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold">Change Password</DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              Enter your current password and choose a new one.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Current password */}
            <div className="space-y-1.5">
              <Label htmlFor="currentPw" className="text-sm font-medium">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPw"
                  type={showCurrentPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangingPassword}
                  autoFocus
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPw" className="text-sm font-medium">New password</Label>
              <div className="relative">
                <Input
                  id="newPw"
                  type={showNewPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && newPassword.length < 8 && (
                <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <XCircleIcon className="h-3.5 w-3.5 shrink-0" />
                  Must be at least 8 characters
                </p>
              )}
              {newPassword.length >= 8 && (
                <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0" />
                  Password strength looks good
                </p>
              )}
            </div>

            {/* Confirm new password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPw" className="text-sm font-medium">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmPw"
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <XCircleIcon className="h-3.5 w-3.5 shrink-0" />
                  Passwords do not match
                </p>
              )}
              {confirmNewPassword.length > 0 && newPassword === confirmNewPassword && newPassword.length >= 8 && (
                <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0" />
                  Passwords match
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full gap-2"
            >
              {isChangingPassword ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Changing password…
                </>
              ) : (
                "Change Password"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowPasswordDialog(false)}
              disabled={isChangingPassword}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
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
              This will permanently delete your account, all applications, and saved data. This cannot be undone.
            </p>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="deletePassword">Confirm your password</Label>
            <Input
              id="deletePassword"
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
