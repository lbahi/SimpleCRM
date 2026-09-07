import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// Production uses __Host- prefix which requires Secure=true, Path=/, no Domain.
// NEVER call response.cookies.delete() on __Host- cookies — Next.js delete() generates
// a Set-Cookie header WITHOUT the Secure attribute, causing compliant browsers
// (Chrome, Firefox, Safari, Edge) to silently REJECT the Set-Cookie header (RFC 6265bis).
// Instead, expire the cookie by setting maxAge=0 / expires=epoch with Secure=true directly.

export async function POST() {
  try {
    await clearSession();
  } catch (error) {
    console.error("clearSession error:", error);
  }

  const response = NextResponse.json({ success: true });

  // 1. Expire __Host-simplecrm_session (strict secure, path=/, no domain)
  response.cookies.set("__Host-simplecrm_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  // 2. Expire simplecrm_session with secure=true
  response.cookies.set("simplecrm_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  // 3. Also append plain simplecrm_session (in case it was set without secure flag)
  response.headers.append(
    "Set-Cookie",
    "simplecrm_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
  );

  // Prevent any browser/proxy caching of the logout response
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}
