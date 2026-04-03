import Link from "next/link";
import Image from "next/image";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/">
          <div className="dark:bg-white dark:rounded-lg dark:px-2 dark:py-0.5">
            <Image src="/logo.png" alt="EkClickJob" width={200} height={60} className="h-12 w-auto object-contain" />
          </div>
        </Link>
      </header>
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
