import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const role = cookieStore.get("user-role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { subscriptionId, userId, plan } = await req.json();

    if (!subscriptionId || !userId || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validPlans = ["free", "pro", "enterprise"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await adminDb.collection("subscriptions").doc(subscriptionId).update({
      plan,
      status: "active",
      currentPeriodStart: FieldValue.serverTimestamp(),
      currentPeriodEnd: endDate,
      updatedAt: FieldValue.serverTimestamp(),
      overriddenByAdmin: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("subscription override error:", err);
    return NextResponse.json({ error: "Failed to override subscription" }, { status: 500 });
  }
}
