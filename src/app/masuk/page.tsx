"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Tidak bisa masuk.");
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
      <h1 className="mb-8 text-2xl font-bold">Masuk</h1>

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
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mb-5 w-full rounded border px-3 py-3 text-base"
      />

      {error ? <p className="mb-5 text-sm">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="min-h-11 w-full rounded border px-4 py-3 font-medium disabled:opacity-50"
      >
        {pending ? "Sedang masuk" : "Masuk"}
      </button>
    </main>
  );
}
