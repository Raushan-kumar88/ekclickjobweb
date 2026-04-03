import Link from "next/link";
import {
  TrendingUpIcon,
  ZapIcon,
  MapPinIcon,
  BriefcaseIcon,
  BarChart2Icon,
  ArrowUpRightIcon,
  UsersIcon,
  BuildingIcon,
  GraduationCapIcon,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Market Trends 2026",
  description: "Explore trending skills, top hiring cities, in-demand roles, and job market insights for India in 2026.",
};

const TRENDING_SKILLS = [
  { skill: "React.js", growth: 42, category: "Frontend" },
  { skill: "Python", growth: 38, category: "AI/ML" },
  { skill: "AWS", growth: 35, category: "Cloud" },
  { skill: "Machine Learning", growth: 48, category: "AI/ML" },
  { skill: "Node.js", growth: 29, category: "Backend" },
  { skill: "Docker/Kubernetes", growth: 44, category: "DevOps" },
  { skill: "Data Analysis", growth: 31, category: "Data" },
  { skill: "Product Management", growth: 27, category: "Management" },
  { skill: "Digital Marketing", growth: 24, category: "Marketing" },
  { skill: "TypeScript", growth: 52, category: "Frontend" },
  { skill: "Next.js", growth: 58, category: "Frontend" },
  { skill: "Generative AI", growth: 76, category: "AI/ML" },
];

const TRENDING_ROLES = [
  { role: "AI/ML Engineer", openings: "18,200+", growth: "+76%", salary: "₹18–40 LPA" },
  { role: "Full Stack Developer", openings: "32,500+", growth: "+42%", salary: "₹8–25 LPA" },
  { role: "Data Scientist", openings: "12,800+", growth: "+38%", salary: "₹12–30 LPA" },
  { role: "DevOps Engineer", openings: "9,400+", growth: "+44%", salary: "₹10–22 LPA" },
  { role: "Product Manager", openings: "7,200+", growth: "+27%", salary: "₹15–35 LPA" },
  { role: "UI/UX Designer", openings: "11,000+", growth: "+31%", salary: "₹6–18 LPA" },
  { role: "Cloud Architect", openings: "5,600+", growth: "+35%", salary: "₹20–45 LPA" },
  { role: "Cybersecurity Analyst", openings: "6,800+", growth: "+41%", salary: "₹8–20 LPA" },
];

const TOP_CITIES = [
  { city: "Bengaluru", jobs: "85,000+", icon: "🏙️", pct: 100, tag: "Silicon Valley of India" },
  { city: "Mumbai", jobs: "52,000+", icon: "🌊", pct: 62, tag: "Finance & Media Hub" },
  { city: "Hyderabad", jobs: "48,000+", icon: "🏗️", pct: 57, tag: "Pharma & IT Hub" },
  { city: "Delhi NCR", jobs: "45,000+", icon: "🏛️", pct: 53, tag: "Startup & Govt Hub" },
  { city: "Pune", jobs: "35,000+", icon: "🎓", pct: 41, tag: "IT & Auto Hub" },
  { city: "Chennai", jobs: "28,000+", icon: "🔧", pct: 33, tag: "Manufacturing & IT" },
  { city: "Kolkata", jobs: "14,000+", icon: "🏭", pct: 17, tag: "Finance & Commerce" },
  { city: "Ahmedabad", jobs: "12,000+", icon: "💼", pct: 14, tag: "SME & Textile Hub" },
];

const SALARY_BANDS = [
  { exp: "Fresher (0–1 yr)", avg: "₹2.5–5 LPA", top: "₹8 LPA" },
  { exp: "1–3 Years", avg: "₹5–10 LPA", top: "₹18 LPA" },
  { exp: "3–5 Years", avg: "₹10–18 LPA", top: "₹28 LPA" },
  { exp: "5–10 Years", avg: "₹18–30 LPA", top: "₹50 LPA" },
  { exp: "10+ Years", avg: "₹30–50 LPA", top: "₹1 Cr+" },
];

const HIRING_INDUSTRIES = [
  { industry: "IT & Software", share: 38, color: "bg-blue-500" },
  { industry: "Fintech", share: 14, color: "bg-emerald-500" },
  { industry: "E-commerce", share: 12, color: "bg-amber-500" },
  { industry: "Healthcare", share: 10, color: "bg-rose-500" },
  { industry: "EdTech", share: 8, color: "bg-violet-500" },
  { industry: "Others", share: 18, color: "bg-slate-400" },
];

