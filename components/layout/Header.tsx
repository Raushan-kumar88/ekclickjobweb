"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BellIcon,
  MenuIcon,
  UserIcon,
  LogOutIcon,
  SettingsIcon,
  LayoutDashboardIcon,
  ChevronDownIcon,
  BuildingIcon,
  XIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  BookOpenIcon,
  PlusCircleIcon,
  HomeIcon,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/utils/button-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";
import { signOut } from "@/lib/firebase/auth";
import { getInitials } from "@/lib/utils/formatters";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const publicNavLinks = [
  { href: "/jobs", label: "Find Jobs", icon: BriefcaseIcon },
  { href: "/companies", label: "Companies", icon: BuildingIcon },
  { href: "/trends", label: "Trends", icon: TrendingUpIcon },
  { href: "/blog", label: "Blog", icon: BookOpenIcon },
];

const mobileBottomLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/jobs", label: "Jobs", icon: SearchIcon },
  { href: "/companies", label: "Companies", icon: BuildingIcon },
  { href: "/trends", label: "Trends", icon: TrendingUpIcon },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, role } = useAuthStore();
  const { unreadNotificationCount } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dashboardHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "employer"
        ? "/employer/dashboard"
        : "/seeker/dashboard";
  const notificationsHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "employer"
        ? "/employer/notifications"
        : "/seeker/notifications";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    document.cookie = "auth-token=; path=/; max-age=0";
    document.cookie = "user-role=; path=/; max-age=0";
    await signOut();
    router.push("/");
  }

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200",
          scrolled && "shadow-sm"
        )}
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="dark:bg-white dark:rounded-xl dark:px-2 dark:py-1">
              <Image
                src="/logo.png"
                alt="EkClickJob"
                width={180}
                height={54}
                className="h-10 w-auto object-contain"
                priority
                loading="eager"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {isAuthenticated && user ? (
              <>
                {/* Employer quick-post button */}
                {role === "employer" && (
                  <Link
                    href="/employer/jobs/new"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "hidden md:inline-flex gap-1.5 text-primary hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <PlusCircleIcon className="h-3.5 w-3.5" />
                    Post Job
                  </Link>
                )}

                {/* Notifications bell */}
                <Link
                  href={notificationsHref}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "relative h-9 w-9"
                  )}
                >
                  <BellIcon className="h-4.5 w-4.5" />
                  {unreadNotificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-0.5 -top-0.5 h-4.5 min-w-4.5 rounded-full px-1 text-[10px] font-bold leading-none flex items-center justify-center"
                    >
                      {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                    </Badge>
                  )}
                </Link>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" className="flex items-center gap-2 px-2 h-9" />}>
                    <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                      <AvatarImage src={user.photoURL ?? undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium md:block">
                      {user.displayName.split(" ")[0]}
                    </span>
                    <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border p-1">
                    <div className="px-2 py-1.5 mb-1">
                      <p className="text-xs font-semibold truncate">{user.displayName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-lg cursor-pointer">
                      <Link href={dashboardHref} className="flex w-full items-center gap-2">
                        <LayoutDashboardIcon className="h-4 w-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer">
                      <Link
                        href={role === "employer" ? "/employer/company" : "/seeker/profile"}
                        className="flex w-full items-center gap-2"
                      >
                        {role === "employer" ? (
                          <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                        {role === "employer" ? "Company" : "Profile"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer">
                      <Link
                        href={role === "employer" ? "/employer/settings" : "/seeker/settings"}
                        className="flex w-full items-center gap-2"
                      >
                        <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOutIcon className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                {/* Employer CTA — Naukri/LinkedIn pattern */}
                <Link
                  href="/register?role=employer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-1.5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <PlusCircleIcon className="h-3.5 w-3.5" />
                  Post a Job
                </Link>
                <div className="h-5 w-px bg-border" />
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-[7px] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "md:hidden h-9 w-9"
              )}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile menu drawer */}
      <div
        className={cn(
          "fixed top-16 right-0 z-40 h-[calc(100vh-4rem)] w-72 border-l bg-background shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <nav className="flex flex-col gap-1 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-1">
              Navigation
            </p>
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <link.icon className="h-4 w-4 text-muted-foreground" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t mx-4" />

          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  <LayoutDashboardIcon className="h-4 w-4 text-muted-foreground" />
                  Dashboard
                </Link>
                {role === "employer" && (
                  <Link
                    href="/employer/jobs/new"
                    className={cn(buttonVariants({ size: "sm" }), "justify-center gap-2 rounded-xl")}
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                    Post a Job
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="mt-2 w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href="/register?role=employer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full justify-center gap-2"
                  )}
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  Post a Job Free
                </Link>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-center")}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={cn(buttonVariants({ size: "sm" }), "w-full justify-center shadow-sm shadow-primary/20")}
                >
                  Get started free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar (LinkedIn pattern) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur md:hidden pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileBottomLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <link.icon className={cn("h-5 w-5", active && "fill-primary/10")} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}

          {isAuthenticated ? (
            <Link
              href={notificationsHref}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl relative transition-colors",
                isActive(notificationsHref) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <BellIcon className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-[8px] font-bold text-white flex items-center justify-center">
                    {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Alerts</span>
            </Link>
          ) : (
            <Link
              href="/register"
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-primary"
            >
              <UserIcon className="h-5 w-5" />
              <span className="text-[10px] font-medium">Join Free</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
