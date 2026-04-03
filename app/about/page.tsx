import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseIcon, UsersIcon, BuildingIcon, TrendingUpIcon, HeartIcon, ShieldIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about EkClickJob — India's fastest growing job portal connecting job seekers with top employers.",
};

const TEAM_VALUES = [
  { icon: HeartIcon, title: "People First", desc: "Every decision starts with how it helps job seekers and employers succeed." },
  { icon: ShieldIcon, title: "Trust & Safety", desc: "We verify employers and maintain a safe, spam-free environment." },
  { icon: TrendingUpIcon, title: "Continuous Growth", desc: "We're always improving — faster search, better matches, smarter tools." },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <BriefcaseIcon className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              About <span className="text-primary">EkClickJob</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              We&apos;re on a mission to make job hunting and hiring in India faster, simpler, and more
              human. One click should be all it takes.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold">Our Story</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  EkClickJob was born from a simple frustration: why does finding a job — or finding the right
                  person for a job — have to be so complicated? We built this platform to fix that.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Starting with a focus on India&apos;s rapidly growing job market, we combine powerful
                  technology with a clean, fast experience to connect the right people with the right
                  opportunities.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Active Jobs", value: "10,000+", icon: BriefcaseIcon },
                  { label: "Companies", value: "1,000+", icon: BuildingIcon },
                  { label: "Job Seekers", value: "50,000+", icon: UsersIcon },
                  { label: "Monthly Hirings", value: "500+", icon: TrendingUpIcon },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border bg-card p-5 text-center">
                    <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold">Our Values</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {TEAM_VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl border bg-background p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-bold">Join us today</h2>
            <p className="mt-4 text-muted-foreground">
              Whether you&apos;re looking for your next role or looking to build a great team,
              EkClickJob is built for you.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/jobs" className={cn(buttonVariants(), "gap-2")}>Browse Jobs</Link>
              <Link href="/register?role=employer" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>Post a Job</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
