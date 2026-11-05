import { prisma } from "@/lib/prisma";
import { getCurrentUser, startSession } from "@/lib/auth";
import {
  MIN_PASSWORD_LENGTH,
  hashPassword,
  verifyPassword,
} from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const current = await getCurrentUser();

  if (!current) {
    return Response.json({ error: "Belum masuk." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Isian tidak terbaca." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const currentPassword =
    typeof data.currentPassword === "string" ? data.currentPassword : "";
  const newPassword =
    typeof data.newPassword === "string" ? data.newPassword : "";

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return Response.json(
      { error: `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter.` },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: current.id },
    select: { id: true, householdId: true, passwordHash: true },
  });

  if (!user) {
    return Response.json({ error: "Belum masuk." }, { status: 401 });
  }

  const correct = await verifyPassword(currentPassword, user.passwordHash);

  if (!correct) {
    return Response.json({ error: "Password lama salah." }, { status: 401 });
  }

  // Raising tokenVersion revokes every existing session, then a fresh
  // cookie keeps THIS device signed in. Other devices are logged out.
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(newPassword),
      tokenVersion: { increment: 1 },
    },
    select: { id: true, householdId: true, tokenVersion: true },
  });

  await startSession(updated);

  return Response.json({ ok: true });
}
