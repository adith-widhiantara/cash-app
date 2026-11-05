"use client";

import { useState } from "react";

export function GantiPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Tidak bisa mengganti password.");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("Tidak bisa menghubungi server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium"
        htmlFor="password-lama"
      >
        Password lama
      </label>
      <input
        id="password-lama"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        className="mb-4 w-full rounded border px-3 py-3 text-base"
      />

      <label
        className="mb-2 block text-sm font-medium"
        htmlFor="password-baru"
      >
        Password baru
      </label>
      <input
        id="password-baru"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        className="mb-2 w-full rounded border px-3 py-3 text-base"
      />
      <p className="mb-4 text-sm">Minimal 8 karakter.</p>

      {error ? <p className="mb-4 text-sm">{error}</p> : null}
      {success ? (
        <p className="mb-4 text-sm">Password berhasil diganti.</p>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="min-h-11 w-full rounded border px-4 py-3 font-medium disabled:opacity-50"
      >
        {pending ? "Menyimpan" : "Ganti password"}
      </button>
    </div>
  );
}
