import { Resend } from "resend";

// Lazy instance — only instantiated when actually sending so a missing key
// during dev doesn't crash the module on import.
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set — email sending is disabled.");
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM = "EkClickJob <noreply@ekclickjob.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ekclickjob.com";

// ─── Shared HTML wrapper ──────────────────────────────────────────────────────

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EkClickJob</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);padding:32px 40px;text-align:center">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">EkClickJob</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,.8);font-size:13px">India's fastest growing job portal</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f1f5f9;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0">
            <p style="margin:0;color:#94a3b8;font-size:12px">
              © ${new Date().getFullYear()} EkClickJob · <a href="${APP_URL}/privacy" style="color:#6d28d9;text-decoration:none">Privacy</a> · <a href="${APP_URL}/terms" style="color:#6d28d9;text-decoration:none">Terms</a>
            </p>
            <p style="margin:6px 0 0;color:#94a3b8;font-size:11px">EkClickJob, India</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#4f46e5);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;margin:24px 0">${label}</a>`;
}

// ─── Email senders ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, displayName: string, role: "seeker" | "employer") {
  const dashUrl = `${APP_URL}/${role}/dashboard`;
  const body = emailLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px">Welcome, ${displayName}! 🎉</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:15px;line-height:1.6">
      You're now part of EkClickJob — India's fastest growing job portal.
      ${role === "seeker"
        ? "Start exploring thousands of jobs from top companies."
        : "Start posting jobs and finding your next great hire."}
    </p>
    <div style="text-align:center">${btn(role === "seeker" ? "Browse Jobs" : "Post Your First Job", dashUrl)}</div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0" />
    <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center">Questions? Reply to this email and we'll help you out.</p>
  `);

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Welcome to EkClickJob, ${displayName}!`,
    html: body,
  });
}

export async function sendApplicationConfirmation(
  to: string,
  seekerName: string,
  jobTitle: string,
  companyName: string,
  jobId: string
) {
  const jobUrl = `${APP_URL}/jobs/${jobId}`;
  const appsUrl = `${APP_URL}/seeker/applications`;

  const body = emailLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px">Application submitted! ✅</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
      Hi ${seekerName}, your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received.
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Position</p>
      <p style="margin:0;color:#1e293b;font-size:16px;font-weight:600">${jobTitle}</p>
      <p style="margin:4px 0 0;color:#64748b;font-size:14px">${companyName}</p>
    </div>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.6">
      We've notified the employer. You'll receive an update when they review your application. In the meantime, keep exploring more opportunities!
    </p>
    <div style="text-align:center;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      ${btn("View Application", appsUrl)}
    </div>
    <p style="margin:20px 0 0;text-align:center">
      <a href="${jobUrl}" style="color:#6d28d9;font-size:13px;text-decoration:none">View job posting →</a>
    </p>
  `);

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Application submitted: ${jobTitle} at ${companyName}`,
    html: body,
  });
}

