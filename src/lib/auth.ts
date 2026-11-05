import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/session";

// This file touches the database, so it is server only. Middleware must
// import from session.ts instead.

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  householdId: string;
};

export async function startSession(user: {
  id: string;
  householdId: string;
  tokenVersion: number;
}): Promise<void> {
  const token = await createSessionToken({
    userId: user.id,
    householdId: user.householdId,
    tokenVersion: user.tokenVersion,
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Development is plain http on localhost. Production is served over
    // https by Tailscale Serve.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Null whenever the session is missing, invalid, or has been revoked. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      householdId: true,
      tokenVersion: true,
    },
  });

  if (!user) return null;

  // A raised tokenVersion means every older token is revoked.
  if (user.tokenVersion !== payload.tokenVersion) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    householdId: user.householdId,
  };
}
