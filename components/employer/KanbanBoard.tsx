"use client";

import { useState } from "react";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { useUpdateApplicationStatus } from "@/hooks/useApplications";
import { toast } from "sonner";
import type { Application, ApplicationStatus } from "@/types";

const COLUMNS: { status: ApplicationStatus; label: string; color: string; headerColor: string }[] = [
  { status: "applied", label: "Applied", color: "border-blue-200 dark:border-blue-800", headerColor: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" },
  { status: "viewed", label: "Viewed", color: "border-slate-200 dark:border-slate-700", headerColor: "bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300" },
  { status: "shortlisted", label: "Shortlisted", color: "border-amber-200 dark:border-amber-800", headerColor: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300" },
  { status: "interview", label: "Interview", color: "border-cyan-200 dark:border-cyan-800", headerColor: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300" },
  { status: "offered", label: "Offered", color: "border-emerald-200 dark:border-emerald-800", headerColor: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" },
  { status: "rejected", label: "Rejected", color: "border-rose-200 dark:border-rose-800", headerColor: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300" },
];

interface KanbanCardProps {
  application: Application;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function KanbanCard({ application, onDragStart, onDragEnd }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab rounded-xl border bg-card p-3 shadow-sm hover:shadow-md transition-all active:cursor-grabbing active:opacity-70 active:scale-95"
    >
      <div className="flex items-start gap-2.5">
        <CompanyAvatar name={application.applicantName} logoUrl={null} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{application.applicantName}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{application.jobTitle}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Applied {formatRelativeTime(application.appliedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  applications: Application[];
}

export function KanbanBoard({ applications }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ApplicationStatus | null>(null);
  const updateStatus = useUpdateApplicationStatus();

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.status] = applications.filter((a) => a.status === col.status);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  async function handleDrop(status: ApplicationStatus) {
    if (!draggingId) return;
    const app = applications.find((a) => a.id === draggingId);
    if (!app || app.status === status) return;

    try {
      await updateStatus.mutateAsync({ applicationId: draggingId, status });
      toast.success(`Moved ${app.applicantName} to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
    setDraggingId(null);
    setDragOverCol(null);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <div
          key={col.status}
          className={cn(
            "flex w-52 shrink-0 flex-col rounded-2xl border-2 transition-all",
            col.color,
            dragOverCol === col.status ? "ring-2 ring-primary scale-[1.02]" : ""
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.status); }}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={() => handleDrop(col.status)}
        >
          {/* Column header */}
          <div className={cn("flex items-center justify-between rounded-t-xl px-3 py-2", col.headerColor)}>
            <span className="text-xs font-bold uppercase tracking-wide">{col.label}</span>
            <span className="rounded-full bg-current/10 px-2 py-0.5 text-[10px] font-bold">
              {grouped[col.status]?.length ?? 0}
            </span>
          </div>

          {/* Cards */}
          <div className="min-h-24 space-y-2 p-2">
            {(grouped[col.status] ?? []).map((app) => (
              <KanbanCard
                key={app.id}
                application={app}
                onDragStart={() => setDraggingId(app.id)}
                onDragEnd={() => { setDraggingId(null); setDragOverCol(null); }}
              />
            ))}
            {(grouped[col.status] ?? []).length === 0 && (
              <div className={cn(
                "flex h-16 items-center justify-center rounded-lg border-2 border-dashed text-xs text-muted-foreground/50 transition-all",
                dragOverCol === col.status ? "border-primary/50 bg-primary/5 text-primary" : ""
              )}>
                Drop here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
