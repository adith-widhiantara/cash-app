import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import { KeluarButton } from "./keluar-button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Middleware checks the signature. This also checks tokenVersion, which
  // needs the database and so cannot run in middleware.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/masuk");
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold">Catatan Keluarga</h1>
      <p className="mb-8 text-sm">
        Masuk sebagai {user.name} ({user.email}).
      </p>

      <a href="/pengaturan" className="mb-4 block text-sm underline">
        Pengaturan
      </a>

      <KeluarButton />
    </main>
  );
}
