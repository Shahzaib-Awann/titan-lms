import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import type { Role } from "./types/common";

/**
 * Protected routes with required roles.
 */
const PROTECTED_ROUTES: Array<[string, Role]> = [
  ["/admin", "admin"],
  ["/student", "student"],
  ["/trainer", "trainer"],
];

/**
 * Default dashboard for each role.
 */
const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  trainer: "/trainer",
  student: "/student",
};

/**
 * Returns home route based on role.
 */
function getRoleHome(role?: Role) {
  return role ? ROLE_HOME[role] : "/";
}

/**
 * Finds required role for a route.
 */
function getRequiredRole(pathname: string): Role | undefined {
  return PROTECTED_ROUTES.find(([route]) =>
    pathname.startsWith(route)
  )?.[1];
}

/**
 * Route access controller.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth();
  const user = session?.user;

  const role = user?.role as Role | undefined;

  // Redirect authenticated users away from sign-in page
  if (pathname === "/sign-in" && role) {
    return NextResponse.redirect(
      new URL(getRoleHome(role), request.url)
    );
  }

  const requiredRole = getRequiredRole(pathname);

  // Public route
  if (!requiredRole) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", pathname);

    return NextResponse.redirect(signInUrl);
  }

  // Prevent unauthorized role access
  if (role !== requiredRole) {
    return NextResponse.redirect(
      new URL(getRoleHome(role), request.url)
    );
  }

  return NextResponse.next();
}

/**
 * Proxy execution paths.
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*",
    "/trainer/:path*",
    "/sign-in",
  ],
};