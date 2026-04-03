"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckIcon, XIcon, ZapIcon, SparklesIcon, BuildingIcon, UsersIcon, StarIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { buttonVariants } from "@/lib/utils/button-variants";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "annual";

const PLANS = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    period: "forever",
    description: "Perfect for small businesses just getting started.",
    highlight: false,
    cta: "Get Started Free",
    href: "/register?role=employer",
    features: [
      { label: "2 active job postings", included: true },
      { label: "Basic applicant management", included: true },
      { label: "Email notifications", included: true },
      { label: "Company profile", included: true },
      { label: "Analytics dashboard", included: false },
      { label: "Candidate search", included: false },
      { label: "Featured job listing", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 2999,
    annualPrice: 1999,
    period: "per month",
    description: "For growing teams that need more visibility and tools.",
    highlight: true,
    cta: "Start Free Trial",
    href: "/register?role=employer&plan=pro",
    badge: "Most Popular",
    features: [
      { label: "10 active job postings", included: true },
      { label: "Full applicant management", included: true },
      { label: "Email notifications", included: true },
      { label: "Company profile", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Candidate search", included: true },
      { label: "1 featured job/month", included: true },
      { label: "Priority support", included: false },
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    period: "contact us",
    description: "For large organizations with advanced requirements.",
    highlight: false,
    cta: "Contact Sales",
    href: "/contact",
    features: [
      { label: "Unlimited job postings", included: true },
      { label: "Full applicant management", included: true },
      { label: "Email notifications", included: true },
      { label: "Company profile", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Candidate search", included: true },
      { label: "Unlimited featured listings", included: true },
      { label: "Dedicated account manager", included: true },
    ],
  },
];

const FAQ = [
  {
    q: "Is the free plan really free forever?",
    a: "Yes. The free plan includes 2 active job postings with no time limit and no credit card required.",
  },
  {
    q: "What's the difference between monthly and annual billing?",
    a: "Annual billing gives you 2 months free — you pay for 10 months but get 12. That's a saving of ₹12,000 per year on the Pro plan.",
  },
  {
    q: "Can I upgrade or downgrade at any time?",
    a: "Yes, you can change your plan at any time. Upgrades take effect immediately; downgrades apply at the end of the billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, credit/debit cards, net banking, and popular wallets via Razorpay.",
  },
  {
    q: "Is there a trial period for paid plans?",
    a: "Yes, the Pro plan comes with a 14-day free trial — no credit card required.",
  },
];

const TRUST_STATS = [
  { icon: BuildingIcon, value: "1,000+", label: "Companies trust us" },
  { icon: UsersIcon, value: "50,000+", label: "Hires made" },
  { icon: StarIcon, label: "4.8/5", value: "4.8 ★", customLabel: "Employer rating" },
];

function formatPrice(amount: number | null, billing: Billing): string {
  if (amount === null) return "Custom";
  if (amount === 0) return "₹0";
  return `₹${(billing === "annual" ? amount : amount).toLocaleString("en-IN")}`;
}

export default function PricingPage() {
  const { user } = useAuthStore();
  const { plan: currentPlan, isLoading: subLoading } = useSubscription();
  const isEmployer = user?.role === "employer";
  const [billing, setBilling] = useState<Billing>("monthly");

  useEffect(() => {
    document.title = "Pricing Plans | EkClickJob";
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 text-center">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm text-muted-foreground mb-4">
              <ZapIcon className="h-3.5 w-3.5 text-primary" />
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Hire Better, <span className="text-primary">Pay Less</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Start free. Upgrade when you need more. No hidden fees.
            </p>

            {/* ── Annual / Monthly toggle ── */}
            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border bg-background/80 p-1.5 shadow-sm">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "rounded-xl px-5 py-2 text-sm font-semibold transition-all",
                  billing === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all",
                  billing === "annual"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Annual
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  billing === "annual"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                )}>
                  2 months free
                </span>
              </button>
            </div>

            {billing === "annual" && (
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                🎉 Save up to ₹12,000/year with annual billing
              </p>
            )}

            {/* Trust stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {TRUST_STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <s.icon className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">{s.value}</span>
                  <span>{s.customLabel ?? s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-12">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => {
                const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
                const annualSaving = plan.monthlyPrice && plan.annualPrice
                  ? (plan.monthlyPrice - plan.annualPrice) * 12
                  : 0;

                return (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl border p-6 flex flex-col transition-all hover:shadow-md",
                      plan.highlight
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "bg-background"
                    )}
                  >
                    {/* Top accent line */}
                    {plan.highlight && (
                      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-primary to-blue-400" />
                    )}

                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-xl font-bold">{plan.name}</h3>

                      <div className="mt-3">
                        <div className="flex items-end gap-1">
                          <span className="text-3xl font-extrabold">{formatPrice(price, billing)}</span>
                          {price !== null && price > 0 && (
                            <span className="mb-1 text-sm text-muted-foreground">/mo</span>
                          )}
                          {price === null && (
                            <span className="mb-1 text-sm text-muted-foreground">— contact us</span>
                          )}
                        </div>

                        {/* Annual sub-line */}
                        {billing === "annual" && plan.annualPrice && plan.annualPrice > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Billed{" "}
                            <span className="font-semibold text-foreground">
                              ₹{(plan.annualPrice * 12).toLocaleString("en-IN")}/year
                            </span>
                            {annualSaving > 0 && (
                              <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                · Save ₹{annualSaving.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        )}
                        {billing === "monthly" && plan.monthlyPrice && plan.monthlyPrice > 0 && plan.annualPrice && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Or{" "}
                            <button
                              onClick={() => setBilling("annual")}
                              className="text-primary hover:underline font-medium"
                            >
                              ₹{plan.annualPrice.toLocaleString("en-IN")}/mo
                            </button>
                            {" "}with annual billing
                          </p>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <ul className="flex-1 space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f.label} className="flex items-start gap-2.5 text-sm">
                          {f.included ? (
                            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          ) : (
                            <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                          )}
                          <span className={cn(!f.included && "text-muted-foreground/60")}>{f.label}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Smart CTA */}
                    {isEmployer && !subLoading ? (
                      plan.name === "Pro" && currentPlan !== "pro" ? (
                        <CheckoutButton plan="pro" className="w-full" label="Upgrade to Pro" />
                      ) : plan.name === "Free" && currentPlan === "free" ? (
                        <span className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium">
                          <PlanBadge plan="free" size="sm" />
                          Current Plan
                        </span>
                      ) : plan.name === "Pro" && currentPlan === "pro" ? (
                        <Link href="/employer/billing" className={cn(buttonVariants(), "w-full justify-center")}>
                          Manage Plan
                        </Link>
                      ) : (
                        <Link
                          href={plan.href}
                          className={cn(
                            plan.highlight ? buttonVariants() : buttonVariants({ variant: "outline" }),
                            "w-full justify-center"
                          )}
                        >
                          {plan.cta}
                        </Link>
                      )
                    ) : (
                      <Link
                        href={plan.href}
                        className={cn(
                          plan.highlight ? buttonVariants() : buttonVariants({ variant: "outline" }),
                          "w-full justify-center rounded-xl"
                        )}
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Feature comparison note */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              All plans include GST. Prices in INR.{" "}
              <Link href="/contact" className="text-primary hover:underline">Need a custom plan?</Link>
            </p>
          </div>
        </section>

        {/* Seeker free note */}
        <section className="py-8">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="rounded-2xl border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 text-center">
              <SparklesIcon className="h-7 w-7 text-primary mx-auto mb-2" />
              <h3 className="font-bold text-lg">100% Free for Job Seekers</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse jobs, apply, build your resume, and track applications — completely free. No premium tiers for seekers.
              </p>
              <Link href="/register?role=seeker" className={cn(buttonVariants({ variant: "outline" }), "mt-4 rounded-xl gap-2")}>
                Create free seeker account →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <div key={item.q} className="rounded-2xl border bg-background p-5">
                  <h3 className="font-semibold">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              More questions?{" "}
              <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
