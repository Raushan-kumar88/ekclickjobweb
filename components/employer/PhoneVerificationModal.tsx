"use client";

import { useState } from "react";
import { PhoneIcon, LoaderIcon, ShieldCheckIcon, XIcon, CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/stores/authStore";

interface PhoneVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function PhoneVerificationModal({ open, onClose, onVerified }: PhoneVerificationModalProps) {
  const uid = useAuthStore((s) => s.uid);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const cleaned = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!uid) {
      toast.error("Not authenticated. Please sign in again.");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", uid), {
        phoneVerified: true,
        phone: cleaned,
        phoneVerifiedAt: serverTimestamp(),
      });
      // Update auth store so the gate lifts immediately without a full reload
      if (user) {
        setUser({ ...user, phone: cleaned, phoneVerified: true });
      }
      toast.success("Phone number saved successfully!");
      setPhone("");
      onVerified();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save phone number. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl mx-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30">
              <ShieldCheckIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add your phone number</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Required once to post jobs and protect candidates from spam
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
            {[
              "Your number is never shown publicly",
              "Used only for account verification and security",
              "Required once — no repeated prompts",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0 text-green-500" />
                {text}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Mobile number
            </label>
            <div className="flex gap-2">
              <div className="flex h-11 items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                placeholder="98765 43210"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || phone.length !== 10}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <PhoneIcon className="h-4 w-4" />}
            {loading ? "Saving…" : "Save & Continue"}
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            By adding your number you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
