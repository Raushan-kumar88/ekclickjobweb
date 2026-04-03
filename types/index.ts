export * from "./user";
export * from "./job";
export * from "./application";
export * from "./company";

export type NotificationType =
  | "application_update"
  | "new_applicant"
  | "job_alert"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: {
    jobId?: string;
    applicationId?: string;
    companyId?: string;
    [key: string]: string | undefined;
  };
  read: boolean;
  createdAt: import("firebase/firestore").Timestamp;
}

export interface SavedSearch {
  id: string;
  userId: string;
  query: string;
  filters: Record<string, unknown>;
  frequency: "daily" | "weekly" | "instant";
  createdAt: import("firebase/firestore").Timestamp;
  lastNotifiedAt: import("firebase/firestore").Timestamp | null;
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export interface ParticipantInfo {
  displayName: string;
  photoURL: string | null;
  role: "seeker" | "employer";
}

export interface LastMessage {
  text: string;
  senderId: string;
  timestamp: import("firebase/firestore").Timestamp;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantInfo: Record<string, ParticipantInfo>;
  jobId?: string;
  jobTitle?: string;
  lastMessage?: LastMessage;
  createdAt: import("firebase/firestore").Timestamp;
  updatedAt: import("firebase/firestore").Timestamp;
  unreadCount: Record<string, number>;
}

export type MessageType = "text" | "file";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: MessageType;
  fileURL?: string;
  fileName?: string;
  createdAt: import("firebase/firestore").Timestamp;
  read: boolean;
}

// ─── Interviews ──────────────────────────────────────────────────────────────

export type InterviewType = "video" | "phone" | "in-person";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  employerId: string;
  seekerId: string;
  seekerName: string;
  scheduledAt: import("firebase/firestore").Timestamp;
  duration: number; // minutes
  type: InterviewType;
  meetingLink?: string;
  location?: string;
  notes?: string;
  status: InterviewStatus;
  createdAt: import("firebase/firestore").Timestamp;
  updatedAt: import("firebase/firestore").Timestamp;
}

// ─── Billing & Subscriptions ─────────────────────────────────────────────────

export type SubscriptionPlan = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trialing";

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  currentPeriodStart: import("firebase/firestore").Timestamp;
  currentPeriodEnd: import("firebase/firestore").Timestamp;
  cancelAtPeriodEnd: boolean;
  createdAt: import("firebase/firestore").Timestamp;
  updatedAt: import("firebase/firestore").Timestamp;
}

export interface BillingRecord {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  plan: SubscriptionPlan;
  amount: number; // in paise
  currency: string;
  status: "captured" | "failed";
  createdAt: import("firebase/firestore").Timestamp;
}

// ─── Verification ────────────────────────────────────────────────────────────

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface VerificationRequest {
  id: string;
  companyId: string;
  ownerId: string;
  companyName: string;
  status: VerificationStatus;
  submittedAt: import("firebase/firestore").Timestamp;
  reviewedAt?: import("firebase/firestore").Timestamp;
  notes?: string;
}
