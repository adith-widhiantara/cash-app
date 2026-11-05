import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { startSession } from "@/lib/auth";
import { readCredentials } from "@/lib/validation";

export const dynamic = "force-dynamic";

// Verifying against a throwaway hash when the email is unknown keeps the
// response time the same, so the endpoint does not reveal which emails
// exist.
const decoyHash = hashPassword(
  `decoy-${Math.random().toString(36).slice(2)}`,
);

const GENERIC_ERROR = "Email atau password salah.";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Isian tidak terbaca." }, { status: 400 });
  }

  const parsed = readCredentials(body);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.value.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      householdId: true,
      tokenVersion: true,
      passwordHash: true,
    },
  });

  if (!user) {
    await verifyPassword(parsed.value.password, await decoyHash);
    return Response.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const correct = await verifyPassword(parsed.value.password, user.passwordHash);

  if (!correct) {
    return Response.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  await startSession(user);

  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
