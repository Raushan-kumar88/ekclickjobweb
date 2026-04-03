import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const role = cookieStore.get("user-role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { subject, body, audience, htmlBody } = await req.json();

    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
    }

    // Fetch target users
    let usersQuery = adminDb.collection("users");
    let queryRef: FirebaseFirestore.Query = usersQuery;

    if (audience === "seekers") {
      queryRef = usersQuery.where("role", "==", "seeker");
    } else if (audience === "employers") {
      queryRef = usersQuery.where("role", "==", "employer");
    }

    const usersSnap = await queryRef.get();
    const emails = usersSnap.docs
      .map((d) => d.data().email as string)
      .filter(Boolean);

    if (emails.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    // Send in batches of 50 (Resend batch limit)
    const BATCH_SIZE = 50;
    let sent = 0;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      await resend.batch.send(
        batch.map((email) => ({
          from: `EkClickJob <${process.env.EMAIL_FROM ?? "noreply@ekclickjob.com"}>`,
          to: email,
          subject,
          text: body,
          ...(htmlBody ? { html: htmlBody } : {}),
        }))
      );
      sent += batch.length;
    }

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error("bulk email error:", err);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}
