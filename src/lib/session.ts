import { cookies } from "next/headers";
import { verifyToken, signToken, type TokenPayload } from "./auth";
import { prisma } from "./prisma";

const isProd = process.env.NODE_ENV === "production";
const SESSION_COOKIE = isProd ? "__Host-simplecrm_session" : "simplecrm_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

export { SESSION_COOKIE };

// ─── Read session from cookie ────────────────────────────────

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, isActive: true }
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    userId: user.id,
    role: user.role as "ADMIN" | "MEMBER",
    email: payload.email,
    name: payload.name,
  };
}

// ─── Write session cookie ────────────────────────────────────

export async function setSession(payload: TokenPayload): Promise<void> {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.delete(SESSION_COOKIE);

  // Clear alternate cookie name in case of dev/prod transition
  if (isProd) {
    cookieStore.delete("simplecrm_session");
  } else {
    cookieStore.set("__Host-simplecrm_session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    cookieStore.delete("__Host-simplecrm_session");
  }
}

