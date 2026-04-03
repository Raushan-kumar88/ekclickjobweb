import type { JobType, ExperienceLevel, RemotePolicy, CompanySize } from "@/types";

export const JOB_CATEGORIES = [
  "IT & Software",
  "Marketing",
  "Sales",
  "Finance & Accounting",
  "Healthcare",
  "Education",
  "Engineering",
  "Design",
  "Human Resources",
  "Operations",
  "Legal",
  "Customer Support",
  "Data Science",
  "Content & Writing",
  "Administration",
  "Other",
] as const;

export const JOB_TYPES: { label: string; value: JobType }[] = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
  { label: "Freelance", value: "freelance" },
  { label: "Walk-in Drive", value: "walk-in" },
];

export const NOTICE_PERIOD_OPTIONS = [
  { label: "Immediate / No Notice", value: "immediate" },
  { label: "15 Days", value: "15days" },
  { label: "1 Month", value: "1month" },
  { label: "2 Months", value: "2months" },
  { label: "3 Months", value: "3months" },
  { label: "More than 3 Months", value: "3months+" },
] as const;

export const INTERNSHIP_DURATION_OPTIONS = [
  { label: "1 Month", value: 1 },
  { label: "2 Months", value: 2 },
  { label: "3 Months", value: 3 },
  { label: "6 Months", value: 6 },
  { label: "12 Months", value: 12 },
] as const;

export const EXPERIENCE_LEVELS: { label: string; value: ExperienceLevel }[] = [
  { label: "Fresher", value: "fresher" },
  { label: "1-3 Years", value: "1-3 years" },
  { label: "3-5 Years", value: "3-5 years" },
  { label: "5-10 Years", value: "5-10 years" },
  { label: "10+ Years", value: "10+ years" },
];

export const REMOTE_POLICIES: { label: string; value: RemotePolicy }[] = [
  { label: "On-site", value: "on-site" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
];

export const COMPANY_SIZES: { label: string; value: CompanySize }[] = [
  { label: "1-10 employees", value: "1-10" },
  { label: "11-50 employees", value: "11-50" },
  { label: "51-200 employees", value: "51-200" },
  { label: "201-500 employees", value: "201-500" },
  { label: "500+ employees", value: "500+" },
];

export const INDUSTRIES = [
  "Information Technology",
  "Healthcare & Pharma",
  "Banking & Finance",
  "Education",
  "Manufacturing",
  "Retail & E-commerce",
  "Consulting",
  "Media & Entertainment",
  "Automotive",
  "Telecom",
  "Real Estate",
  "FMCG",
  "Logistics & Supply Chain",
  "Energy & Utilities",
  "Government",
  "Other",
] as const;

export const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad",
  "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow",
  "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
  "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot",
  "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar",
  "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore",
  "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
  "Raipur", "Kochi", "Chandigarh", "Mysore", "Gurgaon",
  "Noida", "Dehradun", "Mangalore", "Trivandrum", "Bhubaneswar",
] as const;

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Chandigarh", "Puducherry",
] as const;

export const APPLICATION_STATUS_CONFIG = {
  applied: { label: "Applied", color: "#3b82f6", bgColor: "#eff6ff" },
  viewed: { label: "Viewed", color: "#f59e0b", bgColor: "#fffbeb" },
  shortlisted: { label: "Shortlisted", color: "#22c55e", bgColor: "#f0fdf4" },
  interview: { label: "Interview", color: "#8b5cf6", bgColor: "#f5f3ff" },
  offered: { label: "Offered", color: "#16a34a", bgColor: "#f0fdf4" },
  rejected: { label: "Rejected", color: "#ef4444", bgColor: "#fef2f2" },
} as const;

export const SALARY_RANGE = {
  MIN: 0,
  MAX: 50_00_000,
  STEP: 1_00_000,
  CURRENCY: "INR",
} as const;

export const POPULAR_SKILLS = [
  "JavaScript", "TypeScript", "React", "React Native", "Node.js",
  "Python", "Java", "SQL", "MongoDB", "AWS", "Docker", "Git",
  "HTML", "CSS", "Angular", "Vue.js", "Flutter", "Swift",
  "Kotlin", "Go", "Ruby", "PHP", "C++", "C#", ".NET",
  "Machine Learning", "Data Analysis", "DevOps", "CI/CD",
  "Figma", "UI/UX Design", "Agile", "Scrum", "REST API",
  "GraphQL", "Firebase", "Redis", "Kubernetes", "Linux",
  "Excel", "Power BI", "Tableau", "SAP", "Salesforce",
  "Digital Marketing", "SEO", "Content Writing", "Communication",
  "Project Management", "Leadership", "Problem Solving",
] as const;

export const FREE_TIER_JOB_LIMIT = 2;
export const UPGRADE_URL = "/pricing";

export const PRIVACY_POLICY_URL = "/privacy";
export const TERMS_OF_SERVICE_URL = "/terms";
export const APP_VERSION = "1.0.0";

export const JOB_TYPE_COLORS: Record<string, string> = {
  "full-time": "#6D28D9",
  "part-time": "#2563EB",
  "contract": "#059669",
  "internship": "#D97706",
  "freelance": "#0D9488",
  "walk-in": "#DC2626",
};

export const AVATAR_COLORS = [
  "#6D28D9", "#2563EB", "#0D9488", "#059669",
  "#D97706", "#E11D48", "#4F46E5", "#0891B2",
] as const;

export const PAGE_SIZE = 20;
