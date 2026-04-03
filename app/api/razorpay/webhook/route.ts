import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { PLAN_PRICES } from "@/lib/utils/subscription";
import { sendSubscriptionConfirmation } from "@/lib/email";
import type { SubscriptionPlan } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const rawBody = await req.text();

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment?: {
          entity: {
            id: string;
            order_id: string;
            amount: number;
            currency: string;
            status: string;
            notes?: Record<string, string>;
          };
        };
      };
    };

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        const userId = payment.notes?.userId;
        const plan = payment.notes?.plan as SubscriptionPlan | undefined;

        if (userId && plan) {
          const now = new Date();
          const periodEnd = new Date(now);
          periodEnd.setDate(periodEnd.getDate() + 30);

          await adminDb.doc(`subscriptions/${userId}`).set(
            {
              userId,
              plan,
              status: "active",
              razorpayPaymentId: payment.id,
              razorpayOrderId: payment.order_id,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          // Record billing history
          const amount = plan === "pro" ? PLAN_PRICES.pro.monthly : 0;
          await adminDb.collection(`subscriptions/${userId}/billingHistory`).add({
            userId,
            razorpayOrderId: payment.order_id,
            razorpayPaymentId: payment.id,
            plan,
            amount,
            currency: payment.currency,
            status: "captured",
            createdAt: FieldValue.serverTimestamp(),
          });

          // Send confirmation email
          const userDoc = await adminDb.doc(`users/${userId}`).get();
          if (userDoc.exists) {
            const userData = userDoc.data() as { email: string; displayName: string };
            await sendSubscriptionConfirmation(
              userData.email,
              userData.displayName,
              plan,
              periodEnd
            );
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        const userId = payment.notes?.userId;
        if (userId) {
          await adminDb.doc(`subscriptions/${userId}`).set(
            {
              status: "expired",
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          const amount = 0;
          await adminDb.collection(`subscriptions/${userId}/billingHistory`).add({
            userId,
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id ?? "",
            plan: payment.notes?.plan ?? "pro",
            amount,
            currency: payment.currency,
            status: "failed",
            createdAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
