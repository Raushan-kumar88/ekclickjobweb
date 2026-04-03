"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  BriefcaseIcon,
  UserIcon,
  MailIcon,
  LockIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { registerSchema, employerRegisterSchema, type RegisterFormData } from "@/lib/utils/validators";
import { signUpWithEmail, signInWithGoogle, getUserDocument } from "@/lib/firebase/auth";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) || "seeker";
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(role === "employer" ? employerRegisterSchema : registerSchema),
  });

  // Re-trigger email validation when role changes so work-email error shows immediately
  useEffect(() => {
    trigger("email");
  }, [role, trigger]);

  async function onSubmit(data: RegisterFormData) {
    try {
      const user = await signUpWithEmail(data.email, data.password, data.displayName, role);
      const token = await user.getIdToken();
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `user-role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      const userDoc = await getUserDocument(user.uid);
      if (userDoc) useAuthStore.getState().setUser(userDoc);
      fetch("/api/auth/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      }).catch(() => {});
      toast.success("Account created! Welcome to EkClickJob.");
      router.push("/onboarding");
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists.");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle(role);
      const { getUserDocument: getDoc } = await import("@/lib/firebase/auth");
      const userDoc = await getDoc(user.uid);
      const isNew = !userDoc?.onboardingCompleted;
      const token = await user.getIdToken();
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `user-role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      if (isNew) {
        if (userDoc) useAuthStore.getState().setUser(userDoc);
        fetch("/api/auth/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid }),
        }).catch(() => {});
        toast.success("Account created with Google!");
        router.push("/onboarding");
      } else {
        toast.success("Signed in with Google!");
        router.push(role === "employer" ? "/employer/dashboard" : "/seeker/dashboard");
      }
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "auth/popup-closed-by-user") return;
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Join thousands of professionals on EkClickJob</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("seeker")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
            role === "seeker"
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "border-border text-muted-foreground hover:border-primary/40 hover:bg-accent/50"
          )}
        >
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            role === "seeker" ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <UserIcon className="h-5 w-5" />
          </div>
          <span className="text-xs leading-tight text-center">I&apos;m looking for a job</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("employer")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
            role === "employer"
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "border-border text-muted-foreground hover:border-primary/40 hover:bg-accent/50"
          )}
        >
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            role === "employer" ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <BriefcaseIcon className="h-5 w-5" />
          </div>
          <span className="text-xs leading-tight text-center">I&apos;m hiring talent</span>
        </button>
      </div>

      {/* Google Sign Up */}
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
        <span className="text-xs text-muted-foreground font-medium">or with email</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-sm font-medium">Full name</Label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="displayName"
              type="text"
              placeholder="Arjun Sharma"
              autoComplete="name"
              {...register("displayName")}
              aria-invalid={!!errors.displayName}
              className="h-11 pl-10 rounded-xl"
            />
          </div>
          {errors.displayName && (
            <p className="text-xs text-destructive">{errors.displayName.message}</p>
          )}
        </div>

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
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
          {role === "employer" && !errors.email && (
            <p className="text-xs text-muted-foreground">
              Use your company email address (e.g. you@yourcompany.com)
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <LockIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              {...register("password")}
              aria-invalid={!!errors.password}
              className="h-11 pl-10 pr-10 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors no-min-tap"
              style={{ minHeight: "unset", minWidth: "unset" }}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
          <div className="relative">
            <LockIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
              className="h-11 pl-10 rounded-xl"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-semibold shadow-sm shadow-primary/20"
          disabled={isSubmitting}
        >
          {isSubmitting && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
          Create free account
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-primary hover:underline">Terms</Link>{" "}and{" "}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>

      <div className="text-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
