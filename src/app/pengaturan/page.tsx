import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_HOUSEHOLD_USERS } from "@/lib/constants";

import { GantiPassword } from "./ganti-password";
import { MemberList } from "./member-list";
import { TambahAnggota } from "./tambah-anggota";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/masuk");
  }

  const members = await prisma.user.findMany({
    where: { householdId: user.householdId },
    select: { id: true, email: true, name: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  const isOwner = user.role === "owner";
  const canAddMember = isOwner && members.length < MAX_HOUSEHOLD_USERS;

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <a href="/" className="mb-6 block text-sm underline">
        Kembali
      </a>

      <h1 className="mb-8 text-2xl font-bold">Pengaturan</h1>

      <section className="mb-8">
        <h2 className="mb-4 font-medium">Anggota</h2>
        <MemberList
          members={members}
          currentUserId={user.id}
          isOwner={isOwner}
        />
      </section>

      {canAddMember ? (
        <section className="mb-8">
          <h2 className="mb-4 font-medium">Tambah anggota</h2>
          <TambahAnggota />
        </section>
      ) : null}

      <section className="mb-8">
        <h2 className="mb-4 font-medium">Ganti password</h2>
        <GantiPassword />
      </section>
    </main>
  );
}
