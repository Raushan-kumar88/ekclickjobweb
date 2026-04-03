import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendJobAlertEmail } from "@/lib/email";

// Runs daily at 8 AM via Vercel Cron (see vercel.json)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all saved searches
    const searchesSnap = await adminDb.collection("savedSearches").get();

    let notificationsSent = 0;

    for (const searchDoc of searchesSnap.docs) {
      const search = searchDoc.data() as {
        userId: string;
        query: string;
        filters: Record<string, unknown>;
        frequency: "daily" | "weekly" | "instant";
        lastNotifiedAt?: { toDate: () => Date } | null;
      };

      // Skip based on frequency
      if (search.lastNotifiedAt) {
        const lastNotified = search.lastNotifiedAt.toDate();
        if (search.frequency === "daily" && lastNotified > oneDayAgo) continue;
        if (search.frequency === "weekly" && lastNotified > oneWeekAgo) continue;
      }

      // Fetch user to check preferences and email
      const userDoc = await adminDb.doc(`users/${search.userId}`).get();
      if (!userDoc.exists) continue;

      const user = userDoc.data() as {
        email: string;
        displayName: string;
        emailPreferences?: { jobAlerts: boolean };
      };

      if (!user.emailPreferences?.jobAlerts) continue;

      // Build cutoff date for "new jobs" — since last notification or 24h ago
      const since = search.lastNotifiedAt
        ? search.lastNotifiedAt.toDate()
        : oneDayAgo;

      // Query matching jobs
      const jobsQuery = adminDb
        .collection("jobs")
        .where("status", "==", "active")
        .where("postedAt", ">=", since)
        .limit(20);

      const jobsSnap = await jobsQuery.get();
      const allJobs = jobsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as {
          title: string;
          companyName: string;
          location: { city: string; state: string };
          jobType: string;
          skills: string[];
          category: string;
        }),
      }));

      // Filter jobs client-side by keyword search and filters
      const query = (search.query ?? "").toLowerCase();
      const filters = search.filters ?? {};

      const matched = allJobs.filter((job) => {
        const titleMatch = query ? job.title.toLowerCase().includes(query) : true;
        const categoryMatch = filters.category
          ? job.category === filters.category
          : true;
        const cityMatch = filters.city
          ? job.location?.city === filters.city
          : true;
        const jobTypeMatch = filters.jobType
          ? job.jobType === filters.jobType
          : true;
        return titleMatch && categoryMatch && cityMatch && jobTypeMatch;
      });

      if (matched.length === 0) continue;

      // Format for email
      const jobsForEmail = matched.map((j) => ({
        id: j.id,
        title: j.title,
        companyName: j.companyName,
        location: j.location ? `${j.location.city}, ${j.location.state}` : "India",
        jobType: j.jobType,
      }));

      await sendJobAlertEmail(
        user.email,
        user.displayName,
        search.query || "your saved search",
        jobsForEmail
      );

      // Update lastNotifiedAt
      await searchDoc.ref.update({ lastNotifiedAt: FieldValue.serverTimestamp() });
      notificationsSent++;
    }

    console.log(`Job alerts sent: ${notificationsSent}`);
    return NextResponse.json({ sent: notificationsSent });
  } catch (err) {
    console.error("job-alerts cron error:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
