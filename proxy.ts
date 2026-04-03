import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/verify-phone"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;
  const role = request.cookies.get("user-role")?.value;
  const onboardingDone = request.cookies.get("onboarding-done")?.value;
  const isAuthenticated = !!token;

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))
  ) {
    if (role === "employer") {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/seeker/dashboard", request.url));
  }

  // Authenticated users who haven't finished onboarding get redirected there
  // (except when they're already on /onboarding itself)
  if (
    isAuthenticated &&
    onboardingDone !== "true" &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api") &&
    (pathname.startsWith("/seeker") || pathname.startsWith("/employer"))
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Seeker routes — require auth + seeker role
  if (pathname.startsWith("/seeker")) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (role === "employer") {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Employer routes — require auth + employer role
  if (pathname.startsWith("/employer")) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (role === "seeker") {
      return NextResponse.redirect(new URL("/seeker/dashboard", request.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Admin routes — require auth + admin role
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static assets)
     * - _next/image (image optimisation)
     * - favicon.ico, public folder assets
     * - API routes (handled by Next.js server)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo\\.png|api/).*)",
  ],
};
