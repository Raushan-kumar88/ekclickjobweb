"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  SendIcon, FileTextIcon, LinkIcon, CheckCircleIcon,
  UploadCloudIcon, XIcon, Loader2Icon, ZapIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { useApplyToJob } from "@/hooks/useApplications";
import { useAuthStore } from "@/stores/authStore";
import { uploadResume } from "@/lib/firebase/storage";
import { updateUserProfile, getUserProfile } from "@/lib/firebase/db";
import { cn } from "@/lib/utils";
import type { DisplayJob } from "@/lib/firebase/db";

type ResumeMode = "saved" | "upload" | "url";

const applySchema = z.object({
  coverLetter: z.string().max(2000, "Cover letter must be under 2000 characters").optional(),
  resumeURL: z.string().optional(),
});
type ApplyFormData = z.infer<typeof applySchema>;

interface ApplyModalProps {
  job: DisplayJob;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyModal({ job, open, onOpenChange }: ApplyModalProps) {
  const { user } = useAuthStore();
  const applyMutation = useApplyToJob();
  const [submitted, setSubmitted] = useState(false);

  // Always fetch fresh profile from Firestore so resumeURL reflects recent uploads
  const { data: freshProfile } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user?.uid && open,
    staleTime: 0, // always re-fetch when modal opens
  });
  const savedResumeURL: string = (freshProfile?.profile?.resumeURL as string | undefined) ?? "";
  // Start on "saved" tab; switch to "upload" if no saved resume once profile loads
  const [mode, setMode] = useState<ResumeMode>("saved");
  const [quickApplied, setQuickApplied] = useState(false);
  const [isQuickApplying, setIsQuickApplying] = useState(false);
  useEffect(() => {
    if (freshProfile !== undefined && !savedResumeURL) {
      setMode("upload");
    }
  }, [freshProfile, savedResumeURL]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedURL, setUploadedURL] = useState("");
  const [manualURL, setManualURL] = useState("");
  const [urlError, setUrlError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
  });

  // ── Resolve the resume URL to submit ──────────────────────────────────────
  function getResolvedURL(): string {
    if (mode === "saved") return savedResumeURL;
    if (mode === "upload") return uploadedURL;
    return manualURL.trim();
  }

  function validateResumeURL(): boolean {
    const url = getResolvedURL();
    if (!url) {
      setUrlError(
        mode === "saved"
          ? "No saved resume found. Please upload a file or paste a URL."
          : mode === "upload"
          ? "Please upload a file first."
          : "Please enter a resume URL."
      );
      return false;
    }
    if (mode === "url") {
      try { new URL(url); } catch {
        setUrlError("Please enter a valid URL (e.g. Google Drive link, LinkedIn).");
        return false;
      }
    }
    setUrlError("");
    return true;
  }

  // ── File picker & upload ──────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("File too large. Max 5 MB."); return; }
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type)) { toast.error("Only PDF or Word files are accepted."); return; }
    setFile(f);
    setUploadedURL("");
    setUploadProgress(0);
  }

  async function handleUpload() {
    if (!file || !user?.uid) return;
    setIsUploading(true);
    try {
      const { downloadURL } = await uploadResume(file, user.uid, setUploadProgress);
      setUploadedURL(downloadURL);
      // Optionally persist to user profile so it's pre-filled next time
      await updateUserProfile(user.uid, {
        "profile.resumeURL": downloadURL,
        "profile.resumeFileName": file.name,
      });
      toast.success("Resume uploaded!");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  // ── Submit application ────────────────────────────────────────────────────
  async function onSubmit(data: ApplyFormData) {
    if (!validateResumeURL()) return;
    const resumeURL = getResolvedURL();
    try {
      await applyMutation.mutateAsync({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        companyLogo: job.companyLogo ?? "",
        employerId: job.postedBy,
        resumeURL,
        coverLetter: data.coverLetter ?? "",
      });
      setSubmitted(true);
      toast.success("Application submitted!");
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
  }

  async function handleQuickApply() {
    if (!savedResumeURL) return;
    setIsQuickApplying(true);
    try {
      await applyMutation.mutateAsync({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        companyLogo: job.companyLogo ?? "",
        employerId: job.postedBy,
        resumeURL: savedResumeURL,
        coverLetter: "",
      });
      setQuickApplied(true);
      setSubmitted(true);
      toast.success("⚡ Applied instantly!");
    } catch {
      toast.error("Quick apply failed. Please try the full form.");
    } finally {
      setIsQuickApplying(false);
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      reset();
      setSubmitted(false);
      setQuickApplied(false);
      setIsQuickApplying(false);
      setFile(null);
      setUploadedURL("");
      setUploadProgress(0);
      setManualURL("");
      setUrlError("");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Application Submitted!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your application for{" "}
                <span className="font-medium text-foreground">{job.title}</span> at{" "}
                <span className="font-medium text-foreground">{job.companyName}</span> has been sent.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Track your status in the Applications section.</p>
            <Button onClick={() => handleClose(false)} className="mt-2 w-full">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <div className="flex items-center gap-3 pb-1">
                <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="md" />
                <div className="min-w-0">
                  <DialogTitle className="text-base leading-tight">{job.title}</DialogTitle>
                  <DialogDescription className="text-sm">{job.companyName}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* ── Quick Apply banner (when saved resume exists) ── */}
            {savedResumeURL && freshProfile !== undefined && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ZapIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Quick Apply available</p>
                      <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 truncate">
                        {(freshProfile?.profile?.resumeFileName as string | undefined) || "Saved resume"} · No cover letter needed
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs"
                    onClick={handleQuickApply}
                    disabled={isQuickApplying || isSubmitting}
                  >
                    {isQuickApplying ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <ZapIcon className="h-3.5 w-3.5" />}
                    {isQuickApplying ? "Applying…" : "Apply Instantly"}
                  </Button>
                </div>
                <p className="mt-2 text-center text-[10px] text-emerald-600/60 dark:text-emerald-400/50">
                  Or fill the form below to add a cover letter
                </p>
              </div>
            )}

            <div className="mt-4 space-y-4">
              {/* ── Resume section ── */}
              <div>
                <Label className="mb-2 flex items-center gap-1.5">
                  <FileTextIcon className="h-3.5 w-3.5" />
                  Resume / CV <span className="text-destructive">*</span>
                </Label>

                {/* Mode tabs */}
                <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl border bg-muted/30 p-1">
                  {(["saved", "upload", "url"] as ResumeMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMode(m); setUrlError(""); }}
                      className={cn(
                        "rounded-lg py-1.5 text-xs font-medium transition-colors capitalize",
                        mode === m ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m === "saved" ? "Saved Resume" : m === "upload" ? "Upload File" : "Paste URL"}
                    </button>
                  ))}
                </div>

                {/* Saved resume */}
                {mode === "saved" && (
                  freshProfile === undefined ? (
                    /* Loading skeleton while Firestore fetches */
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3 animate-pulse">
                      <div className="h-9 w-9 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-32 rounded bg-muted" />
                        <div className="h-2.5 w-24 rounded bg-muted" />
                      </div>
                    </div>
                  ) : savedResumeURL ? (
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileTextIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {(freshProfile?.profile?.resumeFileName as string | undefined) || "Saved Resume"}
                        </p>
                        <a href={savedResumeURL} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block">
                          View / Download →
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        No saved resume found.{" "}
                        <button type="button" onClick={() => setMode("upload")} className="text-primary hover:underline">
                          Upload one
                        </button>{" "}
                        or{" "}
                        <button type="button" onClick={() => setMode("url")} className="text-primary hover:underline">
                          paste a URL
                        </button>.
                      </p>
                    </div>
                  )
                )}

                {/* Upload file */}
                {mode === "upload" && (
                  <div>
                    {!file ? (
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 hover:border-primary hover:bg-muted/30 transition-colors"
                      >
                        <UploadCloudIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to select your resume</p>
                        <p className="text-xs text-muted-foreground">PDF or Word · max 5 MB</p>
                        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                      </div>
                    ) : (
                      <div className="rounded-xl border bg-muted/30 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <FileTextIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                          </div>
                          {!uploadedURL && (
                            <button type="button" onClick={() => { setFile(null); setUploadProgress(0); }}
                              className="rounded-lg p-1 hover:bg-muted/50 transition-colors">
                              <XIcon className="h-4 w-4 text-muted-foreground" />
                            </button>
                          )}
                          {uploadedURL && (
                            <span className="text-xs font-medium text-green-600">✓ Uploaded</span>
                          )}
                        </div>

                        {/* Upload progress */}
                        {isUploading && (
                          <div className="mt-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full bg-primary transition-all duration-300 rounded-full"
                                style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{uploadProgress}%</p>
                          </div>
                        )}

                        {!uploadedURL && !isUploading && (
                          <Button type="button" size="sm" className="mt-2 w-full gap-1.5" onClick={handleUpload}>
                            <UploadCloudIcon className="h-3.5 w-3.5" />
                            Upload Resume
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Paste URL */}
                {mode === "url" && (
                  <div>
                    <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30">
                      <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <input
                        type="url"
                        value={manualURL}
                        onChange={(e) => { setManualURL(e.target.value); setUrlError(""); }}
                        placeholder="https://linkedin.com/in/yourname or Google Drive link"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Paste your LinkedIn profile, Google Drive, or any publicly accessible resume link.
                    </p>
                  </div>
                )}

                {urlError && (
                  <p className="mt-1.5 text-xs text-destructive">{urlError}</p>
                )}
              </div>

              {/* Cover letter */}
              <div className="space-y-2">
                <Label htmlFor="coverLetter" className="flex items-center gap-1.5">
                  <FileTextIcon className="h-3.5 w-3.5" />
                  Cover Letter{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Tell the employer why you're a great fit for this role..."
                  rows={4}
                  {...register("coverLetter")}
                  className={errors.coverLetter ? "border-destructive" : ""}
                />
                {errors.coverLetter && (
                  <p className="text-xs text-destructive">{errors.coverLetter.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-2" showCloseButton>
              <Button type="submit" disabled={isSubmitting || isUploading} className="gap-2">
                {isSubmitting ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                {isSubmitting ? "Submitting…" : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
