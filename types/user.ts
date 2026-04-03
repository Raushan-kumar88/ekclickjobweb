import { Timestamp } from "firebase/firestore";

export interface UserLocation {
  city: string;
  state: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  employmentType?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance" | "Self-employed" | "";
  startDate: string;
  endDate: string | null;
  description: string; // newline-separated bullet points
}

export interface Education {
  id: string;
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  year: number;
  startYear?: number;
  grade?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  techStack?: string; // comma-separated tags
  startDate?: string;
  endDate?: string | null;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  url?: string;
  credentialId?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: "Native" | "Fluent" | "Advanced" | "Intermediate" | "Basic";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  metric?: string; // e.g. "40% increase", "saved $2M"
}

export interface Course {
  id: string;
  name: string;
  institution?: string;
  year?: string;
  url?: string;
}

export interface VolunteerWork {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
}

export interface SalaryExpectation {
  min: number;
  max: number;
}

export interface SeekerProfile {
  headline: string;
  bio: string;
  location: UserLocation;
  website?: string;
  linkedin?: string;
  github?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  achievements?: Achievement[];
  courses?: Course[];
  volunteerWork?: VolunteerWork[];
  interests?: string[];
  preferredJobTypes: string[];
  expectedSalary: SalaryExpectation;
  resumeURL: string;
  resumeFileName: string;
  // Indian market fields
  noticePeriod?: string;       // e.g. "immediate" | "15days" | "1month" | "2months" | "3months" | "3months+"
  currentCTC?: number;         // in LPA (Lakhs per annum)
  expectedCTC?: number;        // in LPA
  openToWork?: boolean;
  openToWorkVisibility?: "public" | "recruiters";  // who can see the OTW signal
}

export type UserRole = "seeker" | "employer" | "admin";

export interface EmailPreferences {
  applicationUpdates: boolean;
  jobAlerts: boolean;
  newApplicants: boolean;
  marketing: boolean;
}

export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  applicationUpdates: true,
  jobAlerts: true,
  newApplicants: true,
  marketing: false,
};

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string | null;
  phoneVerified?: boolean;
  phoneVerifiedAt?: Timestamp;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  fcmTokens: string[];
  onboardingCompleted: boolean;
  emailPreferences: EmailPreferences;
  profile: SeekerProfile;
  // Employer fields
  isHiringManager?: boolean;   // Decision Maker / Hiring Manager badge
  followedCompanies?: string[];
}

export interface UserCreateInput {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}
