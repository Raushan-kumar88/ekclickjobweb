"use client";

import { useState } from "react";
import {
  MapPinIcon, BriefcaseIcon, GraduationCapIcon,
  MessageSquareIcon, FileTextIcon, ChevronDownIcon, ChevronUpIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetOrCreateConversation } from "@/hooks/useMessaging";
import { useAuthStore } from "@/stores/authStore";
import type { CandidateResult } from "@/lib/firebase/db";

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-blue-500", "bg-emerald-500", "bg-rose-500",
    "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
  ];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface CandidateCardProps {
  candidate: CandidateResult;
}

export function CandidateCard({ candidate: c }: CandidateCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(false);

  const getOrCreateConversation = useGetOrCreateConversation();

  async function handleMessage() {
    if (!user) return;
    const id = await getOrCreateConversation.mutateAsync({
      otherUid: c.uid,
      otherInfo: {
        displayName: c.displayName,
        photoURL: c.photoURL ?? null,
        role: "seeker" as const,
      },
    });
    router.push(`/employer/messages/${id}`);
  }

  const initials = c.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const latestExp = c.experience[0];
  const topEdu = c.education[0];

  return (
    <div className="rounded-2xl border bg-card transition-shadow hover:shadow-md">
      {/* ── Header ── */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(c.displayName)}`}
          >
            {c.photoURL ? (
              <img src={c.photoURL} alt={c.displayName} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              initials || "?"
            )}
          </div>

          {/* Name + headline */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base leading-tight">{c.displayName}</p>
            {c.headline && (
              <p className="mt-0.5 text-sm text-primary font-medium truncate">{c.headline}</p>
            )}
            {c.location?.city && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPinIcon className="h-3 w-3" />
                {c.location.city}{c.location.state ? `, ${c.location.state}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Quick stats row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {c.experience.length > 0 && (
            <span className="flex items-center gap-1">
              <BriefcaseIcon className="h-3 w-3" />
              {c.experience.length} role{c.experience.length > 1 ? "s" : ""}
            </span>
          )}
          {c.education.length > 0 && (
            <span className="flex items-center gap-1">
              <GraduationCapIcon className="h-3 w-3" />
              {c.education[0]?.degree}
            </span>
          )}
          {c.resumeURL && (
            <span className="flex items-center gap-1 text-primary">
              <FileTextIcon className="h-3 w-3" />
              Resume available
            </span>
          )}
        </div>

        {/* Skills */}
        {c.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.skills.slice(0, expanded ? undefined : 6).map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {skill}
              </span>
            ))}
            {!expanded && c.skills.length > 6 && (
              <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                +{c.skills.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t px-5 pb-4 pt-3 space-y-3">
          {c.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">{c.bio}</p>
          )}
          {latestExp && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Latest Experience
              </p>
              <p className="text-sm font-medium">{latestExp.title}</p>
              <p className="text-xs text-muted-foreground">
                {latestExp.company} · {latestExp.startDate} — {latestExp.endDate ?? "Present"}
              </p>
              {latestExp.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{latestExp.description}</p>
              )}
            </div>
          )}
          {topEdu && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Education
              </p>
              <p className="text-sm font-medium">{topEdu.degree}</p>
              <p className="text-xs text-muted-foreground">{topEdu.institution} · {topEdu.year}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 border-t px-5 py-3">
        <button
          onClick={handleMessage}
          disabled={getOrCreateConversation.isPending}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <MessageSquareIcon className="h-3.5 w-3.5" />
          Message
        </button>

        {c.resumeURL && (
          <a
            href={c.resumeURL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <FileTextIcon className="h-3.5 w-3.5" />
            Resume
          </a>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          {expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          {expanded ? "Less" : "More"}
        </button>
      </div>
    </div>
  );
}
