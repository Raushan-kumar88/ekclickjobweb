import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  // Check admin cookie
  const cookieStore = await cookies();
  const role = cookieStore.get("user-role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [usersSnap, jobsSnap, companiesSnap, appsSnap, verifSnap] = await Promise.all([
      adminDb.collection("users").count().get(),
      adminDb.collection("jobs").count().get(),
      adminDb.collection("companies").count().get(),
      adminDb.collection("applications").count().get(),
      adminDb.collection("verificationRequests").where("status", "==", "pending").count().get(),
    ]);

    const activeJobsSnap = await adminDb
      .collection("jobs")
      .where("status", "==", "active")
      .count()
      .get();

    return NextResponse.json({
      totalUsers: usersSnap.data().count,
      totalJobs: jobsSnap.data().count,
      totalCompanies: companiesSnap.data().count,
      totalApplications: appsSnap.data().count,
      activeJobs: activeJobsSnap.data().count,
      pendingVerifications: verifSnap.data().count,
    });
  } catch (err) {
    console.error("admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
