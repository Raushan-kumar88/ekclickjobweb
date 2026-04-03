import Link from "next/link";
import {
  BriefcaseIcon,
  SearchIcon,
  BuildingIcon,
  UsersIcon,
  MonitorIcon,
  TrendingUpIcon,
  HeartIcon,
  GraduationCapIcon,
  CodeIcon,
  PaletteIcon,
  DatabaseIcon,
  PenSquareIcon,
  ShieldIcon,
  BarChartIcon,
  HeadphonesIcon,
  SettingsIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  SparklesIcon,
  GlobeIcon,
  MapPinIcon,
  ZapIcon,
  ChevronDownIcon,
  TrendingDownIcon,
  AwardIcon,
  RocketIcon,
  UserIcon,
} from "lucide-react";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JOB_CATEGORIES } from "@/lib/utils/constants";
import { FeaturedJobs } from "@/components/jobs/FeaturedJobs";
import { CTASection } from "@/components/landing/CTASection";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "IT & Software": CodeIcon,
  Marketing: TrendingUpIcon,
  Sales: BarChartIcon,
  "Finance & Accounting": BarChartIcon,
  Healthcare: HeartIcon,
  Education: GraduationCapIcon,
  Engineering: SettingsIcon,
  Design: PaletteIcon,
  "Human Resources": UsersIcon,
  Operations: SettingsIcon,
  Legal: ShieldIcon,
  "Customer Support": HeadphonesIcon,
  "Data Science": DatabaseIcon,
  "Content & Writing": PenSquareIcon,
  Administration: BriefcaseIcon,
  Other: MonitorIcon,
};

const CATEGORY_COLORS: Record<string, string> = {
  "IT & Software": "from-blue-500 to-blue-600",
  Marketing: "from-purple-500 to-purple-600",
  Sales: "from-rose-500 to-rose-600",
  "Finance & Accounting": "from-emerald-500 to-emerald-600",
  Healthcare: "from-red-500 to-rose-500",
  Education: "from-amber-500 to-amber-600",
  Engineering: "from-cyan-500 to-cyan-600",
  Design: "from-pink-500 to-pink-600",
  "Human Resources": "from-violet-500 to-violet-600",
  "Data Science": "from-indigo-500 to-indigo-600",
};

const CATEGORY_COUNTS: Record<string, string> = {
  "IT & Software": "3,240+",
  Marketing: "1,180+",
  Sales: "2,100+",
  "Finance & Accounting": "890+",
  Healthcare: "760+",
  Education: "540+",
  Engineering: "1,320+",
  Design: "670+",
  "Human Resources": "480+",
  "Data Science": "920+",
};

// Naukri-style experience options — values MUST match ExperienceLevel type from constants
const EXPERIENCE_LEVELS = [
  { value: "", label: "Experience" },
  { value: "fresher", label: "Fresher (0 yrs)" },
  { value: "1-3 years", label: "1–3 Years" },
  { value: "3-5 years", label: "3–5 Years" },
  { value: "5-10 years", label: "5–10 Years" },
  { value: "10+ years", label: "10+ Years" },
];

// Trending searches (tag cloud) — varying importance
const TRENDING_SEARCHES = [
  { label: "React Developer", size: "tag-lg", href: "/jobs?q=React+Developer" },
  { label: "Python", size: "tag-md", href: "/jobs?q=Python" },
  { label: "Data Science", size: "tag-lg", href: "/jobs?q=Data+Science" },
  { label: "Product Manager", size: "tag-md", href: "/jobs?q=Product+Manager" },
  { label: "UI/UX Designer", size: "tag-sm", href: "/jobs?q=UI+UX+Designer" },
  { label: "DevOps", size: "tag-sm", href: "/jobs?q=DevOps" },
  { label: "Marketing", size: "tag-md", href: "/jobs?q=Marketing" },
  { label: "Node.js", size: "tag-sm", href: "/jobs?q=Node.js" },
  { label: "Machine Learning", size: "tag-lg", href: "/jobs?q=Machine+Learning" },
  { label: "MBA", size: "tag-xs", href: "/jobs?q=MBA" },
  { label: "Full Stack", size: "tag-md", href: "/jobs?q=Full+Stack" },
  { label: "HR Manager", size: "tag-xs", href: "/jobs?q=HR+Manager" },
  { label: "Sales Executive", size: "tag-sm", href: "/jobs?q=Sales+Executive" },
  { label: "Flutter", size: "tag-xs", href: "/jobs?q=Flutter" },
  { label: "AI Engineer", size: "tag-lg", href: "/jobs?q=AI+Engineer" },
];