export default function TrendsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="border-b bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-700 py-14">
          <div className="container mx-auto max-w-7xl px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white mb-4">
              <ZapIcon className="h-4 w-4" />
              Live Market Data — Updated March 2026
            </div>
            <h1 className="text-4xl font-black text-white sm:text-5xl">
              India Job Market Trends
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Trending skills, top cities, in-demand roles, and salary benchmarks — all in one place.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/jobs" className={cn(buttonVariants(), "bg-white text-blue-700 hover:bg-white/90")}>
                Browse Jobs
              </Link>
              <Link href="/jobs?fresher=true" className={cn(buttonVariants({ variant: "outline" }), "border-white/40 text-white hover:bg-white/10")}>
                Fresher Jobs
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12 space-y-14">

          {/* Key stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: BriefcaseIcon, label: "Active Jobs", value: "3,20,000+", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
              { icon: BuildingIcon, label: "Hiring Companies", value: "18,500+", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
              { icon: UsersIcon, label: "Job Seekers", value: "12 Lakh+", color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20" },
              { icon: GraduationCapIcon, label: "Fresher Openings", value: "42,000+", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-2xl border bg-background p-5 text-center">
                <div className={cn("mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl", color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-2xl font-black">{value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* Trending Skills */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <TrendingUpIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Trending Skills in 2026</h2>
                <p className="text-sm text-muted-foreground">Year-over-year growth in job postings requiring these skills</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TRENDING_SKILLS.sort((a, b) => b.growth - a.growth).map((item) => (
                <Link
                  key={item.skill}
                  href={`/jobs?q=${encodeURIComponent(item.skill)}`}
                  className="group flex items-center gap-4 rounded-xl border bg-background p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm">{item.skill}</span>
                      <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                        <ArrowUpRightIcon className="h-3 w-3" />
                        +{item.growth}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                        style={{ width: `${Math.min(item.growth * 1.2, 100)}%` }}
                      />
                    </div>
                    <span className="mt-1 text-[10px] text-muted-foreground">{item.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Trending Roles */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <BriefcaseIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Most In-Demand Roles</h2>
                <p className="text-sm text-muted-foreground">Roles with fastest growing demand across India</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-right font-semibold">Open Positions</th>
                    <th className="px-4 py-3 text-right font-semibold">YoY Growth</th>
                    <th className="px-4 py-3 text-right font-semibold">Avg. Salary</th>
                    <th className="px-4 py-3 text-center font-semibold">Find Jobs</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {TRENDING_ROLES.map((row, i) => (
                    <tr key={row.role} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-4 py-3 font-medium">{row.role}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{row.openings}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-emerald-600">{row.growth}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">{row.salary}</td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/jobs?q=${encodeURIComponent(row.role)}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Browse →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top Cities */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                <MapPinIcon className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Top Hiring Cities</h2>
                <p className="text-sm text-muted-foreground">Active job openings by city across India</p>
              </div>
            </div>
            <div className="space-y-3">
              {TOP_CITIES.map((item) => (
                <Link
                  key={item.city}
                  href={`/jobs?city=${encodeURIComponent(item.city)}`}
                  className="group flex items-center gap-4 rounded-xl border bg-background p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="font-semibold">{item.city}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{item.tag}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{item.jobs}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-400 transition-all"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Salary Bands */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <BarChart2Icon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Salary Benchmarks by Experience</h2>
                <p className="text-sm text-muted-foreground">Average and top-percentile salaries across India (2026)</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SALARY_BANDS.map((band) => (
                <div key={band.exp} className="rounded-xl border bg-background p-5">
                  <p className="text-sm font-semibold">{band.exp}</p>
                  <p className="mt-2 text-2xl font-black text-amber-600">{band.avg}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Top earners: <span className="font-semibold text-foreground">{band.top}</span></p>
                </div>
              ))}
            </div>
          </section>

          {/* Industry hiring share */}
          <section className="rounded-2xl border bg-background p-6">
            <h2 className="mb-6 text-xl font-bold">Hiring by Industry</h2>
            <div className="space-y-3">
              {HIRING_INDUSTRIES.map((item) => (
                <div key={item.industry} className="flex items-center gap-3">
                  <span className="w-32 text-sm font-medium">{item.industry}</span>
                  <div className="flex-1 h-3 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${item.share}%` }} />
                  </div>
                  <span className="w-10 text-right text-sm font-semibold">{item.share}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Ready to ride the trend?</h2>
            <p className="mt-2 text-white/80">Browse thousands of jobs matching today&apos;s market demands.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/jobs" className={cn(buttonVariants(), "bg-white text-blue-700 hover:bg-white/90")}>
                Browse All Jobs
              </Link>
              <Link href="/register" className={cn(buttonVariants({ variant: "outline" }), "border-white/40 text-white hover:bg-white/10")}>
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
