import { MIN_PASSWORD_LENGTH } from "@/lib/password";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Credentials = {
  email: string;
  password: string;
};

export type Registration = Credentials & {
  name: string;
};

/** Messages are Indonesian because they are shown to the user. */
export function readCredentials(
  body: unknown,
): { ok: true; value: Credentials } | { ok: false; error: string } {
  const data = (body ?? {}) as Record<string, unknown>;

  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Alamat email tidak valid." };
  }

  if (password.length === 0) {
    return { ok: false, error: "Password belum diisi." };
  }

  return { ok: true, value: { email, password } };
}

export function readRegistration(
  body: unknown,
): { ok: true; value: Registration } | { ok: false; error: string } {
  const base = readCredentials(body);
  if (!base.ok) return base;

  const data = (body ?? {}) as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";

  if (name.length === 0) {
    return { ok: false, error: "Nama belum diisi." };
  }

  if (base.value.password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    };
  }

  return { ok: true, value: { ...base.value, name } };
}

export type NewMember = {
  email: string;
  name: string;
};

/** Used by the owner to create a member account. No password: the route generates one. */
export function readNewMember(
  body: unknown,
): { ok: true; value: NewMember } | { ok: false; error: string } {
  const data = (body ?? {}) as Record<string, unknown>;

  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const name = typeof data.name === "string" ? data.name.trim() : "";

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Alamat email tidak valid." };
  }

  if (name.length === 0) {
    return { ok: false, error: "Nama belum diisi." };
  }

  return { ok: true, value: { email, name } };
}
