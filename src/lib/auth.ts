import * as jose from "jose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

// ─── Password hashing ───────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT ─────────────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  name?: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "dev-secret-placeholder-32-chars-long-minimum";
  if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET environment variable is not set, using fallback");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret());
    return payload as unknown as TokenPayload;
  } catch (err) {
    console.error("JWT Verification failed:", err);
    return null;
  }
}