export async function sendNewApplicantAlert(
  to: string,
  employerName: string,
  seekerName: string,
  jobTitle: string,
  jobId: string,
  applicationId: string
) {
  const appsUrl = `${APP_URL}/employer/jobs/${jobId}/applicants`;

  const body = emailLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px">New applicant! 👤</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
      Hi ${employerName}, <strong>${seekerName}</strong> has applied for <strong>${jobTitle}</strong>.
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Applicant</p>
      <p style="margin:0;color:#1e293b;font-size:16px;font-weight:600">${seekerName}</p>
      <p style="margin:4px 0 0;color:#64748b;font-size:14px">Applied for: ${jobTitle}</p>
    </div>
    <div style="text-align:center">${btn("Review Application", appsUrl)}</div>
  `);

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `New applicant for ${jobTitle}: ${seekerName}`,
    html: body,
  });
}

export async function sendApplicationStatusUpdate(
  to: string,
  seekerName: string,
  jobTitle: string,
  companyName: string,
  status: string,
  jobId: string
) {
  const appsUrl = `${APP_URL}/seeker/applications`;

  const STATUS_MESSAGES: Record<string, { emoji: string; headline: string; detail: string }> = {
    viewed: {
      emoji: "👀",
      headline: "Your application was viewed",
      detail: `${companyName} has viewed your application for <strong>${jobTitle}</strong>. They're reviewing candidates.`,
    },
    shortlisted: {
      emoji: "⭐",
      headline: "You've been shortlisted!",
      detail: `Great news! ${companyName} has shortlisted you for <strong>${jobTitle}</strong>. They may be in touch soon.`,
    },
    interview: {
      emoji: "🗓",
      headline: "Interview scheduled",
      detail: `${companyName} wants to interview you for <strong>${jobTitle}</strong>. Check your interviews section for details.`,
    },
    offered: {
      emoji: "🎉",
      headline: "You received an offer!",
      detail: `Congratulations! ${companyName} has made you an offer for <strong>${jobTitle}</strong>. Log in to view the details.`,
    },
    rejected: {
      emoji: "📩",
      headline: "Application update",
      detail: `${companyName} has reviewed your application for <strong>${jobTitle}</strong> and has decided to move forward with other candidates. Don't give up — keep applying!`,
    },
  };

  const info = STATUS_MESSAGES[status] ?? {
    emoji: "📋",
    headline: "Application status updated",
    detail: `Your application for <strong>${jobTitle}</strong> at ${companyName} has been updated to: <strong>${status}</strong>.`,
  };

  const body = emailLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px">${info.emoji} ${info.headline}</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
      Hi ${seekerName}, ${info.detail}
    </p>
    <div style="text-align:center">${btn("View My Applications", appsUrl)}</div>
  `);

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `${info.emoji} ${info.headline}: ${jobTitle} at ${companyName}`,
    html: body,
  });
}

export async function sendSubscriptionConfirmation(
  to: string,
  displayName: string,
  plan: string,
  periodEnd: Date
) {
  const billingUrl = `${APP_URL}/employer/billing`;
  const formatted = periodEnd.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const body = emailLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px">Subscription activated! 🚀</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
      Hi ${displayName}, your <strong>${plan.toUpperCase()} Plan</strong> is now active.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Plan Details</p>
      <p style="margin:0;color:#1e293b;font-size:16px;font-weight:700">${plan.toUpperCase()} Plan</p>
      <p style="margin:4px 0 0;color:#64748b;font-size:14px">Active until: ${formatted}</p>
    </div>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.6">
      You can now post up to 10 jobs, access candidate search, and view analytics.
    </p>
    <div style="text-align:center">${btn("Go to Employer Dashboard", `${APP_URL}/employer/dashboard`)}</div>
    <p style="margin:20px 0 0;text-align:center">
      <a href="${billingUrl}" style="color:#6d28d9;font-size:13px;text-decoration:none">View billing details →</a>
    </p>
  `);

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Your EkClickJob ${plan.toUpperCase()} plan is active`,
    html: body,
  });
}

export async function sendJobAlertEmail(
  to: string,
  seekerName: string,
  searchQuery: string,
  jobs: Array<{ id: string; title: string; companyName: string; location: string; jobType: string }>
) {
  if (jobs.length === 0) return;

  const jobItems = jobs
    .slice(0, 5)
    .map(
      (j) => `
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px">
        <a href="${APP_URL}/jobs/${j.id}" style="text-decoration:none">
          <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600">${j.title}</p>
          <p style="margin:4px 0 0;color:#64748b;font-size:13px">${j.companyName} · ${j.location}</p>
          <span style="display:inline-block;margin-top:6px;background:#ede9fe;color:#6d28d9;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:600;text-transform:capitalize">${j.jobType}</span>
        </a>
      </div>
    `
    )
    .join("");

  const body = emailLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px">🔔 New jobs for "${searchQuery}"</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
      Hi ${seekerName}, we found ${jobs.length} new job${jobs.length !== 1 ? "s" : ""} matching your saved search.
    </p>
    ${jobItems}
    ${jobs.length > 5 ? `<p style="margin:16px 0;color:#64748b;font-size:14px;text-align:center">+${jobs.length - 5} more jobs available</p>` : ""}
    <div style="text-align:center">${btn("View All Matching Jobs", `${APP_URL}/jobs?q=${encodeURIComponent(searchQuery)}`)}</div>
    <p style="margin:24px 0 0;text-align:center">
      <a href="${APP_URL}/seeker/job-alerts" style="color:#94a3b8;font-size:12px;text-decoration:none">Manage job alerts</a>
    </p>
  `);

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `🔔 ${jobs.length} new job${jobs.length !== 1 ? "s" : ""} for "${searchQuery}"`,
    html: body,
  });
}

export async function sendPasswordChangedEmail(to: string, displayName: string) {
  const body = emailLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px">Password changed 🔐</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:15px;line-height:1.6">
      Hi ${displayName}, your EkClickJob account password was recently changed.
    </p>
    <div style="background:#fefce8;border:1px solid #fde047;border-radius:10px;padding:16px;margin-bottom:24px">
      <p style="margin:0;color:#854d0e;font-size:14px">
        If you did not make this change, please <a href="${APP_URL}/forgot-password" style="color:#6d28d9;font-weight:600">reset your password immediately</a>.
      </p>
    </div>
    <div style="text-align:center">${btn("Go to My Account", `${APP_URL}/seeker/settings`)}</div>
  `);

  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your EkClickJob password was changed",
    html: body,
  });
}
