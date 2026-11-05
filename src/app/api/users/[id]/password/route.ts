import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH, hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

// There is no email in this app, so a member who forgets their password
// cannot recover it alone. The owner sets a new one.
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
  const newPassword =
    typeof data.newPassword === "string" ? data.newPassword : "";

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return Response.json(
      { error: `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter.` },
      { status: 400 },
    );
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

  return Response.json({ ok: true });
}
