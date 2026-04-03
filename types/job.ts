import { Timestamp } from "firebase/firestore";

export type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "freelance"
  | "walk-in";

export type ExperienceLevel =
  | "fresher"
  | "1-3 years"
  | "3-5 years"
  | "5-10 years"
  | "10+ years";

export type RemotePolicy = "on-site" | "remote" | "hybrid";

export type JobStatus = "active" | "paused" | "closed";

export interface JobLocation {
  city: string;
  state: string;
  country: string;
}

export interface JobSalary {
  min: number;
  max: number;
  currency: string;
  period: "per year" | "per month";
}

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  location: JobLocation;
  salary: JobSalary;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  remotePolicy: RemotePolicy;
  skills: string[];
  category: string;
  status: JobStatus;
  postedBy: string;
  postedAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
  applicationsCount: number;
  viewsCount: number;
  isSponsored: boolean;
  scheduledAt?: string | null;
  isWalkIn?: boolean;
  walkInAddress?: string;
  walkInMapLink?: string;
  walkInDates?: string[];
  walkInTiming?: string;
  internshipDetails?: InternshipDetails;
  equityDetails?: EquityDetails;
  hiringManagerId?: string;
}

// Internship-specific fields
export interface InternshipDetails {
  stipendMin?: number;        // ₹/month; 0 = unpaid
  stipendMax?: number;
  durationMonths?: number;    // 1-12
  certificateOffered?: boolean;
  ppoRate?: number;           // 0-100 %
  isPaid?: boolean;
}

// Equity / startup fields
export interface EquityDetails {
  equityMin?: number;         // % e.g. 0.1
  equityMax?: number;
  fundingStage?: "bootstrapped" | "pre-seed" | "seed" | "series-a" | "series-b" | "series-c" | "public";
}

export interface JobCreateInput {
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  location: JobLocation;
  salary: JobSalary;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  remotePolicy: RemotePolicy;
  skills: string[];
  category: string;
  isSponsored?: boolean;
  scheduledAt?: string | null;
  isWalkIn?: boolean;
  walkInAddress?: string | null;
  walkInMapLink?: string | null;
  walkInDates?: string[] | null;
  walkInTiming?: string | null;
  internshipDetails?: InternshipDetails | null;
  equityDetails?: EquityDetails;
  hiringManagerId?: string | null;
}

export interface JobFilters {
  query: string;
  jobTypes: JobType[];
  experienceLevel: ExperienceLevel | null;
  salaryMin: number;
  salaryMax: number;
  city: string;
  state: string;
  remotePolicy: RemotePolicy | null;
  category: string;
}
