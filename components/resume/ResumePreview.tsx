"use client";

import { MapPinIcon, MailIcon, PhoneIcon, GlobeIcon, LinkedinIcon, GithubIcon, TrophyIcon } from "lucide-react";
import type { ResumeData } from "@/hooks/useResumeBuilder";

interface ResumePreviewProps {
  resume: ResumeData;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ResumePreview({ resume }: ResumePreviewProps) {
  const isEmpty = !resume.bio && !resume.experience.length && !resume.education.length && !resume.skills.length;

  if (isEmpty) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        Fill in the editor to see your resume preview here
      </div>
    );
  }

  const t = resume.template ?? "classic";
  if (t === "modern")    return <ModernTemplate r={resume} />;
  if (t === "minimal")   return <MinimalTemplate r={resume} />;
  if (t === "executive") return <ExecutiveTemplate r={resume} />;
  if (t === "creative")  return <CreativeTemplate r={resume} />;
  return <ClassicTemplate r={resume} />;
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function isRichHTML(text: string) {
  return /<[a-z][\s\S]*>/i.test(text);
}

function ExperienceEntry({ exp }: { exp: ResumeData["experience"][0] }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-semibold text-[12.5px] text-gray-900">{exp.title}</span>
          {exp.employmentType && <span className="ml-1.5 text-[9px] bg-gray-100 text-gray-500 rounded px-1 py-0.5 align-middle">{exp.employmentType}</span>}
          <div className="text-[11.5px] text-gray-500">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
        </div>
        <span className="shrink-0 text-[10.5px] text-gray-400 whitespace-nowrap mt-0.5">{exp.startDate} — {exp.endDate ?? "Present"}</span>
      </div>
      {exp.description && (
        isRichHTML(exp.description) ? (
          <div className="mt-1.5 text-[11.5px] text-gray-600 leading-relaxed rte-preview"
            dangerouslySetInnerHTML={{ __html: exp.description }} />
        ) : (
          <ul className="mt-1.5 pl-3.5 space-y-0.5">
            {exp.description.split("\n").map((l) => l.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean).map((b, i) => (
              <li key={i} className="relative text-[11.5px] text-gray-600 leading-relaxed before:absolute before:-left-3.5 before:content-['•'] before:text-blue-500">{b}</li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

function EducationEntry({ edu }: { edu: ResumeData["education"][0] }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-[12px] text-gray-900">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}</div>
          <div className="text-[11px] text-gray-500">{edu.institution}{edu.grade ? ` · ${edu.grade}` : ""}</div>
        </div>
        <span className="shrink-0 text-[10.5px] text-gray-400">{edu.startYear ? `${edu.startYear}–` : ""}{edu.year}</span>
      </div>
    </div>
  );
}

function ProjectEntry({ project }: { project: ResumeData["projects"][0] }) {
  const tags = project.techStack ? project.techStack.split(",").map((t) => t.trim()).filter(Boolean) : [];
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="font-semibold text-[12px] text-gray-900">{project.name}{project.url && <span className="ml-1.5 text-[9.5px] text-blue-500">{project.url}</span>}</div>
      {project.description && (
        isRichHTML(project.description) ? (
          <div className="mt-0.5 text-[11px] text-gray-600 rte-preview" dangerouslySetInnerHTML={{ __html: project.description }} />
        ) : (
          <div className="text-[11px] text-gray-600 mt-0.5">{project.description}</div>
        )
      )}
      {tags.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{tags.map((t) => <span key={t} className="text-[9.5px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{t}</span>)}</div>}
    </div>
  );
}

function CertEntry({ cert }: { cert: ResumeData["certifications"][0] }) {
  return (
    <div className="mb-1.5 last:mb-0 flex items-start justify-between gap-2">
      <div>
        <div className="font-semibold text-[11.5px] text-gray-900">{cert.name}</div>
        <div className="text-[11px] text-gray-500">{cert.issuer}{cert.credentialId ? ` · ${cert.credentialId}` : ""}</div>
      </div>
      {cert.issueDate && <span className="shrink-0 text-[10.5px] text-gray-400">{cert.issueDate}</span>}
    </div>
  );
}

function AchievementEntry({ a }: { a: ResumeData["achievements"][0] }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex items-center gap-1.5">
        <TrophyIcon className="h-3 w-3 text-amber-500 shrink-0" />
        <span className="font-semibold text-[12px] text-gray-900">{a.title}</span>
        {a.metric && <span className="text-[9.5px] font-bold rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5">{a.metric}</span>}
      </div>
      {isRichHTML(a.description) ? (
        <div className="mt-0.5 pl-4 text-[11px] text-gray-600 rte-preview" dangerouslySetInnerHTML={{ __html: a.description }} />
      ) : (
        <div className="mt-0.5 pl-4 text-[11px] text-gray-600 leading-relaxed">{a.description}</div>
      )}
    </div>
  );
}

function CourseEntry({ course }: { course: ResumeData["courses"][0] }) {
  return (
    <div className="mb-1 last:mb-0 flex items-start justify-between gap-2">
      <div>
        <div className="font-medium text-[11.5px] text-gray-900">{course.name}</div>
        {course.institution && <div className="text-[11px] text-gray-500">{course.institution}</div>}
      </div>
      {course.year && <span className="shrink-0 text-[10.5px] text-gray-400">{course.year}</span>}
    </div>
  );
}

// ─── CLASSIC template ─────────────────────────────────────────────────────────

function ClassicTemplate({ r }: { r: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 font-sans text-[12.5px] leading-relaxed"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="border-b-[3px] border-blue-600 pb-4 mb-5">
        <h1 className="text-2xl font-bold tracking-tight">{r.displayName || "Your Name"}</h1>
        {r.headline && <p className="mt-0.5 text-[13px] font-semibold text-blue-600">{r.headline}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
          {r.email    && <span className="flex items-center gap-1"><MailIcon className="h-3 w-3" />{r.email}</span>}
          {r.phone    && <span className="flex items-center gap-1"><PhoneIcon className="h-3 w-3" />{r.phone}</span>}
          {r.location?.city && <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{r.location.city}{r.location.state ? `, ${r.location.state}` : ""}</span>}
          {r.linkedin && <span className="flex items-center gap-1"><LinkedinIcon className="h-3 w-3" />{r.linkedin}</span>}
          {r.github   && <span className="flex items-center gap-1"><GithubIcon className="h-3 w-3" />{r.github}</span>}
          {r.website  && <span className="flex items-center gap-1"><GlobeIcon className="h-3 w-3" />{r.website}</span>}
        </div>
      </div>
      {r.bio && <CSection title="Professional Summary"><p className="text-gray-700 leading-relaxed">{r.bio}</p></CSection>}
      {r.achievements.length > 0 && <CSection title="Key Achievements">{r.achievements.map((a) => <AchievementEntry key={a.id} a={a} />)}</CSection>}
      {r.experience.length > 0 && <CSection title="Work Experience">{r.experience.map((e) => <ExperienceEntry key={e.id} exp={e} />)}</CSection>}
      {r.education.length > 0 && <CSection title="Education">{r.education.map((e) => <EducationEntry key={e.id} edu={e} />)}</CSection>}
      {r.projects.length > 0 && <CSection title="Projects">{r.projects.map((p) => <ProjectEntry key={p.id} project={p} />)}</CSection>}
      {r.certifications.length > 0 && <CSection title="Certifications">{r.certifications.map((c) => <CertEntry key={c.id} cert={c} />)}</CSection>}
      {r.courses.length > 0 && <CSection title="Training & Courses">{r.courses.map((c) => <CourseEntry key={c.id} course={c} />)}</CSection>}
      {r.volunteerWork.length > 0 && <CSection title="Volunteer Work">{r.volunteerWork.map((v) => (
        <div key={v.id} className="mb-2 last:mb-0">
          <div className="flex items-start justify-between gap-2">
            <div><div className="font-semibold text-[12px]">{v.role}</div><div className="text-[11px] text-gray-500">{v.organization}</div></div>
            <span className="shrink-0 text-[10.5px] text-gray-400">{v.startDate} — {v.endDate ?? "Present"}</span>
          </div>
          {v.description && <div className="mt-0.5 text-[11px] text-gray-600">{v.description}</div>}
        </div>
      ))}</CSection>}
      {r.skills.length > 0 && <CSection title="Skills"><div className="flex flex-wrap gap-1.5">{r.skills.map((s) => <span key={s} className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-800">{s}</span>)}</div></CSection>}
      {r.languages.length > 0 && <CSection title="Languages"><div className="flex flex-wrap gap-3">{r.languages.map((l) => <span key={l.id} className="text-[12px] text-gray-700">{l.name} <span className="text-gray-400">·</span> <span className="text-gray-500">{l.proficiency}</span></span>)}</div></CSection>}
      {r.interests.length > 0 && <CSection title="Interests"><div className="text-[12px] text-gray-600">{r.interests.join(" · ")}</div></CSection>}
    </div>
  );
}

// ─── MODERN template (dark left sidebar) ─────────────────────────────────────

function ModernTemplate({ r }: { r: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 font-sans text-[12px] leading-relaxed flex items-stretch"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="w-[32%] self-stretch bg-[#1e3a5f] text-white p-4 shrink-0 flex flex-col">
        <h1 className="text-base font-bold leading-tight break-words">{r.displayName || "Your Name"}</h1>
        {r.headline && <p className="mt-1 text-[10.5px] font-medium text-blue-200 break-words">{r.headline}</p>}
        <div className="mt-3 space-y-1.5 text-[10px] text-blue-100">
          {r.email    && <div className="flex items-start gap-1.5"><MailIcon className="h-2.5 w-2.5 mt-0.5 shrink-0" /><span className="break-all min-w-0">{r.email}</span></div>}
          {r.phone    && <div className="flex items-center gap-1.5"><PhoneIcon className="h-2.5 w-2.5 shrink-0" /><span>{r.phone}</span></div>}
          {r.location?.city && <div className="flex items-center gap-1.5"><MapPinIcon className="h-2.5 w-2.5 shrink-0" /><span>{r.location.city}{r.location.state ? `, ${r.location.state}` : ""}</span></div>}
          {r.linkedin && <div className="flex items-start gap-1.5"><LinkedinIcon className="h-2.5 w-2.5 mt-0.5 shrink-0" /><span className="break-all min-w-0">{r.linkedin}</span></div>}
          {r.github   && <div className="flex items-start gap-1.5"><GithubIcon className="h-2.5 w-2.5 mt-0.5 shrink-0" /><span className="break-all min-w-0">{r.github}</span></div>}
          {r.website  && <div className="flex items-start gap-1.5"><GlobeIcon className="h-2.5 w-2.5 mt-0.5 shrink-0" /><span className="break-all min-w-0">{r.website}</span></div>}
        </div>
        {r.skills.length > 0 && <div className="mt-4"><SBH>Skills</SBH><div className="mt-1.5 flex flex-wrap gap-1">{r.skills.map((s) => <span key={s} className="rounded bg-white/15 px-1.5 py-0.5 text-[9.5px] font-medium">{s}</span>)}</div></div>}
        {r.languages.length > 0 && <div className="mt-4"><SBH>Languages</SBH><div className="mt-1.5 space-y-1.5">{r.languages.map((l) => (<div key={l.id}><div className="flex justify-between text-[9.5px]"><span>{l.name}</span><span className="opacity-70">{l.proficiency}</span></div><div className="mt-0.5 flex gap-0.5">{[1,2,3,4,5].map((i) => { const b: Record<string,number>={Native:5,Fluent:4,Advanced:3,Intermediate:2,Basic:1}; return <div key={i} className={`h-1 flex-1 rounded-full ${i<=b[l.proficiency]?"bg-blue-300":"bg-white/20"}`} />; })}</div></div>))}</div></div>}
        {r.interests.length > 0 && <div className="mt-4"><SBH>Interests</SBH><div className="mt-1 text-[9.5px] text-blue-100 leading-relaxed">{r.interests.join(" · ")}</div></div>}
      </div>
      <div className="flex-1 min-w-0 p-4">
        {r.bio && <MSection title="Summary"><p className="text-gray-600 text-[11.5px] leading-relaxed">{r.bio}</p></MSection>}
        {r.achievements.length > 0 && <MSection title="Key Achievements">{r.achievements.map((a) => <AchievementEntry key={a.id} a={a} />)}</MSection>}
        {r.experience.length > 0 && <MSection title="Experience">{r.experience.map((e) => <ExperienceEntry key={e.id} exp={e} />)}</MSection>}
        {r.education.length > 0 && <MSection title="Education">{r.education.map((e) => <EducationEntry key={e.id} edu={e} />)}</MSection>}
        {r.projects.length > 0 && <MSection title="Projects">{r.projects.map((p) => <ProjectEntry key={p.id} project={p} />)}</MSection>}
        {r.certifications.length > 0 && <MSection title="Certifications">{r.certifications.map((c) => <CertEntry key={c.id} cert={c} />)}</MSection>}
        {r.courses.length > 0 && <MSection title="Training & Courses">{r.courses.map((c) => <CourseEntry key={c.id} course={c} />)}</MSection>}
      </div>
    </div>
  );
}

// ─── MINIMAL template ────────────────────────────────────────────────────────

function MinimalTemplate({ r }: { r: ResumeData }) {
  const contact = [r.email, r.phone, [r.location?.city, r.location?.state].filter(Boolean).join(", ") || null, r.linkedin, r.github, r.website].filter(Boolean);
  return (
    <div className="bg-white text-gray-900 font-sans text-[12.5px] leading-relaxed"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-2xl font-light tracking-tight text-gray-900">{r.displayName || "Your Name"}</h1>
        {r.headline && <p className="mt-1 text-sm text-gray-500">{r.headline}</p>}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400">{contact.map((c, i) => <span key={i}>{c}</span>)}</div>
      </div>
      {r.bio && <MinSection title="Summary"><p className="text-gray-600">{r.bio}</p></MinSection>}
      {r.achievements.length > 0 && <MinSection title="Key Achievements">{r.achievements.map((a) => <AchievementEntry key={a.id} a={a} />)}</MinSection>}
      {r.experience.length > 0 && <MinSection title="Experience">{r.experience.map((e) => <ExperienceEntry key={e.id} exp={e} />)}</MinSection>}
      {r.education.length > 0 && <MinSection title="Education">{r.education.map((e) => <EducationEntry key={e.id} edu={e} />)}</MinSection>}
      {r.projects.length > 0 && <MinSection title="Projects">{r.projects.map((p) => <ProjectEntry key={p.id} project={p} />)}</MinSection>}
      {r.certifications.length > 0 && <MinSection title="Certifications">{r.certifications.map((c) => <CertEntry key={c.id} cert={c} />)}</MinSection>}
      {r.courses.length > 0 && <MinSection title="Training">{r.courses.map((c) => <CourseEntry key={c.id} course={c} />)}</MinSection>}
      {r.skills.length > 0 && <MinSection title="Skills"><div className="text-[12px] text-gray-600">{r.skills.join(" · ")}</div></MinSection>}
      {r.languages.length > 0 && <MinSection title="Languages"><div className="flex flex-wrap gap-3 text-[12px] text-gray-600">{r.languages.map((l) => <span key={l.id}>{l.name} <span className="text-gray-400">({l.proficiency})</span></span>)}</div></MinSection>}
      {r.interests.length > 0 && <MinSection title="Interests"><div className="text-[12px] text-gray-500">{r.interests.join(" · ")}</div></MinSection>}
    </div>
  );
}

// ─── EXECUTIVE template (double-column: left sidebar + right main) ───────────

function ExecutiveTemplate({ r }: { r: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 font-sans text-[11.5px] leading-relaxed"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Top header bar */}
      <div className="bg-[#1a2e44] text-white px-5 py-4 mb-0">
        <h1 className="text-xl font-bold tracking-tight">{r.displayName || "Your Name"}</h1>
        {r.headline && <p className="mt-0.5 text-[11px] text-blue-200 font-medium">{r.headline}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-blue-100">
          {r.email    && <span className="flex items-center gap-1"><MailIcon className="h-2.5 w-2.5" />{r.email}</span>}
          {r.phone    && <span className="flex items-center gap-1"><PhoneIcon className="h-2.5 w-2.5" />{r.phone}</span>}
          {r.location?.city && <span className="flex items-center gap-1"><MapPinIcon className="h-2.5 w-2.5" />{r.location.city}{r.location.state ? `, ${r.location.state}` : ""}</span>}
          {r.linkedin && <span className="flex items-center gap-1"><LinkedinIcon className="h-2.5 w-2.5" />{r.linkedin}</span>}
          {r.website  && <span className="flex items-center gap-1"><GlobeIcon className="h-2.5 w-2.5" />{r.website}</span>}
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex">
        {/* Left sidebar — 35% */}
        <div className="w-[35%] shrink-0 bg-gray-50 border-r border-gray-200 p-4">
          {r.skills.length > 0 && <ExecSection title="Core Skills">{r.skills.map((s) => <div key={s} className="flex items-center gap-1.5 text-[11px] py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />{s}</div>)}</ExecSection>}
          {r.education.length > 0 && <ExecSection title="Education">{r.education.map((e) => <EducationEntry key={e.id} edu={e} />)}</ExecSection>}
          {r.certifications.length > 0 && <ExecSection title="Certifications">{r.certifications.map((c) => <CertEntry key={c.id} cert={c} />)}</ExecSection>}
          {r.courses.length > 0 && <ExecSection title="Training">{r.courses.map((c) => <CourseEntry key={c.id} course={c} />)}</ExecSection>}
          {r.languages.length > 0 && <ExecSection title="Languages">{r.languages.map((l) => <div key={l.id} className="mb-1 last:mb-0"><div className="flex justify-between text-[10.5px]"><span className="font-medium">{l.name}</span><span className="text-gray-400">{l.proficiency}</span></div><div className="mt-0.5 flex gap-0.5">{[1,2,3,4,5].map((i) => { const b: Record<string,number>={Native:5,Fluent:4,Advanced:3,Intermediate:2,Basic:1}; return <div key={i} className={`h-1.5 flex-1 rounded-full ${i<=b[l.proficiency]?"bg-blue-500":"bg-gray-200"}`} />; })}</div></div>)}</ExecSection>}
          {r.interests.length > 0 && <ExecSection title="Interests"><div className="flex flex-wrap gap-1">{r.interests.map((i) => <span key={i} className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-600">{i}</span>)}</div></ExecSection>}
          {r.volunteerWork.length > 0 && <ExecSection title="Volunteer">{r.volunteerWork.map((v) => <div key={v.id} className="mb-1.5 last:mb-0"><div className="font-semibold text-[11px]">{v.role}</div><div className="text-[10.5px] text-gray-500">{v.organization}</div></div>)}</ExecSection>}
        </div>

        {/* Right main — 65% */}
        <div className="flex-1 min-w-0 p-4">
          {r.achievements.length > 0 && (
            <div className="mb-4">
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-700 border-b-2 border-blue-600 pb-1 mb-2">Key Achievements</div>
              <div className="grid grid-cols-1 gap-2">
                {r.achievements.map((a) => (
                  <div key={a.id} className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                    <div className="flex items-center gap-1.5"><TrophyIcon className="h-3 w-3 text-amber-600 shrink-0" /><span className="font-semibold text-[11.5px]">{a.title}</span>{a.metric && <span className="ml-auto shrink-0 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5">{a.metric}</span>}</div>
                    <div className="mt-1 text-[10.5px] text-gray-600 pl-4">{a.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {r.bio && <div className="mb-4"><div className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-700 border-b-2 border-blue-600 pb-1 mb-2">Summary</div><p className="text-gray-700 text-[11.5px] leading-relaxed">{r.bio}</p></div>}
          {r.experience.length > 0 && <ExecMainSection title="Experience">{r.experience.map((e) => <ExperienceEntry key={e.id} exp={e} />)}</ExecMainSection>}
          {r.projects.length > 0 && <ExecMainSection title="Projects">{r.projects.map((p) => <ProjectEntry key={p.id} project={p} />)}</ExecMainSection>}
        </div>
      </div>
    </div>
  );
}

// ─── CREATIVE template (bold header + 2-col body) ────────────────────────────

function CreativeTemplate({ r }: { r: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 font-sans text-[11.5px] leading-relaxed"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Bold gradient header */}
      <div style={{ background: "linear-gradient(135deg, #0f2942 0%, #1d4ed8 100%)" }} className="text-white px-5 py-5">
        <h1 className="text-[22px] font-black tracking-tight leading-tight">{r.displayName || "Your Name"}</h1>
        {r.headline && <p className="mt-1 text-[12px] font-medium text-blue-200">{r.headline}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-blue-100">
          {r.email    && <span>{r.email}</span>}
          {r.phone    && <span>{r.phone}</span>}
          {r.location?.city && <span>{r.location.city}{r.location.state ? `, ${r.location.state}` : ""}</span>}
          {r.linkedin && <span>{r.linkedin}</span>}
          {r.github   && <span>{r.github}</span>}
          {r.website  && <span>{r.website}</span>}
        </div>
      </div>

      {/* Body: left 62% main + right 38% sidebar */}
      <div className="flex">
        {/* Main */}
        <div className="flex-1 min-w-0 p-4 border-r border-gray-100">
          {r.bio && <CreSection title="About Me"><p className="text-gray-600 leading-relaxed">{r.bio}</p></CreSection>}
          {r.achievements.length > 0 && (
            <CreSection title="Key Achievements">
              {r.achievements.map((a) => (
                <div key={a.id} className="mb-2 last:mb-0 flex gap-2">
                  <div className="mt-0.5 h-4 w-4 shrink-0 rounded bg-blue-600 flex items-center justify-center">
                    <TrophyIcon className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div><div className="font-semibold text-[11.5px]">{a.title}{a.metric && <span className="ml-1.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5">{a.metric}</span>}</div><div className="text-[11px] text-gray-500 mt-0.5">{a.description}</div></div>
                </div>
              ))}
            </CreSection>
          )}
          {r.experience.length > 0 && <CreSection title="Experience">{r.experience.map((e) => <ExperienceEntry key={e.id} exp={e} />)}</CreSection>}
          {r.projects.length > 0 && <CreSection title="Projects">{r.projects.map((p) => <ProjectEntry key={p.id} project={p} />)}</CreSection>}
          {r.volunteerWork.length > 0 && <CreSection title="Volunteer">{r.volunteerWork.map((v) => <div key={v.id} className="mb-1.5 last:mb-0"><div className="font-semibold text-[11.5px]">{v.role} · <span className="font-normal text-gray-500">{v.organization}</span></div><div className="text-[10.5px] text-gray-400">{v.startDate} — {v.endDate ?? "Present"}</div></div>)}</CreSection>}
        </div>

        {/* Right sidebar */}
        <div className="w-[38%] shrink-0 p-4 bg-gray-50/60">
          {r.skills.length > 0 && <CreSideSection title="Skills"><div className="flex flex-wrap gap-1">{r.skills.map((s) => <span key={s} className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-800">{s}</span>)}</div></CreSideSection>}
          {r.education.length > 0 && <CreSideSection title="Education">{r.education.map((e) => <EducationEntry key={e.id} edu={e} />)}</CreSideSection>}
          {r.certifications.length > 0 && <CreSideSection title="Certifications">{r.certifications.map((c) => <CertEntry key={c.id} cert={c} />)}</CreSideSection>}
          {r.courses.length > 0 && <CreSideSection title="Training">{r.courses.map((c) => <CourseEntry key={c.id} course={c} />)}</CreSideSection>}
          {r.languages.length > 0 && <CreSideSection title="Languages">{r.languages.map((l) => <div key={l.id} className="mb-2 last:mb-0"><div className="flex justify-between text-[10.5px] mb-0.5"><span className="font-medium">{l.name}</span><span className="text-gray-400">{l.proficiency}</span></div><div className="flex gap-0.5">{[1,2,3,4,5].map((i) => { const b: Record<string,number>={Native:5,Fluent:4,Advanced:3,Intermediate:2,Basic:1}; return <div key={i} className={`h-1.5 flex-1 rounded-full ${i<=b[l.proficiency]?"bg-blue-600":"bg-gray-200"}`} />; })}</div></div>)}</CreSideSection>}
          {r.interests.length > 0 && <CreSideSection title="Interests"><div className="flex flex-wrap gap-1">{r.interests.map((i) => <span key={i} className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-600">{i}</span>)}</div></CreSideSection>}
        </div>
      </div>
    </div>
  );
}

// ─── Section wrappers ────────────────────────────────────────────────────────

function CSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-4"><h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 border-b border-blue-200 pb-1">{title}</h2>{children}</div>;
}
function MSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-3"><h2 className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[#1e3a5f] border-b border-gray-200 pb-1">{title}</h2>{children}</div>;
}
function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-4"><h2 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">{title}</h2>{children}</div>;
}
function ExecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-4 last:mb-0"><h3 className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#1a2e44] border-b border-gray-300 pb-1">{title}</h3>{children}</div>;
}
function ExecMainSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-4 last:mb-0"><div className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-700 border-b-2 border-blue-600 pb-1 mb-2">{title}</div>{children}</div>;
}
function CreSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-4 last:mb-0"><div className="flex items-center gap-2 mb-2"><div className="h-3.5 w-1 rounded-full bg-blue-600" /><h2 className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-gray-800">{title}</h2></div>{children}</div>;
}
function CreSideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-4 last:mb-0"><h3 className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-700 border-b border-blue-100 pb-1">{title}</h3>{children}</div>;
}
function SBH({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[9px] font-bold uppercase tracking-widest text-blue-200 border-b border-white/20 pb-1">{children}</h3>;
}
