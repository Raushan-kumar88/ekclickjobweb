"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getUserProfile, updateUserProfile } from "@/lib/firebase/db";
import { toast } from "sonner";
import type {
  SeekerProfile,
  WorkExperience,
  Education,
  Project,
  Certification,
  Language,
  Achievement,
  Course,
  VolunteerWork,
  UserLocation,
} from "@/types";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export type ResumeTemplate = "classic" | "modern" | "minimal" | "executive" | "creative";

export interface ResumeData {
  displayName: string;
  email: string;
  phone: string;
  headline: string;
  bio: string;
  location: UserLocation;
  website: string;
  linkedin: string;
  github: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  achievements: Achievement[];
  courses: Course[];
  volunteerWork: VolunteerWork[];
  interests: string[];
  resumeURL: string;
  resumeFileName: string;
  template: ResumeTemplate;
}

const EMPTY_RESUME: ResumeData = {
  displayName: "",
  email: "",
  phone: "",
  headline: "",
  bio: "",
  location: { city: "", state: "" },
  website: "",
  linkedin: "",
  github: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  achievements: [],
  courses: [],
  volunteerWork: [],
  interests: [],
  resumeURL: "",
  resumeFileName: "",
  template: "classic",
};

export function useResumeBuilder() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [resume, setResume] = useState<ResumeData>(EMPTY_RESUME);
  const [isDirty, setIsDirty] = useState(false);

  const { data: rawProfile, isLoading } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user?.uid,
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!rawProfile || !user) return;
    const p = (rawProfile.profile ?? {}) as Partial<SeekerProfile>;
    setResume({
      displayName: user.displayName ?? rawProfile.displayName ?? "",
      email: user.email ?? rawProfile.email ?? "",
      phone: user.phone ?? rawProfile.phone ?? "",
      headline: p.headline ?? "",
      bio: p.bio ?? "",
      location: p.location ?? { city: "", state: "" },
      website: p.website ?? "",
      linkedin: p.linkedin ?? "",
      github: p.github ?? "",
      skills: p.skills ?? [],
      experience: p.experience ?? [],
      education: p.education ?? [],
      projects: p.projects ?? [],
      certifications: p.certifications ?? [],
      languages: p.languages ?? [],
      achievements: p.achievements ?? [],
      courses: p.courses ?? [],
      volunteerWork: p.volunteerWork ?? [],
      interests: p.interests ?? [],
      resumeURL: p.resumeURL ?? "",
      resumeFileName: p.resumeFileName ?? "",
      template: "classic",
    });
    setIsDirty(false);
  }, [rawProfile, user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.uid) throw new Error("Not authenticated");
      await updateUserProfile(user.uid, {
        displayName: resume.displayName,
        "profile.headline": resume.headline,
        "profile.bio": resume.bio,
        "profile.location": resume.location,
        "profile.website": resume.website,
        "profile.linkedin": resume.linkedin,
        "profile.github": resume.github,
        "profile.skills": resume.skills,
        "profile.experience": resume.experience,
        "profile.education": resume.education,
        "profile.projects": resume.projects,
        "profile.certifications": resume.certifications,
        "profile.languages": resume.languages,
        "profile.achievements": resume.achievements,
        "profile.courses": resume.courses,
        "profile.volunteerWork": resume.volunteerWork,
        "profile.interests": resume.interests,
      });
    },
    onSuccess: () => {
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.uid] });
      toast.success("Resume saved!");
    },
    onError: () => toast.error("Failed to save resume."),
  });

  function update(partial: Partial<ResumeData>) {
    setResume((prev) => ({ ...prev, ...partial }));
    setIsDirty(true);
  }

  // ── Experience ──────────────────────────────────────────────────────────────

  function addExperience(exp: Omit<WorkExperience, "id">) {
    update({ experience: [...resume.experience, { id: generateId(), ...exp }] });
  }

  function updateExperience(id: string, exp: Partial<WorkExperience>) {
    update({
      experience: resume.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
    });
  }

  function removeExperience(id: string) {
    update({ experience: resume.experience.filter((e) => e.id !== id) });
  }

  function reorderExperience(fromIdx: number, toIdx: number) {
    const arr = [...resume.experience];
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    update({ experience: arr });
  }

  // ── Education ───────────────────────────────────────────────────────────────

  function addEducation(edu: Omit<Education, "id">) {
    update({ education: [...resume.education, { id: generateId(), ...edu }] });
  }

  function updateEducation(id: string, edu: Partial<Education>) {
    update({
      education: resume.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
    });
  }

  function removeEducation(id: string) {
    update({ education: resume.education.filter((e) => e.id !== id) });
  }

  // ── Skills ──────────────────────────────────────────────────────────────────

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || resume.skills.includes(trimmed)) return;
    update({ skills: [...resume.skills, trimmed] });
  }

  function removeSkill(skill: string) {
    update({ skills: resume.skills.filter((s) => s !== skill) });
  }

  // ── Projects ────────────────────────────────────────────────────────────────

  function addProject(project: Omit<Project, "id">) {
    update({ projects: [...resume.projects, { id: generateId(), ...project }] });
  }

  function updateProject(id: string, project: Partial<Project>) {
    update({
      projects: resume.projects.map((p) => (p.id === id ? { ...p, ...project } : p)),
    });
  }

  function removeProject(id: string) {
    update({ projects: resume.projects.filter((p) => p.id !== id) });
  }

  // ── Certifications ──────────────────────────────────────────────────────────

  function addCertification(cert: Omit<Certification, "id">) {
    update({ certifications: [...resume.certifications, { id: generateId(), ...cert }] });
  }

  function updateCertification(id: string, cert: Partial<Certification>) {
    update({
      certifications: resume.certifications.map((c) => (c.id === id ? { ...c, ...cert } : c)),
    });
  }

  function removeCertification(id: string) {
    update({ certifications: resume.certifications.filter((c) => c.id !== id) });
  }

  // ── Languages ───────────────────────────────────────────────────────────────

  function addLanguage(lang: Omit<Language, "id">) {
    update({ languages: [...resume.languages, { id: generateId(), ...lang }] });
  }

  function updateLanguage(id: string, lang: Partial<Language>) {
    update({
      languages: resume.languages.map((l) => (l.id === id ? { ...l, ...lang } : l)),
    });
  }

  function removeLanguage(id: string) {
    update({ languages: resume.languages.filter((l) => l.id !== id) });
  }

  // ── Achievements ─────────────────────────────────────────────────────────────

  function addAchievement(a: Omit<Achievement, "id">) {
    update({ achievements: [...resume.achievements, { id: generateId(), ...a }] });
  }

  function updateAchievement(id: string, a: Partial<Achievement>) {
    update({ achievements: resume.achievements.map((x) => (x.id === id ? { ...x, ...a } : x)) });
  }

  function removeAchievement(id: string) {
    update({ achievements: resume.achievements.filter((x) => x.id !== id) });
  }

  // ── Courses ──────────────────────────────────────────────────────────────────

  function addCourse(c: Omit<Course, "id">) {
    update({ courses: [...resume.courses, { id: generateId(), ...c }] });
  }

  function updateCourse(id: string, c: Partial<Course>) {
    update({ courses: resume.courses.map((x) => (x.id === id ? { ...x, ...c } : x)) });
  }

  function removeCourse(id: string) {
    update({ courses: resume.courses.filter((x) => x.id !== id) });
  }

  // ── Volunteer ────────────────────────────────────────────────────────────────

  function addVolunteer(v: Omit<VolunteerWork, "id">) {
    update({ volunteerWork: [...resume.volunteerWork, { id: generateId(), ...v }] });
  }

  function updateVolunteer(id: string, v: Partial<VolunteerWork>) {
    update({ volunteerWork: resume.volunteerWork.map((x) => (x.id === id ? { ...x, ...v } : x)) });
  }

  function removeVolunteer(id: string) {
    update({ volunteerWork: resume.volunteerWork.filter((x) => x.id !== id) });
  }

  // ── Interests ────────────────────────────────────────────────────────────────

  function addInterest(interest: string) {
    const t = interest.trim();
    if (!t || resume.interests.includes(t)) return;
    update({ interests: [...resume.interests, t] });
  }

  function removeInterest(interest: string) {
    update({ interests: resume.interests.filter((i) => i !== interest) });
  }

  // ── Completion score ────────────────────────────────────────────────────────

  function getCompletionScore(): { score: number; missing: string[] } {
    const missing: string[] = [];
    let total = 0;
    let filled = 0;

    const check = (val: string | undefined | null, label: string, weight = 1) => {
      total += weight;
      if (val && val.trim().length > 0) filled += weight;
      else missing.push(label);
    };

    check(resume.displayName, "Full name");
    check(resume.email, "Email");
    check(resume.phone, "Phone");
    check(resume.headline, "Professional headline", 2);
    check(resume.bio, "Professional summary", 2);
    if (resume.experience.length === 0) { missing.push("Work experience"); total += 3; }
    else filled += 3;
    if (resume.education.length === 0) { missing.push("Education"); total += 2; }
    else filled += 2;
    if (resume.skills.length < 3) { missing.push("At least 3 skills"); total += 2; }
    else filled += 2;
    check(resume.linkedin, "LinkedIn profile");
    if (resume.projects.length === 0) { missing.push("Projects"); total += 1; }
    else filled += 1;

    return { score: Math.round((filled / total) * 100), missing };
  }

  return {
    resume,
    update,
    isLoading,
    isDirty,
    isSaving: saveMutation.isPending,
    save: saveMutation.mutate,
    getCompletionScore,
    // Experience
    addExperience,
    updateExperience,
    removeExperience,
    reorderExperience,
    // Education
    addEducation,
    updateEducation,
    removeEducation,
    // Skills
    addSkill,
    removeSkill,
    // Projects
    addProject,
    updateProject,
    removeProject,
    // Certifications
    addCertification,
    updateCertification,
    removeCertification,
    // Languages
    addLanguage,
    updateLanguage,
    removeLanguage,
    // Achievements
    addAchievement,
    updateAchievement,
    removeAchievement,
    // Courses
    addCourse,
    updateCourse,
    removeCourse,
    // Volunteer
    addVolunteer,
    updateVolunteer,
    removeVolunteer,
    // Interests
    addInterest,
    removeInterest,
  };
}
