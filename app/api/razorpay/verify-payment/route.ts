import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { PLAN_PRICES } from "@/lib/utils/subscription";
import { sendSubscriptionConfirmation } from "@/lib/email";
import type { SubscriptionPlan } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      userId: string;
      plan: SubscriptionPlan;
    };

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30); // 30-day cycle

    // Activate subscription via Admin SDK (bypasses client security rules)
    await adminDb.doc(`subscriptions/${userId}`).set({
      userId,
      plan,
      status: "active",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Save billing record
    const amount = plan === "pro" ? PLAN_PRICES.pro.monthly : 0;
    await adminDb
      .collection(`subscriptions/${userId}/billingHistory`)
      .add({
        userId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        plan,
        amount,
        currency: "INR",
        status: "captured",
        createdAt: FieldValue.serverTimestamp(),
      });

    // Send subscription confirmation email (fire-and-forget)
    try {
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      if (userDoc.exists) {
        const userData = userDoc.data() as { email: string; displayName: string };
        await sendSubscriptionConfirmation(userData.email, userData.displayName, plan, periodEnd);
      }
    } catch {
      // Non-critical — don't fail the payment verification
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Razorpay verify-payment error:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
