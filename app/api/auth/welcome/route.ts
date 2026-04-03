import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { sendWelcomeEmail } from "@/lib/email";
import type { UserRole } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { uid } = (await req.json()) as { uid: string };

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const userDoc = await adminDb.doc(`users/${uid}`).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userDoc.data() as {
      email: string;
      displayName: string;
      role: UserRole;
    };

    await sendWelcomeEmail(user.email, user.displayName, user.role === "admin" ? "seeker" : user.role);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("welcome email error:", err);
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
  }
}
