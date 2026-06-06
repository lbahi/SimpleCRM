import * as jose from "jose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const TOKEN_TTL = "1d";
const TOKEN_ISSUER = "simplecrm";
const TOKEN_AUDIENCE = "simplecrm-app";

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
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET environment variable is missing or shorter than 32 characters"
    );
  }
  if (secret === "change-me-to-a-random-string-at-least-32-chars-long-minimum") {
    throw new Error("JWT_SECRET is still set to the placeholder value");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret(), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
