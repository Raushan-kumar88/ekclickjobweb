"use client";

import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, BuildingIcon, MapPinIcon, CalendarIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import type { WorkExperience } from "@/types";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Self-employed"];

const schema = z.object({
  title: z.string().min(2, "Job title is required"),
  company: z.string().min(2, "Company name is required"),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().nullable().optional(),
  description: z.string().max(1000).optional(),
});
type FormData = z.infer<typeof schema>;

interface ExperienceFormProps {
  initial?: WorkExperience;
  onSave: (data: Omit<WorkExperience, "id">) => void;
  onCancel: () => void;
}

function ExperienceForm({ initial, onSave, onCancel }: ExperienceFormProps) {
  const [currentJob, setCurrentJob] = useState(!initial?.endDate);
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      title: initial?.title ?? "",
      company: initial?.company ?? "",
      location: initial?.location ?? "",
      employmentType: initial?.employmentType ?? "",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
      description: initial?.description ?? "",
    },
  });

  function onSubmit(data: FormData) {
    onSave({
      title: data.title,
      company: data.company,
      location: data.location ?? "",
      employmentType: (data.employmentType ?? "") as WorkExperience["employmentType"],
      startDate: data.startDate,
      endDate: currentJob ? null : (data.endDate ?? null),
      description: data.description ?? "",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Job Title *</label>
          <input {...register("title")} placeholder="e.g. Software Engineer"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.title && <p className="mt-0.5 text-xs text-destructive">{errors.title.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Company *</label>
          <input {...register("company")} placeholder="e.g. Google"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.company && <p className="mt-0.5 text-xs text-destructive">{errors.company.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Employment Type</label>
          <select {...register("employmentType")}
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Select type</option>
            {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Location</label>
          <input {...register("location")} placeholder="e.g. Bangalore, India · Remote"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Start Date *</label>
          <input {...register("startDate")} placeholder="e.g. Jan 2022"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.startDate && <p className="mt-0.5 text-xs text-destructive">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">End Date</label>
          <input {...register("endDate")} placeholder="e.g. Dec 2023" disabled={currentJob}
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40" />
          <label className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={currentJob} onChange={(e) => setCurrentJob(e.target.checked)} className="rounded" />
            Currently working here
          </label>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Key Responsibilities & Achievements
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="• Led migration to microservices, reducing deploy time by 40%&#10;• Mentored 3 junior engineers&#10;• Built real-time dashboard used by 200k+ users"
              className="mt-1"
              minHeight="130px"
            />
          )}
        />
        {errors.description && <p className="mt-0.5 text-xs text-destructive">{errors.description.message}</p>}
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {initial ? "Update" : "Add Experience"}
        </button>
      </div>
    </form>
  );
}

interface ExperienceSectionProps {
  experience: WorkExperience[];
  onAdd: (e: Omit<WorkExperience, "id">) => void;
  onUpdate: (id: string, e: Partial<WorkExperience>) => void;
  onRemove: (id: string) => void;
  onReorder?: (fromIdx: number, toIdx: number) => void;
}

export function ExperienceSection({ experience, onAdd, onUpdate, onRemove, onReorder }: ExperienceSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {experience.map((exp, idx) => (
        <div key={exp.id}>
          {editingId === exp.id ? (
            <ExperienceForm
              initial={exp}
              onSave={(data) => { onUpdate(exp.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="group flex items-start gap-3 rounded-xl border bg-card p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{exp.title}</p>
                  {exp.employmentType && (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {exp.employmentType}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  {exp.company && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BuildingIcon className="h-3 w-3" />{exp.company}
                    </span>
                  )}
                  {exp.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPinIcon className="h-3 w-3" />{exp.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    {exp.startDate} — {exp.endDate ?? "Present"}
                  </span>
                </div>
                {exp.description && (
                  <div
                    className="mt-1.5 text-xs text-muted-foreground line-clamp-2 rte-content"
                    dangerouslySetInnerHTML={{ __html: exp.description }}
                  />
                )}
              </div>
              <div className={cn("flex gap-1", onReorder ? "flex-col" : "flex-row", "opacity-0 group-hover:opacity-100 transition-opacity")}>
                {onReorder && (
                  <>
                    <button onClick={() => onReorder(idx, idx - 1)} disabled={idx === 0}
                      className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-20">
                      <ChevronUpIcon className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onReorder(idx, idx + 1)} disabled={idx === experience.length - 1}
                      className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-20">
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <button onClick={() => setEditingId(exp.id)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onRemove(exp.id)}
                  className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <ExperienceForm
          onSave={(data) => { onAdd(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <PlusIcon className="h-4 w-4" />
          Add Experience
        </button>
      )}
    </div>
  );
}
