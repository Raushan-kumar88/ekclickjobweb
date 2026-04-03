import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "EkClickJob Privacy Policy — how we collect, use, and protect your personal data.",
};

const LAST_UPDATED = "January 1, 2025";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-4xl font-extrabold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/90">
            <Section title="1. Information We Collect">
              <p>We collect information you provide directly, such as when you create an account, post a job, or apply for a position. This includes:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Name, email address, phone number</li>
                <li>Professional profile information (skills, experience, education)</li>
                <li>Resume and portfolio files</li>
                <li>Company information for employers</li>
              </ul>
              <p className="mt-2">We also collect usage data automatically, including IP address, browser type, pages visited, and interaction data.</p>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use your information to:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Provide, operate, and improve our services</li>
                <li>Match job seekers with relevant job opportunities</li>
                <li>Send you job alerts and notifications (with your consent)</li>
                <li>Communicate with you about your account and applications</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </Section>

            <Section title="3. Information Sharing">
              <p>We do not sell your personal information. We share your information only:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>With employers when you apply for their jobs</li>
                <li>With service providers who help us operate the platform</li>
                <li>When required by law or to protect rights and safety</li>
              </ul>
            </Section>

            <Section title="4. Data Security">
              <p>We use industry-standard security measures including encryption, secure servers, and regular security audits to protect your data. However, no method of transmission over the internet is 100% secure.</p>
            </Section>

            <Section title="5. Your Rights">
              <p>You have the right to:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Access and download your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </Section>

            <Section title="6. Cookies">
              <p>We use cookies and similar technologies to provide functionality, analyze usage, and improve our services. You can control cookies through your browser settings.</p>
            </Section>

            <Section title="7. Contact Us">
              <p>
                For privacy-related questions, contact us at{" "}
                <a href="mailto:privacy@ekclickjob.com" className="text-primary hover:underline">
                  privacy@ekclickjob.com
                </a>
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      <div className="text-muted-foreground">{children}</div>
    </section>
  );
}
