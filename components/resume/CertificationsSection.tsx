"use client";

import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, AwardIcon, ExternalLinkIcon, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Certification } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Certification name is required"),
  issuer: z.string().min(2, "Issuing organization is required"),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

interface CertificationFormProps {
  initial?: Certification;
  onSave: (data: Omit<Certification, "id">) => void;
  onCancel: () => void;
}

function CertificationForm({ initial, onSave, onCancel }: CertificationFormProps) {
  const [noExpiry, setNoExpiry] = useState(!initial?.expiryDate);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      issuer: initial?.issuer ?? "",
      issueDate: initial?.issueDate ?? "",
      expiryDate: initial?.expiryDate ?? "",
      credentialId: initial?.credentialId ?? "",
      url: initial?.url ?? "",
    },
  });

  function onSubmit(data: FormData) {
    onSave({
      name: data.name,
      issuer: data.issuer,
      issueDate: data.issueDate ?? "",
      expiryDate: noExpiry ? "" : (data.expiryDate ?? ""),
      credentialId: data.credentialId ?? "",
      url: data.url ?? "",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Certification Name *</label>
          <input {...register("name")} placeholder="e.g. AWS Certified Solutions Architect"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.name && <p className="mt-0.5 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Issuing Organization *</label>
          <input {...register("issuer")} placeholder="e.g. Amazon Web Services"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          {errors.issuer && <p className="mt-0.5 text-xs text-destructive">{errors.issuer.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Issue Date</label>
          <input {...register("issueDate")} placeholder="e.g. Jan 2023"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Expiry Date</label>
          <input {...register("expiryDate")} placeholder="e.g. Jan 2026" disabled={noExpiry}
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40" />
          <label className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={noExpiry} onChange={(e) => setNoExpiry(e.target.checked)} className="rounded" />
            No expiry
          </label>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Credential ID <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <input {...register("credentialId")} placeholder="e.g. ABC123XYZ"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Credential URL <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <input {...register("url")} placeholder="https://..."
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
          {initial ? "Update" : "Add Certification"}
        </button>
      </div>
    </form>
  );
}

interface CertificationsSectionProps {
  certifications: Certification[];
  onAdd: (c: Omit<Certification, "id">) => void;
  onUpdate: (id: string, c: Partial<Certification>) => void;
  onRemove: (id: string) => void;
}

export function CertificationsSection({ certifications, onAdd, onUpdate, onRemove }: CertificationsSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {certifications.map((cert) => (
        <div key={cert.id}>
          {editingId === cert.id ? (
            <CertificationForm
              initial={cert}
              onSave={(data) => { onUpdate(cert.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="group flex items-start gap-3 rounded-xl border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
                <AwardIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{cert.name}</p>
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  {cert.issueDate && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      Issued {cert.issueDate}
                      {cert.expiryDate ? ` · Expires ${cert.expiryDate}` : " · No expiry"}
                    </span>
                  )}
                  {cert.credentialId && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      ID: {cert.credentialId}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingId(cert.id)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onRemove(cert.id)}
                  className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <CertificationForm
          onSave={(data) => { onAdd(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <PlusIcon className="h-4 w-4" />
          Add Certification
        </button>
      )}
    </div>
  );
}
