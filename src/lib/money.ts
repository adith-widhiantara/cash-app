/**
 * Money helpers.
 * Every amount is an integer in full rupiah: Rp 15.000 is 15000.
 * Float and Decimal are forbidden anywhere in this app.
 */

import { LOCALE, type TransactionType } from "@/lib/constants";

/** Spoken and written multipliers used in Indonesian amounts. */
export const AMOUNT_MULTIPLIERS: Record<string, number> = {
  rb: 1_000,
  ribu: 1_000,
  k: 1_000,
  jt: 1_000_000,
  juta: 1_000_000,
};

export function isValidAmount(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/** 15000 becomes "Rp 15.000". Negative input keeps its sign. */
export function formatRupiah(amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new Error(`Amount must be an integer in full rupiah: ${amount}`);
  }
  const digits = new Intl.NumberFormat(LOCALE).format(Math.abs(amount));
  return amount < 0 ? `-Rp ${digits}` : `Rp ${digits}`;
}

/**
 * Display form per DESIGN.md: income gets a plus, expense a minus,
 * transfer no sign at all.
 */
export function formatSignedRupiah(
  amount: number,
  type: TransactionType,
): string {
  const formatted = formatRupiah(Math.abs(amount));
  if (type === "income") return `+${formatted}`;
  if (type === "expense") return `−${formatted}`;
  return formatted;
}

const AMOUNT_PATTERN = /(\d+(?:\.\d{3})*)(?:,(\d+))?\s*(rb|ribu|k|jt|juta)?\b/;

/**
 * Reads the first amount out of free text and returns full rupiah.
 * "25rb" is 25000, "8,5jt" is 8500000, "Rp 45.000" is 45000.
 * Returns null when there is no usable amount.
 */
export function parseAmount(input: string): number | null {
  const text = input.toLowerCase().replace(/rp\.?/g, " ");
  const match = AMOUNT_PATTERN.exec(text);
  if (!match) return null;

  const whole = match[1].replace(/[.\s]/g, "");
  if (whole.length === 0) return null;

  const fraction = match[2] ?? "";
  const unit = match[3];
  const multiplier = unit ? AMOUNT_MULTIPLIERS[unit] : 1;

  const numeric =
    multiplier === 1
      ? Number(whole)
      : Number(`${whole}.${fraction || "0"}`) * multiplier;

  const amount = Math.round(numeric);
  return isValidAmount(amount) ? amount : null;
}

/** Balance is never stored. It is always recomputed from this. */
export function computeBalance(
  initialBalance: number,
  deltas: readonly number[],
): number {
  return deltas.reduce((total, delta) => total + delta, initialBalance);
}
