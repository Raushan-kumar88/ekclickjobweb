import Link from "next/link";
import Image from "next/image";
import { TwitterIcon, LinkedinIcon, InstagramIcon } from "lucide-react";

const seekerLinks = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/register?role=seeker", label: "Create Account" },
  { href: "/seeker/resume", label: "Resume Builder" },
  { href: "/blog", label: "Career Tips" },
];

const employerLinks = [
  { href: "/employer/jobs/new", label: "Post a Job" },
  { href: "/register?role=employer", label: "Create Account" },
  { href: "/pricing", label: "Pricing Plans" },
  { href: "/companies", label: "Browse Companies" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const STATS = [
  { value: "10,000+", label: "Active Jobs" },
  { value: "1,000+", label: "Companies" },
  { value: "50,000+", label: "Professionals" },
  { value: "500+", label: "Hires/Month" },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Stats strip */}
      <div className="border-b border-slate-800/60 bg-slate-900/50">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-black text-white sm:text-2xl">{stat.value}</div>
                <div className="mt-0.5 text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="EkClickJob"
                width={160}
                height={48}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              India&apos;s fastest growing job portal connecting talented
              professionals with top employers across 50+ cities.
            </p>
            <div className="mt-5 flex gap-2.5">
              {[
                { icon: TwitterIcon, href: "#", label: "Twitter" },
                { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
                { icon: InstagramIcon, href: "#", label: "Instagram" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-400 transition-all hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-6 md:col-span-8 lg:col-span-7">
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">
                For Seekers
              </h3>
              <ul className="space-y-2.5">
                {seekerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">
                For Employers
              </h3>
              <ul className="space-y-2.5">
                {employerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">
                Company
              </h3>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-800/60 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} EkClickJob. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}
