"use client";

import Link from "next/link";
import {
  ZapIcon,
  UsersIcon,
  BuildingIcon,
  SearchIcon,
  BookmarkIcon,
  FileTextIcon,
  BriefcaseIcon,
  BarChartIcon,
  PlusCircleIcon,
  UserCheckIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/utils/button-variants";

const SEEKER_ACTIONS = [
  { icon: SearchIcon, title: "Browse Jobs", desc: "Explore thousands of opportunities", href: "/jobs", color: "from-blue-500 to-blue-600" },
  { icon: BookmarkIcon, title: "Saved Jobs", desc: "Review your bookmarked roles", href: "/seeker/saved-jobs", color: "from-violet-500 to-violet-600" },
  { icon: FileTextIcon, title: "My Applications", desc: "Track your application status", href: "/seeker/applications", color: "from-emerald-500 to-emerald-600" },
  { icon: FileTextIcon, title: "Resume Builder", desc: "Craft a standout resume", href: "/seeker/resume", color: "from-amber-500 to-amber-600" },
];

const EMPLOYER_ACTIONS = [
  { icon: PlusCircleIcon, title: "Post a Job", desc: "Create a new job listing", href: "/employer/jobs/new", color: "from-blue-500 to-blue-600" },
  { icon: UserCheckIcon, title: "Candidates", desc: "Browse potential hires", href: "/employer/candidates", color: "from-emerald-500 to-emerald-600" },
  { icon: BriefcaseIcon, title: "My Jobs", desc: "Manage your job postings", href: "/employer/jobs", color: "from-violet-500 to-violet-600" },
  { icon: BarChartIcon, title: "Analytics", desc: "View hiring performance", href: "/employer/analytics", color: "from-amber-500 to-amber-600" },
];

export function CTASection() {
  const { isAuthenticated, isLoading, user, role } = useAuthStore();

  if (isLoading) return null;

  if (isAuthenticated && user) {
    const firstName = user.displayName?.split(" ")[0] || "there";
    const isEmployer = role === "employer";
    const actions = isEmployer ? EMPLOYER_ACTIONS : SEEKER_ACTIONS;
    const dashboardHref = isEmployer ? "/employer/dashboard" : "/seeker/dashboard";

    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="rounded-3xl border bg-gradient-to-br from-blue-50 via-background to-sky-50/50 p-8 md:p-12 dark:from-blue-950/20 dark:via-card dark:to-sky-950/10">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">
                  Welcome back, {firstName}!
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {isEmployer
                    ? "Manage your hiring pipeline and find top talent."
                    : "Continue your job search and land your dream role."}
                </p>
              </div>
              <Link
                href={dashboardHref}
                className={cn(buttonVariants(), "shrink-0 gap-2 rounded-xl shadow-lg shadow-primary/20")}
              >
                Go to Dashboard
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {actions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", action.color)}>
                    <action.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors">{action.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 text-white dark:from-blue-700 dark:via-blue-800 dark:to-blue-900">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="container relative mx-auto max-w-4xl px-4 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
          <ZapIcon className="h-3.5 w-3.5" />
          Join 50,000+ professionals
        </div>
        <h2 className="text-3xl font-bold md:text-5xl">Ready to Take the Next Step?</h2>
        <p className="mx-auto mt-4 max-w-xl text-blue-100/80 text-lg">
          Join thousands of professionals and companies already using
          EkClickJob to hire and get hired.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register?role=seeker"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/30 transition-all hover:bg-blue-50 hover:shadow-xl"
          >
            <UsersIcon className="h-4 w-4" />
            I&apos;m a Job Seeker
          </Link>
          <Link
            href="/register?role=employer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
          >
            <BuildingIcon className="h-4 w-4" />
            I&apos;m an Employer
          </Link>
        </div>
      </div>
    </section>
  );
}
