"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  SearchIcon,
  BookmarkIcon,
  FileTextIcon,
  BellIcon,
  UserIcon,
  SettingsIcon,
  MessageSquareIcon,
  FileIcon,
  BriefcaseIcon,
  GiftIcon,
  BarChart3Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import { useTotalUnreadMessages } from "@/hooks/useMessaging";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/seeker/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/jobs", label: "Browse Jobs", icon: SearchIcon },
  { href: "/seeker/saved-jobs", label: "Saved Jobs", icon: BookmarkIcon },
  { href: "/seeker/applications", label: "Applications", icon: FileTextIcon },
  { href: "/seeker/messages", label: "Messages", icon: MessageSquareIcon, messageBadge: true },
  { href: "/seeker/interviews", label: "Interviews", icon: FileTextIcon },
  { href: "/seeker/notifications", label: "Notifications", icon: BellIcon, badge: true },
  { href: "/seeker/job-alerts", label: "Job Alerts", icon: BellIcon },
  { href: "/seeker/resume", label: "My Resume", icon: FileIcon },
  { href: "/seeker/offer-analyzer", label: "Offer Analyzer", icon: BarChart3Icon },
  { href: "/seeker/profile", label: "Profile", icon: UserIcon },
  { href: "/seeker/referral", label: "Refer & Earn", icon: GiftIcon },
  { href: "/seeker/settings", label: "Settings", icon: SettingsIcon },
];

export function SeekerSidebar() {
  const pathname = usePathname();
  const { unreadNotificationCount } = useAppStore();
  const unreadMessages = useTotalUnreadMessages();

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20 space-y-1">
        <div className="mb-4 flex items-center gap-2 px-3 py-2">
          <BriefcaseIcon className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Job Seeker
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
              {item.badge && unreadNotificationCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 rounded-full px-1 text-xs">
                  {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                </Badge>
              )}
              {item.messageBadge && unreadMessages > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 rounded-full px-1 text-xs">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