// Company logos (marquee) — using text avatars to avoid missing assets
const HIRING_COMPANIES = [
  { name: "TCS", color: "bg-blue-600" },
  { name: "Infosys", color: "bg-blue-500" },
  { name: "Wipro", color: "bg-violet-600" },
  { name: "HCL", color: "bg-emerald-600" },
  { name: "Accenture", color: "bg-purple-700" },
  { name: "IBM", color: "bg-slate-700" },
  { name: "Google", color: "bg-red-500" },
  { name: "Microsoft", color: "bg-blue-700" },
  { name: "Amazon", color: "bg-orange-500" },
  { name: "Flipkart", color: "bg-blue-500" },
  { name: "Paytm", color: "bg-sky-600" },
  { name: "Swiggy", color: "bg-orange-600" },
  { name: "Zomato", color: "bg-rose-600" },
  { name: "BYJU'S", color: "bg-indigo-600" },
  { name: "Razorpay", color: "bg-blue-800" },
  { name: "Freshworks", color: "bg-green-600" },
  { name: "Zoho", color: "bg-red-600" },
  { name: "Ola", color: "bg-yellow-600" },
];

const STATS = [
  { label: "Active Jobs", value: "10,000+", icon: BriefcaseIcon, iconBg: "bg-blue-500", blob: "bg-blue-200 dark:bg-blue-500/20", trend: "+18% this week" },
  { label: "Top Companies", value: "1,000+", icon: BuildingIcon, iconBg: "bg-emerald-500", blob: "bg-emerald-200 dark:bg-emerald-500/20", trend: "+45 new this month" },
  { label: "Job Seekers", value: "50,000+", icon: UsersIcon, iconBg: "bg-violet-500", blob: "bg-violet-200 dark:bg-violet-500/20", trend: "Active network" },
  { label: "Hirings / Month", value: "500+", icon: TrendingUpIcon, iconBg: "bg-orange-500", blob: "bg-orange-200 dark:bg-orange-500/20", trend: "People placed" },
];

// Success stories (Naukri pattern)
const SUCCESS_STORIES = [
  {
    name: "Priya Sharma",
    role: "Senior Software Engineer",
    company: "Microsoft",
    initials: "PS",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    quote: "Found my dream job in just 2 weeks! The one-click apply feature saved so much time. Highly recommend to all job seekers.",
    salary: "₹20 LPA",
    prevRole: "Software Engineer",
    location: "Bangalore",
  },
  {
    name: "Rahul Verma",
    role: "Product Manager",
    company: "Flipkart",
    initials: "RV",
    color: "bg-gradient-to-br from-violet-500 to-violet-600",
    quote: "EkClickJob's smart job matching showed me roles I didn't even know existed. Landed a 40% salary hike through this platform.",
    salary: "₹24 LPA",
    prevRole: "Business Analyst",
    location: "Pune",
  },
  {
    name: "Anita Patel",
    role: "UX Design Lead",
    company: "Razorpay",
    initials: "AP",
    color: "bg-gradient-to-br from-rose-500 to-rose-600",
    quote: "As a fresher, I was worried about getting noticed. The resume builder and skill badges helped me stand out from the crowd.",
    salary: "₹33 LPA",
    prevRole: "Design Intern",
    location: "Mumbai",
  },
];

