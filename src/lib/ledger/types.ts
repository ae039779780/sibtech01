export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
export type Direction = "DEBIT" | "CREDIT";
export type HoldStatus = "OPEN" | "RELEASED" | "CAPTURED";

export type JournalType =
  | "PAYIN"
  | "PAYOUT"
  | "FX"
  | "EXCHANGE"
  | "CARD_SPEND"
  | "HOLD_CAPTURE"
  | "REVERSAL"
  | "ADJUSTMENT"
  | "SEED";

export type LedgerAccount = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  currency: string;
  ownerUserId?: string | null;
};

export type JournalLine = {
  id: string;
  entryId: string;
  accountId: string;
  direction: Direction;
  amountMinor: bigint;
  currency: string;
};

export type JournalEntry = {
  id: string;
  correlationId: string;
  type: JournalType;
  description: string;
  metadata: Record<string, unknown>;
  createdById?: string | null;
  reversesId?: string | null;
  createdAt: Date;
  lines: JournalLine[];
};

export type Hold = {
  id: string;
  accountId: string;
  amountMinor: bigint;
  currency: string;
  reason: string;
  status: HoldStatus;
  paymentId?: string | null;
  journalEntryId?: string | null;
  createdAt: Date;
};

export type ProposedLine = {
  accountCode: string;
  direction: Direction;
  amountMinor: bigint;
  currency: string;
};

export type NewEntry = {
  correlationId: string;
  type: JournalType;
  description: string;
  metadata?: Record<string, unknown>;
  createdById?: string | null;
  reversesId?: string | null;
  lines: ProposedLine[];
};

export type AccountBalance = {
  account: LedgerAccount;
  postedMinor: bigint;
  heldMinor: bigint;
  availableMinor: bigint;
};

export class LedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LedgerError";
  }
}

export function customerWalletCode(userId: string, currency: string): string {
  return `liability:customer:${userId}:${currency}`;
}

export function partnerNostroCode(partner: string, currency: string): string {
  return `asset:partner:${partner}:${currency}`;
}

export function safeguardingCode(currency: string): string {
  return `asset:safeguarding:${currency}`;
}

export function fxSpreadRevenueCode(currency: string): string {
  return `revenue:fx-spread:${currency}`;
}

export function houseFloatCode(currency: string): string {
  return `asset:house-float:${currency}`;
}

export function normalBalanceSign(type: AccountType, direction: Direction): bigint {
  const debitIncreases: AccountType[] = ["ASSET", "EXPENSE"];
  const debitPositive = debitIncreases.includes(type);
  if (direction === "DEBIT") {
    return debitPositive ? 1n : -1n;
  }
  return debitPositive ? -1n : 1n;
}
