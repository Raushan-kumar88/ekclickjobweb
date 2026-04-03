"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  BuildingIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  FlagIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  FileTextIcon,
  BellIcon,
  ScrollTextIcon,
  SettingsIcon,
  HeadphonesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogOutIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { signOut } from "@/lib/firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/formatters";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboardIcon },
      { label: "Analytics", href: "/admin/analytics", icon: TrendingUpIcon },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/admin/users", icon: UsersIcon },
      { label: "Employer Validation", href: "/admin/employer-validation", icon: BadgeCheckIcon },
      { label: "Jobs", href: "/admin/jobs", icon: BriefcaseIcon },
      { label: "Companies", href: "/admin/companies", icon: BuildingIcon },
      { label: "Verifications", href: "/admin/verifications", icon: ShieldCheckIcon },
      { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCardIcon },
    ],
  },
  {
    title: "Content & Support",
    items: [
      { label: "Content", href: "/admin/content", icon: FileTextIcon },
      { label: "Support Center", href: "/admin/support", icon: HeadphonesIcon },
      { label: "Notifications", href: "/admin/notifications", icon: BellIcon },
      { label: "Reports", href: "/admin/reports", icon: FlagIcon },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollTextIcon },
      { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
    ],
  },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  async function handleSignOut() {
    document.cookie = "auth-token=; path=/; max-age=0";
    document.cookie = "user-role=; path=/; max-age=0";
    document.cookie = "onboarding-done=; path=/; max-age=0";
    await signOut();
    router.push("/login");
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo area */}
      <div className={cn("flex h-16 items-center border-b px-4", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/admin/dashboard" className="text-lg font-bold text-primary">
            EkClickJob
            <span className="ml-1.5 text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </button>
        {/* Mobile close */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon, badge }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onMobileClose}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      collapsed ? "justify-center px-2" : "",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="flex-1">{label}</span>
                    )}
                    {!collapsed && badge !== undefined && badge > 0 && (
                      <span
                        className={cn(
                          "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                          active
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-destructive text-destructive-foreground"
                        )}
                      >
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section at bottom */}
      <div className={cn("border-t p-3", collapsed ? "flex justify-center" : "")}>
        {collapsed ? (
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOutIcon className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user?.photoURL ?? undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {getInitials(user?.displayName ?? "Admin")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user?.displayName ?? "Admin"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOutIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-background shadow-2xl lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
