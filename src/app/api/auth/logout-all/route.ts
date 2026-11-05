import { prisma } from "@/lib/prisma";
import { getCurrentUser, endSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// For a lost phone: revoke every session for this user, including this one.
export async function POST() {
  const current = await getCurrentUser();

  if (!current) {
    return Response.json({ error: "Belum masuk." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: current.id },
    data: { tokenVersion: { increment: 1 } },
  });

  await endSession();

  return Response.json({ ok: true });
}
