"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { format, subDays, subMonths, subYears, eachDayOfInterval, startOfDay } from "date-fns";

type DateRange = "7d" | "30d" | "90d" | "1y";

interface TimeSeriesPoint {
  label: string;
  value: number;
}

interface UserAnalytics {
  growth: TimeSeriesPoint[];
  byRole: { label: string; value: number }[];
  totalSeekers: number;
  totalEmployers: number;
  totalAdmins: number;
}

interface JobAnalytics {
  growth: TimeSeriesPoint[];
  byCategory: { label: string; value: number }[];
  byType: { label: string; value: number }[];
  byStatus: { label: string; value: number }[];
}

interface RevenueAnalytics {
  growth: TimeSeriesPoint[];
  byPlan: { label: string; value: number }[];
  totalActiveSubscriptions: number;
  mrr: number;
}

function getStartDate(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case "7d": return subDays(now, 7);
    case "30d": return subDays(now, 30);
    case "90d": return subDays(now, 90);
    case "1y": return subYears(now, 1);
  }
}

function buildDayBuckets(range: DateRange): Map<string, number> {
  const start = getStartDate(range);
  const days = eachDayOfInterval({ start, end: new Date() });
  const fmt = range === "1y" ? "MMM yyyy" : "MMM d";
  const map = new Map<string, number>();
  for (const d of days) {
    map.set(format(d, fmt), 0);
  }
  return map;
}

export function useUserAnalytics(range: DateRange) {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = getStartDate(range);
      const usersSnap = await getDocs(
        query(
          collection(db, "users"),
          where("createdAt", ">=", Timestamp.fromDate(startDate)),
          orderBy("createdAt", "asc")
        )
      );

      const buckets = buildDayBuckets(range);
      const fmt = range === "1y" ? "MMM yyyy" : "MMM d";
      let seekers = 0, employers = 0, admins = 0;

      for (const doc of usersSnap.docs) {
        const d = doc.data();
        const ts: Timestamp | undefined = d.createdAt;
        if (ts) {
          const key = format(ts.toDate(), fmt);
          buckets.set(key, (buckets.get(key) ?? 0) + 1);
        }
        if (d.role === "seeker") seekers++;
        else if (d.role === "employer") employers++;
        else if (d.role === "admin") admins++;
      }

      setData({
        growth: Array.from(buckets.entries()).map(([label, value]) => ({ label, value })),
        byRole: [
          { label: "Seekers", value: seekers },
          { label: "Employers", value: employers },
          { label: "Admins", value: admins },
        ],
        totalSeekers: seekers,
        totalEmployers: employers,
        totalAdmins: admins,
      });
    } catch (err) {
      console.error("useUserAnalytics error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, isLoading };
}

export function useJobAnalytics(range: DateRange) {
  const [data, setData] = useState<JobAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = getStartDate(range);
      const jobsSnap = await getDocs(
        query(
          collection(db, "jobs"),
          where("postedAt", ">=", Timestamp.fromDate(startDate)),
          orderBy("postedAt", "asc")
        )
      );

      const buckets = buildDayBuckets(range);
      const fmt = range === "1y" ? "MMM yyyy" : "MMM d";
      const categoryMap = new Map<string, number>();
      const typeMap = new Map<string, number>();
      const statusMap = new Map<string, number>();

      for (const doc of jobsSnap.docs) {
        const d = doc.data();
        const ts: Timestamp | undefined = d.postedAt;
        if (ts) {
          const key = format(ts.toDate(), fmt);
          buckets.set(key, (buckets.get(key) ?? 0) + 1);
        }
        if (d.category) categoryMap.set(d.category, (categoryMap.get(d.category) ?? 0) + 1);
        if (d.jobType) typeMap.set(d.jobType, (typeMap.get(d.jobType) ?? 0) + 1);
        if (d.status) statusMap.set(d.status, (statusMap.get(d.status) ?? 0) + 1);
      }

      setData({
        growth: Array.from(buckets.entries()).map(([label, value]) => ({ label, value })),
        byCategory: Array.from(categoryMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([label, value]) => ({ label, value })),
        byType: Array.from(typeMap.entries()).map(([label, value]) => ({ label, value })),
        byStatus: Array.from(statusMap.entries()).map(([label, value]) => ({ label, value })),
      });
    } catch (err) {
      console.error("useJobAnalytics error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, isLoading };
}

export function useRevenueAnalytics(range: DateRange) {
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const subsSnap = await getDocs(
        query(collection(db, "subscriptions"), where("status", "==", "active"))
      );

      const buckets = buildDayBuckets(range);
      const planMap = new Map<string, number>();
      let mrr = 0;

      const PLAN_PRICES: Record<string, number> = { pro: 2999, enterprise: 9999 };

      for (const doc of subsSnap.docs) {
        const d = doc.data();
        const plan = d.plan ?? "free";
        if (plan !== "free") {
          planMap.set(plan, (planMap.get(plan) ?? 0) + 1);
          mrr += PLAN_PRICES[plan] ?? 0;
        }
      }

      setData({
        growth: Array.from(buckets.entries()).map(([label, value]) => ({ label, value })),
        byPlan: Array.from(planMap.entries()).map(([label, value]) => ({ label, value })),
        totalActiveSubscriptions: subsSnap.size,
        mrr,
      });
    } catch (err) {
      console.error("useRevenueAnalytics error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, isLoading };
}

export function useApplicationFunnel() {
  const [data, setData] = useState<{ label: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFunnel() {
      try {
        const appsSnap = await getDocs(query(collection(db, "applications"), limit(1000)));
        const statusMap = new Map<string, number>();
        const ORDER = ["applied", "viewed", "shortlisted", "interview", "offered", "rejected"];

        for (const doc of appsSnap.docs) {
          const status = doc.data().status ?? "applied";
          statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
        }

        setData(
          ORDER.filter((s) => statusMap.has(s)).map((s) => ({
            label: s.charAt(0).toUpperCase() + s.slice(1),
            value: statusMap.get(s) ?? 0,
          }))
        );
      } catch (err) {
        console.error("useApplicationFunnel error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFunnel();
  }, []);

  return { data, isLoading };
}
