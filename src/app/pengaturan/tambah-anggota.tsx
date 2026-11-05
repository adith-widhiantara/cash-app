"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatedMember = {
  name: string;
  email: string;
  tempPassword: string;
};

export function TambahAnggota() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState<CreatedMember | null>(null);

  async function handleSubmit() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Tidak bisa membuat akun.");
        return;
      }

      setCreated({
        name: data.name,
        email: data.email,
        tempPassword: data.tempPassword,
      });
      setName("");
      setEmail("");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server.");
    } finally {
      setPending(false);
    }
  }

  if (created) {
    return (
      <div className="rounded border p-4">
        <div className="mb-3 font-medium">
          Akun untuk {created.name} berhasil dibuat.
        </div>
        <div className="mb-1 text-sm">Password untuk dibagikan:</div>
        <div className="mb-2 font-mono text-sm">{created.tempPassword}</div>
        <div className="mb-4 text-xs">
          Catat sekarang — tidak akan ditampilkan lagi.
        </div>
        <button
          type="button"
          onClick={() => setCreated(null)}
          className="text-sm underline"
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium" htmlFor="tambah-nama">
        Nama
      </label>
      <input
        id="tambah-nama"
        type="text"
        autoComplete="off"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="mb-4 w-full rounded border px-3 py-3 text-base"
      />

      <label
        className="mb-2 block text-sm font-medium"
        htmlFor="tambah-email"
      >
        Email
      </label>
      <input
        id="tambah-email"
        type="email"
        inputMode="email"
        autoComplete="off"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mb-4 w-full rounded border px-3 py-3 text-base"
      />

      {error ? <p className="mb-4 text-sm">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="min-h-11 w-full rounded border px-4 py-3 font-medium disabled:opacity-50"
      >
        {pending ? "Membuat akun" : "Buat akun"}
      </button>
    </div>
  );
}
