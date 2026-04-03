import type { Metadata } from "next";
import { PhoneAuthForm } from "@/components/auth/PhoneAuthForm";

export const metadata: Metadata = {
  title: "Verify phone",
  description: "Verify your phone number to sign in",
};

export default function VerifyPhonePage() {
  return <PhoneAuthForm />;
}
