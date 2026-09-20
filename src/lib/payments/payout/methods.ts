export const PAYOUT_METHODS = [
  {
    id: "BANK" as const,
    slug: "bank",
    label: "Bank",
    hint: "Account number or IBAN. SWIFT sits under Bank — not a separate picker row.",
  },
  {
    id: "PUSH2CARD" as const,
    slug: "push2card",
    label: "Push2card",
    hint: "Debit card destination via a partner token. PAN never enters Sibtech. Thunes stub by default.",
    preferredPartner: "thunes" as const,
  },
  {
    id: "UPI" as const,
    slug: "upi",
    label: "UPI",
    hint: "Pay a VPA / UPI ID. Confirm, then a DEMO receipt.",
  },
];

export type PayoutMethodId = (typeof PAYOUT_METHODS)[number]["id"];

export function listPayoutMethods() {
  return PAYOUT_METHODS;
}

export function payoutMethodBySlug(slug: string) {
  return PAYOUT_METHODS.find((m) => m.slug === slug) ?? null;
}

export function parsePayoutMethod(value: unknown): PayoutMethodId {
  const raw = String(value ?? "");
  if (raw === "SWIFT" || raw === "LOCAL") return "BANK";
  const found = PAYOUT_METHODS.find((m) => m.id === raw);
  if (!found) {
    throw new Error("Payout method must be Bank, Push2card, or UPI");
  }
  return found.id;
}

export function payoutMethodLabel(method: string): string {
  switch (method) {
    case "BANK":
    case "SWIFT":
    case "LOCAL":
      return "Bank";
    case "PUSH2CARD":
      return "Push2card";
    case "UPI":
      return "UPI";
    default:
      return method;
  }
}

export function destinationSummary(input: {
  method: string;
  name?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  cardLast4?: string | null;
  upiVpa?: string | null;
}): string {
  if (input.method === "PUSH2CARD") {
    return `${input.name ?? "Debit card"} · •••• ${input.cardLast4 ?? "••••"}`;
  }
  if (input.method === "UPI") {
    return `${input.name ?? "UPI"} · ${input.upiVpa ?? ""}`;
  }
  return `${input.name ?? "Bank"} · ${input.iban ?? input.accountNumber ?? ""}`;
}
