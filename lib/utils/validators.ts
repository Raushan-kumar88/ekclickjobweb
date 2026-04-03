import { z } from "zod";

export const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.in", "yahoo.in", "ymail.com",
  "hotmail.com", "hotmail.co.in", "hotmail.in",
  "outlook.com", "outlook.in",
  "live.com", "live.in",
  "msn.com",
  "rediffmail.com",
  "icloud.com", "me.com", "mac.com",
  "aol.com",
  "mailinator.com", "guerrillamail.com", "tempmail.com",
  "sharklasers.com", "yopmail.com", "throwam.com",
]);

export function isWorkEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain);
}

/** Validates GSTIN format: 2-digit state code + 10-char PAN + entity + Z + checksum */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  headline: z.string().max(100, "Headline must be less than 100 characters").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid mobile number")
    .optional()
    .or(z.literal("")),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().nullable(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  year: z
    .number()
    .min(1950, "Year must be after 1950")
    .max(new Date().getFullYear() + 5, "Invalid year"),
});

export const jobSchema = z.object({
  title: z
    .string()
    .min(1, "Job title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Job description is required")
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters"),
  category: z.string().min(1, "Category is required"),
  jobType: z.enum(["full-time", "part-time", "contract", "internship", "freelance"]),
  experienceLevel: z.enum(["fresher", "1-3 years", "3-5 years", "5-10 years", "10+ years"]),
  remotePolicy: z.enum(["on-site", "remote", "hybrid"]),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  salaryMin: z.number().min(0, "Salary must be positive"),
  salaryMax: z.number().min(0, "Salary must be positive"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

export const companySchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Name must be less than 100 characters"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  industry: z.string().min(1, "Industry is required"),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

export const employerRegisterSchema = registerSchema.refine(
  (data) => isWorkEmail(data.email),
  {
    message: "Employers must use a company/work email address. Free email providers (Gmail, Yahoo, etc.) are not accepted.",
    path: ["email"],
  }
);

export const gstinSchema = z.object({
  gstin: z
    .string()
    .min(1, "GSTIN is required")
    .length(15, "GSTIN must be exactly 15 characters")
    .regex(GSTIN_REGEX, "Invalid GSTIN format. Expected: 22AAAAA0000A1Z5"),
  companyWebsite: z
    .string()
    .min(1, "Company website is required")
    .url("Please enter a valid URL (e.g. https://yourcompany.com)")
    .refine((url) => {
      try {
        const { hostname } = new URL(url);
        return !hostname.includes("localhost") && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/);
      } catch {
        return false;
      }
    }, "Please enter a publicly accessible company website URL"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PhoneFormData = z.infer<typeof phoneSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ExperienceFormData = z.infer<typeof experienceSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type JobFormData = z.infer<typeof jobSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type GstinFormData = z.infer<typeof gstinSchema>;
