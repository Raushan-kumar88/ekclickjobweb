"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  SettingsIcon,
  SaveIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  BriefcaseIcon,
  CreditCardIcon,
  WrenchIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logAdminAction } from "@/lib/admin/auditLogger";
import { useAuthStore } from "@/stores/authStore";

interface SiteSettings {
  // General
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  supportEmail: string;
  // Features
  messagingEnabled: boolean;
  companyReviewsEnabled: boolean;
  resumeBuilderEnabled: boolean;
  jobAlertsEnabled: boolean;
  maintenanceMode: boolean;
  // Jobs
  defaultJobExpiryDays: number;
  maxFreeJobsPerEmployer: number;
  requireJobApproval: boolean;
  // Subscription
  proMonthlyPrice: number;
  enterpriseMonthlyPrice: number;
  trialPeriodDays: number;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "EkClickJob",
  siteTagline: "Find Your Dream Jobs in One Click",
  contactEmail: "contact@ekclickjob.com",
  supportEmail: "support@ekclickjob.com",
  messagingEnabled: true,
  companyReviewsEnabled: true,
  resumeBuilderEnabled: true,
  jobAlertsEnabled: true,
  maintenanceMode: false,
  defaultJobExpiryDays: 30,
  maxFreeJobsPerEmployer: 2,
  requireJobApproval: false,
  proMonthlyPrice: 2999,
  enterpriseMonthlyPrice: 9999,
  trialPeriodDays: 0,
};

type SectionTab = "general" | "features" | "jobs" | "subscription";

const SECTION_TABS: { id: SectionTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "features", label: "Features", icon: ToggleRightIcon },
  { id: "jobs", label: "Jobs", icon: BriefcaseIcon },
  { id: "subscription", label: "Subscription", icon: CreditCardIcon },
];

function ToggleRow({
  label,
  description,
  value,
  onChange,
  dangerous,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  dangerous?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-background p-4">
      <div>
        <p className={cn("text-sm font-medium", dangerous && value && "text-destructive")}>{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors",
          value
            ? dangerous
              ? "bg-destructive border-destructive"
              : "bg-primary border-primary"
            : "bg-muted border-muted-foreground/30"
        )}
      >
        <div
          className={cn(
            "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            value ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user: adminUser } = useAuthStore();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionTab>("general");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "siteSettings", "main"));
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...(snap.data() as SiteSettings) });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "siteSettings", "main"), {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser?.uid,
      });
      setHasChanges(false);
      toast.success("Settings saved successfully");
      await logAdminAction({
        adminId: adminUser?.uid ?? "unknown",
        adminName: adminUser?.displayName ?? "Admin",
        adminEmail: adminUser?.email ?? "",
        action: "settings.updated",
        targetCollection: "siteSettings",
        targetId: "main",
        details: { section: activeSection },
      });
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Configure platform-wide settings
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="gap-2 shrink-0"
        >
          <SaveIcon className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 rounded-xl border bg-muted/30 p-1 overflow-x-auto">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap",
              activeSection === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeSection === "general" && (
        <div className="space-y-4">
          {[
            { label: "Site Name", key: "siteName" as const, type: "text" },
            { label: "Site Tagline", key: "siteTagline" as const, type: "text" },
            { label: "Contact Email", key: "contactEmail" as const, type: "email" },
            { label: "Support Email", key: "supportEmail" as const, type: "email" },
          ].map(({ label, key, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium">{label}</label>
              <Input
                type={type}
                value={settings[key] as string}
                onChange={(e) => update(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Features */}
      {activeSection === "features" && (
        <div className="space-y-3">
          <ToggleRow
            label="Maintenance Mode"
            description="Show maintenance page to all non-admin users"
            value={settings.maintenanceMode}
            onChange={(v) => update("maintenanceMode", v)}
            dangerous
          />
          <ToggleRow
            label="Messaging"
            description="Allow seekers and employers to message each other"
            value={settings.messagingEnabled}
            onChange={(v) => update("messagingEnabled", v)}
          />
          <ToggleRow
            label="Company Reviews"
            description="Allow seekers to write reviews for companies"
            value={settings.companyReviewsEnabled}
            onChange={(v) => update("companyReviewsEnabled", v)}
          />
          <ToggleRow
            label="Resume Builder"
            description="Allow seekers to build and download resumes"
            value={settings.resumeBuilderEnabled}
            onChange={(v) => update("resumeBuilderEnabled", v)}
          />
          <ToggleRow
            label="Job Alerts"
            description="Send email alerts for new matching jobs"
            value={settings.jobAlertsEnabled}
            onChange={(v) => update("jobAlertsEnabled", v)}
          />
        </div>
      )}

      {/* Job Settings */}
      {activeSection === "jobs" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default Job Expiry (days)</label>
            <Input
              type="number"
              min={1}
              max={365}
              value={settings.defaultJobExpiryDays}
              onChange={(e) => update("defaultJobExpiryDays", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Jobs auto-close after this many days</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Max Free Jobs per Employer</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={settings.maxFreeJobsPerEmployer}
              onChange={(e) => update("maxFreeJobsPerEmployer", Number(e.target.value))}
            />
          </div>
          <ToggleRow
            label="Require Job Approval"
            description="New job posts must be approved by admin before going live"
            value={settings.requireJobApproval}
            onChange={(v) => update("requireJobApproval", v)}
          />
        </div>
      )}

      {/* Subscription Settings */}
      {activeSection === "subscription" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Pro Plan Price (₹/month)</label>
            <Input
              type="number"
              min={0}
              value={settings.proMonthlyPrice}
              onChange={(e) => update("proMonthlyPrice", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Enterprise Plan Price (₹/month)</label>
            <Input
              type="number"
              min={0}
              value={settings.enterpriseMonthlyPrice}
              onChange={(e) => update("enterpriseMonthlyPrice", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Trial Period (days, 0 = no trial)</label>
            <Input
              type="number"
              min={0}
              max={90}
              value={settings.trialPeriodDays}
              onChange={(e) => update("trialPeriodDays", Number(e.target.value))}
            />
          </div>

          <div className="rounded-xl border bg-amber-50 dark:bg-amber-900/10 p-4 text-sm text-amber-700 dark:text-amber-400">
            <WrenchIcon className="h-4 w-4 mb-1" />
            Changing prices here updates the display only. Update Razorpay plan prices separately in your Razorpay dashboard.
          </div>
        </div>
      )}
    </div>
  );
}
