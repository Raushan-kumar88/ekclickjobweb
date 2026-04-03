"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { WorkExperience, Education } from "@/types";

export async function recordJobViewAction(jobId: string): Promise<void> {
  try {
    await adminDb.doc(`jobs/${jobId}`).update({
      viewsCount: FieldValue.increment(1),
    });
  } catch {
    // View tracking should never block the user experience
  }
}

export interface CandidateResult {
  uid: string;
  displayName: string;
  photoURL: string | null;
  headline: string;
  bio: string;
  location: { city: string; state: string };
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  resumeURL?: string;
  openToWork?: boolean;
  openToWorkVisibility?: "public" | "recruiters";
  noticePeriod?: string;
  currentCTC?: number;
  expectedCTC?: number;
}

export async function searchCandidatesAction(filters: {
  skill?: string;
  city?: string;
  keyword?: string;
} = {}): Promise<CandidateResult[]> {
  try {
    let q = adminDb
      .collection("users")
      .where("role", "==", "seeker")
      .limit(300);

    if (filters.skill) {
      q = adminDb
        .collection("users")
        .where("role", "==", "seeker")
        .where("profile.skills", "array-contains", filters.skill)
        .limit(300);
    }

    const snap = await q.get();

    let results: CandidateResult[] = snap.docs.map((d) => {
      const data = d.data();
      const p = data.profile ?? {};
      return {
        uid: d.id,
        displayName: data.displayName ?? "",
        photoURL: data.photoURL ?? null,
        headline: p.headline ?? "",
        bio: p.bio ?? "",
        location: p.location && typeof p.location === "object"
          ? { city: p.location.city ?? "", state: p.location.state ?? "" }
          : { city: "", state: "" },
        skills: Array.isArray(p.skills) ? p.skills : [],
        experience: Array.isArray(p.experience) ? p.experience : [],
        education: Array.isArray(p.education) ? p.education : [],
        resumeURL: p.resumeURL ?? "",
        openToWork: p.openToWork ?? false,
        openToWorkVisibility: p.openToWorkVisibility ?? "public",
        noticePeriod: p.noticePeriod ?? "",
        currentCTC: p.currentCTC ?? undefined,
        expectedCTC: p.expectedCTC ?? undefined,
      };
    });

    // City filter
    if (filters.city) {
      const city = filters.city.toLowerCase();
      results = results.filter(
        (c) =>
          c.location.city.toLowerCase().includes(city) ||
          c.location.state.toLowerCase().includes(city)
      );
    }

    // Keyword filter
    if (filters.keyword) {
      const words = filters.keyword.toLowerCase().trim().split(/\s+/).filter(Boolean);
      results = results.filter((c) => {
        const text = [c.displayName, c.headline, c.bio, ...c.skills].join(" ").toLowerCase();
        return words.every((w) => text.includes(w));
      });
    }

    // Only show seekers who have at least a name (remove ghost accounts)
    return results.filter((c) => c.displayName.trim().length > 0);
  } catch (err) {
    console.error("[searchCandidatesAction]", err);
    return [];
  }
}
