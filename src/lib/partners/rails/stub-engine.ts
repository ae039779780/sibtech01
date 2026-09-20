import type {
  Corridor,
  PayinInstruction,
  PayinRequest,
  PayinMethod,
  PayoutMethod,
  PayoutRequest,
  PayoutSubmission,
  RailsProviderId,
  TransferStatus,
} from "./types";
import { RailsPartnerError } from "./types";
import { assertNotPan, isPartnerCardToken } from "@/lib/payments/payout/guard";

const transfers = new Map<string, TransferStatus>();

/** Pay-in corridors only. Payout picker is Bank / Push2card / UPI. */
export const SHARED_CORRIDORS: Corridor[] = [
  { id: "ca-local-cad", sourceCurrency: "CAD", targetCurrency: "CAD", country: "CA", kind: "LOCAL", estimatedMinutes: 30, minMinor: 100n, maxMinor: 250_000_00n },
  { id: "us-local-usd", sourceCurrency: "USD", targetCurrency: "USD", country: "US", kind: "LOCAL", estimatedMinutes: 60, minMinor: 100n, maxMinor: 250_000_00n },
  { id: "eu-local-eur", sourceCurrency: "EUR", targetCurrency: "EUR", country: "DE", kind: "LOCAL", estimatedMinutes: 15, minMinor: 100n, maxMinor: 150_000_00n },
  { id: "gb-local-gbp", sourceCurrency: "GBP", targetCurrency: "GBP", country: "GB", kind: "LOCAL", estimatedMinutes: 10, minMinor: 100n, maxMinor: 100_000_00n },
  { id: "swift-cad", sourceCurrency: "CAD", targetCurrency: "CAD", country: "CA", kind: "SWIFT", estimatedMinutes: 24 * 60, minMinor: 1_000n, maxMinor: 2_000_000_00n },
  { id: "swift-usd", sourceCurrency: "USD", targetCurrency: "USD", country: "US", kind: "SWIFT", estimatedMinutes: 24 * 60, minMinor: 1_000n, maxMinor: 2_000_000_00n },
  { id: "swift-eur", sourceCurrency: "EUR", targetCurrency: "EUR", country: "LU", kind: "SWIFT", estimatedMinutes: 24 * 60, minMinor: 1_000n, maxMinor: 2_000_000_00n },
  { id: "crypto-usdt", sourceCurrency: "USDT", targetCurrency: "USDT", country: "XX", kind: "CRYPTO", estimatedMinutes: 20, minMinor: 1_000_000n, maxMinor: 250_000_000_000n },
  { id: "crypto-btc", sourceCurrency: "BTC", targetCurrency: "BTC", country: "XX", kind: "CRYPTO", estimatedMinutes: 40, minMinor: 10_000n, maxMinor: 5_0000_0000n },
];

/** Visible payout corridors — Bank (incl. SWIFT-like), Push2card, UPI. */
export const PAYOUT_CORRIDORS: Corridor[] = [
  { id: "bank-cad", sourceCurrency: "CAD", targetCurrency: "CAD", country: "CA", kind: "BANK", estimatedMinutes: 30, minMinor: 100n, maxMinor: 250_000_00n },
  { id: "bank-usd", sourceCurrency: "USD", targetCurrency: "USD", country: "US", kind: "BANK", estimatedMinutes: 60, minMinor: 100n, maxMinor: 250_000_00n },
  { id: "bank-eur", sourceCurrency: "EUR", targetCurrency: "EUR", country: "DE", kind: "BANK", estimatedMinutes: 24 * 60, minMinor: 1_000n, maxMinor: 2_000_000_00n },
  { id: "bank-gbp", sourceCurrency: "GBP", targetCurrency: "GBP", country: "GB", kind: "BANK", estimatedMinutes: 10, minMinor: 100n, maxMinor: 100_000_00n },
  { id: "push2card-cad", sourceCurrency: "CAD", targetCurrency: "CAD", country: "CA", kind: "PUSH2CARD", estimatedMinutes: 5, minMinor: 100n, maxMinor: 10_000_00n },
  { id: "push2card-usd", sourceCurrency: "USD", targetCurrency: "USD", country: "US", kind: "PUSH2CARD", estimatedMinutes: 5, minMinor: 100n, maxMinor: 10_000_00n },
  { id: "upi-in", sourceCurrency: "CAD", targetCurrency: "INR", country: "IN", kind: "UPI", estimatedMinutes: 2, minMinor: 100n, maxMinor: 100_000_00n },
];

