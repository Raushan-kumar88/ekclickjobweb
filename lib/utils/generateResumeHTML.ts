import type { ResumeData } from "@/hooks/useResumeBuilder";

export function generateResumeHTML(resume: ResumeData): string {
  const t = resume.template ?? "classic";
  if (t === "modern")    return generateModernHTML(resume);
  if (t === "minimal")   return generateMinimalHTML(resume);
  if (t === "executive") return generateExecutiveHTML(resume);
  if (t === "creative")  return generateCreativeHTML(resume);
  return generateClassicHTML(resume);
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function contact(resume: ResumeData): string {
  const parts: string[] = [];
  if (resume.email)    parts.push(`✉ <a href="mailto:${esc(resume.email)}">${esc(resume.email)}</a>`);
  if (resume.phone)    parts.push(`📞 ${esc(resume.phone)}`);
  const city = resume.location?.city ?? "";
  const state = resume.location?.state ?? "";
  if (city)            parts.push(`📍 ${esc([city, state].filter(Boolean).join(", "))}`);
  if (resume.linkedin) parts.push(`in ${esc(resume.linkedin)}`);
  if (resume.github)   parts.push(`⌥ ${esc(resume.github)}`);
  if (resume.website)  parts.push(`🌐 ${esc(resume.website)}`);
  return parts.map((p) => `<span>${p}</span>`).join("");
}

/**
 * Render description field. If it already contains HTML tags (from Tiptap),
 * use it directly. Otherwise fall back to converting newline-bullets to <ul>.
 */
function renderDescription(text: string): string {
  if (!text) return "";
  const isHTML = /<[a-z][\s\S]*>/i.test(text);
  if (isHTML) {
    // Sanitise slightly: unwrap outer <p> wrappers so they flow inline
    return `<div class="rte-out">${text}</div>`;
  }
  // Legacy plain-text with newlines — convert to bullet list
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return "";
  return `<ul class="bullets">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
}

function bulletLines(text: string): string {
  return text
    .split("\n")
    .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
    .filter(Boolean)
    .map((l) => `<li>${esc(l)}</li>`)
    .join("");
}

// ─── Classic HTML ────────────────────────────────────────────────────────────

function generateClassicHTML(resume: ResumeData): string {
  const name = resume.displayName || "Your Name";

  const experienceHTML = resume.experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Work Experience</div>
      ${resume.experience.map((exp) => `
        <div class="entry">
          <div class="entry-header">
            <div>
              <div class="entry-title">${esc(exp.title)}${exp.employmentType ? ` <span class="badge">${esc(exp.employmentType)}</span>` : ""}</div>
              <div class="entry-subtitle">${esc(exp.company)}${exp.location ? ` · ${esc(exp.location)}` : ""}</div>
            </div>
            <div class="entry-date">${esc(exp.startDate)} — ${esc(exp.endDate ?? "Present")}</div>
          </div>
          ${exp.description ? renderDescription(exp.description) : ""}
        </div>`).join("")}
    </div>` : "";

  const educationHTML = resume.education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${resume.education.map((edu) => `
        <div class="entry">
          <div class="entry-header">
            <div>
              <div class="entry-title">${esc(edu.degree)}${edu.fieldOfStudy ? `, ${esc(edu.fieldOfStudy)}` : ""}</div>
              <div class="entry-subtitle">${esc(edu.institution)}${edu.grade ? ` · ${esc(edu.grade)}` : ""}</div>
            </div>
            <div class="entry-date">${edu.startYear ? `${edu.startYear}–` : ""}${edu.year}</div>
          </div>
        </div>`).join("")}
    </div>` : "";

  const projectsHTML = resume.projects.length > 0 ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${resume.projects.map((p) => `
        <div class="entry">
          <div class="entry-header">
            <div>
              <div class="entry-title">${esc(p.name)}${p.url ? ` <a href="${esc(p.url)}" class="link">${esc(p.url)}</a>` : ""}</div>
              ${p.techStack ? `<div class="tags">${p.techStack.split(",").map((t) => `<span class="tag">${esc(t.trim())}</span>`).join("")}</div>` : ""}
            </div>
            ${p.startDate ? `<div class="entry-date">${esc(p.startDate)}${p.startDate ? ` — ${esc(p.endDate ?? "Present")}` : ""}</div>` : ""}
          </div>
          ${p.description ? renderDescription(p.description) : ""}
        </div>`).join("")}
    </div>` : "";

  const certsHTML = resume.certifications.length > 0 ? `
    <div class="section">
      <div class="section-title">Certifications</div>
      ${resume.certifications.map((c) => `
        <div class="entry">
          <div class="entry-header">
            <div>
              <div class="entry-title">${esc(c.name)}</div>
              <div class="entry-subtitle">${esc(c.issuer)}${c.credentialId ? ` · ID: ${esc(c.credentialId)}` : ""}</div>
            </div>
            ${c.issueDate ? `<div class="entry-date">${esc(c.issueDate)}${c.expiryDate ? ` – ${esc(c.expiryDate)}` : ""}</div>` : ""}
          </div>
        </div>`).join("")}
    </div>` : "";

  const skillsHTML = resume.skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills-wrap">${resume.skills.map((s) => `<span class="skill-tag">${esc(s)}</span>`).join("")}</div>
    </div>` : "";

  const langsHTML = resume.languages.length > 0 ? `
    <div class="section">
      <div class="section-title">Languages</div>
      <div class="langs-row">${resume.languages.map((l) => `<span class="lang-item">${esc(l.name)} <span class="lang-level">${esc(l.proficiency)}</span></span>`).join("")}</div>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resume — ${esc(name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 22mm 20mm 20mm 20mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 12.5px; line-height: 1.6; color: #0f172a; background: #fff; }
    a { color: #2563eb; text-decoration: none; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 14px; margin-bottom: 18px; }
    .name { font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; }
    .headline { font-size: 13.5px; font-weight: 600; color: #2563eb; margin-top: 3px; }
    .contact { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; font-size: 11.5px; color: #475569; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #2563eb; border-bottom: 1.5px solid #bfdbfe; padding-bottom: 4px; margin-bottom: 10px; }
    .entry { margin-bottom: 12px; }
    .entry:last-child { margin-bottom: 0; }
    .entry-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .entry-title { font-weight: 600; color: #0f172a; font-size: 13px; }
    .entry-subtitle { color: #475569; font-size: 12px; margin-top: 1px; }
    .entry-date { font-size: 11px; color: #64748b; white-space: nowrap; margin-top: 2px; }
    .entry-body { margin-top: 4px; font-size: 11.5px; color: #334155; line-height: 1.6; }
    .bullets { margin-top: 5px; padding-left: 16px; font-size: 11.5px; color: #334155; line-height: 1.6; }
    .bullets li { margin-bottom: 2px; }
    .badge { display: inline-block; background: #f1f5f9; color: #475569; font-size: 9px; font-weight: 500; border-radius: 3px; padding: 1px 5px; margin-left: 4px; vertical-align: middle; }
    .badge-green { display: inline-block; background: #d1fae5; color: #065f46; font-size: 9px; font-weight: 700; border-radius: 20px; padding: 1px 7px; margin-left: 6px; vertical-align: middle; }
    .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .tag { background: #f1f5f9; color: #475569; border-radius: 3px; padding: 1px 6px; font-size: 10px; }
    .link { font-size: 10px; color: #2563eb; margin-left: 6px; }
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 5px; padding: 2px 10px; font-size: 11px; font-weight: 500; }
    .langs-row { display: flex; flex-wrap: wrap; gap: 16px; }
    .lang-item { font-size: 12px; color: #0f172a; }
    .lang-level { color: #64748b; font-size: 11px; }
    .summary { color: #334155; line-height: 1.7; }
    .rte-out p { margin-bottom: 0.25em; } .rte-out p:last-child { margin-bottom: 0; }
    .rte-out ul { list-style-type: disc; padding-left: 1.2em; margin: 0.2em 0; } .rte-out ol { list-style-type: decimal; padding-left: 1.2em; margin: 0.2em 0; } .rte-out li { margin-bottom: 0.15em; font-size: 11.5px; color: #334155; }
    .rte-out strong { font-weight: 700; } .rte-out em { font-style: italic; } .rte-out u { text-decoration: underline; }
    .rte-out h2 { font-weight: 700; font-size: 1em; margin: 0.3em 0 0.15em; } .rte-out h3 { font-weight: 600; font-size: 0.95em; margin: 0.25em 0 0.1em; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${esc(name)}</div>
    ${resume.headline ? `<div class="headline">${esc(resume.headline)}</div>` : ""}
    <div class="contact">${contact(resume)}</div>
  </div>
  ${resume.bio ? `<div class="section"><div class="section-title">Professional Summary</div><div class="summary">${esc(resume.bio)}</div></div>` : ""}
  ${resume.achievements?.length > 0 ? `<div class="section"><div class="section-title">Key Achievements</div>${resume.achievements.map((a) => `<div class="entry"><div class="entry-header"><div class="entry-title">🏆 ${esc(a.title)}${a.metric ? ` <span class="badge-green">${esc(a.metric)}</span>` : ""}</div></div><div class="entry-body">${esc(a.description)}</div></div>`).join("")}</div>` : ""}
  ${experienceHTML}
  ${educationHTML}
  ${projectsHTML}
  ${certsHTML}
  ${resume.courses?.length > 0 ? `<div class="section"><div class="section-title">Training &amp; Courses</div>${resume.courses.map((c) => `<div class="entry"><div class="entry-header"><div class="entry-title">${esc(c.name)}</div>${c.year ? `<div class="entry-date">${esc(c.year)}</div>` : ""}</div>${c.institution ? `<div class="entry-subtitle">${esc(c.institution)}</div>` : ""}</div>`).join("")}</div>` : ""}
  ${resume.volunteerWork?.length > 0 ? `<div class="section"><div class="section-title">Volunteer Work</div>${resume.volunteerWork.map((v) => `<div class="entry"><div class="entry-header"><div><div class="entry-title">${esc(v.role)}</div><div class="entry-subtitle">${esc(v.organization)}</div></div><div class="entry-date">${esc(v.startDate)} — ${esc(v.endDate ?? "Present")}</div></div>${v.description ? `<div class="entry-body">${esc(v.description)}</div>` : ""}</div>`).join("")}</div>` : ""}
  ${skillsHTML}
  ${langsHTML}
  ${resume.interests?.length > 0 ? `<div class="section"><div class="section-title">Interests</div><div class="summary" style="color:#475569">${resume.interests.map(esc).join(" · ")}</div></div>` : ""}
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
</body>
</html>`;
}

// ─── Modern HTML (dark sidebar) ──────────────────────────────────────────────

function generateModernHTML(resume: ResumeData): string {
  const name = resume.displayName || "Your Name";

  const contactSidebar = [
    resume.email    && `<div class="sc">✉ ${esc(resume.email)}</div>`,
    resume.phone    && `<div class="sc">📞 ${esc(resume.phone)}</div>`,
    [resume.location?.city, resume.location?.state].filter(Boolean).join(", ") && `<div class="sc">📍 ${esc([resume.location?.city, resume.location?.state].filter(Boolean).join(", "))}</div>`,
    resume.linkedin && `<div class="sc">in ${esc(resume.linkedin)}</div>`,
    resume.github   && `<div class="sc">⌥ ${esc(resume.github)}</div>`,
    resume.website  && `<div class="sc">🌐 ${esc(resume.website)}</div>`,
  ].filter(Boolean).join("");

  const skillsSidebar = resume.skills.length > 0 ? `
    <div class="sh">Skills</div>
    <div class="stags">${resume.skills.map((s) => `<span class="stag">${esc(s)}</span>`).join("")}</div>` : "";

  const langsSidebar = resume.languages.length > 0 ? `
    <div class="sh">Languages</div>
    ${resume.languages.map((l) => `
      <div class="slang">
        <div class="slang-row"><span>${esc(l.name)}</span><span class="slang-lv">${esc(l.proficiency)}</span></div>
        <div class="sbars">${[1,2,3,4,5].map((i) => {
          const bars: Record<string,number> = { Native:5,Fluent:4,Advanced:3,Intermediate:2,Basic:1 };
          return `<div class="sbar ${i <= bars[l.proficiency] ? "sbar-on" : "sbar-off"}"></div>`;
        }).join("")}</div>
      </div>`).join("")}` : "";

  const mainContent = [
    resume.bio && `<div class="ms"><div class="mt">Summary</div><p class="mbody">${esc(resume.bio)}</p></div>`,
    resume.experience.length > 0 && `<div class="ms"><div class="mt">Experience</div>${resume.experience.map((exp) => `
      <div class="me">
        <div class="me-hdr"><div><div class="me-t">${esc(exp.title)}${exp.employmentType ? ` <span class="badge">${esc(exp.employmentType)}</span>` : ""}</div><div class="me-s">${esc(exp.company)}${exp.location ? ` · ${esc(exp.location)}` : ""}</div></div>
        <div class="me-d">${esc(exp.startDate)} — ${esc(exp.endDate ?? "Present")}</div></div>
        ${exp.description ? renderDescription(exp.description) : ""}
      </div>`).join("")}</div>`,
    resume.education.length > 0 && `<div class="ms"><div class="mt">Education</div>${resume.education.map((edu) => `
      <div class="me"><div class="me-hdr"><div><div class="me-t">${esc(edu.degree)}${edu.fieldOfStudy ? `, ${esc(edu.fieldOfStudy)}` : ""}</div><div class="me-s">${esc(edu.institution)}${edu.grade ? ` · ${esc(edu.grade)}` : ""}</div></div><div class="me-d">${edu.startYear ? `${edu.startYear}–` : ""}${edu.year}</div></div></div>`).join("")}</div>`,
    resume.projects.length > 0 && `<div class="ms"><div class="mt">Projects</div>${resume.projects.map((p) => `
      <div class="me">
        <div class="me-t">${esc(p.name)}</div>
        <div class="mbody">${esc(p.description)}</div>
        ${p.techStack ? `<div class="tags">${p.techStack.split(",").map((t) => `<span class="tag">${esc(t.trim())}</span>`).join("")}</div>` : ""}
      </div>`).join("")}</div>`,
    resume.certifications.length > 0 && `<div class="ms"><div class="mt">Certifications</div>${resume.certifications.map((c) => `
      <div class="me"><div class="me-hdr"><div><div class="me-t">${esc(c.name)}</div><div class="me-s">${esc(c.issuer)}</div></div>${c.issueDate ? `<div class="me-d">${esc(c.issueDate)}</div>` : ""}</div></div>`).join("")}</div>`,
  ].filter(Boolean).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resume — ${esc(name)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    @page{size:A4;margin:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.6;color:#0f172a;background:#fff;display:flex;min-height:100vh;}
    a{color:#93c5fd;text-decoration:none;}
    .sidebar{width:30%;background:#1e3a5f;color:#fff;padding:24px 18px;display:flex;flex-direction:column;gap:0;}
    .sname{font-size:18px;font-weight:700;line-height:1.2;}
    .sheadline{font-size:11px;font-weight:500;color:#93c5fd;margin-top:4px;}
    .sc{font-size:10.5px;color:#bfdbfe;margin-top:3px;word-break:break-all;}
    .sh{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:3px;margin-top:14px;margin-bottom:6px;}
    .stags{display:flex;flex-wrap:wrap;gap:4px;}
    .stag{background:rgba(255,255,255,.15);color:#fff;border-radius:3px;padding:2px 7px;font-size:10px;}
    .slang{margin-bottom:6px;}
    .slang-row{display:flex;justify-content:space-between;font-size:10.5px;}
    .slang-lv{opacity:.6;font-size:10px;}
    .sbars{display:flex;gap:2px;margin-top:2px;}
    .sbar{height:3px;flex:1;border-radius:2px;}
    .sbar-on{background:#60a5fa;}
    .sbar-off{background:rgba(255,255,255,.15);}
    .main{flex:1;padding:24px 20px;}
    .ms{margin-bottom:16px;}
    .mt{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1e3a5f;border-bottom:1.5px solid #e2e8f0;padding-bottom:3px;margin-bottom:8px;}
    .mbody{font-size:11.5px;color:#334155;line-height:1.65;}
    .me{margin-bottom:10px;}
    .me:last-child{margin-bottom:0;}
    .me-hdr{display:flex;justify-content:space-between;gap:8px;}
    .me-t{font-weight:600;color:#0f172a;font-size:12.5px;}
    .me-s{font-size:11.5px;color:#475569;margin-top:1px;}
    .me-d{font-size:10.5px;color:#64748b;white-space:nowrap;margin-top:2px;flex-shrink:0;}
    .bullets{padding-left:14px;font-size:11px;color:#334155;line-height:1.6;margin-top:4px;}
    .bullets li{margin-bottom:2px;}
    .badge{display:inline-block;background:#f1f5f9;color:#475569;font-size:8.5px;border-radius:3px;padding:1px 4px;margin-left:4px;vertical-align:middle;}
    .badge-green{display:inline-block;background:#d1fae5;color:#065f46;font-size:8.5px;font-weight:700;border-radius:20px;padding:1px 6px;margin-left:6px;vertical-align:middle;}
    .tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
    .tag{background:#f1f5f9;color:#475569;border-radius:3px;padding:1px 6px;font-size:10px;}
    .rte-out p{margin-bottom:0.2em;}.rte-out p:last-child{margin-bottom:0;}.rte-out ul{list-style-type:disc;padding-left:1.1em;margin:0.15em 0;}.rte-out ol{list-style-type:decimal;padding-left:1.1em;margin:0.15em 0;}.rte-out li{margin-bottom:0.1em;font-size:11px;color:#334155;}.rte-out strong{font-weight:700;}.rte-out em{font-style:italic;}.rte-out u{text-decoration:underline;}
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="sname">${esc(name)}</div>
    ${resume.headline ? `<div class="sheadline">${esc(resume.headline)}</div>` : ""}
    <div style="margin-top:10px;">${contactSidebar}</div>
    ${skillsSidebar}
    ${langsSidebar}
  </div>
  <div class="main">${mainContent}</div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
</body>
</html>`;
}

// ─── Minimal HTML ────────────────────────────────────────────────────────────

function generateMinimalHTML(resume: ResumeData): string {
  const name = resume.displayName || "Your Name";

  const contactParts = [
    resume.email,
    resume.phone,
    [resume.location?.city, resume.location?.state].filter(Boolean).join(", ") || null,
    resume.linkedin,
    resume.github,
    resume.website,
  ].filter(Boolean).map((p) => esc(p ?? ""));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resume — ${esc(name)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    @page{size:A4;margin:22mm 20mm 20mm 20mm;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12.5px;line-height:1.65;color:#1e293b;background:#fff;}
    a{color:#1e293b;text-decoration:none;}
    h1{font-size:26px;font-weight:300;letter-spacing:-0.5px;color:#0f172a;}
    .sub{font-size:13px;color:#64748b;margin-top:3px;}
    .contact{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;font-size:11px;color:#94a3b8;border-bottom:1px solid #e2e8f0;padding-bottom:12px;}
    .sec{margin-top:14px;}
    .sec-t{font-size:9px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;}
    .entry{margin-bottom:10px;}
    .entry:last-child{margin-bottom:0;}
    .row{display:flex;justify-content:space-between;gap:8px;}
    .et{font-weight:600;font-size:13px;color:#0f172a;}
    .es{font-size:12px;color:#64748b;margin-top:1px;}
    .ed{font-size:11px;color:#94a3b8;white-space:nowrap;}
    .bullets{padding-left:14px;font-size:11.5px;color:#475569;margin-top:4px;line-height:1.6;}
    .bullets li{margin-bottom:2px;}
    .tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
    .tag{background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:1px 7px;font-size:10px;color:#475569;}
    .skills{font-size:12px;color:#475569;}
    .badge{display:inline-block;background:#f1f5f9;color:#475569;font-size:9px;border-radius:3px;padding:1px 4px;margin-left:4px;vertical-align:middle;}
    .langs{display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:#475569;}
    .lang-lv{color:#94a3b8;font-size:11px;}
    .rte-out p{margin-bottom:0.2em;}.rte-out p:last-child{margin-bottom:0;}.rte-out ul{list-style-type:disc;padding-left:1.1em;margin:0.15em 0;}.rte-out ol{list-style-type:decimal;padding-left:1.1em;margin:0.15em 0;}.rte-out li{margin-bottom:0.1em;}.rte-out strong{font-weight:700;}.rte-out em{font-style:italic;}
  </style>
</head>
<body>
  <h1>${esc(name)}</h1>
  ${resume.headline ? `<div class="sub">${esc(resume.headline)}</div>` : ""}
  <div class="contact">${contactParts.join(" · ")}</div>
  ${resume.bio ? `<div class="sec"><div class="sec-t">Summary</div><p style="font-size:12px;color:#334155;line-height:1.7;">${esc(resume.bio)}</p></div>` : ""}
  ${resume.experience.length > 0 ? `<div class="sec"><div class="sec-t">Experience</div>${resume.experience.map((exp) => `
    <div class="entry">
      <div class="row"><div><div class="et">${esc(exp.title)}${exp.employmentType ? ` <span class="badge">${esc(exp.employmentType)}</span>` : ""}</div><div class="es">${esc(exp.company)}${exp.location ? ` · ${esc(exp.location)}` : ""}</div></div><div class="ed">${esc(exp.startDate)} — ${esc(exp.endDate ?? "Present")}</div></div>
      ${exp.description ? renderDescription(exp.description) : ""}
    </div>`).join("")}</div>` : ""}
  ${resume.education.length > 0 ? `<div class="sec"><div class="sec-t">Education</div>${resume.education.map((edu) => `
    <div class="entry"><div class="row"><div><div class="et">${esc(edu.degree)}${edu.fieldOfStudy ? `, ${esc(edu.fieldOfStudy)}` : ""}</div><div class="es">${esc(edu.institution)}${edu.grade ? ` · ${esc(edu.grade)}` : ""}</div></div><div class="ed">${edu.startYear ? `${edu.startYear}–` : ""}${edu.year}</div></div></div>`).join("")}</div>` : ""}
  ${resume.projects.length > 0 ? `<div class="sec"><div class="sec-t">Projects</div>${resume.projects.map((p) => `
    <div class="entry"><div class="et">${esc(p.name)}</div><div class="es">${esc(p.description)}</div>${p.techStack ? `<div class="tags">${p.techStack.split(",").map((t) => `<span class="tag">${esc(t.trim())}</span>`).join("")}</div>` : ""}</div>`).join("")}</div>` : ""}
  ${resume.certifications.length > 0 ? `<div class="sec"><div class="sec-t">Certifications</div>${resume.certifications.map((c) => `
    <div class="entry"><div class="row"><div><div class="et">${esc(c.name)}</div><div class="es">${esc(c.issuer)}</div></div>${c.issueDate ? `<div class="ed">${esc(c.issueDate)}</div>` : ""}</div></div>`).join("")}</div>` : ""}
  ${resume.achievements?.length > 0 ? `<div class="sec"><div class="sec-t">Key Achievements</div>${resume.achievements.map((a) => `<div class="entry"><div class="et">🏆 ${esc(a.title)}${a.metric ? ` <span style="background:#d1fae5;color:#065f46;font-size:8.5px;font-weight:700;border-radius:20px;padding:1px 6px;margin-left:6px;display:inline-block;">${esc(a.metric)}</span>` : ""}</div><div class="es">${esc(a.description)}</div></div>`).join("")}</div>` : ""}
  ${resume.skills.length > 0 ? `<div class="sec"><div class="sec-t">Skills</div><div class="skills">${resume.skills.join(" · ")}</div></div>` : ""}
  ${resume.languages.length > 0 ? `<div class="sec"><div class="sec-t">Languages</div><div class="langs">${resume.languages.map((l) => `<span>${esc(l.name)} <span class="lang-lv">(${esc(l.proficiency)})</span></span>`).join("")}</div></div>` : ""}
  ${resume.courses?.length > 0 ? `<div class="sec"><div class="sec-t">Training &amp; Courses</div>${resume.courses.map((c) => `<div class="entry"><div class="et">${esc(c.name)}</div>${c.institution ? `<div class="es">${esc(c.institution)}${c.year ? ` · ${esc(c.year)}` : ""}</div>` : ""}</div>`).join("")}</div>` : ""}
  ${resume.volunteerWork?.length > 0 ? `<div class="sec"><div class="sec-t">Volunteer</div>${resume.volunteerWork.map((v) => `<div class="entry"><div class="row"><div><div class="et">${esc(v.role)}</div><div class="es">${esc(v.organization)}</div></div><div class="ed">${esc(v.startDate)} — ${esc(v.endDate ?? "Present")}</div></div></div>`).join("")}</div>` : ""}
  ${resume.interests?.length > 0 ? `<div class="sec"><div class="sec-t">Interests</div><div class="skills">${resume.interests.map(esc).join(" · ")}</div></div>` : ""}
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
</body>
</html>`;
}

// ─── Executive HTML (double-column with sidebar) ──────────────────────────────

function generateExecutiveHTML(resume: ResumeData): string {
  const name = resume.displayName || "Your Name";
  const loc = [resume.location?.city, resume.location?.state].filter(Boolean).join(", ");

  const langBars = (prof: string) => {
    const bars: Record<string, number> = { Native: 5, Fluent: 4, Advanced: 3, Intermediate: 2, Basic: 1 };
    const n = bars[prof] ?? 1;
    return [1,2,3,4,5].map((i) => `<div style="flex:1;height:4px;border-radius:2px;background:${i<=n?"#3b82f6":"#e2e8f0"};"></div>`).join("");
  };

  const sidebar = `
    <div style="font-size:10.5px;color:#64748b;margin-top:10px;line-height:1.8;">
      ${resume.email    ? `<div>✉ ${esc(resume.email)}</div>` : ""}
      ${resume.phone    ? `<div>📞 ${esc(resume.phone)}</div>` : ""}
      ${loc             ? `<div>📍 ${esc(loc)}</div>` : ""}
      ${resume.linkedin ? `<div>in ${esc(resume.linkedin)}</div>` : ""}
      ${resume.website  ? `<div>🌐 ${esc(resume.website)}</div>` : ""}
    </div>
    ${resume.skills.length > 0 ? `<div class="sh">Core Skills</div><div>${resume.skills.map((s) => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;font-size:10.5px;"><span style="width:6px;height:6px;border-radius:50%;background:#3b82f6;display:inline-block;flex-shrink:0;"></span>${esc(s)}</div>`).join("")}</div>` : ""}
    ${resume.education.length > 0 ? `<div class="sh">Education</div>${resume.education.map((e) => `<div style="margin-bottom:8px;"><div style="font-weight:600;font-size:11px;">${esc(e.degree)}${e.fieldOfStudy ? `, ${esc(e.fieldOfStudy)}` : ""}</div><div style="font-size:10.5px;color:#64748b;">${esc(e.institution)}</div>${e.year ? `<div style="font-size:10px;color:#94a3b8;">${e.startYear ? `${e.startYear}–` : ""}${e.year}</div>` : ""}</div>`).join("")}` : ""}
    ${resume.certifications.length > 0 ? `<div class="sh">Certifications</div>${resume.certifications.map((c) => `<div style="margin-bottom:6px;"><div style="font-weight:600;font-size:11px;">${esc(c.name)}</div><div style="font-size:10px;color:#64748b;">${esc(c.issuer)}</div></div>`).join("")}` : ""}
    ${resume.courses?.length > 0 ? `<div class="sh">Training</div>${resume.courses.map((c) => `<div style="margin-bottom:5px;"><div style="font-weight:500;font-size:11px;">${esc(c.name)}</div>${c.institution ? `<div style="font-size:10px;color:#64748b;">${esc(c.institution)}</div>` : ""}</div>`).join("")}` : ""}
    ${resume.languages.length > 0 ? `<div class="sh">Languages</div>${resume.languages.map((l) => `<div style="margin-bottom:6px;"><div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:2px;"><span>${esc(l.name)}</span><span style="color:#94a3b8;">${esc(l.proficiency)}</span></div><div style="display:flex;gap:2px;">${langBars(l.proficiency)}</div></div>`).join("")}` : ""}
    ${resume.interests?.length > 0 ? `<div class="sh">Interests</div><div style="font-size:10.5px;color:#475569;line-height:1.6;">${resume.interests.map(esc).join(" · ")}</div>` : ""}
    ${resume.volunteerWork?.length > 0 ? `<div class="sh">Volunteer</div>${resume.volunteerWork.map((v) => `<div style="margin-bottom:5px;"><div style="font-weight:600;font-size:11px;">${esc(v.role)}</div><div style="font-size:10.5px;color:#64748b;">${esc(v.organization)}</div></div>`).join("")}` : ""}
  `;

  const achHTML = resume.achievements?.length > 0 ? `
    <div style="margin-bottom:16px;">
      <div class="mt">Key Achievements</div>
      <div style="display:grid;gap:8px;">
        ${resume.achievements.map((a) => `
          <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:6px;padding:8px 10px;">
            <div style="font-weight:600;font-size:11.5px;">🏆 ${esc(a.title)}${a.metric ? ` <span style="background:#d1fae5;color:#065f46;font-size:8.5px;font-weight:700;border-radius:20px;padding:1px 7px;margin-left:6px;">${esc(a.metric)}</span>` : ""}</div>
            <div style="margin-top:3px;font-size:11px;color:#44403c;">${esc(a.description)}</div>
          </div>`).join("")}
      </div>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resume — ${esc(name)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    @page{size:A4;margin:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;line-height:1.6;color:#1e293b;background:#fff;}
    a{color:#2563eb;text-decoration:none;}
    .hdr{background:#1a2e44;color:#fff;padding:16px 20px;}
    .hdr-name{font-size:20px;font-weight:700;}
    .hdr-hl{font-size:11px;color:#93c5fd;margin-top:2px;}
    .hdr-ct{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;font-size:9.5px;color:#bfdbfe;}
    .body{display:flex;}
    .sidebar{width:35%;background:#f8fafc;border-right:1px solid #e2e8f0;padding:16px;}
    .sh{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1a2e44;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin-top:14px;margin-bottom:6px;}
    .sh:first-child{margin-top:0;}
    .main{flex:1;padding:16px;}
    .mt{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1d4ed8;border-bottom:2px solid #2563eb;padding-bottom:3px;margin-bottom:8px;}
    .me{margin-bottom:10px;}
    .me:last-child{margin-bottom:0;}
    .me-hdr{display:flex;justify-content:space-between;gap:8px;}
    .me-t{font-weight:600;font-size:12.5px;}
    .me-s{font-size:11.5px;color:#475569;margin-top:1px;}
    .me-d{font-size:10.5px;color:#64748b;white-space:nowrap;flex-shrink:0;}
    .bullets{padding-left:14px;font-size:11px;color:#334155;line-height:1.6;margin-top:4px;}
    .bullets li{margin-bottom:2px;}
    .badge{display:inline-block;background:#f1f5f9;color:#475569;font-size:8.5px;border-radius:3px;padding:1px 4px;margin-left:4px;vertical-align:middle;}
    .rte-out p{margin-bottom:0.2em;}.rte-out p:last-child{margin-bottom:0;}.rte-out ul{list-style-type:disc;padding-left:1.1em;margin:0.15em 0;}.rte-out ol{list-style-type:decimal;padding-left:1.1em;margin:0.15em 0;}.rte-out li{margin-bottom:0.1em;font-size:11px;color:#334155;}.rte-out strong{font-weight:700;}.rte-out em{font-style:italic;}
  </style>
</head>
<body>
  <div class="hdr">
    <div class="hdr-name">${esc(name)}</div>
    ${resume.headline ? `<div class="hdr-hl">${esc(resume.headline)}</div>` : ""}
    <div class="hdr-ct">
      ${resume.email    ? `<span>✉ ${esc(resume.email)}</span>` : ""}
      ${resume.phone    ? `<span>📞 ${esc(resume.phone)}</span>` : ""}
      ${loc             ? `<span>📍 ${esc(loc)}</span>` : ""}
      ${resume.linkedin ? `<span>in ${esc(resume.linkedin)}</span>` : ""}
      ${resume.website  ? `<span>🌐 ${esc(resume.website)}</span>` : ""}
    </div>
  </div>
  <div class="body">
    <div class="sidebar">${sidebar}</div>
    <div class="main">
      ${achHTML}
      ${resume.bio ? `<div style="margin-bottom:14px;"><div class="mt">Summary</div><p style="font-size:11.5px;color:#334155;line-height:1.65;">${esc(resume.bio)}</p></div>` : ""}
      ${resume.experience.length > 0 ? `<div style="margin-bottom:14px;"><div class="mt">Experience</div>${resume.experience.map((exp) => `<div class="me"><div class="me-hdr"><div><div class="me-t">${esc(exp.title)}${exp.employmentType ? ` <span class="badge">${esc(exp.employmentType)}</span>` : ""}</div><div class="me-s">${esc(exp.company)}${exp.location ? ` · ${esc(exp.location)}` : ""}</div></div><div class="me-d">${esc(exp.startDate)} — ${esc(exp.endDate ?? "Present")}</div></div>${exp.description ? renderDescription(exp.description) : ""}</div>`).join("")}</div>` : ""}
      ${resume.projects.length > 0 ? `<div><div class="mt">Projects</div>${resume.projects.map((p) => `<div class="me"><div class="me-t">${esc(p.name)}</div><div style="font-size:11px;color:#475569;margin-top:2px;">${esc(p.description)}</div></div>`).join("")}</div>` : ""}
    </div>
  </div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
</body>
</html>`;
}

// ─── Creative HTML (gradient header + 2-col body) ─────────────────────────────

function generateCreativeHTML(resume: ResumeData): string {
  const name = resume.displayName || "Your Name";
  const loc = [resume.location?.city, resume.location?.state].filter(Boolean).join(", ");

  const langBars = (prof: string) => {
    const bars: Record<string, number> = { Native: 5, Fluent: 4, Advanced: 3, Intermediate: 2, Basic: 1 };
    const n = bars[prof] ?? 1;
    return [1,2,3,4,5].map((i) => `<div style="flex:1;height:4px;border-radius:2px;background:${i<=n?"#2563eb":"#e2e8f0"};"></div>`).join("");
  };

  const achievementsHTML = resume.achievements?.length > 0 ? `
    <div class="cs"><div class="ct"><span class="ctbar"></span>Key Achievements</div>
      ${resume.achievements.map((a) => `
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <div style="width:16px;height:16px;background:#2563eb;border-radius:3px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;font-size:9px;">🏆</div>
          <div><div style="font-weight:600;font-size:11.5px;">${esc(a.title)}${a.metric ? ` <span style="background:#d1fae5;color:#065f46;font-size:8.5px;font-weight:700;border-radius:20px;padding:1px 6px;margin-left:6px;">${esc(a.metric)}</span>` : ""}</div><div style="font-size:11px;color:#475569;margin-top:2px;">${esc(a.description)}</div></div>
        </div>`).join("")}
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resume — ${esc(name)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    @page{size:A4;margin:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;line-height:1.6;color:#1e293b;background:#fff;}
    a{color:#2563eb;text-decoration:none;}
    .hdr{background:linear-gradient(135deg,#0f2942 0%,#1d4ed8 100%);color:#fff;padding:20px 24px;}
    .hdr-name{font-size:22px;font-weight:900;letter-spacing:-0.5px;}
    .hdr-hl{font-size:12px;color:#bfdbfe;margin-top:3px;font-weight:500;}
    .hdr-ct{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;font-size:9.5px;color:#bfdbfe;}
    .body{display:flex;}
    .main{flex:1;min-width:0;padding:14px 16px;border-right:1px solid #f1f5f9;}
    .sidebar{width:38%;padding:14px;}
    .cs{margin-bottom:14px;}
    .ct{display:flex;align-items:center;gap:6px;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1e293b;margin-bottom:8px;}
    .ctbar{width:3px;height:14px;background:#2563eb;border-radius:2px;display:inline-block;flex-shrink:0;}
    .ssh{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbeafe;padding-bottom:3px;margin-top:14px;margin-bottom:6px;}
    .ssh:first-child{margin-top:0;}
    .me{margin-bottom:10px;}
    .me:last-child{margin-bottom:0;}
    .me-hdr{display:flex;justify-content:space-between;gap:8px;}
    .me-t{font-weight:600;font-size:12.5px;}
    .me-s{font-size:11.5px;color:#475569;margin-top:1px;}
    .me-d{font-size:10.5px;color:#64748b;white-space:nowrap;flex-shrink:0;}
    .bullets{padding-left:14px;font-size:11px;color:#334155;line-height:1.6;margin-top:4px;}
    .bullets li{margin-bottom:2px;}
    .badge{display:inline-block;background:#f1f5f9;color:#475569;font-size:8.5px;border-radius:3px;padding:1px 4px;margin-left:4px;vertical-align:middle;}
    .stag{display:inline-block;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:500;margin:2px;}
    .rte-out p{margin-bottom:0.2em;}.rte-out p:last-child{margin-bottom:0;}.rte-out ul{list-style-type:disc;padding-left:1.1em;margin:0.15em 0;}.rte-out ol{list-style-type:decimal;padding-left:1.1em;margin:0.15em 0;}.rte-out li{margin-bottom:0.1em;font-size:11px;color:#334155;}.rte-out strong{font-weight:700;}.rte-out em{font-style:italic;}
  </style>
</head>
<body>
  <div class="hdr">
    <div class="hdr-name">${esc(name)}</div>
    ${resume.headline ? `<div class="hdr-hl">${esc(resume.headline)}</div>` : ""}
    <div class="hdr-ct">
      ${resume.email    ? `<span>${esc(resume.email)}</span>` : ""}
      ${resume.phone    ? `<span>${esc(resume.phone)}</span>` : ""}
      ${loc             ? `<span>${esc(loc)}</span>` : ""}
      ${resume.linkedin ? `<span>${esc(resume.linkedin)}</span>` : ""}
      ${resume.github   ? `<span>${esc(resume.github)}</span>` : ""}
      ${resume.website  ? `<span>${esc(resume.website)}</span>` : ""}
    </div>
  </div>
  <div class="body">
    <div class="main">
      ${resume.bio ? `<div class="cs"><div class="ct"><span class="ctbar"></span>About Me</div><p style="font-size:11.5px;color:#334155;line-height:1.65;">${esc(resume.bio)}</p></div>` : ""}
      ${achievementsHTML}
      ${resume.experience.length > 0 ? `<div class="cs"><div class="ct"><span class="ctbar"></span>Experience</div>${resume.experience.map((exp) => `<div class="me"><div class="me-hdr"><div><div class="me-t">${esc(exp.title)}${exp.employmentType ? ` <span class="badge">${esc(exp.employmentType)}</span>` : ""}</div><div class="me-s">${esc(exp.company)}${exp.location ? ` · ${esc(exp.location)}` : ""}</div></div><div class="me-d">${esc(exp.startDate)} — ${esc(exp.endDate ?? "Present")}</div></div>${exp.description ? renderDescription(exp.description) : ""}</div>`).join("")}</div>` : ""}
      ${resume.projects.length > 0 ? `<div class="cs"><div class="ct"><span class="ctbar"></span>Projects</div>${resume.projects.map((p) => `<div class="me"><div class="me-t">${esc(p.name)}</div><div style="font-size:11px;color:#475569;margin-top:2px;">${esc(p.description)}</div>${p.techStack ? `<div style="margin-top:4px;">${p.techStack.split(",").map((t) => `<span class="stag">${esc(t.trim())}</span>`).join("")}</div>` : ""}</div>`).join("")}</div>` : ""}
      ${resume.volunteerWork?.length > 0 ? `<div class="cs"><div class="ct"><span class="ctbar"></span>Volunteer</div>${resume.volunteerWork.map((v) => `<div class="me"><div class="me-hdr"><div><div class="me-t">${esc(v.role)}</div><div class="me-s">${esc(v.organization)}</div></div><div class="me-d">${esc(v.startDate)} — ${esc(v.endDate ?? "Present")}</div></div></div>`).join("")}</div>` : ""}
    </div>
    <div class="sidebar">
      ${resume.skills.length > 0 ? `<div class="ssh">Skills</div><div>${resume.skills.map((s) => `<span class="stag">${esc(s)}</span>`).join("")}</div>` : ""}
      ${resume.education.length > 0 ? `<div class="ssh">Education</div>${resume.education.map((e) => `<div style="margin-bottom:8px;"><div style="font-weight:600;font-size:11px;">${esc(e.degree)}${e.fieldOfStudy ? `, ${esc(e.fieldOfStudy)}` : ""}</div><div style="font-size:10.5px;color:#64748b;">${esc(e.institution)}</div>${e.year ? `<div style="font-size:10px;color:#94a3b8;">${e.startYear ? `${e.startYear}–` : ""}${e.year}</div>` : ""}</div>`).join("")}` : ""}
      ${resume.certifications.length > 0 ? `<div class="ssh">Certifications</div>${resume.certifications.map((c) => `<div style="margin-bottom:6px;"><div style="font-weight:600;font-size:11px;">${esc(c.name)}</div><div style="font-size:10px;color:#64748b;">${esc(c.issuer)}</div></div>`).join("")}` : ""}
      ${resume.courses?.length > 0 ? `<div class="ssh">Training</div>${resume.courses.map((c) => `<div style="margin-bottom:5px;"><div style="font-size:11px;font-weight:500;">${esc(c.name)}</div>${c.institution ? `<div style="font-size:10px;color:#64748b;">${esc(c.institution)}</div>` : ""}</div>`).join("")}` : ""}
      ${resume.languages.length > 0 ? `<div class="ssh">Languages</div>${resume.languages.map((l) => `<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:2px;"><span style="font-weight:500;">${esc(l.name)}</span><span style="color:#94a3b8;">${esc(l.proficiency)}</span></div><div style="display:flex;gap:2px;">${langBars(l.proficiency)}</div></div>`).join("")}` : ""}
      ${resume.interests?.length > 0 ? `<div class="ssh">Interests</div><div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:2px;">${resume.interests.map((i) => `<span style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:2px 7px;font-size:10px;color:#475569;">${esc(i)}</span>`).join("")}</div>` : ""}
    </div>
  </div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
</body>
</html>`;
}
