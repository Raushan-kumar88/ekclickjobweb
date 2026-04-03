import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { JobAssistant } from "@/components/shared/JobAssistant";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EkClickJob - Find Your Dream Job in India",
    template: "%s | EkClickJob",
  },
  description:
    "India's fastest growing job portal. Find thousands of jobs from top companies. Apply in one click.",
  keywords: ["jobs", "job portal", "India", "careers", "employment", "hiring"],
  authors: [{ name: "EkClickJob" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ekclickjob.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ekclickjob.com",
    siteName: "EkClickJob",
    title: "EkClickJob - Find Your Dream Job in India",
    description: "India's fastest growing job portal. Find thousands of jobs from top companies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EkClickJob - Find Your Dream Job in India",
    description: "India's fastest growing job portal.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider>
                {children}
                <JobAssistant />
                <Toaster richColors position="top-right" />
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
