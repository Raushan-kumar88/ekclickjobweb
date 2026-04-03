import { formatDistanceToNow, format } from "date-fns";
import { Timestamp } from "firebase/firestore";

type TimestampLike = Timestamp | string | Date | null | undefined;

function toDate(ts: TimestampLike): Date | null {
  if (!ts) return null;
  try {
    if (ts instanceof Date) return ts;
    if (typeof ts === "string") return new Date(ts);
    if (typeof (ts as Timestamp).toDate === "function") return (ts as Timestamp).toDate();
    return null;
  } catch {
    return null;
  }
}

export function formatRelativeTime(timestamp: TimestampLike): string {
  const date = toDate(timestamp);
  if (!date) return "";
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "";
  }
}

export function formatDate(timestamp: TimestampLike): string {
  const date = toDate(timestamp);
  if (!date) return "";
  try {
    return format(date, "dd MMM yyyy");
  } catch {
    return "";
  }
}

export function formatSalary(min: number, max: number): string {
  const formatLPA = (value: number): string => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)} LPA`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  if (min === 0 && max === 0) return "Not disclosed";
  if (min === 0) return `Up to ${formatLPA(max)}`;
  if (max === 0) return `${formatLPA(min)}+`;
  if (min === max) return formatLPA(min);
  return `${formatLPA(min)} - ${formatLPA(max)}`;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLocation(city: string, state?: string): string {
  if (!city) return state || "";
  if (!state) return city;
  return `${city}, ${state}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
