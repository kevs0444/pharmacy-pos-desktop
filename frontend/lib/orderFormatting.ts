export const DEFAULT_ORDER_UNIT = "EACH";

export function toOrderUpper(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).toUpperCase();
}

export function toTrimmedOrderUpper(value: unknown): string {
  return toOrderUpper(value).trim();
}

export function formatFiveDigitStockNo(value: unknown, fallback?: unknown): string {
  const rawDigits = value === null || value === undefined ? "" : String(value).replace(/\D/g, "");
  const fallbackDigits =
    fallback === null || fallback === undefined ? "" : String(fallback).replace(/\D/g, "");
  const digits = rawDigits || fallbackDigits;

  if (!digits) return "";

  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) return "";

  return String(parsed).padStart(5, "0").slice(-5);
}
