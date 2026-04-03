"use client";

import { useState, useRef } from "react";
import {
  SaveIcon, PrinterIcon, EyeIcon, EyeOffIcon,
  UserIcon, BriefcaseIcon, GraduationCapIcon, TagIcon,
  Loader2Icon, CheckIcon, UploadCloudIcon, FileTextIcon, XIcon,
  CodeIcon, AwardIcon, GlobeIcon, LayoutTemplateIcon, AlertCircleIcon,
  LinkedinIcon, GithubIcon, LinkIcon, TrophyIcon, BookMarkedIcon,
  HeartHandshakeIcon, SmileIcon, Maximize2Icon,
} from "lucide-react";
import { useResumeBuilder, type ResumeTemplate, type ResumeData } from "@/hooks/useResumeBuilder";
import { ExperienceSection } from "@/components/resume/ExperienceSection";
import { EducationSection } from "@/components/resume/EducationSection";
import { SkillsSection } from "@/components/resume/SkillsSection";
import { ProjectsSection } from "@/components/resume/ProjectsSection";
import { CertificationsSection } from "@/components/resume/CertificationsSection";
import { LanguagesSection } from "@/components/resume/LanguagesSection";
import { AchievementsSection } from "@/components/resume/AchievementsSection";
import { CoursesSection } from "@/components/resume/CoursesSection";
import { VolunteerSection } from "@/components/resume/VolunteerSection";
import { InterestsSection } from "@/components/resume/InterestsSection";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { TemplatePreviewCard } from "@/components/resume/TemplatePreviewCard";
import { ATSScoreCard } from "@/components/resume/ATSScoreCard";
import { generateResumeHTML } from "@/lib/utils/generateResumeHTML";
import { uploadResume } from "@/lib/firebase/storage";
import { updateUserProfile } from "@/lib/firebase/db";
import { useAuthStore } from "@/stores/authStore";
import { STATES, CITIES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Section =
  | "personal" | "experience" | "education" | "skills"
  | "projects" | "certifications" | "languages"
  | "achievements" | "courses" | "volunteer" | "interests";

const SECTIONS: { id: Section; label: string; short: string; icon: React.ElementType }[] = [
  { id: "personal",       label: "Personal",      short: "Info",  icon: UserIcon },
  { id: "experience",     label: "Experience",    short: "Exp",   icon: BriefcaseIcon },
  { id: "education",      label: "Education",     short: "Edu",   icon: GraduationCapIcon },
  { id: "skills",         label: "Skills",        short: "Skills",icon: TagIcon },
  { id: "achievements",   label: "Achievements",  short: "Win",   icon: TrophyIcon },
  { id: "projects",       label: "Projects",      short: "Proj",  icon: CodeIcon },
  { id: "certifications", label: "Certifications",short: "Certs", icon: AwardIcon },
  { id: "courses",        label: "Courses",       short: "Train", icon: BookMarkedIcon },
  { id: "languages",      label: "Languages",     short: "Lang",  icon: GlobeIcon },
  { id: "volunteer",      label: "Volunteer",     short: "Vol",   icon: HeartHandshakeIcon },
  { id: "interests",      label: "Interests",     short: "Int",   icon: SmileIcon },
];

const TEMPLATES: { id: ResumeTemplate; label: string; desc: string; color: string }[] = [
  { id: "classic",   label: "Classic",   desc: "Blue accents",       color: "border-blue-500 text-blue-600" },
  { id: "modern",    label: "Modern",    desc: "Dark sidebar",        color: "border-slate-700 text-slate-700" },
  { id: "minimal",   label: "Minimal",   desc: "Typography only",     color: "border-gray-400 text-gray-600" },
  { id: "executive", label: "Executive", desc: "Double column",       color: "border-indigo-600 text-indigo-600" },
  { id: "creative",  label: "Creative",  desc: "Bold gradient header",color: "border-violet-600 text-violet-600" },
];

const DUMMY_RESUME: ResumeData = {
  displayName: "Arjun Mehta",
  email: "arjun.mehta@gmail.com",
  phone: "+91 98765 43210",
  headline: "Senior Full-Stack Engineer · React · Node.js · AWS",
  bio: "Results-driven software engineer with 6+ years of experience building scalable web applications and distributed systems. Passionate about clean architecture, developer experience, and shipping products that users love. Led engineering teams of up to 8 engineers and delivered multiple high-impact features at growth-stage startups.",
  location: { city: "Bengaluru", state: "Karnataka" },
  website: "https://arjunmehta.dev",
  linkedin: "linkedin.com/in/arjunmehta",
  github: "github.com/arjunmehta",
  skills: ["React", "TypeScript", "Node.js", "Next.js", "PostgreSQL", "Redis", "AWS", "Docker", "GraphQL", "Tailwind CSS", "Python", "Kubernetes"],
  experience: [
    {
      id: "e1",
      title: "Senior Software Engineer",
      company: "Razorpay",
      employmentType: "Full-time",
      location: "Bengaluru, KA",
      startDate: "Jan 2022",
      endDate: "Present",
      description: "Led the re-architecture of the checkout flow, reducing drop-off by 23%.\nBuilt a real-time fraud-detection pipeline processing 50K events/sec using Kafka & Redis.\nMentored 4 junior engineers, introduced code review standards and reduced bug escape rate by 40%.\nDrove adoption of TypeScript across 3 frontend repos, cutting runtime errors by 60%.",
    },
    {
      id: "e2",
      title: "Software Engineer",
      company: "Zomato",
      employmentType: "Full-time",
      location: "Gurugram, HR",
      startDate: "Jul 2019",
      endDate: "Dec 2021",
      description: "Owned the restaurant onboarding microservice serving 300K+ partners.\nReduced API latency by 45% through query optimisation and caching strategies.\nBuilt an A/B testing framework used by 8 product teams.\nContributed to open-source internal design system (12K GitHub stars).",
    },
    {
      id: "e3",
      title: "Frontend Developer",
      company: "Freshworks",
      employmentType: "Internship",
      location: "Chennai, TN",
      startDate: "Jan 2019",
      endDate: "Jun 2019",
      description: "Developed dashboard components in React for CRM product used by 50K+ businesses.\nImproved Lighthouse performance score from 54 to 91.",
    },
  ],
  education: [
    { id: "ed1", degree: "B.Tech", fieldOfStudy: "Computer Science", institution: "IIT Bombay", grade: "8.9 CGPA", year: 2019, startYear: 2015 },
  ],
  projects: [
    { id: "p1", name: "OpenBoard", description: "Real-time collaborative whiteboard built with WebSockets, Canvas API, and Redis pub/sub. Supports 100+ concurrent users.", techStack: "React, Node.js, Redis, WebSockets", url: "github.com/arjunmehta/openboard", startDate: "", endDate: "" },
    { id: "p2", name: "JobFlow AI", description: "AI-powered job application tracker that parses job descriptions and suggests resume improvements using GPT-4.", techStack: "Next.js, Python, OpenAI API, PostgreSQL", url: "jobflowai.app", startDate: "", endDate: "" },
  ],
  certifications: [
    { id: "c1", name: "AWS Certified Solutions Architect – Associate", issuer: "Amazon Web Services", issueDate: "Mar 2023", credentialId: "AWS-SAA-789XYZ" },
    { id: "c2", name: "Google Professional Cloud Developer", issuer: "Google Cloud", issueDate: "Nov 2022", credentialId: "" },
  ],
  languages: [
    { id: "l1", name: "English", proficiency: "Fluent" },
    { id: "l2", name: "Hindi", proficiency: "Native" },
    { id: "l3", name: "Kannada", proficiency: "Intermediate" },
  ],
  achievements: [
    { id: "a1", title: "Reduced checkout drop-off by 23%", metric: "23% uplift", description: "Re-architected the payment flow UI at Razorpay, increasing conversion and contributing $2M+ ARR." },
    { id: "a2", title: "Built fraud pipeline processing 50K events/sec", metric: "50K/s throughput", description: "Designed and deployed a real-time fraud-detection system with sub-10ms latency." },
  ],
  courses: [
    { id: "co1", name: "System Design Masterclass", institution: "Educative.io", year: "2023" },
    { id: "co2", name: "Deep Learning Specialization", institution: "Coursera / deeplearning.ai", year: "2022" },
  ],
  volunteerWork: [
    { id: "v1", role: "Mentor", organization: "GirlScript Summer of Code", startDate: "Apr 2022", endDate: "Jun 2022", description: "Guided 12 first-time open-source contributors in React and Node.js projects." },
  ],
  interests: ["Open Source", "Competitive Programming", "Rock Climbing", "Photography", "Chess"],
  resumeURL: "",
  resumeFileName: "",
  template: "classic",
};

export default function ResumeBuilderPage() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>("personal");
  const [showPreview, setShowPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ open: boolean; template: ResumeTemplate; showDummy: boolean }>({ open: false, template: "classic", showDummy: false });

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const {
    resume, update, isLoading, isDirty, isSaving, save, getCompletionScore,
    addExperience, updateExperience, removeExperience, reorderExperience,
    addEducation, updateEducation, removeEducation,
    addSkill, removeSkill,
    addProject, updateProject, removeProject,
    addCertification, updateCertification, removeCertification,
    addLanguage, removeLanguage,
    addAchievement, updateAchievement, removeAchievement,
    addCourse, updateCourse, removeCourse,
    addVolunteer, updateVolunteer, removeVolunteer,
    addInterest, removeInterest,
  } = useResumeBuilder();

  const { score, missing } = getCompletionScore();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("File too large. Max 5 MB."); return; }
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type)) { toast.error("Only PDF or Word files accepted."); return; }
    setUploadFile(f);
    setUploadProgress(0);
  }

  async function handleFileUpload() {
    if (!uploadFile || !user?.uid) return;
    setIsUploading(true);
    try {
      const { downloadURL } = await uploadResume(uploadFile, user.uid, setUploadProgress);
      await updateUserProfile(user.uid, {
        "profile.resumeURL": downloadURL,
        "profile.resumeFileName": uploadFile.name,
      });
      toast.success("Resume uploaded and saved to your profile!");
      setUploadFile(null);
      setUploadProgress(0);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handlePrint() {
    const html = generateResumeHTML(resume);
    const win = window.open("", "_blank", "width=850,height=1100");
    if (!win) { alert("Please allow pop-ups for this site to download the PDF."); return; }
    win.document.write(html);
    win.document.close();
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Resume Builder</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Build and download a professional resume in minutes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors lg:hidden">
              {showPreview ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              {showPreview ? "Edit" : "Preview"}
            </button>
            <button onClick={() => setPreviewModal({ open: true, template: resume.template ?? "classic", showDummy: false })}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
              <Maximize2Icon className="h-4 w-4" />
              Full Preview
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
              <PrinterIcon className="h-4 w-4" />
              Download PDF
            </button>
            <button onClick={() => save()} disabled={!isDirty || isSaving}
              className={cn("flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                isDirty ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-default")}>
              {isSaving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : isDirty ? <SaveIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
              {isSaving ? "Saving…" : isDirty ? "Save" : "Saved"}
            </button>
          </div>
        </div>

        {/* Completion bar */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Resume Strength</span>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                score >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : score >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300")}>
                {score}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{score >= 80 ? "Looking strong!" : score >= 50 ? "Almost there" : "Needs work"}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-all duration-700",
              score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500")}
              style={{ width: `${score}%` }} />
          </div>
          {missing.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <AlertCircleIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">Missing: </span>
              {missing.slice(0, 4).map((m) => (
                <span key={m} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{m}</span>
              ))}
              {missing.length > 4 && <span className="text-xs text-muted-foreground">+{missing.length - 4} more</span>}
            </div>
          )}
        </div>

        {/* Upload existing resume */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Upload Existing Resume</p>
              <p className="text-xs text-muted-foreground mt-0.5">PDF or Word · used when you apply for jobs</p>
            </div>
            <div className="flex items-center gap-2">
              {resume.resumeURL && !uploadFile && (
                <a href={resume.resumeURL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted/50 transition-colors">
                  <FileTextIcon className="h-3.5 w-3.5" />
                  View saved
                </a>
              )}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted/50 transition-colors">
                <UploadCloudIcon className="h-3.5 w-3.5" />
                {resume.resumeURL ? "Replace" : "Upload"} File
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
          {uploadFile && (
            <div className="mt-3 rounded-xl border bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileTextIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(uploadFile.size / 1024).toFixed(0)} KB</p>
                </div>
                {!isUploading && (
                  <button type="button" onClick={() => setUploadFile(null)} className="rounded-lg p-1 hover:bg-muted/50">
                    <XIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              {isUploading && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{uploadProgress}%</p>
                </div>
              )}
              {!isUploading && (
                <button type="button" onClick={handleFileUpload}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  <UploadCloudIcon className="h-4 w-4" />
                  Upload & Save to Profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* Two-panel layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Left: Editor ── */}
          <div className={cn("space-y-4", showPreview && "hidden lg:block")}>
            {/* Section tabs — icon + short label, no truncation */}
            <div className="grid grid-cols-11 gap-0.5 rounded-xl border bg-muted/30 p-1">
              {SECTIONS.map(({ id, short, icon: Icon }) => (
                <button key={id} onClick={() => setActiveSection(id)}
                  className={cn("flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors",
                    activeSection === id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-[10px] font-medium leading-none">{short}</span>
                </button>
              ))}
            </div>

            {/* Section content */}
            <div className="rounded-2xl border bg-card p-5">

              {/* Personal Info */}
              {activeSection === "personal" && (
                <div className="space-y-5">
                  <h2 className="font-semibold">Personal Information</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                      <input value={resume.displayName} onChange={(e) => update({ displayName: e.target.value })} placeholder="Your full name"
                        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Email</label>
                      <input value={resume.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@example.com" type="email"
                        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Phone</label>
                      <input value={resume.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+91 98765 43210"
                        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Professional Headline</label>
                      <input value={resume.headline} onChange={(e) => update({ headline: e.target.value })} placeholder="e.g. Senior React Developer"
                        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">City</label>
                      <select value={resume.location.city} onChange={(e) => update({ location: { ...resume.location, city: e.target.value } })}
                        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select city</option>
                        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">State</label>
                      <select value={resume.location.state} onChange={(e) => update({ location: { ...resume.location, state: e.target.value } })}
                        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select state</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Social / Web links */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Online Presence</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><LinkedinIcon className="h-3 w-3" />LinkedIn</label>
                        <input value={resume.linkedin} onChange={(e) => update({ linkedin: e.target.value })} placeholder="linkedin.com/in/username"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><GithubIcon className="h-3 w-3" />GitHub</label>
                        <input value={resume.github} onChange={(e) => update({ github: e.target.value })} placeholder="github.com/username"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><LinkIcon className="h-3 w-3" />Portfolio / Website</label>
                        <input value={resume.website} onChange={(e) => update({ website: e.target.value })} placeholder="https://yoursite.dev"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Professional Summary <span className="text-muted-foreground/50">({resume.bio.length}/500)</span>
                    </label>
                    <textarea value={resume.bio} onChange={(e) => update({ bio: e.target.value })} maxLength={500} rows={4}
                      placeholder="Write 3–5 sentences about your experience, key skills, and what you bring to a team…"
                      className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                </div>
              )}

              {activeSection === "experience" && (
                <div className="space-y-4">
                  <h2 className="font-semibold">Work Experience</h2>
                  <ExperienceSection experience={resume.experience} onAdd={addExperience} onUpdate={updateExperience} onRemove={removeExperience} onReorder={reorderExperience} />
                </div>
              )}

              {activeSection === "education" && (
                <div className="space-y-4">
                  <h2 className="font-semibold">Education</h2>
                  <EducationSection education={resume.education} onAdd={addEducation} onUpdate={updateEducation} onRemove={removeEducation} />
                </div>
              )}

              {activeSection === "skills" && (
                <div className="space-y-4">
                  <h2 className="font-semibold">Skills</h2>
                  <SkillsSection skills={resume.skills} onAdd={addSkill} onRemove={removeSkill} />
                </div>
              )}

              {activeSection === "projects" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-semibold">Projects</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Personal, open-source, or freelance work that showcases your skills.</p>
                  </div>
                  <ProjectsSection projects={resume.projects} onAdd={addProject} onUpdate={updateProject} onRemove={removeProject} />
                </div>
              )}

              {activeSection === "certifications" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-semibold">Certifications</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Professional certifications boost your ATS score significantly.</p>
                  </div>
                  <CertificationsSection certifications={resume.certifications} onAdd={addCertification} onUpdate={updateCertification} onRemove={removeCertification} />
                </div>
              )}

              {activeSection === "languages" && (
                <div className="space-y-4">
                  <div><h2 className="font-semibold">Languages</h2><p className="text-xs text-muted-foreground mt-0.5">Multilingual candidates stand out — add all languages you speak.</p></div>
                  <LanguagesSection languages={resume.languages} onAdd={addLanguage} onRemove={removeLanguage} />
                </div>
              )}

              {activeSection === "achievements" && (
                <div className="space-y-4">
                  <div><h2 className="font-semibold">Key Achievements</h2><p className="text-xs text-muted-foreground mt-0.5">Quantified wins get you noticed. Used as a highlighted box in Executive & Creative templates.</p></div>
                  <AchievementsSection achievements={resume.achievements} onAdd={addAchievement} onUpdate={updateAchievement} onRemove={removeAchievement} />
                </div>
              )}

              {activeSection === "courses" && (
                <div className="space-y-4">
                  <div><h2 className="font-semibold">Training & Courses</h2><p className="text-xs text-muted-foreground mt-0.5">Online courses, workshops, bootcamps — shows continuous learning.</p></div>
                  <CoursesSection courses={resume.courses} onAdd={addCourse} onUpdate={updateCourse} onRemove={removeCourse} />
                </div>
              )}

              {activeSection === "volunteer" && (
                <div className="space-y-4">
                  <div><h2 className="font-semibold">Volunteer Work</h2><p className="text-xs text-muted-foreground mt-0.5">Community involvement demonstrates leadership and empathy.</p></div>
                  <VolunteerSection volunteerWork={resume.volunteerWork} onAdd={addVolunteer} onUpdate={updateVolunteer} onRemove={removeVolunteer} />
                </div>
              )}

              {activeSection === "interests" && (
                <div className="space-y-4">
                  <div><h2 className="font-semibold">Interests & Hobbies</h2><p className="text-xs text-muted-foreground mt-0.5">Add a personal touch — relevant interests signal cultural fit.</p></div>
                  <InterestsSection interests={resume.interests} onAdd={addInterest} onRemove={removeInterest} />
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Template + Preview + ATS ── */}
          <div className={cn(!showPreview && "hidden lg:block")}>
            <div className="sticky top-20 space-y-4">
              {/* Template picker */}
              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <LayoutTemplateIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Template</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Click to select · hover to expand</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {TEMPLATES.map((t) => (
                    <div key={t.id} className="relative group">
                      {/* Clickable card — selects this template */}
                      <button
                        onClick={() => update({ template: t.id })}
                        className={cn(
                          "w-full flex flex-col overflow-hidden rounded-xl border-2 transition-all",
                          resume.template === t.id
                            ? `${t.color} shadow-md`
                            : "border-border hover:border-primary/50 hover:shadow-sm",
                        )}>
                        {/* Static template layout preview */}
                        <div className="relative w-full overflow-hidden bg-white" style={{ height: 110 }}>
                          <TemplatePreviewCard template={t.id} className="absolute inset-0" />
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                          {resume.template === t.id && (
                            <div className="absolute inset-0 bg-primary/10 flex items-start justify-end p-1.5">
                              <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center shadow">
                                <CheckIcon className="h-2.5 w-2.5 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Label strip */}
                        <div className={cn(
                          "px-2 py-1.5 border-t text-left",
                          resume.template === t.id ? "bg-primary/5 border-current/20" : "bg-muted/30",
                        )}>
                          <div className={cn("text-[11px] font-semibold leading-none",
                            resume.template === t.id ? "text-primary" : "text-foreground")}>
                            {t.label}
                          </div>
                          <div className="text-[9px] text-muted-foreground mt-0.5 leading-none">{t.desc}</div>
                        </div>
                      </button>

                      {/* Hover: expand preview in modal */}
                      <button
                        onClick={() => setPreviewModal({ open: true, template: t.id, showDummy: true })}
                        title={`Full preview – ${t.label}`}
                        className="absolute top-1.5 left-1.5 h-6 w-6 flex items-center justify-center rounded-md bg-white/80 backdrop-blur-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm">
                        <Maximize2Icon className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ATS Score */}
              <ATSScoreCard resume={resume} />

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</h2>
                <span className="text-xs text-muted-foreground">Updates as you type</span>
              </div>

              {/* A4 preview */}
              <div className="overflow-hidden rounded-2xl border shadow-sm bg-white">
                <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
                  <div className="p-8">
                    <ResumePreview resume={resume} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Template Gallery ── */}
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">Template Gallery</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              See how each template is laid out — click <span className="font-medium text-foreground">Use this</span> to apply it, or expand for a full preview with your data.
            </p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
          {TEMPLATES.map((t) => {
            const isActive = resume.template === t.id;
            return (
              <div key={t.id} className="relative shrink-0 snap-start group" style={{ width: 200 }}>
                <div className={cn(
                  "rounded-2xl border-2 overflow-hidden transition-all shadow-sm hover:shadow-lg cursor-pointer",
                  isActive ? `${t.color} shadow-md` : "border-border hover:border-primary/50",
                )}>
                  {/* Static layout preview */}
                  <div className="relative bg-white overflow-hidden" style={{ height: 280 }}>
                    <TemplatePreviewCard template={t.id} className="absolute inset-0" />
                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    {/* Active badge */}
                    {isActive && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 shadow">
                        <CheckIcon className="h-2.5 w-2.5 text-primary-foreground" />
                        <span className="text-[9px] font-bold text-primary-foreground">Active</span>
                      </div>
                    )}
                    {/* Expand to full preview */}
                    <button
                      onClick={() => setPreviewModal({ open: true, template: t.id, showDummy: true })}
                      className="absolute top-2.5 left-2.5 h-7 w-7 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                      title={`Full preview – ${t.label}`}>
                      <Maximize2Icon className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </div>

                  {/* Footer */}
                  <div className={cn(
                    "flex items-center justify-between px-3 py-2.5 border-t",
                    isActive ? "bg-primary/5" : "bg-muted/20",
                  )}>
                    <div>
                      <div className={cn("text-sm font-semibold", isActive ? "text-primary" : "text-foreground")}>
                        {t.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                    </div>
                    <button
                      onClick={() => update({ template: t.id })}
                      className={cn(
                        "shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground cursor-default"
                          : "border hover:bg-primary hover:text-primary-foreground hover:border-primary",
                      )}>
                      {isActive ? "Selected" : "Use this"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Full Preview Modal ── */}
      {previewModal.open && (() => {
        const previewData: ResumeData = {
          ...(previewModal.showDummy ? DUMMY_RESUME : resume),
          template: previewModal.template,
        };
        return (
          <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 lg:p-10 overflow-y-auto">
            <div className="relative w-full max-w-4xl my-auto">
              {/* Modal chrome */}
              <div className="flex items-center justify-between rounded-t-2xl bg-card border border-b-0 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <EyeIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">
                    {previewModal.showDummy ? "Template Example Preview" : "Your Resume Preview"}
                  </span>
                  {previewModal.showDummy && (
                    <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.5">
                      Sample data — not your resume
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Template switcher inside modal */}
                  <div className="hidden sm:flex items-center gap-1 rounded-xl border bg-muted/30 p-1">
                    {TEMPLATES.map((t) => (
                      <button key={t.id}
                        onClick={() => setPreviewModal((p) => ({ ...p, template: t.id }))}
                        className={cn("rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                          previewModal.template === t.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={handlePrint}
                    className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors">
                    <PrinterIcon className="h-3.5 w-3.5" />
                    PDF
                  </button>
                  <button onClick={() => setPreviewModal({ open: false, template: "classic", showDummy: false })}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border hover:bg-muted/50 transition-colors">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* A4 paper */}
              <div className="rounded-b-2xl border overflow-hidden bg-white shadow-2xl">
                {/* Mobile template switcher */}
                <div className="flex sm:hidden items-center gap-1 border-b bg-muted/10 p-2 overflow-x-auto">
                  {TEMPLATES.map((t) => (
                    <button key={t.id}
                      onClick={() => setPreviewModal((p) => ({ ...p, template: t.id }))}
                      className={cn("shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                        previewModal.template === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="overflow-y-auto max-h-[75vh]">
                  <div className="p-8 sm:p-10">
                    <ResumePreview resume={previewData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
