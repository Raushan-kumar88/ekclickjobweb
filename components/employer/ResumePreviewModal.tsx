"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ExternalLinkIcon,
  MonitorPlayIcon,
  FileTextIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeUrl: string;
  applicantName: string;
}

function gviewUrl(url: string) {
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
}

/**
 * Append PDF open-parameters so Chrome's embedded viewer:
 *  - hides the left nav thumbnail panel (navpanes=0)
 *  - hides the top PDF toolbar (toolbar=0)
 *  - scales the page to fit the full height without scrolling (view=Fit)
 * Only applied when the URL appears to be a PDF. The hash is ignored for gview.
 */
function withPdfParams(url: string): string {
  const looksLikePdf =
    /\.pdf(\?|$|#)/i.test(url) ||
    url.toLowerCase().includes("%2fpdf") ||
    url.toLowerCase().includes("/pdf");
  if (!looksLikePdf) return url;
  // Strip any existing hash before appending ours
  const base = url.includes("#") ? url.split("#")[0] : url;
  // zoom=75 → readable text + full single-page resume visible without scrolling on most screens
  return `${base}#toolbar=0&navpanes=0&zoom=75`;
}

export function ResumePreviewModal({
  open,
  onOpenChange,
  resumeUrl,
  applicantName,
}: ResumePreviewModalProps) {
  const [mode, setMode] = useState<"direct" | "gview">("direct");

  useEffect(() => {
    if (!open) setMode("direct");
  }, [open]);

  const iframeSrc =
    mode === "direct" ? withPdfParams(resumeUrl) : gviewUrl(resumeUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          /* Dialog default includes sm:max-w-sm — must override every bp or modal stays ~384px wide */
          "!fixed !inset-2 !z-50 !max-w-none sm:!max-w-none md:!max-w-none lg:!max-w-none xl:!max-w-none",
          "!left-2 !right-2 !top-2 !bottom-2 !h-auto !w-auto !min-w-0",
          "!translate-x-0 !translate-y-0",
          "flex flex-col gap-0 overflow-hidden rounded-xl border bg-background p-0 shadow-2xl",
          "sm:!inset-3 sm:!left-3 sm:!right-3 sm:!top-3 sm:!bottom-3",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        )}
      >
        {/* Slim toolbar — same usable area as browser chrome + PDF, like a new tab */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/80 bg-muted/40 px-2 sm:h-11 sm:px-3">
          <FileTextIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold sm:text-base">
              {applicantName}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full-screen resume preview. Same view as opening the file in a new tab.
            </DialogDescription>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "h-8 gap-1 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
              )}
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" />
              <span className="ml-1 hidden sm:inline">New tab</span>
            </a>
            {mode === "direct" ? (
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="h-8 gap-1 px-2 text-xs sm:h-9 sm:px-2.5 sm:text-sm"
                onClick={() => setMode("gview")}
              >
                <MonitorPlayIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Alt viewer</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="h-8 gap-1 px-2 text-xs sm:h-9"
                onClick={() => setMode("direct")}
              >
                <FileTextIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Direct</span>
              </Button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-9 sm:w-9"
              aria-label="Close preview"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Full width + height of modal; PDF viewer fills frame */}
        <div className="relative min-h-0 min-w-0 flex-1 bg-[#525659] dark:bg-[#2d2d2d]">
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title={`Resume — ${applicantName}`}
            className="absolute inset-0 box-border h-full min-h-0 w-full min-w-0 border-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
