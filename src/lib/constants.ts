/**
 * Shared constants. Single source of truth for values used across the app.
 * UI strings are Indonesian. Identifiers and comments are English.
 */

export const APP_NAME = "Catatan Keluarga";
export const TIMEZONE = "Asia/Jakarta";
export const LOCALE = "id-ID";

export const EXPENSE_CATEGORIES = [
  "Makanan",
  "Belanja Harian",
  "Transportasi",
  "Tagihan",
  "Kesehatan",
  "Anak",
  "Rumah",
  "Hiburan",
  "Transfer Keluarga",
  "Lain-lain",
] as const;

export const INCOME_CATEGORIES = [
  "Gaji",
  "Bonus/THR",
  "Usaha",
  "Lain-lain",
] as const;

export const ACCOUNT_TYPES = ["cash", "bank", "ewallet", "other"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_SOURCES = [
  "manual",
  "voice",
  "photo",
  "sms",
  "email",
  "notification",
  "recurring",
] as const;
export type TransactionSource = (typeof TRANSACTION_SOURCES)[number];

export const INBOX_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "missed",
] as const;
export type InboxStatus = (typeof INBOX_STATUSES)[number];

/** Two people, one household. Raise this if that ever changes. */
export const MAX_HOUSEHOLD_USERS = 2;

/** The wallet account. Created automatically at setup, never optional. */
export const CASH_ACCOUNT_NAME = "Cash";

/** Backdating further than this asks for a soft confirmation, never a block. */
export const BACKDATE_CONFIRM_DAYS = 60;

/** Same amount + same account inside this window is a suspected duplicate. */
export const DUPLICATE_WINDOW_MINUTES = 10;

/** Undo window after an approval, Gmail style. */
export const UNDO_WINDOW_SECONDS = 10;

/** A recurring income not approved within this many days becomes "missed". */
export const RECURRING_MISSED_AFTER_DAYS = 7;

/** Below this confidence an item goes to the Inbox instead of auto-commit. */
export const AUTO_COMMIT_CONFIDENCE = 0.85;

/** Text matching any of these means a transfer to Cash, not an expense. */
export const CASH_WITHDRAWAL_KEYWORDS = [
  "tarik tunai",
  "penarikan",
  "atm",
] as const;
