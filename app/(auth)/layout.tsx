import Link from "next/link";
import Image from "next/image";
import {
  BriefcaseIcon,
  ShieldCheckIcon,
  ZapIcon,
  UsersIcon,
  SparklesIcon,
} from "lucide-react";

const features = [
  {
    icon: BriefcaseIcon,
    title: "10,000+ Active Jobs",
    desc: "Fresh opportunities posted daily by verified employers",
  },
  {
    icon: ShieldCheckIcon,
    title: "100% Verified Companies",
    desc: "Every employer is reviewed before posting jobs",
  },
  {
    icon: ZapIcon,
    title: "One-Click Apply",
    desc: "Apply instantly with your saved profile and resume",
  },
  {
    icon: UsersIcon,
    title: "50,000+ Professionals",
    desc: "Join India's fastest growing career community",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left branding panel (hidden on mobile) ── */}
      <div className="relative hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-0 h-64 w-64 rounded-full bg-blue-400/10 blur-2xl -translate-y-1/2" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-3 py-1.5 shadow-lg">
              <Image
                src="/logo.png"
                alt="EkClickJob"
                width={160}
                height={48}
                className="h-9 w-auto object-contain"
                priority
                loading="eager"
              />
            </div>
          </Link>

          {/* Hero copy */}
          <div className="mt-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white mb-6">
              <SparklesIcon className="h-3.5 w-3.5" />
              India&apos;s fastest growing job portal
            </div>
            <h2 className="text-3xl font-black text-white xl:text-4xl leading-tight">
              Your Next Great<br />
              <span className="text-yellow-300">Opportunity Awaits</span>
            </h2>
            <p className="mt-4 text-white/75 text-base leading-relaxed max-w-xs">
              Join millions of professionals who found their dream jobs through EkClickJob.
            </p>
          </div>

          {/* Feature list */}
          <div className="mt-10 space-y-5">
            {features.map((feat) => (
              <div key={feat.title} className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <feat.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{feat.title}</p>
                  <p className="text-xs text-white/60 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-auto pt-10">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-5">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-white/85 italic leading-relaxed">
                &ldquo;Found my dream job as a Senior Developer in 3 days. The one-click apply feature is a game changer!&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  RK
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Rahul Kumar</p>
                  <p className="text-[10px] text-white/50">Senior Developer, Bangalore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="lg:hidden border-b bg-background px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <div className="dark:bg-white dark:rounded-lg dark:px-2 dark:py-0.5">
              <Image
                src="/logo.png"
                alt="EkClickJob"
                width={160}
                height={48}
                className="h-9 w-auto object-contain"
                priority
                loading="eager"
              />
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to home
          </Link>
        </header>

        {/* Desktop top-right back link */}
        <div className="hidden lg:flex justify-end px-8 pt-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            ← Back to home
          </Link>
        </div>

        {/* Form content */}
        <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Footer note */}
        <div className="px-8 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} EkClickJob &mdash; Made with ❤️ in India
          </p>
        </div>
      </div>
    </div>
  );
}
