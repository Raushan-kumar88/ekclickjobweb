"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, LoaderIcon, MailIcon, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginSchema, type LoginFormData } from "@/lib/utils/validators";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/seeker/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const user = await signInWithEmail(data.email, data.password);
      const { getUserDocument } = await import("@/lib/firebase/auth");
      const [userDoc, token] = await Promise.all([
        getUserDocument(user.uid),
        user.getIdToken(),
      ]);
      const role = userDoc?.role ?? "seeker";
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `user-role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      const redirectTo = role === "employer" ? "/employer/dashboard" : from;
      toast.success("Welcome back!");
      router.push(redirectTo);
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        toast.error("Invalid email or password");
      } else if (err.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Failed to sign in. Please try again.");
      }
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      const { getUserDocument } = await import("@/lib/firebase/auth");
      const [userDoc, token] = await Promise.all([
        getUserDocument(user.uid),
        user.getIdToken(),
      ]);
      const role = userDoc?.role ?? "seeker";
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `user-role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      toast.success("Signed in with Google!");
      router.push(role === "employer" ? "/employer/dashboard" : from);
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "auth/popup-closed-by-user") return;
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your EkClickJob account</p>
      </div>

      {/* Google Sign In */}
      <Button
        variant="outline"
        className="w-full h-11 gap-3 rounded-xl font-medium border-border/60 hover:bg-accent/60 transition-all"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <LoaderIcon className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium">or continue with email</span>
        <Separator className="flex-1" />
      </div>

      {/* Email / Password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
          <div className="relative">
            <MailIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              aria-invalid={!!errors.email}
              className="h-11 pl-10 rounded-xl"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              aria-invalid={!!errors.password}
              className="h-11 pl-10 pr-10 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors no-min-tap"
              style={{ minHeight: "unset", minWidth: "unset" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-semibold shadow-sm shadow-primary/20 mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      {/* Phone sign in link */}
      <p className="text-center text-sm text-muted-foreground">
        Prefer phone?{" "}
        <Link href="/verify-phone" className="text-primary font-medium hover:underline">
          Sign in with OTP
        </Link>
      </p>

      {/* Register link */}
      <div className="text-center border-t pt-5">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
}
