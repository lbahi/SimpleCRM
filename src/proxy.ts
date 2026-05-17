// SimpleCRM — middleware
import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/form", "/api/seed", "/api/health", "/api/auth/login", "/api/auth/logout"];

const ADMIN_ONLY_PATHS = ["/inbox", "/analytics", "/forms", "/team"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || isStaticPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("simplecrm_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Members cannot access admin-only routes
  if (
    payload.role === "MEMBER" &&
    ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL("/leads", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-user-id", payload.userId);
  response.headers.set("x-user-role", payload.role);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
