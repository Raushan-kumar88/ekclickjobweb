import { Timestamp } from "firebase/firestore";

export type ApplicationStatus =
  | "applied"
  | "viewed"
  | "shortlisted"
  | "interview"
  | "offered"
  | "rejected";

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  applicantId: string;
  applicantName: string;
  employerId: string;
  resumeURL: string;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: Timestamp;
  updatedAt: Timestamp;
  employerNotes: string;
}

export interface ApplicationCreateInput {
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  employerId: string;
  resumeURL: string;
  coverLetter?: string;
}
