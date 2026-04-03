"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recently_viewed_jobs";
const MAX_ITEMS = 20;

interface RecentlyViewedEntry {
  jobId: string;
  viewedAt: number;
}

export function useRecentlyViewed(): { entries: RecentlyViewedEntry[]; isLoaded: boolean } {
  const [entries, setEntries] = useState<RecentlyViewedEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setEntries(JSON.parse(raw) as RecentlyViewedEntry[]);
      }
    } catch {
      setEntries([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  return { entries, isLoaded };
}

export function useAddRecentlyViewed(): (jobId: string) => void {
  return useCallback((jobId: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let current: RecentlyViewedEntry[] = [];
      if (raw) current = JSON.parse(raw);
      const filtered = current.filter((e) => e.jobId !== jobId);
      const updated = [{ jobId, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage may be unavailable
    }
  }, []);
}
