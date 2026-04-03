import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "EkClickJob Terms of Service — the rules and conditions for using our platform.",
};

const LAST_UPDATED = "January 1, 2025";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-4xl font-extrabold">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed">
            <Section title="1. Acceptance of Terms">
              <p>By accessing or using EkClickJob, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
            </Section>

            <Section title="2. Use of the Platform">
              <p>You agree to use EkClickJob only for lawful purposes. You must not:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Post false, misleading, or fraudulent job listings</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Scrape, crawl, or harvest data without permission</li>
                <li>Post content that violates applicable laws</li>
              </ul>
            </Section>

            <Section title="3. Accounts">
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized access.</p>
            </Section>

            <Section title="4. Job Seeker Terms">
              <p>Job seekers may create profiles, upload resumes, and apply for jobs. By applying, you authorize us to share your application materials with the relevant employer. We do not guarantee job placement.</p>
            </Section>

            <Section title="5. Employer Terms">
              <p>Employers agree to post only legitimate job opportunities. Free accounts are limited to 2 active job postings. Employers must not discriminate in hiring based on protected characteristics.</p>
            </Section>

            <Section title="6. Content Ownership">
              <p>You retain ownership of content you post. By posting, you grant EkClickJob a non-exclusive license to display and distribute your content on the platform.</p>
            </Section>

            <Section title="7. Limitation of Liability">
              <p>EkClickJob is provided &ldquo;as is&rdquo; without warranties. We are not liable for any damages resulting from your use of the platform, including but not limited to lost employment opportunities or hiring decisions.</p>
            </Section>

            <Section title="8. Termination">
              <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your settings.</p>
            </Section>

            <Section title="9. Changes to Terms">
              <p>We may update these terms from time to time. Continued use after changes constitutes acceptance of the new terms.</p>
            </Section>

            <Section title="10. Contact">
              <p>
                Questions about these terms? Contact us at{" "}
                <a href="mailto:legal@ekclickjob.com" className="text-primary hover:underline">
                  legal@ekclickjob.com
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
