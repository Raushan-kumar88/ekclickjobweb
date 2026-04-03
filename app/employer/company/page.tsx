"use client";

import { useRef, useState } from "react";
import { BuildingIcon, CheckCircleIcon, GlobeIcon, MapPinIcon, UsersIcon, CameraIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { CompanyForm, type CompanyFormInitialValues } from "@/components/employer/CompanyForm";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCompany, useCreateCompany, useUpdateCompany } from "@/hooks/useCompany";
import { useAuthStore } from "@/stores/authStore";
import { uploadCompanyLogo } from "@/lib/firebase/storage";
import type { CompanyCreateInput } from "@/types";

export default function CompanyProfilePage() {
  const { isLoading: authLoading, isAuthenticated } = useAuthStore();
  const { data: company, isLoading: companyLoading } = useMyCompany();
  const isLoading = authLoading || !isAuthenticated || companyLoading;
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  const isCreating = !company;
  const isSaving = createCompany.isPending || updateCompany.isPending;

  function handleLogoSelect(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    if (isCreating) {
      // Store file and upload it right after company is created
      setPendingLogoFile(file);
    } else {
      uploadLogo(file, company!.id);
    }
  }

  async function uploadLogo(file: File, companyId: string) {
    setLogoUploading(true);
    try {
      const url = await uploadCompanyLogo(file, companyId);
      await updateCompany.mutateAsync({ companyId, data: { logo: url } });
      toast.success("Company logo uploaded!");
    } catch (err) {
      console.error(err);
      setLogoPreview(null);
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleSubmit(data: CompanyCreateInput) {
    try {
      if (isCreating) {
        const companyId = await createCompany.mutateAsync(data);
        // Upload pending logo if user picked one before saving
        if (pendingLogoFile && companyId) {
          await uploadLogo(pendingLogoFile, companyId);
          setPendingLogoFile(null);
        }
        toast.success("Company profile created!");
      } else {
        await updateCompany.mutateAsync({ companyId: company.id, data });
        toast.success("Company profile updated!");
      }
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to save company profile.");
    }
  }

  const initialValues: CompanyFormInitialValues = company
    ? {
        name: company.name,
        industry: company.industry,
        size: company.size,
        city: company.location?.city,
        state: company.location?.state,
        website: company.website,
        description: company.description,
      }
    : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BuildingIcon className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Company Profile</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4 rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-background p-6 space-y-6">
              <h2 className="font-semibold">
                {isCreating ? "Set Up Your Company" : "Edit Company Details"}
              </h2>

              {/* ── Logo Upload ── */}
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Company Logo
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
                </p>
                <div className="flex items-center gap-4">
                  {/* Avatar / preview */}
                  <div className="relative shrink-0">
                    {logoPreview || company?.logo ? (
                      <img
                        src={logoPreview ?? company!.logo}
                        alt="Company logo"
                        className="h-20 w-20 rounded-xl object-contain border bg-muted"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30">
                        <BuildingIcon className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {logoUploading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                        <LoaderIcon className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      disabled={logoUploading}
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
                    >
                      <CameraIcon className="h-4 w-4" />
                      {logoUploading
                        ? "Uploading…"
                        : logoPreview || company?.logo
                        ? "Change Logo"
                        : "Upload Logo"}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WebP — max 2 MB. Square images work best.
                    </p>
                    {isCreating && logoPreview && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Logo will be saved when you click &quot;Create Company&quot;.
                      </p>
                    )}
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLogoSelect(f);
                      e.target.value = "";
                    }}
                  />
                </div>
                <hr className="border-border" />
              </div>

              <CompanyForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                submitLabel={isCreating ? "Create Company" : "Save Changes"}
              />
            </div>
          </div>

          {/* Preview card */}
          <div className="space-y-4">
            {company && (
              <div className="rounded-xl border bg-background p-5">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Company Card Preview
                </h3>
                <div className="flex items-center gap-3">
                  <CompanyAvatar name={company.name} logoUrl={company.logo} size="lg" />
                  <div>
                    <p className="font-semibold">{company.name}</p>
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {company.location?.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPinIcon className="h-4 w-4 shrink-0" />
                      {company.location.city}, {company.location.state}
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="h-4 w-4 shrink-0" />
                      {company.size} employees
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GlobeIcon className="h-4 w-4 shrink-0" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-primary hover:underline"
                      >
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  {company.verified && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      Verified Company
                    </div>
                  )}
                </div>

                {company.description && (
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-4">
                    {company.description}
                  </p>
                )}
              </div>
            )}

            {/* Tips */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Profile Tips
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Add a company description to get 3x more applicants
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Upload your logo to build brand recognition
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Link your website for credibility
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
