import { getCurrency } from "./currencies";
import { fromMinor } from "./money";

export function displayAmount(minor: bigint | string, currency: string): string {
  const value = typeof minor === "string" ? BigInt(minor) : minor;
  const { decimals } = getCurrency(currency);
  const formatted = Number(fromMinor(value, decimals)).toLocaleString("en-CA", {
    minimumFractionDigits: Math.min(decimals, 2),
    maximumFractionDigits: Math.min(decimals, 8),
  });
  return `${formatted} ${currency}`;
}

export function displayDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function kycTone(status: string) {
  switch (status) {
    case "APPROVED":
      return "ok";
    case "IN_REVIEW":
    case "PENDING":
      return "warn";
    case "REJECTED":
      return "danger";
    default:
      return "muted";
  }
}
