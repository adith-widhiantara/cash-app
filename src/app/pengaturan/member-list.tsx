"use client";

import { useState } from "react";

type Member = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function MemberList({
  members,
  currentUserId,
  isOwner,
}: {
  members: Member[];
  currentUserId: string;
  isOwner: boolean;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  async function handleReset(id: string) {
    setPending(id);
    try {
      const response = await fetch(`/api/users/${id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate: true }),
      });
      const data = await response.json();
      if (response.ok) {
        setRevealed((prev) => ({ ...prev, [id]: data.tempPassword }));
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <ul className="space-y-3">
      {members.map((member) => (
        <li key={member.id} className="rounded border p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-medium">{member.name}</span>
              {member.role === "owner" ? (
                <span className="ml-2 text-xs">pemilik</span>
              ) : null}
              <div className="text-sm">{member.email}</div>
            </div>
            {isOwner && member.id !== currentUserId ? (
              <button
                type="button"
                onClick={() => handleReset(member.id)}
                disabled={pending === member.id}
                className="shrink-0 text-sm underline disabled:opacity-50"
              >
                {pending === member.id ? "Mereset" : "Reset password"}
              </button>
            ) : null}
          </div>
          {revealed[member.id] ? (
            <div className="mt-3 rounded border p-2">
              <div className="mb-1 text-xs font-medium">
                Password baru untuk dibagikan:
              </div>
              <div className="font-mono text-sm">{revealed[member.id]}</div>
              <div className="mt-1 text-xs">
                Catat sekarang — tidak akan ditampilkan lagi.
              </div>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
