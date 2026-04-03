"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon, BellIcon, SearchIcon } from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

function getBreadcrumb(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return "Dashboard";
  return segments
    .slice(1)
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" › ");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors lg:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-semibold">Admin</span>
              {breadcrumb !== "Dashboard" && (
                <span> › {breadcrumb}</span>
              )}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative hidden flex-1 max-w-md md:flex items-center">
            <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Search users, jobs, companies..."
              className={cn(
                "h-9 w-full rounded-xl border bg-muted/40 pl-9 pr-3 text-sm",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              )}
            />
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <BellIcon className="h-4.5 w-4.5" />
            </button>
            <div className="h-5 w-px bg-border" />
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL ?? undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {getInitials(user?.displayName ?? "Admin")}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
