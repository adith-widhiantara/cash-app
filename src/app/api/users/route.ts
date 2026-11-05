import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword, generateTempPassword } from "@/lib/password";
import { readNewMember } from "@/lib/validation";
import { MAX_HOUSEHOLD_USERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = await getCurrentUser();

  if (!current) {
    return Response.json({ error: "Belum masuk." }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { householdId: current.householdId },
    select: { id: true, email: true, name: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ users });
}

export async function POST(request: Request) {
  const current = await getCurrentUser();

  if (!current) {
    return Response.json({ error: "Belum masuk." }, { status: 401 });
  }

  if (current.role !== "owner") {
    return Response.json(
      { error: "Hanya pemilik yang bisa menambah akun." },
      { status: 403 },
    );
  }

  const count = await prisma.user.count({
    where: { householdId: current.householdId },
  });

  if (count >= MAX_HOUSEHOLD_USERS) {
    return Response.json(
      { error: "Sudah ada dua akun di rumah tangga ini." },
      { status: 409 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Isian tidak terbaca." }, { status: 400 });
  }

  const parsed = readNewMember(body);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const taken = await prisma.user.findUnique({
    where: { email: parsed.value.email },
    select: { id: true },
  });

  if (taken) {
    return Response.json(
      { error: "Email itu sudah dipakai." },
      { status: 409 },
    );
  }

  const tempPassword = generateTempPassword();

  const user = await prisma.user.create({
    data: {
      email: parsed.value.email,
      name: parsed.value.name,
      passwordHash: await hashPassword(tempPassword),
      role: "member",
      householdId: current.householdId,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return Response.json({ ...user, tempPassword }, { status: 201 });
}
