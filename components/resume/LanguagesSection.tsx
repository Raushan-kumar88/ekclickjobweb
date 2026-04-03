"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, GlobeIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

const PROFICIENCY_LEVELS: Language["proficiency"][] = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];

const PROFICIENCY_COLORS: Record<Language["proficiency"], string> = {
  Native:       "bg-primary text-primary-foreground",
  Fluent:       "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  Advanced:     "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  Intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  Basic:        "bg-muted text-muted-foreground",
};

const PROFICIENCY_BARS: Record<Language["proficiency"], number> = {
  Native: 5, Fluent: 4, Advanced: 3, Intermediate: 2, Basic: 1,
};

const schema = z.object({
  name: z.string().min(2, "Language name is required"),
  proficiency: z.enum(["Native", "Fluent", "Advanced", "Intermediate", "Basic"]),
});
type FormData = z.infer<typeof schema>;

interface LanguageFormProps {
  onSave: (data: Omit<Language, "id">) => void;
  onCancel: () => void;
}

function LanguageForm({ onSave, onCancel }: LanguageFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", proficiency: "Fluent" },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex items-end gap-3 rounded-xl border bg-muted/30 p-3">
      <div className="flex-1">
        <label className="text-xs font-medium text-muted-foreground">Language *</label>
        <input {...register("name")} placeholder="e.g. English, Hindi, French"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        {errors.name && <p className="mt-0.5 text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="flex-1">
        <label className="text-xs font-medium text-muted-foreground">Proficiency *</label>
        <select {...register("proficiency")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
          {PROFICIENCY_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pb-0.5">
        <button type="button" onClick={onCancel}
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Add
        </button>
      </div>
    </form>
  );
}

interface LanguagesSectionProps {
  languages: Language[];
  onAdd: (l: Omit<Language, "id">) => void;
  onRemove: (id: string) => void;
}

export function LanguagesSection({ languages, onAdd, onRemove }: LanguagesSectionProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-3">
      {languages.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {languages.map((lang) => (
            <div key={lang.id}
              className="group flex items-center gap-3 rounded-xl border bg-card p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <GlobeIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{lang.name}</p>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      i < PROFICIENCY_BARS[lang.proficiency] ? "bg-primary" : "bg-muted"
                    )} />
                  ))}
                </div>
              </div>
              <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", PROFICIENCY_COLORS[lang.proficiency])}>
                {lang.proficiency}
              </span>
              <button
                onClick={() => onRemove(lang.id)}
                className="rounded-lg p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive">
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <LanguageForm
          onSave={(data) => { onAdd(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <PlusIcon className="h-4 w-4" />
          Add Language
        </button>
      )}

      {languages.length === 0 && !adding && (
        <p className="text-center text-xs text-muted-foreground">
          Add languages you speak — especially useful for multilingual roles.
        </p>
      )}
    </div>
  );
}
