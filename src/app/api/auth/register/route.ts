import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { startSession } from "@/lib/auth";
import { readRegistration } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Two people, one household. Registration closes after the first user.
  const existing = await prisma.user.count();

  if (existing > 0) {
    return Response.json(
      { error: "Pendaftaran sudah ditutup. Minta akun dibuatkan." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Isian tidak terbaca." }, { status: 400 });
  }

  const parsed = readRegistration(body);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  // The seed already created the household and its 14 categories. Joining
  // it matters: a new household would leave those categories orphaned.
  const household = await prisma.household.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!household) {
    return Response.json(
      { error: "Household belum ada. Jalankan prisma db seed dulu." },
      { status: 500 },
    );
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.value.email,
      name: parsed.value.name,
      passwordHash: await hashPassword(parsed.value.password),
      role: "owner",
      householdId: household.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      householdId: true,
      tokenVersion: true,
    },
  });

  await startSession(user);

  return Response.json(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    { status: 201 },
  );
}
