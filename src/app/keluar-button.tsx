"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function KeluarButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/masuk");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="min-h-11 rounded border px-4 py-3 font-medium disabled:opacity-50"
    >
      {pending ? "Sedang keluar" : "Keluar"}
    </button>
  );
}
