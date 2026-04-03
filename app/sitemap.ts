import type { MetadataRoute } from "next";
import { getAllActiveJobs, getAllCompanies } from "@/lib/firebase/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ekclickjob.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/jobs`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/companies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let jobPages: MetadataRoute.Sitemap = [];
  try {
    const jobs = await getAllActiveJobs();
    jobPages = jobs.map((job) => ({
      url: `${BASE_URL}/jobs/${job.id}`,
      lastModified: job.updatedAt?.toDate?.() ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // If Firestore is unavailable, return static pages only
  }

  let companyPages: MetadataRoute.Sitemap = [];
  try {
    const companies = await getAllCompanies();
    companyPages = companies.map((c) => ({
      url: `${BASE_URL}/companies/${c.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // sitemap degrades gracefully if Firestore is unavailable
  }

  return [...staticPages, ...jobPages, ...companyPages];
}
