import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { sendApplicationStatusUpdate, sendNewApplicantAlert } from "@/lib/email";

// Called after employer updates an application status
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      type: "status_update" | "new_applicant";
      applicationId: string;
      jobId: string;
      status?: string;
    };

    const { type, applicationId, jobId, status } = body;

    if (!applicationId || !jobId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch application
    const appDoc = await adminDb.doc(`applications/${applicationId}`).get();
    if (!appDoc.exists) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    const application = appDoc.data() as {
      applicantId: string;
      applicantName: string;
      jobTitle: string;
      companyName: string;
      employerId: string;
    };

    if (type === "status_update" && status) {
      // Send email to seeker
      const seekerDoc = await adminDb.doc(`users/${application.applicantId}`).get();
      if (!seekerDoc.exists) {
        return NextResponse.json({ error: "Seeker not found" }, { status: 404 });
      }
      const seeker = seekerDoc.data() as {
        email: string;
        displayName: string;
        emailPreferences?: { applicationUpdates: boolean };
      };

      if (seeker.emailPreferences?.applicationUpdates !== false) {
        await sendApplicationStatusUpdate(
          seeker.email,
          seeker.displayName,
          application.jobTitle,
          application.companyName,
          status,
          jobId
        );
      }
    } else if (type === "new_applicant") {
      // Send email to employer
      const employerDoc = await adminDb.doc(`users/${application.employerId}`).get();
      if (!employerDoc.exists) {
        return NextResponse.json({ error: "Employer not found" }, { status: 404 });
      }
      const employer = employerDoc.data() as {
        email: string;
        displayName: string;
        emailPreferences?: { newApplicants: boolean };
      };

      if (employer.emailPreferences?.newApplicants !== false) {
        await sendNewApplicantAlert(
          employer.email,
          employer.displayName,
          application.applicantName,
          application.jobTitle,
          jobId,
          applicationId
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("application email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
