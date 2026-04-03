import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your EkClickJob account",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[600px] w-full max-w-md rounded-xl" />}>
      <RegisterForm />
    </Suspense>
  );
}
