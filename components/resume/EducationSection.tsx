"use client";

import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, BookOpenIcon, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Education } from "@/types";

const currentYear = new Date().getFullYear();

const schema = z.object({
  degree: z.string().min(2, "Degree / qualification is required"),
  fieldOfStudy: z.string().optional(),
  institution: z.string().min(2, "Institution name is required"),
  startYear: z.number().min(1950).max(currentYear + 6).optional().nullable(),
  year: z.number().min(1950).max(currentYear + 6, "Invalid year"),
  grade: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface EducationFormProps {
  initial?: Education;
  onSave: (data: Omit<Education, "id">) => void;
  onCancel: () => void;
}

function EducationForm({ initial, onSave, onCancel }: EducationFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      degree: initial?.degree ?? "",
      fieldOfStudy: initial?.fieldOfStudy ?? "",
      institution: initial?.institution ?? "",
      startYear: initial?.startYear ?? null,
      year: initial?.year ?? currentYear,
      grade: initial?.grade ?? "",
    },
  });

  function onSubmit(data: FormData) {
    onSave({
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy ?? "",
      institution: data.institution,
      startYear: data.startYear ?? undefined,
      year: data.year,
      grade: data.grade ?? "",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Degree / Qualification *</label>
          <input {...register("degree")} placeholder="e.g. B.Tech, B.Sc, MBA"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.degree && <p className="mt-0.5 text-xs text-destructive">{errors.degree.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Field of Study</label>
          <input {...register("fieldOfStudy")} placeholder="e.g. Computer Science"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Institution *</label>
          <input {...register("institution")} placeholder="e.g. IIT Delhi"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.institution && <p className="mt-0.5 text-xs text-destructive">{errors.institution.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Start Year</label>
          <input {...register("startYear", { valueAsNumber: true })} type="number" placeholder="e.g. 2018"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Graduation Year *</label>
          <input {...register("year", { valueAsNumber: true })} type="number" placeholder={String(currentYear)}
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.year && <p className="mt-0.5 text-xs text-destructive">{errors.year.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Grade / GPA / Percentage <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <input {...register("grade")} placeholder="e.g. 8.5 CGPA · 78% · First Class"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {initial ? "Update" : "Add Education"}
        </button>
      </div>
    </form>
  );
}

interface EducationSectionProps {
  education: Education[];
  onAdd: (e: Omit<Education, "id">) => void;
  onUpdate: (id: string, e: Partial<Education>) => void;
  onRemove: (id: string) => void;
}

export function EducationSection({ education, onAdd, onUpdate, onRemove }: EducationSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {education.map((edu) => (
        <div key={edu.id}>
          {editingId === edu.id ? (
            <EducationForm
              initial={edu}
              onSave={(data) => { onUpdate(edu.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="group flex items-start gap-3 rounded-xl border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <BookOpenIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {edu.degree}{edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    {edu.startYear ? `${edu.startYear} – ` : ""}{edu.year}
                  </span>
                  {edu.grade && (
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {edu.grade}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingId(edu.id)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onRemove(edu.id)}
                  className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <EducationForm
          onSave={(data) => { onAdd(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <PlusIcon className="h-4 w-4" />
          Add Education
        </button>
      )}
    </div>
  );
}
