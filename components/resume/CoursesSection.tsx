"use client";

import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, BookMarkedIcon, ExternalLinkIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Course } from "@/types";

const schema = z.object({
  name: z.string().min(3, "Course name is required"),
  institution: z.string().optional(),
  year: z.string().optional(),
  url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

interface CourseFormProps {
  initial?: Course;
  onSave: (data: Omit<Course, "id">) => void;
  onCancel: () => void;
}

function CourseForm({ initial, onSave, onCancel }: CourseFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      institution: initial?.institution ?? "",
      year: initial?.year ?? "",
      url: initial?.url ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Course / Training Name *</label>
          <input {...register("name")} placeholder="e.g. Machine Learning Specialization"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.name && <p className="mt-0.5 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Provider / Institution</label>
          <input {...register("institution")} placeholder="e.g. Coursera, Udemy, IIT"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Year Completed</label>
          <input {...register("year")} placeholder="e.g. 2024"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Certificate URL <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <input {...register("url")} placeholder="https://coursera.org/verify/..."
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.url && <p className="mt-0.5 text-xs text-destructive">{errors.url.message}</p>}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {initial ? "Update" : "Add Course"}
        </button>
      </div>
    </form>
  );
}

interface CoursesSectionProps {
  courses: Course[];
  onAdd: (c: Omit<Course, "id">) => void;
  onUpdate: (id: string, c: Partial<Course>) => void;
  onRemove: (id: string) => void;
}

export function CoursesSection({ courses, onAdd, onUpdate, onRemove }: CoursesSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <div key={course.id}>
          {editingId === course.id ? (
            <CourseForm
              initial={course}
              onSave={(data) => { onUpdate(course.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="group flex items-start gap-3 rounded-xl border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950">
                <BookMarkedIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{course.name}</p>
                  {course.url && (
                    <a href={course.url} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {course.institution}{course.year ? ` · ${course.year}` : ""}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingId(course.id)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onRemove(course.id)}
                  className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <CourseForm
          onSave={(data) => { onAdd(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <PlusIcon className="h-4 w-4" />
          Add Training / Course
        </button>
      )}
    </div>
  );
}
