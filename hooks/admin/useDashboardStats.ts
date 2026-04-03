"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface AdminDashboardStats {
  totalUsers: number;
  totalJobs: number;
  activeJobs: number;
  totalCompanies: number;
  verifiedCompanies: number;
  totalApplications: number;
  pendingVerifications: number;
  pendingEmployerValidations: number;
  openSupportTickets: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalCompanies: 0,
    verifiedCompanies: 0,
    totalApplications: 0,
    pendingVerifications: 0,
    pendingEmployerValidations: 0,
    openSupportTickets: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use getCountFromServer for heavy collections to avoid fetching all docs
    async function fetchCounts() {
      try {
        const [
          usersSnap,
          jobsSnap,
          activeJobsSnap,
          companiesSnap,
          verifiedSnap,
          appsSnap,
          pendingVerifSnap,
          pendingEmpSnap,
          ticketsSnap,
          activeSubs,
        ] = await Promise.all([
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "jobs")),
          getCountFromServer(query(collection(db, "jobs"), where("status", "==", "active"))),
          getCountFromServer(collection(db, "companies")),
          getCountFromServer(query(collection(db, "companies"), where("verified", "==", true))),
          getCountFromServer(collection(db, "applications")),
          getCountFromServer(
            query(collection(db, "verificationRequests"), where("status", "==", "pending"))
          ),
          getCountFromServer(
            query(collection(db, "employerValidations"), where("status", "==", "pending"))
          ),
          getCountFromServer(
            query(collection(db, "supportTickets"), where("status", "==", "open"))
          ),
          getCountFromServer(
            query(collection(db, "subscriptions"), where("status", "==", "active"))
          ),
        ]);

        setStats((prev) => ({
          ...prev,
          totalUsers: usersSnap.data().count,
          totalJobs: jobsSnap.data().count,
          activeJobs: activeJobsSnap.data().count,
          totalCompanies: companiesSnap.data().count,
          verifiedCompanies: verifiedSnap.data().count,
          totalApplications: appsSnap.data().count,
          pendingVerifications: pendingVerifSnap.data().count,
          pendingEmployerValidations: pendingEmpSnap.data().count,
          openSupportTickets: ticketsSnap.data().count,
          activeSubscriptions: activeSubs.data().count,
        }));
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setIsLoading(false);
      }
    }

    fetchCounts();

    // Real-time listener for support tickets (most urgent to track live)
    const ticketsUnsub = onSnapshot(
      query(collection(db, "supportTickets"), where("status", "==", "open")),
      (snap) => {
        setStats((prev) => ({ ...prev, openSupportTickets: snap.size }));
      }
    );

    // Real-time listener for pending employer validations
    const empUnsub = onSnapshot(
      query(collection(db, "employerValidations"), where("status", "==", "pending")),
      (snap) => {
        setStats((prev) => ({ ...prev, pendingEmployerValidations: snap.size }));
      }
    );

    return () => {
      ticketsUnsub();
      empUnsub();
    };
  }, []);

  return { stats, isLoading };
}
