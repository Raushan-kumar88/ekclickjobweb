"use client";

import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, TrophyIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Achievement } from "@/types";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const schema = z.object({
  title: z.string().min(3, "Achievement title is required"),
  metric: z.string().optional(),
  description: z.string().min(10, "Add a brief description").max(400),
});
type FormData = z.infer<typeof schema>;

interface AchievementFormProps {
  initial?: Achievement;
  onSave: (data: Omit<Achievement, "id">) => void;
  onCancel: () => void;
}

function AchievementForm({ initial, onSave, onCancel }: AchievementFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      metric: initial?.metric ?? "",
      description: initial?.description ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Achievement Title *</label>
          <input {...register("title")} placeholder="e.g. Led revenue growth initiative"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.title && <p className="mt-0.5 text-xs text-destructive">{errors.title.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Key Metric / Result <span className="text-muted-foreground/50">(optional — makes it stand out)</span>
          </label>
          <input {...register("metric")} placeholder="e.g. 40% increase in sales · $2M saved · 3× faster"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
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
                placeholder="Explain the challenge, your action, and the result…"
                className="mt-1"
                minHeight="90px"
              />
            )}
          />
          {errors.description && <p className="mt-0.5 text-xs text-destructive">{errors.description.message}</p>}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {initial ? "Update" : "Add Achievement"}
        </button>
      </div>
    </form>
  );
}

interface AchievementsSectionProps {
  achievements: Achievement[];
  onAdd: (a: Omit<Achievement, "id">) => void;
  onUpdate: (id: string, a: Partial<Achievement>) => void;
  onRemove: (id: string) => void;
}

export function AchievementsSection({ achievements, onAdd, onUpdate, onRemove }: AchievementsSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Highlight 3–5 career-defining wins with measurable results. These appear prominently in the Executive template.
      </p>
      {achievements.map((a) => (
        <div key={a.id}>
          {editingId === a.id ? (
            <AchievementForm
              initial={a}
              onSave={(data) => { onUpdate(a.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="group flex items-start gap-3 rounded-xl border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
                <TrophyIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{a.title}</p>
                  {a.metric && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {a.metric}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2 rte-content" dangerouslySetInnerHTML={{ __html: a.description }} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingId(a.id)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onRemove(a.id)}
                  className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <AchievementForm
          onSave={(data) => { onAdd(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <PlusIcon className="h-4 w-4" />
          Add Achievement
        </button>
      )}
    </div>
  );
}
