export type PayinMethod = "LOCAL" | "SWIFT" | "CRYPTO";
export type PayoutMethod = "BANK" | "PUSH2CARD" | "UPI";
export type RailKind = PayinMethod | PayoutMethod;

export function isPayinMethod(value: string): value is PayinMethod {
  return value === "LOCAL" || value === "SWIFT" || value === "CRYPTO";
}

export function isPayoutMethod(value: string): value is PayoutMethod {
  return value === "BANK" || value === "PUSH2CARD" || value === "UPI";
}

export type RailsProviderId = "thunes" | "terrapay";

export type Corridor = {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  country: string;
  kind: RailKind;
  estimatedMinutes: number;
  minMinor: bigint;
  maxMinor: bigint;
};

export type PayinRequest = {
  userId: string;
  amountMinor: bigint;
  currency: string;
  method: PayinMethod;
  country?: string;
  idempotencyKey: string;
};

export type PayinInstruction = {
  partner: RailsProviderId;
  partnerRef: string;
  status: "AWAITING_FUNDS";
  method: PayinMethod;
  currency: string;
  amountMinor: bigint;
  corridor: string;
  instructions: {
    bankName: string;
    accountName: string;
    accountNumber?: string;
    iban?: string;
    swiftBic?: string;
    reference: string;
    memo: string;
    cryptoAddress?: string;
    cryptoNetwork?: string;
  };
};

export type PayoutRequest = {
  userId: string;
  amountMinor: bigint;
  currency: string;
  method: PayoutMethod;
  country: string;
  beneficiaryName: string;
  accountNumber?: string;
  iban?: string;
  swiftBic?: string;
  bankName?: string;
  cardToken?: string;
  cardLast4?: string;
  upiVpa?: string;
  idempotencyKey: string;
};

export type PayoutSubmission = {
  partner: RailsProviderId;
  partnerRef: string;
  status: "ACCEPTED" | "REJECTED";
  method: PayoutMethod;
  corridor: string;
  estimatedMinutes: number;
  message: string;
};

export type TransferStatus = {
  partnerRef: string;
  status: "AWAITING_FUNDS" | "PROCESSING" | "SETTLED" | "FAILED";
  raw: Record<string, unknown>;
};

export interface RailsPartner {
  readonly id: RailsProviderId;
  readonly displayName: string;
  readonly settlementModel: string;
  listCorridors(): Promise<Corridor[]>;
  createPayin(request: PayinRequest): Promise<PayinInstruction>;
  createPayout(request: PayoutRequest): Promise<PayoutSubmission>;
  getTransfer(partnerRef: string): Promise<TransferStatus>;
}

export class RailsPartnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RailsPartnerError";
  }
}
