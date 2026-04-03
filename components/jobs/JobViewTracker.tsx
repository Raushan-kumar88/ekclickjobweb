"use client";

import { useEffect, useRef } from "react";
import { recordJobViewAction } from "@/app/actions/jobs";

interface JobViewTrackerProps {
  jobId: string;
}

export function JobViewTracker({ jobId }: JobViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    recordJobViewAction(jobId);
  }, [jobId]);

  return null;
}
