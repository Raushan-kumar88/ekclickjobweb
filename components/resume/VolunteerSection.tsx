"use client";

import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, HeartHandshakeIcon, CalendarIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { VolunteerWork } from "@/types";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const schema = z.object({
  role: z.string().min(2, "Role is required"),
  organization: z.string().min(2, "Organization is required"),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().max(400).optional(),
});
type FormData = z.infer<typeof schema>;

interface VolunteerFormProps {
  initial?: VolunteerWork;
  onSave: (data: Omit<VolunteerWork, "id">) => void;
  onCancel: () => void;
}

function VolunteerForm({ initial, onSave, onCancel }: VolunteerFormProps) {
  const [ongoing, setOngoing] = useState(!initial?.endDate);
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: initial?.role ?? "",
      organization: initial?.organization ?? "",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
      description: initial?.description ?? "",
    },
  });

  function onSubmit(data: FormData) {
    onSave({
      role: data.role,
      organization: data.organization,
      startDate: data.startDate,
      endDate: ongoing ? null : (data.endDate ?? ""),
      description: data.description ?? "",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Role *</label>
          <input {...register("role")} placeholder="e.g. Mentor, Organizer"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.role && <p className="mt-0.5 text-xs text-destructive">{errors.role.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Organization *</label>
          <input {...register("organization")} placeholder="e.g. NGO India"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.organization && <p className="mt-0.5 text-xs text-destructive">{errors.organization.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Start Date *</label>
          <input {...register("startDate")} placeholder="e.g. Jan 2022"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.startDate && <p className="mt-0.5 text-xs text-destructive">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">End Date</label>
          <input {...register("endDate")} placeholder="e.g. Dec 2023" disabled={ongoing}
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40" />
          <label className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={ongoing} onChange={(e) => setOngoing(e.target.checked)} className="rounded" />
            Still active
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Description <span className="text-muted-foreground/50">(optional)</span></label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Briefly describe your contribution…"
                className="mt-1"
                minHeight="80px"
              />
            )}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {initial ? "Update" : "Add Volunteer Work"}
        </button>
      </div>
    </form>
  );
}

interface VolunteerSectionProps {
  volunteerWork: VolunteerWork[];
  onAdd: (v: Omit<VolunteerWork, "id">) => void;
  onUpdate: (id: string, v: Partial<VolunteerWork>) => void;
  onRemove: (id: string) => void;
}

export function VolunteerSection({ volunteerWork, onAdd, onUpdate, onRemove }: VolunteerSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {volunteerWork.map((v) => (
        <div key={v.id}>
          {editingId === v.id ? (
            <VolunteerForm
              initial={v}
              onSave={(data) => { onUpdate(v.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="group flex items-start gap-3 rounded-xl border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950">
                <HeartHandshakeIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{v.role}</p>
                <p className="text-xs text-muted-foreground">{v.organization}</p>
                <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <CalendarIcon className="h-3 w-3" />
                  {v.startDate} — {v.endDate ?? "Present"}
                </span>
                {v.description && <div className="mt-1 text-xs text-muted-foreground line-clamp-2 rte-content" dangerouslySetInnerHTML={{ __html: v.description }} />}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingId(v.id)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onRemove(v.id)}
                  className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <VolunteerForm
          onSave={(data) => { onAdd(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <PlusIcon className="h-4 w-4" />
          Add Volunteer Work
        </button>
      )}
    </div>
  );
}