function ref(prefix: string): string {
  const n = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${n}`;
}

export function pickPayinCorridor(method: PayinMethod, currency: string, country?: string): Corridor {
  const match = SHARED_CORRIDORS.find((c) => {
    if (c.kind !== method) return false;
    if (method === "SWIFT") {
      return c.sourceCurrency === currency || c.targetCurrency === currency;
    }
    return c.sourceCurrency === currency && (!country || c.country === country || c.country === "XX");
  });
  if (!match) {
    throw new RailsPartnerError(`No ${method} pay-in corridor for ${currency}`);
  }
  return match;
}

export function pickPayoutCorridor(method: PayoutMethod, currency: string): Corridor {
  if (method === "UPI") {
    return PAYOUT_CORRIDORS.find((c) => c.kind === "UPI")!;
  }
  const match =
    PAYOUT_CORRIDORS.find((c) => c.kind === method && c.sourceCurrency === currency) ??
    PAYOUT_CORRIDORS.find((c) => c.kind === method);
  if (!match) {
    throw new RailsPartnerError(`No ${method} payout corridor for ${currency}`);
  }
  return match;
}

/** @deprecated pay-in uses pickPayinCorridor; payout uses pickPayoutCorridor */
export function pickCorridor(method: PayinMethod, currency: string, country?: string): Corridor {
  return pickPayinCorridor(method, currency, country);
}

export function remember(status: TransferStatus) {
  transfers.set(status.partnerRef, status);
}

export function recall(partnerRef: string): TransferStatus {
  const found = transfers.get(partnerRef);
  if (!found) {
    throw new RailsPartnerError(`Unknown partner reference ${partnerRef}`);
  }
  return found;
}

export function buildPayin(
  partner: RailsProviderId,
  prefix: string,
  bankName: string,
  request: PayinRequest,
): PayinInstruction {
  const corridor = pickPayinCorridor(request.method, request.currency, request.country);
  const partnerRef = ref(prefix);
  const reference = `SIB-${request.userId.slice(-6).toUpperCase()}-${partnerRef.slice(-6)}`;
  remember({
    partnerRef,
    status: "AWAITING_FUNDS",
    raw: { direction: "PAYIN", idempotencyKey: request.idempotencyKey },
  });

  const crypto = request.method === "CRYPTO";
  return {
    partner,
    partnerRef,
    status: "AWAITING_FUNDS",
    method: request.method,
    currency: request.currency,
    amountMinor: request.amountMinor,
    corridor: corridor.id,
    instructions: {
      bankName,
      accountName: "Sibtech Client Money / Partner Omnibus",
      accountNumber: crypto ? undefined : partner === "thunes" ? "1007482910" : "8829100441",
      iban: crypto ? undefined : request.currency === "EUR" ? "LU12 0010 0748 2910 0000" : undefined,
      swiftBic: request.method === "SWIFT" ? (partner === "thunes" ? "THUNLULL" : "TRPYUS33") : undefined,
      reference,
      memo: `Quote this reference so Sibtech can reconcile under its Canadian license.`,
      cryptoAddress: crypto
        ? partner === "thunes"
          ? "TXY9sibtechdemo1111111111111111111"
          : "0x51b7ec0deC0deC0deSIBTECH00000001"
        : undefined,
      cryptoNetwork: crypto ? (request.currency === "BTC" ? "bitcoin" : "tron-or-ethereum") : undefined,
    },
  };
}

export function buildPayout(
  partner: RailsProviderId,
  prefix: string,
  request: PayoutRequest,
): PayoutSubmission {
  if (request.amountMinor <= 0n) {
    throw new RailsPartnerError("Payout amount must be positive");
  }
  if (request.method === "BANK" && !request.accountNumber && !request.iban) {
    throw new RailsPartnerError("Bank payouts require an account number or IBAN");
  }
  if (request.method === "PUSH2CARD") {
    if (!request.cardToken) {
      throw new RailsPartnerError("Push2card requires a partner card token");
    }
    assertNotPan(request.cardToken);
    if (!isPartnerCardToken(request.cardToken)) {
      throw new RailsPartnerError("Push2card token must be issued by the vault iframe stub");
    }
  }
  if (request.method === "UPI" && !request.upiVpa) {
    throw new RailsPartnerError("UPI payouts require a VPA / UPI ID");
  }
  const corridor = pickPayoutCorridor(request.method, request.currency);
  const partnerRef = ref(prefix);
  remember({
    partnerRef,
    status: "PROCESSING",
    raw: {
      direction: "PAYOUT",
      beneficiary: request.beneficiaryName,
      method: request.method,
      cardLast4: request.cardLast4,
      upiVpa: request.upiVpa,
    },
  });
  return {
    partner,
    partnerRef,
    status: "ACCEPTED",
    method: request.method,
    corridor: corridor.id,
    estimatedMinutes: corridor.estimatedMinutes,
    message: `${partner} stub accepted ${request.method} payout on ${corridor.id}`,
  };
}
