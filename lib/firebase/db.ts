import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  type DocumentData,
  type QueryConstraint,
  type DocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Job,
  JobCreateInput,
  Application,
  ApplicationCreateInput,
  Company,
  CompanyCreateInput,
  CompanyReview,
  CompanyReviewInput,
  Notification,
  NotificationType,
  SavedSearch,
  EmailPreferences,
  VerificationRequest,
  VerificationStatus,
  Subscription,
  SubscriptionPlan,
  BillingRecord,
} from "@/types";

// ─── Internal helpers ────────────────────────────────────────────────────────

/** Narrow an unknown catch value to a Firestore-style error with a code. */
function isFirestoreError(e: unknown): e is { code: string } {
  return typeof e === "object" && e !== null && "code" in e && typeof (e as Record<string, unknown>).code === "string";
}

// ─── Serialization ──────────────────────────────────────────────────────────

export interface DisplayJob extends Omit<Job, "postedAt" | "updatedAt" | "expiresAt"> {
  postedAt: string;
  updatedAt: string;
  expiresAt: string;
}

export function toDisplayJob(job: Job): DisplayJob {
  const toISO = (ts: Timestamp | null | undefined) => {
    try {
      return ts?.toDate?.()?.toISOString() ?? new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  };
  return {
    ...job,
    postedAt: toISO(job.postedAt),
    updatedAt: toISO(job.updatedAt),
    expiresAt: toISO(job.expiresAt),
  };
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export async function getJobs(
  pageSize = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ jobs: Job[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [
    where("status", "==", "active"),
    orderBy("postedAt", "desc"),
    limit(pageSize),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));

  try {
    const q = query(collection(db, "jobs"), ...constraints);
    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
    return { jobs, lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null };
  } catch (error: unknown) {
    if (isFirestoreError(error) && error.code === "failed-precondition") {
      const fallbackQ = query(collection(db, "jobs"), where("status", "==", "active"), limit(pageSize));
      const snapshot = await getDocs(fallbackQ);
      const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
      return { jobs, lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null };
    }
    throw error;
  }
}

export async function getAllActiveJobs(): Promise<Job[]> {
  try {
    const q = query(collection(db, "jobs"), where("status", "==", "active"), orderBy("postedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
  } catch (error: unknown) {
    if (isFirestoreError(error) && error.code === "failed-precondition") {
      const fallbackQ = query(collection(db, "jobs"), where("status", "==", "active"));
      const snapshot = await getDocs(fallbackQ);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
    }
    throw error;
  }
}

export async function getFeaturedJobs(count = 6): Promise<Job[]> {
  try {
    const q = query(
      collection(db, "jobs"),
      where("status", "==", "active"),
      orderBy("postedAt", "desc"),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
  } catch (error: unknown) {
    if (isFirestoreError(error) && error.code === "failed-precondition") {
      const fallbackQ = query(collection(db, "jobs"), where("status", "==", "active"), limit(count));
      const snapshot = await getDocs(fallbackQ);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
    }
    throw error;
  }
}

export async function getJob(jobId: string): Promise<Job | null> {
  const snapshot = await getDoc(doc(db, "jobs", jobId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Job;
}

export async function getJobsByCategory(category: string, count = 8): Promise<DisplayJob[]> {
  try {
    const q = query(
      collection(db, "jobs"),
      where("status", "==", "active"),
      where("category", "==", category),
      orderBy("postedAt", "desc"),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => toDisplayJob({ id: d.id, ...d.data() } as Job));
  } catch {
    return [];
  }
}

export async function createJob(data: JobCreateInput, postedBy: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Strip undefined values — Firestore rejects them (null is fine)
  const sanitized = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );

  const docRef = await addDoc(collection(db, "jobs"), {
    ...sanitized,
    status: "active",
    postedBy,
    postedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt,
    applicationsCount: 0,
    viewsCount: 0,
    isSponsored: data.isSponsored ?? false,
  });
  return docRef.id;
}

export async function updateJob(jobId: string, data: Partial<DocumentData>): Promise<void> {
  await updateDoc(doc(db, "jobs", jobId), { ...data, updatedAt: serverTimestamp() });
}

export async function getEmployerJobs(employerId: string, status?: string): Promise<Job[]> {
  try {
    const constraints: QueryConstraint[] = [where("postedBy", "==", employerId), orderBy("postedAt", "desc")];
    if (status) constraints.unshift(where("status", "==", status));
    const q = query(collection(db, "jobs"), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
  } catch (error: unknown) {
    if (isFirestoreError(error) && error.code === "failed-precondition") {
      const fallbackConstraints: QueryConstraint[] = [where("postedBy", "==", employerId)];
      if (status) fallbackConstraints.push(where("status", "==", status));
      const fallbackQ = query(collection(db, "jobs"), ...fallbackConstraints);
      const snapshot = await getDocs(fallbackQ);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
    }
    throw error;
  }
}

// ─── Applications ─────────────────────────────────────────────────────────

export async function createApplication(
  data: ApplicationCreateInput,
  applicantId: string,
  applicantName: string
): Promise<string> {
  const docRef = await addDoc(collection(db, "applications"), {
    ...data,
    applicantId,
    applicantName,
    status: "applied",
    appliedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    employerNotes: "",
  });
  return docRef.id;
}

export async function getSeekerApplications(applicantId: string): Promise<Application[]> {
  try {
    const q = query(
      collection(db, "applications"),
      where("applicantId", "==", applicantId),
      orderBy("appliedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[];
  } catch (error: unknown) {
    if (isFirestoreError(error) && error.code === "failed-precondition") {
      const fallbackQ = query(collection(db, "applications"), where("applicantId", "==", applicantId));
      const snapshot = await getDocs(fallbackQ);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[];
    }
    throw error;
  }
}

export async function getJobApplications(jobId: string): Promise<Application[]> {
  try {
    const q = query(
      collection(db, "applications"),
      where("jobId", "==", jobId),
      orderBy("appliedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[];
  } catch (error: unknown) {
    const e = error as { code?: string; message?: string };
    if (e.code === "failed-precondition") {
      const fallbackQ = query(collection(db, "applications"), where("jobId", "==", jobId));
      const snapshot = await getDocs(fallbackQ);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[];
    }
    console.warn("[getJobApplications] error:", e.code, e.message);
    return [];
  }
}

export async function getEmployerApplications(employerId: string): Promise<Application[]> {
  try {
    const q = query(
      collection(db, "applications"),
      where("employerId", "==", employerId),
      orderBy("appliedAt", "desc"),
      limit(200)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[];
  } catch (error: unknown) {
    const e = error as { code?: string; message?: string };
    if (e.code === "failed-precondition") {
      const fallbackQ = query(
        collection(db, "applications"),
        where("employerId", "==", employerId)
      );
      const snapshot = await getDocs(fallbackQ);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[];
    }
    console.warn("[getEmployerApplications] error:", e.code, e.message);
    return [];
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  notes?: string
): Promise<void> {
  const data: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  if (notes !== undefined) data.employerNotes = notes;
  await updateDoc(doc(db, "applications", applicationId), data);
}

export async function hasApplied(jobId: string, applicantId: string): Promise<boolean> {
  const q = query(
    collection(db, "applications"),
    where("jobId", "==", jobId),
    where("applicantId", "==", applicantId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// ─── Companies ───────────────────────────────────────────────────────────────

export async function createCompany(data: CompanyCreateInput, ownerId: string): Promise<string> {
  const sanitized = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(collection(db, "companies"), {
    ...sanitized,
    logo: "",
    ownerId,
    verified: false,
    createdAt: serverTimestamp(),
    jobCount: 0,
  });
  return docRef.id;
}

export async function getCompany(companyId: string): Promise<Company | null> {
  const snapshot = await getDoc(doc(db, "companies", companyId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Company;
}

export async function getCompanyByOwner(ownerId: string): Promise<Company | null> {
  const q = query(collection(db, "companies"), where("ownerId", "==", ownerId), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as Company;
}

export async function updateCompany(companyId: string, data: Partial<DocumentData>): Promise<void> {
  await updateDoc(doc(db, "companies", companyId), data);
}

export async function getCompaniesByIds(companyIds: string[]): Promise<Company[]> {
  if (!companyIds.length) return [];
  const promises = companyIds.map((id) => getCompany(id));
  const results = await Promise.all(promises);
  return results.filter(Boolean) as Company[];
}

export async function getActiveJobsByCompany(companyId: string): Promise<Job[]> {
  const q = query(
    collection(db, "jobs"),
    where("companyId", "==", companyId),
    where("status", "==", "active"),
    orderBy("postedAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
}

export async function getAllCompanies(
  filters: { industry?: string; size?: string; city?: string } = {}
): Promise<Company[]> {
  const constraints: QueryConstraint[] = [orderBy("jobCount", "desc"), limit(60)];
  if (filters.industry) constraints.unshift(where("industry", "==", filters.industry));
  if (filters.size) constraints.unshift(where("size", "==", filters.size));
  if (filters.city) constraints.unshift(where("location.city", "==", filters.city));
  const q = query(collection(db, "companies"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Company));
}

// ─── Company Reviews ─────────────────────────────────────────────────────────

export async function getCompanyReviews(companyId: string): Promise<CompanyReview[]> {
  const q = query(
    collection(db, "companyReviews"),
    where("companyId", "==", companyId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CompanyReview));
}

export async function getMyCompanyReview(
  companyId: string,
  reviewerId: string
): Promise<CompanyReview | null> {
  const q = query(
    collection(db, "companyReviews"),
    where("companyId", "==", companyId),
    where("reviewerId", "==", reviewerId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as CompanyReview;
}

export async function submitCompanyReview(
  input: CompanyReviewInput,
  reviewerId: string,
  reviewerDisplayName: string
): Promise<void> {
  // Check if already reviewed
  const existing = await getMyCompanyReview(input.companyId, reviewerId);

  const data: Record<string, unknown> = {
    ...input,
    reviewerId,
    reviewerDisplayName,
    helpful: 0,
    helpfulVoters: [],
    updatedAt: serverTimestamp(),
  };
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) delete (data as Record<string, unknown>)[k];
  }

  if (existing) {
    // Update existing review
    await updateDoc(doc(db, "companyReviews", existing.id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create new review
    const ref = await addDoc(collection(db, "companyReviews"), {
      ...data,
      createdAt: serverTimestamp(),
    });

    // Update company aggregate rating
    const company = await getCompany(input.companyId);
    if (company) {
      const currentCount = company.reviewCount ?? 0;
      const currentAvg = company.averageRating ?? 0;
      const newCount = currentCount + 1;
      const newAvg = (currentAvg * currentCount + input.rating) / newCount;
      await updateDoc(doc(db, "companies", input.companyId), {
        averageRating: Math.round(newAvg * 10) / 10,
        reviewCount: newCount,
      });
    }
    return ref.id as unknown as void;
  }
}

export async function markReviewHelpful(
  reviewId: string,
  userId: string
): Promise<void> {
  const reviewRef = doc(db, "companyReviews", reviewId);
  const snap = await getDoc(reviewRef);
  if (!snap.exists()) return;
  const data = snap.data() as CompanyReview;
  const voters = data.helpfulVoters ?? [];
  const hasVoted = voters.includes(userId);

  await updateDoc(reviewRef, {
    helpful: hasVoted ? Math.max(0, data.helpful - 1) : data.helpful + 1,
    helpfulVoters: hasVoted
      ? voters.filter((v) => v !== userId)
      : [...voters, userId],
  });
}

// ─── Saved Jobs ──────────────────────────────────────────────────────────────

export async function saveJob(userId: string, jobId: string): Promise<void> {
  await setDoc(doc(db, "users", userId, "savedJobs", jobId), { savedAt: serverTimestamp() });
}

export async function unsaveJob(userId: string, jobId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "savedJobs", jobId));
}

export async function getSavedJobIds(userId: string): Promise<string[]> {
  const snapshot = await getDocs(collection(db, "users", userId, "savedJobs"));
  return snapshot.docs.map((d) => d.id);
}

export async function isJobSaved(userId: string, jobId: string): Promise<boolean> {
  const snapshot = await getDoc(doc(db, "users", userId, "savedJobs", jobId));
  return snapshot.exists();
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((d) => updateDoc(d.ref, { read: true })));
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await deleteDoc(doc(db, "notifications", notificationId));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

// ─── Saved Searches ──────────────────────────────────────────────────────────

export async function saveSearch(
  userId: string,
  searchQuery: string,
  filters: Record<string, unknown>,
  frequency: "daily" | "weekly" | "instant" = "daily"
): Promise<string> {
  const ref = await addDoc(collection(db, "savedSearches"), {
    userId,
    query: searchQuery,
    filters,
    frequency,
    createdAt: serverTimestamp(),
    lastNotifiedAt: null,
  });
  return ref.id;
}

export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  const q = query(
    collection(db, "savedSearches"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SavedSearch[];
}

export async function deleteSavedSearch(searchId: string): Promise<void> {
  await deleteDoc(doc(db, "savedSearches", searchId));
}

// ─── Email Preferences ───────────────────────────────────────────────────────

export async function updateEmailPreferences(
  userId: string,
  prefs: Partial<EmailPreferences>
): Promise<void> {
  await updateDoc(doc(db, "users", userId), { emailPreferences: prefs, updatedAt: serverTimestamp() });
}

export async function getEmailPreferences(userId: string): Promise<EmailPreferences | null> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return (snap.data().emailPreferences as EmailPreferences) ?? null;
}

// ─── Employer Validations (company verification submissions) ──────────────────
// All verification data is stored in `employerValidations` collection.
// The old `verificationRequests` collection is unused and can be ignored.

export async function getEmployerValidation(
  ownerId: string
): Promise<VerificationRequest | null> {
  const q = query(
    collection(db, "employerValidations"),
    where("ownerId", "==", ownerId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as VerificationRequest;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<DocumentData | null> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function updateUserProfile(userId: string, data: Partial<DocumentData>): Promise<void> {
  await updateDoc(doc(db, "users", userId), { ...data, updatedAt: serverTimestamp() });
}

// ─── Messaging ────────────────────────────────────────────────────────────────

import type { Conversation, Message, ParticipantInfo } from "@/types";

/**
 * Get or create a conversation between two users.
 * Uses a deterministic ID so the same pair never has duplicates.
 */
export async function getOrCreateConversation(
  currentUid: string,
  otherUid: string,
  currentInfo: ParticipantInfo,
  otherInfo: ParticipantInfo,
  jobId?: string,
  jobTitle?: string
): Promise<string> {
  // Deterministic ID — always sorted so [a,b] == [b,a], no duplicates
  const ids = [currentUid, otherUid].sort();
  const convId = jobId ? `${ids[0]}_${ids[1]}_${jobId}` : `${ids[0]}_${ids[1]}`;

  const ref = doc(db, "conversations", convId);

  const newConvData = {
    participantIds: ids,
    participantInfo: {
      [currentUid]: currentInfo,
      [otherUid]: otherInfo,
    },
    jobId: jobId ?? null,
    jobTitle: jobTitle ?? null,
    lastMessage: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    unreadCount: { [currentUid]: 0, [otherUid]: 0 },
  };

  // Try to read the doc first to check existence.
  // Firestore security rules for non-existent documents may evaluate
  // `resource.data.*` as null and return permission-denied. In that case
  // we skip the read and go straight to creating the document.
  let docExists = false;
  try {
    const snap = await getDoc(ref);
    docExists = snap.exists();
  } catch (readErr: unknown) {
    const code = (readErr as { code?: string })?.code;
    // permission-denied on a non-existent doc is expected with strict rules —
    // fall through and attempt to create below.
    if (code !== "permission-denied") throw readErr;
  }

  if (!docExists) {
    try {
      await setDoc(ref, newConvData);
    } catch (writeErr: unknown) {
      const code = (writeErr as { code?: string })?.code;
      // "already-exists" means a concurrent write beat us — that's fine.
      if (code !== "already-exists") throw writeErr;
    }
  }

  return convId;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, "conversations"),
      where("participantIds", "array-contains", userId),
      orderBy("updatedAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
  } catch (error: unknown) {
    const e = error as { code?: string; message?: string };
    if (e.code === "failed-precondition") {
      const fallbackQ = query(
        collection(db, "conversations"),
        where("participantIds", "array-contains", userId),
        limit(50)
      );
      const snap = await getDocs(fallbackQ);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
    }
    console.warn("[getConversations] error:", e.code, e.message);
    return [];
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  recipientId: string
): Promise<void> {
  // Write message and update conversation summary atomically
  await Promise.all([
    addDoc(collection(db, "conversations", conversationId, "messages"), {
      conversationId,
      senderId,
      text,
      type: "text",
      createdAt: serverTimestamp(),
      read: false,
    }),
    updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: {
        text,
        senderId,
        timestamp: serverTimestamp(),
        read: false,
      },
      updatedAt: serverTimestamp(),
      // Atomic increment — no read-before-write, no race condition
      [`unreadCount.${recipientId}`]: increment(1),
    }),
  ]);
}

export async function markMessagesRead(
  conversationId: string,
  userId: string
): Promise<void> {
  // Reset the unread counter (drives the badge in sidebar)
  await updateDoc(doc(db, "conversations", conversationId), {
    [`unreadCount.${userId}`]: 0,
    "lastMessage.read": true,
  });

  // Best-effort: mark individual messages as read for delivery receipts.
  // Uses a simple equality query to avoid multi-field inequality index requirement.
  try {
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      where("read", "==", false)
    );
    const snap = await getDocs(q);
    const unread = snap.docs.filter((d) => d.data().senderId !== userId);
    if (unread.length > 0) {
      await Promise.all(unread.map((d) => updateDoc(d.ref, { read: true })));
    }
  } catch {
    // Non-critical — badge is already cleared above
  }
}

export async function getTotalUnreadMessages(userId: string): Promise<number> {
  const q = query(
    collection(db, "conversations"),
    where("participantIds", "array-contains", userId)
  );
  const snap = await getDocs(q);
  let total = 0;
  for (const d of snap.docs) {
    const data = d.data();
    total += data.unreadCount?.[userId] ?? 0;
  }
  return total;
}

// ─── Interviews ───────────────────────────────────────────────────────────────

import type { Interview, InterviewType } from "@/types";

export interface ScheduleInterviewInput {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  employerId: string;
  seekerId: string;
  seekerName: string;
  scheduledAt: Date;
  duration: number;
  type: InterviewType;
  meetingLink?: string;
  location?: string;
  notes?: string;
}

export async function scheduleInterview(input: ScheduleInterviewInput): Promise<string> {
  // Firestore rejects `undefined` values — strip them before writing
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined) data[k] = v;
  }
  const ref = await addDoc(collection(db, "interviews"), {
    ...data,
    status: "scheduled",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getEmployerInterviews(employerId: string): Promise<Interview[]> {
  const q = query(
    collection(db, "interviews"),
    where("employerId", "==", employerId),
    orderBy("scheduledAt", "asc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interview));
}

export async function getSeekerInterviews(seekerId: string): Promise<Interview[]> {
  const q = query(
    collection(db, "interviews"),
    where("seekerId", "==", seekerId),
    orderBy("scheduledAt", "asc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interview));
}

export async function updateInterviewStatus(
  interviewId: string,
  status: Interview["status"]
): Promise<void> {
  await updateDoc(doc(db, "interviews", interviewId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function rescheduleInterview(
  interviewId: string,
  newDate: Date,
  notes?: string
): Promise<void> {
  await updateDoc(doc(db, "interviews", interviewId), {
    scheduledAt: newDate,
    status: "rescheduled",
    ...(notes !== undefined && { notes }),
    updatedAt: serverTimestamp(),
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface EmployerAnalytics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  statusBreakdown: Record<string, number>;
  applicationsByDay: { date: string; count: number }[];
  topJobs: { jobId: string; title: string; applications: number; views: number }[];
}

export async function getEmployerAnalytics(employerId: string): Promise<EmployerAnalytics> {
  // Fetch all employer jobs
  const jobsQ = query(
    collection(db, "jobs"),
    where("postedBy", "==", employerId),
    orderBy("postedAt", "desc"),
    limit(100)
  );
  const jobsSnap = await getDocs(jobsQ);
  const jobs = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
    id: string; title: string; status: string; applicationsCount: number; viewsCount: number;
  }>;

  // Fetch all applications for this employer
  const appsQ = query(
    collection(db, "applications"),
    where("employerId", "==", employerId),
    orderBy("appliedAt", "desc"),
    limit(500)
  );
  const appsSnap = await getDocs(appsQ);
  const apps = appsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
    id: string; status: string; appliedAt: { toDate: () => Date };
  }>;

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  for (const app of apps) {
    statusBreakdown[app.status] = (statusBreakdown[app.status] ?? 0) + 1;
  }

  // Applications by day (last 30 days)
  const now = new Date();
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const app of apps) {
    try {
      const dateKey = app.appliedAt.toDate().toISOString().slice(0, 10);
      if (dateKey in dayMap) dayMap[dateKey]++;
    } catch { /* skip */ }
  }
  const applicationsByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

  // Top 5 jobs by applications
  const topJobs = [...jobs]
    .sort((a, b) => (b.applicationsCount ?? 0) - (a.applicationsCount ?? 0))
    .slice(0, 5)
    .map((j) => ({
      jobId: j.id,
      title: j.title,
      applications: j.applicationsCount ?? 0,
      views: j.viewsCount ?? 0,
    }));

  return {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === "active").length,
    totalApplications: apps.length,
    totalViews: jobs.reduce((s, j) => s + (j.viewsCount ?? 0), 0),
    statusBreakdown,
    applicationsByDay,
    topJobs,
  };
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    const snap = await getDoc(doc(db, "subscriptions", userId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Subscription;
  } catch (error: unknown) {
    console.warn("[getSubscription] error:", (error as { code?: string }).code);
    return null;
  }
}

export async function activateSubscription(
  userId: string,
  plan: SubscriptionPlan,
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<void> {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30); // 30-day billing cycle

  await setDoc(doc(db, "subscriptions", userId), {
    userId,
    plan,
    status: "active",
    razorpayOrderId,
    razorpayPaymentId,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function cancelSubscription(userId: string): Promise<void> {
  await updateDoc(doc(db, "subscriptions", userId), {
    cancelAtPeriodEnd: true,
    updatedAt: serverTimestamp(),
  });
}

export async function saveBillingRecord(
  userId: string,
  record: Omit<BillingRecord, "id" | "createdAt">
): Promise<void> {
  await addDoc(collection(db, "subscriptions", userId, "billingHistory"), {
    ...record,
    createdAt: serverTimestamp(),
  });
}

export async function getBillingHistory(userId: string): Promise<BillingRecord[]> {
  const q = query(
    collection(db, "subscriptions", userId, "billingHistory"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BillingRecord));
}

// ─── Candidates (Seeker Search) ───────────────────────────────────────────────

export interface CandidateResult {
  uid: string;
  displayName: string;
  photoURL: string | null;
  headline: string;
  bio: string;
  location: { city: string; state: string };
  skills: string[];
  experience: import("@/types").WorkExperience[];
  education: import("@/types").Education[];
  resumeURL?: string;
  openToWork?: boolean;
  openToWorkVisibility?: "public" | "recruiters";
  noticePeriod?: string;
  currentCTC?: number;
  expectedCTC?: number;
}

export async function searchCandidates(filters: {
  skill?: string;
  city?: string;
  keyword?: string;
} = {}): Promise<CandidateResult[]> {
  const constraints: QueryConstraint[] = [
    where("role", "==", "seeker"),
    limit(200),
  ];

  // Server-side skill filter (uses array-contains index)
  if (filters.skill) {
    constraints.push(where("profile.skills", "array-contains", filters.skill));
  }

  const snap = await getDocs(query(collection(db, "users"), ...constraints));

  let results: CandidateResult[] = snap.docs.map((d) => {
    const data = d.data();
    const p = data.profile ?? {};
    return {
      uid: d.id,
      displayName: data.displayName ?? "",
      photoURL: data.photoURL ?? null,
      headline: p.headline ?? "",
      bio: p.bio ?? "",
      location: p.location ?? { city: "", state: "" },
      skills: p.skills ?? [],
      experience: p.experience ?? [],
      education: p.education ?? [],
      resumeURL: p.resumeURL ?? "",
      openToWork: p.openToWork ?? false,
      openToWorkVisibility: p.openToWorkVisibility ?? "public",
      noticePeriod: p.noticePeriod ?? "",
      currentCTC: p.currentCTC ?? undefined,
      expectedCTC: p.expectedCTC ?? undefined,
    };
  });

  // Client-side city filter
  if (filters.city) {
    const city = filters.city.toLowerCase();
    results = results.filter((c) =>
      c.location.city.toLowerCase().includes(city) ||
      c.location.state.toLowerCase().includes(city)
    );
  }

  // Client-side keyword filter — split into individual words so that
  // "react developer" matches someone with skill "React" and headline "Developer"
  if (filters.keyword) {
    const words = filters.keyword.toLowerCase().trim().split(/\s+/).filter(Boolean);
    results = results.filter((c) => {
      const searchText = [
        c.displayName,
        c.headline,
        c.bio,
        ...c.skills,
      ].join(" ").toLowerCase();
      return words.every((word) => searchText.includes(word));
    });
  }

  // Only return candidates who have at least a headline or skills set
  return results.filter((c) => c.headline || c.skills.length > 0);
}

// ─── Profile Views ────────────────────────────────────────────────────────────

export interface ProfileView {
  id: string;
  viewerId: string;
  viewerName: string;
  viewerCompany?: string;
  viewerRole: "employer" | "seeker" | "admin";
  viewedAt: import("firebase/firestore").Timestamp;
}

export async function recordProfileView(
  seekerId: string,
  viewer: { uid: string; displayName: string; role: string; companyName?: string }
): Promise<void> {
  if (viewer.uid === seekerId) return; // Don't record self-views
  const viewsRef = collection(db, "users", seekerId, "profileViews");
  // Upsert: one record per viewer per day
  const today = new Date().toISOString().slice(0, 10);
  const viewId = `${viewer.uid}_${today}`;
  await setDoc(doc(viewsRef, viewId), {
    viewerId: viewer.uid,
    viewerName: viewer.displayName ?? "Anonymous",
    viewerCompany: viewer.companyName ?? null,
    viewerRole: viewer.role,
    viewedAt: serverTimestamp(),
  });
}

export async function getProfileViews(seekerId: string, limitCount = 20): Promise<ProfileView[]> {
  try {
    const q = query(
      collection(db, "users", seekerId, "profileViews"),
      orderBy("viewedAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ProfileView[];
  } catch {
    return [];
  }
}
