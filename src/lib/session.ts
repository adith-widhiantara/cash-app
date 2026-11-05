import { SignJWT, jwtVerify } from "jose";

// No Prisma import here on purpose: this file also runs in Next.js
// middleware, which uses the edge runtime and cannot reach the database.

export const SESSION_COOKIE = "catatan_session";

// Browsers cap cookie lifetime at roughly 400 days, so "stays logged in"
// means one year, then a fresh login.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type SessionPayload = {
  userId: string;
  householdId: string;
  tokenVersion: number;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or shorter than 32 characters. It is set in .env and passed through compose.yaml.",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    hid: payload.householdId,
    tv: payload.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_MAX_AGE_SECONDS)
    .sign(getSecret());
}

/** Returns null for anything invalid: bad signature, expired, malformed. */
export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    const userId = payload.sub;
    const householdId = payload.hid;
    const tokenVersion = payload.tv;

    if (
      typeof userId !== "string" ||
      typeof householdId !== "string" ||
      typeof tokenVersion !== "number"
    ) {
      return null;
    }

    return { userId, householdId, tokenVersion };
  } catch {
    return null;
  }
}
