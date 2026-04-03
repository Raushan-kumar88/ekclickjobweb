import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPinIcon,
  BanknoteIcon,
  BriefcaseIcon,
  CalendarIcon,
  UsersIcon,
  BuildingIcon,
  MonitorIcon,
  GraduationCapIcon,
  TagIcon,
  ArrowLeftIcon,
  ShareIcon,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { getJob, toDisplayJob } from "@/lib/firebase/db";
import { buttonVariants } from "@/lib/utils/button-variants";
import { formatSalary, formatDate, formatLocation } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { JobDetailActions } from "@/components/jobs/JobDetailActions";
import { SimilarJobs } from "@/components/jobs/SimilarJobs";
import { SalaryInsights } from "@/components/jobs/SalaryInsights";
import { JobViewTracker } from "@/components/jobs/JobViewTracker";
import type { DisplayJob } from "@/lib/firebase/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await getJob(id);
    if (!job) return { title: "Job Not Found" };
    const display = toDisplayJob(job);
    return {
      title: `${display.title} at ${display.companyName}`,
      description: `${display.title} — ${formatLocation(display.location?.city, display.location?.state)} — ${formatSalary(display.salary?.min ?? 0, display.salary?.max ?? 0)}. Apply now on EkClickJob.`,
      openGraph: {
        title: `${display.title} at ${display.companyName}`,
        description: display.description.slice(0, 160),
        type: "website",
      },
    };
  } catch {
    return { title: "Job Details" };
  }
}

function buildJobPostingJsonLd(job: DisplayJob) {
  const employmentTypeMap: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    internship: "INTERN",
    freelance: "OTHER",
  };

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    validThrough: job.expiresAt,
    employmentType: employmentTypeMap[job.jobType] ?? "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
      logo: job.companyLogo || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location?.city,
        addressRegion: job.location?.state,
        addressCountry: "IN",
      },
    },
    ...(job.remotePolicy === "remote" && { jobLocationType: "TELECOMMUTE" }),
    baseSalary:
      job.salary?.min || job.salary?.max
        ? {
            "@type": "MonetaryAmount",
            currency: job.salary.currency || "INR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salary.min,
              maxValue: job.salary.max,
              unitText: "YEAR",
            },
          }
        : undefined,
    skills: job.skills.join(", "),
    identifier: {
      "@type": "PropertyValue",
      name: "EkClickJob",
      value: job.id,
    },
    url: `https://ekclickjob.com/jobs/${job.id}`,
  };
}

const TAG_COLORS: Record<string, string> = {
  "full-time": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "part-time": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  contract: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  internship: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  freelance: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  remote: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "on-site": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  hybrid: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  fresher: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "1-3 years": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "3-5 years": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "5-10 years": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "10+ years": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;

  let job: DisplayJob | null = null;
  try {
    const raw = await getJob(id);
    if (!raw) notFound();
    job = toDisplayJob(raw);
  } catch {
    notFound();
  }

  if (!job) notFound();

  const jsonLd = buildJobPostingJsonLd(job);
  const location = formatLocation(job.location?.city ?? "", job.location?.state);
  const salary = formatSalary(job.salary?.min ?? 0, job.salary?.max ?? 0);
  const postedDate = formatDate(job.postedAt);
  const expiresDate = formatDate(job.expiresAt);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <JobViewTracker jobId={job.id} />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/30 py-4">
          <div className="container mx-auto max-w-7xl px-4">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link href="/jobs" className="hover:text-primary">Jobs</Link>
              <span>/</span>
              <span className="truncate max-w-xs text-foreground">{job.title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* ── Left: Job Details ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Back button */}
              <Link
                href="/jobs"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 -ml-2")}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to jobs
              </Link>

              {/* Header card */}
              <div className="rounded-2xl border bg-gradient-to-br from-blue-50/40 via-background to-background p-6 dark:from-blue-950/10">
                <div className="flex items-start gap-4">
                  <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold md:text-3xl">{job.title}</h1>
                    <p className="mt-1 text-lg text-muted-foreground">{job.companyName}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {location && (
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPinIcon className="h-4 w-4 shrink-0" />
                          {location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                        <BanknoteIcon className="h-4 w-4 shrink-0" />
                        {salary}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.jobType && (
                        <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", TAG_COLORS[job.jobType])}>
                          {capitalize(job.jobType)}
                        </span>
                      )}
                      {job.remotePolicy && (
                        <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", TAG_COLORS[job.remotePolicy])}>
                          {capitalize(job.remotePolicy)}
                        </span>
                      )}
                      {job.experienceLevel && (
                        <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", TAG_COLORS[job.experienceLevel])}>
                          {capitalize(job.experienceLevel)}
                        </span>
                      )}
                      {job.isSponsored && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                          Promoted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4" />
                    Posted {postedDate}
                  </span>
                  {expiresDate && (
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4" />
                      Expires {expiresDate}
                    </span>
                  )}
                  {typeof job.applicationsCount === "number" && job.applicationsCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <UsersIcon className="h-4 w-4" />
                      {job.applicationsCount} applicant{job.applicationsCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <TagIcon className="h-4 w-4" />
                    {job.category}
                  </span>
                </div>
              </div>

              {/* Job Description */}
              <div className="rounded-2xl border bg-background p-6">
                <h2 className="mb-4 text-xl font-bold">Job Description</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {job.description}
                </div>
              </div>

              {/* Skills */}
              {job.skills.length > 0 && (
                <div className="rounded-2xl border bg-background p-6">
                  <h2 className="mb-4 text-xl font-bold">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Link
                        key={skill}
                        href={`/jobs?q=${encodeURIComponent(skill)}`}
                        className="rounded-full border bg-muted px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        {skill}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Sidebar ── */}
            <div className="space-y-4">
              {/* Apply card (client component for interactivity) */}
              <JobDetailActions job={job} />

              {/* Company info */}
              <div className="rounded-2xl border bg-background p-5">
                <h3 className="mb-4 font-semibold">About the Company</h3>
                <div className="flex items-center gap-3">
                  <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="md" />
                  <div>
                    <div className="font-medium">{job.companyName}</div>
                    <div className="text-sm text-muted-foreground">{job.category}</div>
                  </div>
                </div>
              </div>

              {/* Job overview */}
              <div className="rounded-2xl border bg-background p-5">
                <h3 className="mb-4 font-semibold">Job Overview</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <BriefcaseIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Job Type</div>
                      <div className="font-medium">{capitalize(job.jobType)}</div>
                    </div>
                  </div>
                  {location && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Location</div>
                        <div className="font-medium">{location}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MonitorIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Work Mode</div>
                      <div className="font-medium">{capitalize(job.remotePolicy)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCapIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Experience</div>
                      <div className="font-medium">{capitalize(job.experienceLevel)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BanknoteIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Salary</div>
                      <div className="font-medium text-green-600 dark:text-green-400">{salary}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Insights */}
              <SalaryInsights
                category={job.category}
                currentMin={job.salary?.min}
                currentMax={job.salary?.max}
              />

              {/* Similar Jobs */}
              <div className="rounded-2xl border bg-background p-5">
                <SimilarJobs
                  currentJobId={job.id}
                  category={job.category}
                  skills={job.skills}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
