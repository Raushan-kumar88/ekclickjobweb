import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your EkClickJob account",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-md rounded-xl" />}>
      <LoginForm />
    </Suspense>
  );
}
