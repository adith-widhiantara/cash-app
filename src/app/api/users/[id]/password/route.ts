import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  MIN_PASSWORD_LENGTH,
  hashPassword,
  generateTempPassword,
} from "@/lib/password";

export const dynamic = "force-dynamic";

// The owner resets a member's password. If body.generate is true, a secure
// temp password is generated and returned in the response. Otherwise
// body.newPassword is used.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const current = await getCurrentUser();

  if (!current) {
    return Response.json({ error: "Belum masuk." }, { status: 401 });
  }

  if (current.role !== "owner") {
    return Response.json(
      { error: "Hanya pemilik yang bisa mengatur ulang password." },
      { status: 403 },
    );
  }

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Isian tidak terbaca." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;

  let newPassword: string;

  if (data.generate === true) {
    newPassword = generateTempPassword();
  } else {
    newPassword =
      typeof data.newPassword === "string" ? data.newPassword : "";
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return Response.json(
        { error: `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter.` },
        { status: 400 },
      );
    }
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, householdId: true },
  });

  if (!target || target.householdId !== current.householdId) {
    return Response.json({ error: "Akun tidak ditemukan." }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: target.id },
    data: {
      passwordHash: await hashPassword(newPassword),
      tokenVersion: { increment: 1 },
    },
  });

  return Response.json({ ok: true, tempPassword: newPassword });
}
