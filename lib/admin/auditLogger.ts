import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
  DocumentData,
  QueryConstraint,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetCollection: string;
  targetId: string;
  details: Record<string, unknown>;
  timestamp: Timestamp;
}

export interface AuditLogInput {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetCollection: string;
  targetId: string;
  details?: Record<string, unknown>;
}

export async function logAdminAction(input: AuditLogInput): Promise<void> {
  try {
    await addDoc(collection(db, "auditLogs"), {
      ...input,
      details: input.details ?? {},
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("[AuditLogger] Failed to write audit log:", err);
  }
}

export interface AuditLogFilters {
  adminId?: string;
  action?: string;
  targetCollection?: string;
  startDate?: Date;
  endDate?: Date;
  pageSize?: number;
  lastDoc?: DocumentData;
}

export async function fetchAuditLogs(filters: AuditLogFilters = {}): Promise<{
  logs: AuditLog[];
  lastDoc: DocumentData | null;
}> {
  const { pageSize = 50, lastDoc, adminId, action, targetCollection, startDate, endDate } = filters;

  const constraints: QueryConstraint[] = [orderBy("timestamp", "desc"), limit(pageSize)];

  if (adminId) constraints.push(where("adminId", "==", adminId));
  if (action) constraints.push(where("action", "==", action));
  if (targetCollection) constraints.push(where("targetCollection", "==", targetCollection));
  if (startDate) constraints.push(where("timestamp", ">=", Timestamp.fromDate(startDate)));
  if (endDate) constraints.push(where("timestamp", "<=", Timestamp.fromDate(endDate)));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, "auditLogs"), ...constraints);
  const snap = await getDocs(q);

  const logs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog));
  const last = snap.docs[snap.docs.length - 1] ?? null;

  return { logs, lastDoc: last };
}
