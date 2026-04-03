import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PLAN_PRICES } from "@/lib/utils/subscription";
import type { SubscriptionPlan } from "@/types";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { plan: SubscriptionPlan; userId: string };
    const { plan, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (plan !== "pro") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = PLAN_PRICES[plan].monthly;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `sub_${userId.slice(0, 20)}_${Date.now().toString().slice(-8)}`,
      notes: { userId, plan },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
