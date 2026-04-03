"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDUSTRIES, COMPANY_SIZES, CITIES, STATES } from "@/lib/utils/constants";
import type { CompanyCreateInput, CompanySize } from "@/types";

const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Industry is required"),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"] as const),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  website: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.startsWith("http://") || v.startsWith("https://"),
      "Website must start with http:// or https://"
    ),
  description: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export interface CompanyFormInitialValues {
  name?: string;
  industry?: string;
  size?: CompanySize;
  city?: string;
  state?: string;
  website?: string;
  description?: string;
  tagline?: string;
  culture?: string;
  benefits?: string[];
  techStack?: string[];
  linkedinUrl?: string;
  twitterUrl?: string;
}

interface CompanyFormProps {
  initialValues?: CompanyFormInitialValues;
  onSubmit: (data: CompanyCreateInput) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CompanyForm({
  initialValues = {},
  onSubmit,
  isLoading,
  submitLabel = "Save Company",
}: CompanyFormProps) {
  const [benefits, setBenefits] = useState<string[]>(initialValues.benefits ?? []);
  const [benefitInput, setBenefitInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>(initialValues.techStack ?? []);
  const [techInput, setTechInput] = useState("");

  function addTag(input: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) {
    const t = input.trim();
    if (!t || list.includes(t)) { setInput(""); return; }
    setList([...list, t]);
    setInput("");
  }
  function removeTag(val: string, list: string[], setList: (v: string[]) => void) {
    setList(list.filter((x) => x !== val));
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialValues.name ?? "",
      industry: initialValues.industry ?? "",
      size: (initialValues.size as CompanySize) ?? "1-10",
      city: initialValues.city ?? "",
      state: initialValues.state ?? "",
      website: initialValues.website ?? "",
      description: initialValues.description ?? "",
    },
  });

  async function onFormSubmit(data: CompanyFormData) {
    const payload: CompanyCreateInput = {
      name: data.name.trim(),
      industry: data.industry,
      size: data.size as CompanySize,
      location: { city: data.city, state: data.state },
      website: data.website?.trim() || null,
      description: data.description?.trim() || null,
      benefits: benefits.length ? benefits : null,
      techStack: techStack.length ? techStack : null,
    };
    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Company Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Company Name <span className="text-destructive">*</span></Label>
        <Input id="name" placeholder="Acme Pvt. Ltd." {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Industry + Size */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Industry <span className="text-destructive">*</span></Label>
          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.industry && <p className="text-xs text-destructive">{errors.industry.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Company Size <span className="text-destructive">*</span></Label>
          <Controller
            name="size"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* City + State */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>City <span className="text-destructive">*</span></Label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>State <span className="text-destructive">*</span></Label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
        </div>
      </div>

      {/* Website */}
      <div className="space-y-1.5">
        <Label htmlFor="website">Website <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
        <Input id="website" placeholder="https://yourcompany.com" {...register("website")} />
        {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">About the Company <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
        <Textarea
          id="description"
          placeholder="Tell job seekers about your company, culture, and what makes you great..."
          rows={4}
          {...register("description")}
        />
      </div>

      {/* Benefits / Perks */}
      <div className="space-y-2">
        <Label>Benefits & Perks <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Health Insurance, Remote Work, Stock Options"
            value={benefitInput}
            onChange={(e) => setBenefitInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(benefitInput, benefits, setBenefits, setBenefitInput); }}}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => addTag(benefitInput, benefits, setBenefits, setBenefitInput)}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        {benefits.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {benefits.map((b) => (
              <span key={b} className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {b}
                <button type="button" onClick={() => removeTag(b, benefits, setBenefits)}>
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label>Tech Stack <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. React, Node.js, PostgreSQL, AWS"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(techInput, techStack, setTechStack, setTechInput); }}}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => addTag(techInput, techStack, setTechStack, setTechInput)}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techStack.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {t}
                <button type="button" onClick={() => removeTag(t, techStack, setTechStack)}>
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
