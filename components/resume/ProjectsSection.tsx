"use client";

import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, ExternalLinkIcon, CodeIcon, CalendarIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Project } from "@/types";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const schema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().min(10, "Add a brief description").max(600),
  url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  techStack: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface ProjectFormProps {
  initial?: Project;
  onSave: (data: Omit<Project, "id">) => void;
  onCancel: () => void;
}

function ProjectForm({ initial, onSave, onCancel }: ProjectFormProps) {
  const [ongoing, setOngoing] = useState(!initial?.endDate);
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      url: initial?.url ?? "",
      techStack: initial?.techStack ?? "",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
    },
  });

  function onSubmit(data: FormData) {
    onSave({
      name: data.name,
      description: data.description,
      url: data.url ?? "",
      techStack: data.techStack ?? "",
      startDate: data.startDate ?? "",
      endDate: ongoing ? null : (data.endDate ?? ""),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Project Name *</label>
          <input {...register("name")} placeholder="e.g. EkClickJob — Job Portal"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.name && <p className="mt-0.5 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Start Date</label>
          <input {...register("startDate")} placeholder="e.g. Mar 2024"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">End Date</label>
          <input {...register("endDate")} placeholder="e.g. Jun 2024" disabled={ongoing}
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40" />
          <label className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={ongoing} onChange={(e) => setOngoing(e.target.checked)} className="rounded" />
            Ongoing / maintained
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Description *</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="What does it do, what problem does it solve, what was your role?"
                className="mt-1"
                minHeight="100px"
              />
            )}
          />
          {errors.description && <p className="mt-0.5 text-xs text-destructive">{errors.description.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Tech Stack <span className="text-muted-foreground/50">(comma-separated)</span>
          </label>
          <input {...register("techStack")} placeholder="e.g. React, Next.js, Firebase, TailwindCSS"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Project / Repo URL <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <input {...register("url")} placeholder="https://github.com/you/project"
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
          {initial ? "Update" : "Add Project"}
        </button>
      </div>
    </form>
  );
}

interface ProjectsSectionProps {
  projects: Project[];
  onAdd: (p: Omit<Project, "id">) => void;
  onUpdate: (id: string, p: Partial<Project>) => void;
  onRemove: (id: string) => void;
}

export function ProjectsSection({ projects, onAdd, onUpdate, onRemove }: ProjectsSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div key={project.id}>
          {editingId === project.id ? (
            <ProjectForm
              initial={project}
              onSave={(data) => { onUpdate(project.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="group flex items-start gap-3 rounded-xl border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <CodeIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{project.name}</p>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {(project.startDate || project.endDate) && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <CalendarIcon className="h-3 w-3" />
                    {project.startDate}{project.startDate && " — "}{project.endDate ?? (project.startDate ? "Present" : "")}
                  </span>
                )}
                {project.description && (
                  <div
                    className="mt-1 text-xs text-muted-foreground line-clamp-2 rte-content"
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />
                )}
                {project.techStack && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {project.techStack.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingId(project.id)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onRemove(project.id)}
                  className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <ProjectForm
          onSave={(data) => { onAdd(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <PlusIcon className="h-4 w-4" />
          Add Project
        </button>
      )}
    </div>
  );
}
