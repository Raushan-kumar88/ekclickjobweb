import { Timestamp } from "firebase/firestore";

export type CompanySize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "500+";

export interface CompanyLocation {
  city: string;
  state: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  coverPhoto?: string;
  website: string;
  description: string;
  industry: string;
  size: CompanySize;
  location: CompanyLocation;
  ownerId: string;
  verified: boolean;
  createdAt: Timestamp;
  jobCount: number;
  averageRating?: number;
  reviewCount?: number;
  // Employer Branding fields
  tagline?: string;
  culture?: string;
  benefits?: string[];
  techStack?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  photoGallery?: string[];
  responseRate?: number;
  avgResponseDays?: number;
}

export interface CompanyCreateInput {
  name: string;
  website?: string | null;
  description?: string | null;
  industry: string;
  size: CompanySize;
  location: CompanyLocation;
  benefits?: string[] | null;
  techStack?: string[] | null;
  tagline?: string | null;
  culture?: string | null;
  socialLinks?: { linkedin?: string; twitter?: string } | null;
}

// ─── Company Reviews ─────────────────────────────────────────────────────────

export type EmploymentStatus = "current" | "former" | "interviewed";

// Glassdoor-style sub-ratings (all optional)
export interface ReviewSubRatings {
  workLifeBalance?: number; // 1–5
  management?: number;      // 1–5
  cultureValues?: number;   // 1–5
  compensation?: number;    // 1–5
}

export interface CompanyReview extends ReviewSubRatings {
  id: string;
  companyId: string;
  reviewerId: string;
  reviewerDisplayName: string; // e.g. "Najmuddin A."
  rating: number; // 1–5
  title: string;
  pros: string;
  cons: string;
  position?: string;
  employmentStatus: EmploymentStatus;
  helpful: number;
  helpfulVoters: string[]; // userIds who marked helpful
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CompanyReviewInput extends ReviewSubRatings {
  companyId: string;
  rating: number;
  title: string;
  pros: string;
  cons: string;
  position?: string;
  employmentStatus: EmploymentStatus;
}
