import Link from "next/link";
import { ClockIcon, CheckCircle2Icon, CircleIcon, XCircleIcon } from "lucide-react";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/types";

const STEPS: { key: ApplicationStatus; label: string }[] = [
  { key: "applied", label: "Applied" },
  { key: "viewed", label: "Viewed" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "offered", label: "Offered" },
];

const STEP_ORDER: Record<ApplicationStatus, number> = {
  applied: 0,
  viewed: 1,
  shortlisted: 2,
  interview: 3,
  offered: 4,
  rejected: -1,
};

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const isRejected = application.status === "rejected";
  const currentIdx = STEP_ORDER[application.status] ?? 0;

  return (
    <Link
      href={`/jobs/${application.jobId}`}
      className="group block rounded-xl border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <CompanyAvatar name={application.companyName} logoUrl={application.companyLogo} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
            {application.jobTitle}
          </p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{application.companyName}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <ClockIcon className="h-3 w-3" />
            Applied {formatRelativeTime(application.appliedAt)}
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="mt-4">
        {isRejected ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/10">
            <XCircleIcon className="h-4 w-4 shrink-0 text-red-500" />
            <span className="text-xs font-medium text-red-700 dark:text-red-400">Application not selected</span>
          </div>
        ) : (
          <div className="flex items-center gap-0">
            {STEPS.map((step, idx) => {
              const done = idx <= currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full transition-all",
                        done
                          ? active
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                            : "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground/40"
                      )}
                    >
                      {done ? (
                        active ? (
                          <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                        ) : (
                          <CheckCircle2Icon className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <CircleIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-1 text-[9px] font-medium whitespace-nowrap",
                        done ? (active ? "text-primary" : "text-primary/70") : "text-muted-foreground/50"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mb-4 h-0.5 flex-1 mx-0.5 rounded-full transition-all",
                        idx < currentIdx ? "bg-primary/40" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
