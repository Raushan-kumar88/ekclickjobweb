"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  GiftIcon, CopyIcon, CheckIcon, ShareIcon, UsersIcon, TrophyIcon,
  MessageCircleIcon, LinkedinIcon, MailIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function generateReferralCode(uid: string): string {
  return "ECJ" + uid.slice(0, 6).toUpperCase();
}

const REWARDS = [
  { milestone: 1, reward: "🎖️ Referrer Badge", points: 50 },
  { milestone: 3, reward: "📊 Priority Profile Listing", points: 150 },
  { milestone: 5, reward: "✨ Featured Profile for 7 days", points: 300 },
  { milestone: 10, reward: "🏆 Pro Subscription — 1 Month FREE", points: 500 },
];

export default function ReferralPage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const referralCode = user ? generateReferralCode(user.uid) : "";
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : "https://ekclickjob.com"}/register?ref=${referralCode}`;

  const mockReferrals = [
    { name: "Arjun S.", joinedAt: "2 days ago", status: "Signed up", points: 50 },
    { name: "Priya K.", joinedAt: "1 week ago", status: "Applied to job", points: 75 },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Referral link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  }

  const whatsappMsg = encodeURIComponent(`Hey! I've been using EkClickJob — India's top job portal. Join with my referral and get priority job alerts! ${referralLink}`);
  const linkedinMsg = encodeURIComponent(`Join EkClickJob with my referral link: ${referralLink}`);
  const emailSubject = encodeURIComponent("You're invited to EkClickJob — India's fastest job portal");
  const emailBody = encodeURIComponent(`Hi,\n\nI'd like to invite you to EkClickJob, India's fastest growing job portal.\n\nJoin using my referral link: ${referralLink}\n\nYou'll get priority job alerts and profile boost when you sign up through my link!\n\nBest,\n${user?.displayName ?? "A friend"}`);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <GiftIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Refer & Earn</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite friends to EkClickJob and earn rewards for every successful referral
        </p>
      </div>

      {/* Referral code card */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-violet-500/5 p-6">
        <p className="text-sm font-medium text-muted-foreground mb-1">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl border bg-background px-4 py-3 font-mono text-xl font-bold tracking-widest text-primary">
            {referralCode}
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-muted-foreground mb-2">Your Referral Link</p>
        <div className="flex items-center gap-2">
          <Input value={referralLink} readOnly className="text-xs h-9" />
          <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0 gap-1.5">
            {copied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <CopyIcon className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Share buttons */}
      <div className="rounded-2xl border bg-background p-5 space-y-3">
        <h3 className="font-semibold text-sm">Share via</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400">
              <MessageCircleIcon className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&summary=${linkedinMsg}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">
              <LinkedinIcon className="h-4 w-4" />
              LinkedIn
            </Button>
          </a>
          <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`}>
            <Button variant="outline" className="gap-2">
              <MailIcon className="h-4 w-4" />
              Email
            </Button>
          </a>
          <Button variant="outline" className="gap-2" onClick={copyLink}>
            <ShareIcon className="h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border bg-background p-5 space-y-3">
        <h3 className="font-semibold text-sm">How it works</h3>
        <div className="space-y-3">
          {[
            { step: "1", text: "Share your unique referral link with friends" },
            { step: "2", text: "Friend signs up using your link" },
            { step: "3", text: "You both earn reward points when they apply to a job" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {item.step}
              </span>
              <p className="text-sm text-muted-foreground pt-0.5">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reward milestones */}
      <div className="rounded-2xl border bg-background p-5 space-y-3">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-4 w-4 text-amber-600" />
          <h3 className="font-semibold text-sm">Reward Milestones</h3>
        </div>
        <div className="space-y-2">
          {REWARDS.map((r) => (
            <div
              key={r.milestone}
              className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/30">
                  {r.milestone}
                </span>
                <div>
                  <p className="text-sm font-medium">{r.reward}</p>
                  <p className="text-xs text-muted-foreground">Refer {r.milestone} friend{r.milestone > 1 ? "s" : ""}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-600">+{r.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Referral history */}
      <div className="rounded-2xl border bg-background p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Your Referrals</h3>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {mockReferrals.length} total
          </span>
        </div>
        {mockReferrals.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No referrals yet. Share your link to get started!</p>
        ) : (
          <div className="space-y-2">
            {mockReferrals.map((ref, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {ref.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ref.name}</p>
                    <p className="text-xs text-muted-foreground">{ref.status} · {ref.joinedAt}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600">+{ref.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
