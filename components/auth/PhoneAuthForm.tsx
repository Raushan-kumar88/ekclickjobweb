"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, ArrowLeftIcon, PhoneIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { phoneSchema, otpSchema, type PhoneFormData, type OtpFormData } from "@/lib/utils/validators";
import { signInWithPhone, verifyOTP, RecaptchaVerifier } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { ConfirmationResult } from "firebase/auth";

export function PhoneAuthForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
    return () => {
      recaptchaRef.current?.clear();
    };
  }, []);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  async function onPhoneSubmit(data: PhoneFormData) {
    try {
      if (!recaptchaRef.current) throw new Error("reCAPTCHA not initialized");
      const result = await signInWithPhone(data.phone, recaptchaRef.current);
      setPhone(data.phone);
      setConfirmationResult(result);
      setStep("otp");
      toast.success(`OTP sent to +91 ${data.phone}`);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "auth/invalid-phone-number") {
        toast.error("Invalid phone number. Please check and try again.");
      } else if (err.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    }
  }

  async function onOtpSubmit(data: OtpFormData) {
    if (!confirmationResult) return;
    try {
      const user = await verifyOTP(confirmationResult, data.otp);
      const { getUserDocument } = await import("@/lib/firebase/auth");
      const userDoc = await getUserDocument(user.uid);
      const redirectTo = userDoc?.role === "employer" ? "/employer/dashboard" : "/seeker/dashboard";
      router.push(redirectTo);
      toast.success("Phone verified! Welcome to EkClickJob.");
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "auth/invalid-verification-code") {
        toast.error("Invalid OTP. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        toast.error("OTP expired. Please request a new one.");
        setStep("phone");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    }
  }

  return (
    <>
      <div id="recaptcha-container" />

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <PhoneIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "phone" ? "Sign in with phone" : "Enter OTP"}
          </CardTitle>
          <CardDescription>
            {step === "phone"
              ? "We'll send a 6-digit OTP to your mobile number"
              : `Enter the OTP sent to +91 ${phone}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "phone" ? (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile number</Label>
                <div className="flex gap-2">
                  <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    🇮🇳 +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    {...phoneForm.register("phone")}
                    aria-invalid={!!phoneForm.formState.errors.phone}
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={phoneForm.formState.isSubmitting}
              >
                {phoneForm.formState.isSubmitting && (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-xl tracking-widest"
                  {...otpForm.register("otp")}
                  aria-invalid={!!otpForm.formState.errors.otp}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-destructive">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={otpForm.formState.isSubmitting}
              >
                {otpForm.formState.isSubmitting && (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify OTP
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("phone")}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Change number
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Sign in with email instead
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
