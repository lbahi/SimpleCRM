import { cookies } from "next/headers";
import { verifyToken, signToken, type TokenPayload } from "./auth";
import { prisma } from "./prisma";

const SESSION_COOKIE = "simplecrm_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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
    // User doesn't exist or is deactivated → invalid session
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

// ─── Clear session cookie ────────────────────────────────────

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
