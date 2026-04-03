"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobForm } from "@/components/employer/JobForm";
import { useEmployerJob, useUpdateJob } from "@/hooks/useEmployerJobs";
import { useMyCompany } from "@/hooks/useCompany";
import type { JobCreateInput } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditJobPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: job, isLoading: jobLoading } = useEmployerJob(id);
  const { data: company } = useMyCompany();
  const updateJob = useUpdateJob();

  async function handleSubmit(data: JobCreateInput) {
    if (!job || !company) return;
    try {
      await updateJob.mutateAsync({
        jobId: id,
        data: {
          ...data,
          companyId: company.id,
          companyName: company.name,
          companyLogo: company.logo ?? "",
        },
      });
      toast.success("Job updated successfully!");
      router.push("/employer/jobs");
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to update job.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/employer/jobs">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Edit Job</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {job ? job.title : "Loading..."}
          </p>
        </div>
      </div>

      {jobLoading ? (
        <div className="space-y-4 rounded-xl border p-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !job ? (
        <div className="rounded-xl border p-6 text-center text-muted-foreground">
          Job not found.{" "}
          <Link href="/employer/jobs" className="text-primary hover:underline">
            Go back to jobs
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-background p-6">
          <JobForm
            initialValues={{
              title: job.title,
              category: job.category,
              jobType: job.jobType,
              experienceLevel: job.experienceLevel,
              remotePolicy: job.remotePolicy,
              city: job.location?.city,
              state: job.location?.state,
              salaryMin: job.salary?.min ? String(job.salary.min / 1_00_000) : "",
              salaryMax: job.salary?.max ? String(job.salary.max / 1_00_000) : "",
              description: job.description,
              skills: job.skills ?? [],
            }}
            onSubmit={handleSubmit}
            isLoading={updateJob.isPending}
            submitLabel="Save Changes"
          />
        </div>
      )}
    </div>
  );
}
