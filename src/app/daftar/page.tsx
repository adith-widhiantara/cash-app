"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DaftarPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Tidak bisa mendaftar.");
        setPending(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server.");
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="mb-2 text-2xl font-bold">Buat akun pertama</h1>
      <p className="mb-8 text-sm">
        Akun kedua dibuat dari halaman pengaturan setelah ini.
      </p>

      <label className="mb-2 block text-sm font-medium" htmlFor="name">
        Nama
      </label>
      <input
        id="name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="mb-5 w-full rounded border px-3 py-3 text-base"
      />

      <label className="mb-2 block text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mb-5 w-full rounded border px-3 py-3 text-base"
      />

      <label className="mb-2 block text-sm font-medium" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mb-2 w-full rounded border px-3 py-3 text-base"
      />
      <p className="mb-5 text-sm">Minimal 8 karakter.</p>

      {error ? <p className="mb-5 text-sm">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="min-h-11 w-full rounded border px-4 py-3 font-medium disabled:opacity-50"
      >
        {pending ? "Sedang membuat" : "Buat akun"}
      </button>
    </main>
  );
}
