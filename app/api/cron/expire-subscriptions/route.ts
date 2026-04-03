import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Runs daily at midnight via Vercel Cron (see vercel.json)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all active subscriptions whose period has ended and cancelAtPeriodEnd is true
    const snapshot = await adminDb
      .collection("subscriptions")
      .where("status", "==", "active")
      .where("cancelAtPeriodEnd", "==", true)
      .get();

    const expiredIds: string[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as {
        currentPeriodEnd: { toDate: () => Date };
        userId: string;
      };
      const periodEnd: Date = data.currentPeriodEnd.toDate();

      if (periodEnd <= now) {
        await docSnap.ref.update({
          status: "expired",
          updatedAt: FieldValue.serverTimestamp(),
        });
        expiredIds.push(data.userId);
      }
    }

    // Also expire active subscriptions that are past their end date (no cancel flag needed)
    const allActiveSnapshot = await adminDb
      .collection("subscriptions")
      .where("status", "==", "active")
      .where("cancelAtPeriodEnd", "==", false)
      .get();

    for (const docSnap of allActiveSnapshot.docs) {
      const data = docSnap.data() as {
        currentPeriodEnd: { toDate: () => Date };
        userId: string;
      };
      const periodEnd: Date = data.currentPeriodEnd.toDate();

      // Grace period of 1 day before expiring auto-renewals
      const gracePeriodEnd = new Date(periodEnd.getTime() + 24 * 60 * 60 * 1000);
      if (gracePeriodEnd <= now) {
        await docSnap.ref.update({
          status: "expired",
          updatedAt: FieldValue.serverTimestamp(),
        });
        expiredIds.push(data.userId);
      }
    }

    console.log(`Expired ${expiredIds.length} subscriptions.`);
    return NextResponse.json({ expired: expiredIds.length, userIds: expiredIds });
  } catch (err) {
    console.error("expire-subscriptions cron error:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
