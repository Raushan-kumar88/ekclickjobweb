import { Suspense } from "react";
import type { Metadata } from "next";
import { BriefcaseIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { JobsClient } from "@/components/jobs/JobsClient";
import { JobCardSkeletonGrid } from "@/components/jobs/JobCardSkeleton";
import { getAllActiveJobs, toDisplayJob } from "@/lib/firebase/db";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description:
    "Find thousands of jobs in IT, Marketing, Finance, Healthcare and more across India. Filter by location, salary, experience, and work mode.",
  openGraph: {
    title: "Browse Jobs | EkClickJob",
    description: "Find your next opportunity from thousands of verified job listings.",
  },
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    type?: string;
    exp?: string;
    remote?: string;
    fresher?: string;
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  let jobs: import("@/lib/firebase/db").DisplayJob[] = [];
  try {
    const raw = await getAllActiveJobs();
    jobs = raw.map(toDisplayJob);
  } catch {
    jobs = [];
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full">
              <div className="w-[480px] shrink-0 border-r">
                <div className="border-b px-4 py-3">
                  <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
                </div>
                <JobCardSkeletonGrid count={10} />
              </div>
              <div className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            </div>
          }
        >
          <JobsClient
            initialJobs={jobs}
            initialQuery={params.q}
            initialCategory={params.category}
            initialCity={params.city}
            initialExp={params.exp}
            initialRemote={params.remote}
            initialFresher={params.fresher === "true"}
          />
        </Suspense>
      </main>
    </div>
  );
}
