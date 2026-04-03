"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, CheckCircleIcon, ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/utils/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/utils/validators";
import { resetPassword } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      await resetPassword(data.email);
      setEmailSent(true);
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "auth/user-not-found") {
        // Don't reveal if email exists for security
        setEmailSent(true);
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    }
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircleIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your inbox</CardTitle>
          <CardDescription>
            We sent a password reset link to{" "}
            <span className="font-medium text-foreground">{getValues("email")}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </p>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center gap-2")}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>

        <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-center gap-2")}>
          <ArrowLeftIcon className="h-4 w-4" />
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