// Salary insights (Glassdoor "Know Your Worth" pattern)
const SALARY_INSIGHTS = [
  { role: "Software Engineer", avg: "₹12–32 LPA", trend: "up", change: "+8%" },
  { role: "Data Scientist", avg: "₹15–40 LPA", trend: "up", change: "+12%" },
  { role: "Product Manager", avg: "₹18–45 LPA", trend: "up", change: "+6%" },
  { role: "UI/UX Designer", avg: "₹8–22 LPA", trend: "up", change: "+10%" },
  { role: "Marketing Manager", avg: "₹8–20 LPA", trend: "neutral", change: "+3%" },
  { role: "HR Manager", avg: "₹6–18 LPA", trend: "up", change: "+5%" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-[#F5F7FA] dark:bg-background">
        {/* ────────── HERO ────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-float" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px] animate-float-delayed" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-sky-600/10 blur-3xl" />

          <div className="container relative mx-auto max-w-7xl px-4 pb-28 pt-16 md:pb-36 md:pt-24">
            {/* Badge */}
            <div className="flex justify-center animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300 backdrop-blur-sm">
                <SparklesIcon className="h-3.5 w-3.5" />
                India&apos;s #1 job portal for freshers &amp; professionals
              </div>
            </div>

            <h1 className="mx-auto mt-6 max-w-4xl text-center text-4xl font-extrabold tracking-tight text-white animate-slide-up sm:text-5xl md:text-6xl lg:text-7xl" style={{ animationDelay: "0.1s" }}>
              Find Your{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-x">
                Dream Job
              </span>
              {" "}in One Click
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-blue-100/65 animate-slide-up sm:text-lg" style={{ animationDelay: "0.15s" }}>
              10,000+ verified jobs from India&apos;s top companies. Apply instantly, track your applications, get hired.
            </p>

            {/* ── 3-Field Mega Search Bar (Naukri pattern) ── */}
            <div className="mx-auto mt-8 max-w-4xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <form action="/jobs" method="GET">
                <div className="rounded-2xl bg-white/8 backdrop-blur-md border border-white/12 p-2 shadow-2xl shadow-black/40">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {/* Experience dropdown */}
                    <div className="relative sm:w-44 shrink-0">
                      <select
                        name="exp"
                        defaultValue=""
                        className="h-12 w-full appearance-none rounded-xl bg-white/8 pl-4 pr-8 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer"
                      >
                        {EXPERIENCE_LEVELS.map((lvl) => (
                          <option key={lvl.value} value={lvl.value} className="bg-slate-900 text-white">
                            {lvl.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>

                    {/* Vertical divider */}
                    <div className="hidden sm:block w-px bg-white/10 my-2" />

                    {/* Job title input */}
                    <div className="relative flex-1">
                      <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        name="q"
                        type="text"
                        placeholder="Job title, skills, or company"
                        className="h-12 w-full rounded-xl bg-transparent pl-11 pr-4 text-sm text-white placeholder-white/40 focus:outline-none"
                      />
                    </div>

                    {/* Vertical divider */}
                    <div className="hidden sm:block w-px bg-white/10 my-2" />

                    {/* Location input */}
                    <div className="relative sm:w-44">
                      <MapPinIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        name="city"
                        type="text"
                        placeholder="City or Remote"
                        className="h-12 w-full rounded-xl bg-transparent pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="h-12 shrink-0 rounded-xl bg-blue-500 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-400 active:scale-95"
                    >
                      Search Jobs
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* ── Trending Tag Cloud (Indeed pattern) ── */}
            <div className="mt-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Trending:</span>
                {TRENDING_SEARCHES.slice(0, 10).map((tag) => (
                  <Link
                    key={tag.label}
                    href={tag.href}
                    className={cn(
                      "rounded-full border border-white/10 bg-white/5 px-3 py-1 transition-all hover:border-blue-400/40 hover:bg-blue-400/10 hover:text-blue-300 text-white/60",
                      tag.size
                    )}
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick stats row */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40 animate-slide-up" style={{ animationDelay: "0.35s" }}>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> 2,340 new jobs today</span>
              <span className="flex items-center gap-1.5">🏢 1,000+ verified companies</span>
              <span className="flex items-center gap-1.5">⚡ One-click apply</span>
              <span className="flex items-center gap-1.5">🆓 Free for job seekers</span>
            </div>
          </div>
        </section>

        {/* ────────── COMPANY MARQUEE STRIP (Naukri pattern) ────────── */}
        <section className="border-y border-border bg-background py-5">
          <div className="container mx-auto max-w-7xl px-4 mb-3">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Trusted by 1,000+ companies hiring on EkClickJob
            </p>
          </div>
          <div className="marquee-container">
            <div className="flex animate-marquee gap-6 w-max px-6">
              {[...HIRING_COMPANIES, ...HIRING_COMPANIES].map((co, i) => (
                <div
                  key={`${co.name}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm shrink-0 hover:shadow-md transition-shadow"
                >
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0", co.color)}>
                    {co.name.slice(0, 2)}
                  </div>
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">{co.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────── STATS ────────── */}
        <section className="py-8 bg-background dark:bg-slate-900/40">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 md:p-6"
                >
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm", stat.iconBg)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">{stat.value}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground font-medium">{stat.label}</div>
                  <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{stat.trend}</div>
                  <div className={cn("absolute -bottom-4 -right-4 h-20 w-20 rounded-full opacity-30 transition-transform group-hover:scale-125", stat.blob)} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────── LATEST JOBS ────────── */}
        <section className="py-12 md:py-16 bg-background dark:bg-slate-900/40">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Live openings
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Latest Job Openings</h2>
                  <p className="mt-1 text-muted-foreground text-sm">2,340 new jobs posted today from top companies</p>
                </div>
                <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline shrink-0">
                  View all jobs <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Horizontal scrollable filter chips (Glassdoor/Internshala pattern) */}
              <div className="mt-4 scroll-x flex gap-2 pb-1">
                {[
                  { label: "All Jobs", href: "/jobs", active: true },
                  { label: "🔥 Actively Hiring", href: "/jobs?active=true" },
                  { label: "💰 ₹10L+ Salary", href: "/jobs?minSalary=1000000" },
                  { label: "🏠 Remote", href: "/jobs?remote=remote" },
                  { label: "⚡ Easy Apply", href: "/jobs" },
                  { label: "🎓 Fresher", href: "/jobs?exp=fresher" },
                  { label: "💼 Full-time", href: "/jobs?type=full-time" },
                  { label: "📍 Bangalore", href: "/jobs?city=Bangalore" },
                  { label: "📍 Mumbai", href: "/jobs?city=Mumbai" },
                ].map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className={cn(
                      "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                      chip.active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>

            <FeaturedJobs />

            <div className="mt-8 text-center">
              <Link href="/jobs" className={cn(buttonVariants({ variant: "outline" }), "gap-2 rounded-xl px-6")}>
                Browse all 10,000+ jobs <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ────────── BROWSE BY INDUSTRY ────────── */}
        <section className="py-14 bg-muted/30 dark:bg-slate-900/50">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <SparklesIcon className="h-3 w-3" />
                  16 Industries
                </div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Browse by Industry</h2>
                <p className="mt-1 text-muted-foreground text-sm">Explore opportunities across every sector.</p>
              </div>
              <Link href="/jobs" className="text-sm font-medium text-primary hover:underline">
                View all industries <ArrowRightIcon className="inline h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Category grid with job counts (Indeed pattern) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {JOB_CATEGORIES.slice(0, 10).map((category) => {
                const Icon = CATEGORY_ICONS[category] ?? BriefcaseIcon;
                const gradColor = CATEGORY_COLORS[category] ?? "from-slate-500 to-slate-600";
                const count = CATEGORY_COUNTS[category] ?? "500+";
                return (
                  <Link
                    key={category}
                    href={`/jobs?category=${encodeURIComponent(category)}`}
                    className="group relative flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-110", gradColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold leading-tight">{category}</div>
                      <div className="mt-0.5 text-xs font-semibold text-primary">{count} jobs</div>
                    </div>
                    <ArrowRightIcon className="absolute right-3 bottom-3 h-3.5 w-3.5 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ────────── SALARY INSIGHTS (Glassdoor "Know Your Worth") ────────── */}
        <section className="py-14 md:py-16 bg-background dark:bg-slate-900/40">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="rounded-3xl border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/15 p-6 md:p-10">
              <div className="grid gap-10 lg:grid-cols-2 items-center">
                {/* Left: Copy */}
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <BarChartIcon className="h-3 w-3" />
                    Salary Insights
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Know What You&apos;re Worth
                  </h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Get real-time salary data for any role in India. Compare your current salary with market trends and negotiate with confidence.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/trends" className={cn(buttonVariants(), "gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20")}>
                      Explore Salary Trends <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    <Link href="/jobs" className={cn(buttonVariants({ variant: "outline" }), "gap-2 rounded-xl")}>
                      Find High-Paying Jobs
                    </Link>
                  </div>
                </div>

                {/* Right: Salary table */}
                <div className="grid gap-2">
                  {SALARY_INSIGHTS.map((item) => (
                    <div key={item.role} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium">{item.role}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{item.avg}</span>
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          item.trend === "up"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                        )}>
                          {item.trend === "up" ? <TrendingUpIcon className="h-2.5 w-2.5" /> : <TrendingDownIcon className="h-2.5 w-2.5" />}
                          {item.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ────────── SUCCESS STORIES (Naukri pattern) ────────── */}
        <section className="py-14 bg-muted/30 dark:bg-slate-900/50">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-8 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <AwardIcon className="h-3 w-3" />
                500+ Placements this month
              </div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Real Success Stories</h2>
              <p className="mt-2 text-muted-foreground text-sm">People just like you found their dream jobs on EkClickJob</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {SUCCESS_STORIES.map((story) => (
                <div key={story.name} className="group relative rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1">
                  {/* Quote mark */}
                  <div className="absolute top-5 right-6 text-5xl font-serif text-muted-foreground/10 select-none">&ldquo;</div>

                  {/* Rating stars */}
                  <div className="mb-3 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">&ldquo;{story.quote}&rdquo;</p>

                  {/* Person */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0", story.color)}>
                      {story.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{story.name}</p>
                      <p className="text-xs text-muted-foreground">{story.role} at <span className="font-semibold text-primary">{story.company}</span></p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mt-4 flex gap-3 border-t pt-3">
                    <div className="text-center">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{story.salary}</div>
                      <div className="text-[10px] text-muted-foreground">Package</div>
                    </div>
                    <div className="h-full w-px bg-border" />
                    <div className="text-center">
                      <div className="text-xs font-bold">{story.location}</div>
                      <div className="text-[10px] text-muted-foreground">Location</div>
                    </div>
                    <div className="h-full w-px bg-border" />
                    <div className="text-center">
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{story.prevRole}</div>
                      <div className="text-[10px] text-muted-foreground">Was</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────── HOW IT WORKS ────────── */}
        <section className="py-14 md:py-16 bg-background dark:bg-slate-900/40">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Get Hired in 4 Steps</h2>
              <p className="mt-2 text-muted-foreground text-sm">No complexity, no hidden process. Just simple and fast.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "01", icon: UserIcon, title: "Create Your Profile", desc: "Sign up in 30 seconds. Add your skills & upload your resume.", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
                { step: "02", icon: SearchIcon, title: "Discover Jobs", desc: "Browse 10,000+ verified jobs filtered by role, location & salary.", color: "from-violet-500 to-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
                { step: "03", icon: ZapIcon, title: "One-Click Apply", desc: "Apply instantly with your saved profile. No repeated forms.", color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                { step: "04", icon: AwardIcon, title: "Get Hired", desc: "Track applications, schedule interviews, and land your role.", color: "from-amber-500 to-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
              ].map((step, i) => (
                <div key={step.title} className={cn("group relative rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1", step.bg)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm", step.color)}>
                      <step.icon className="h-5.5 w-5.5" />
                    </div>
                    <span className="text-4xl font-black text-foreground/5">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  {i < 3 && (
                    <ArrowRightIcon className="absolute -right-3 top-1/2 hidden -translate-y-1/2 h-5 w-5 text-muted-foreground/20 lg:block" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register?role=seeker" className={cn(buttonVariants(), "gap-2 rounded-xl shadow-lg shadow-primary/20 h-11 px-6")}>
                <RocketIcon className="h-4 w-4" />
                Start Finding Jobs — Free
              </Link>
              <Link href="/register?role=employer" className={cn(buttonVariants({ variant: "outline" }), "gap-2 rounded-xl h-11 px-6")}>
                Post a Job Free →
              </Link>
            </div>
          </div>
        </section>

        {/* ────────── WHY CHOOSE ────────── */}
        <section className="py-14 bg-muted/30 dark:bg-slate-900/50">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Why 50,000+ Professionals Choose EkClickJob</h2>
              <p className="mt-2 text-muted-foreground text-sm">Trusted, Celebrated and 400+ Site Reviews</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: CheckCircleIcon, title: "100% Free for Seekers", desc: "Search, apply, and get hired — completely free, no hidden charges.", accent: "from-blue-500 to-sky-500", bg: "bg-blue-50 dark:bg-blue-500/10", iconColor: "text-blue-600 dark:text-blue-400" },
                { icon: ShieldIcon, title: "Verified Companies", desc: "Every employer is reviewed and verified before they can post jobs.", accent: "from-emerald-500 to-green-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", iconColor: "text-emerald-600 dark:text-emerald-400" },
                { icon: ZapIcon, title: "One-Click Apply", desc: "Apply instantly with your saved profile and resume — no re-filling.", accent: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-500/10", iconColor: "text-amber-600 dark:text-amber-400" },
                { icon: GlobeIcon, title: "Pan-India Coverage", desc: "Opportunities in 50+ cities from metro hubs to tier-2 towns.", accent: "from-purple-500 to-violet-500", bg: "bg-purple-50 dark:bg-purple-500/10", iconColor: "text-purple-600 dark:text-purple-400" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group relative rounded-2xl border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                >
                  <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity", item.accent)} />
                  <div className={cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl", item.bg)}>
                    <item.icon className={cn("h-6 w-6", item.iconColor)} />
                  </div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────── Campus / Fresher Zone ────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-700 py-14 md:py-16">
          <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="container mx-auto max-w-7xl px-4 relative z-10">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white mb-5 border border-white/10">
                  <GraduationCapIcon className="h-4 w-4" />
                  Campus &amp; Fresher Zone
                </div>
                <h2 className="text-3xl font-black text-white sm:text-4xl leading-tight">
                  Starting your career?<br />
                  <span className="text-yellow-300">We&apos;ve got your back.</span>
                </h2>
                <p className="mt-4 text-white/75 leading-relaxed">
                  Thousands of entry-level, internship, and campus placement opportunities — handpicked for freshers.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Internships", "Campus Placements", "Entry Level", "0–1 Year Exp", "IT Fresher", "MBA Fresher"].map((tag) => (
                    <Link key={tag} href={`/jobs?fresher=true&q=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-sm text-white hover:bg-white/20 transition-colors">
                      {tag}
                    </Link>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/jobs?fresher=true"
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-violet-700 shadow-lg hover:bg-white/90 transition-all">
                    Browse Fresher Jobs
                  </Link>
                  <Link href="/jobs?jobType=internship"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white hover:bg-white/20 transition-all">
                    View Internships
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Fresher Jobs", value: "12,000+", icon: BriefcaseIcon, desc: "Entry-level openings" },
                  { label: "Internships", value: "3,500+", icon: GraduationCapIcon, desc: "Paid & unpaid" },
                  { label: "Campus Hiring", value: "500+", icon: BuildingIcon, desc: "Top companies" },
                  { label: "Placed This Month", value: "2,800+", icon: UsersIcon, desc: "Success stories" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white/10 border border-white/10 p-5 backdrop-blur-sm">
                    <stat.icon className="h-6 w-6 text-yellow-300 mb-3" />
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-sm font-semibold text-white/90">{stat.label}</div>
                    <div className="text-xs text-white/50 mt-0.5">{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ────────── CTA ────────── */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
