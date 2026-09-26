import { LedgerError, type JournalLine, type ProposedLine } from "./types";

export function validateBalancedLines(lines: ProposedLine[]): void {
  if (lines.length < 2) {
    throw new LedgerError("A journal entry requires at least two lines");
  }
  for (const line of lines) {
    if (line.amountMinor <= 0n) {
      throw new LedgerError("Line amounts must be positive minor units");
    }
    if (!line.accountCode || !line.currency) {
      throw new LedgerError("Each line needs an account code and currency");
    }
  }

  const byCurrency = new Map<string, { debit: bigint; credit: bigint }>();
  for (const line of lines) {
    const bucket = byCurrency.get(line.currency) ?? { debit: 0n, credit: 0n };
    if (line.direction === "DEBIT") {
      bucket.debit += line.amountMinor;
    } else {
      bucket.credit += line.amountMinor;
    }
    byCurrency.set(line.currency, bucket);
  }

  for (const [currency, { debit, credit }] of byCurrency) {
    if (debit !== credit) {
      throw new LedgerError(
        `Unbalanced ${currency} entry: debit ${debit} != credit ${credit}`,
      );
    }
  }
}

export function postedBalance(
  accountType: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE",
  lines: Pick<JournalLine, "direction" | "amountMinor">[],
): bigint {
  const debitIncreases = accountType === "ASSET" || accountType === "EXPENSE";
  return lines.reduce((acc, line) => {
    const signed =
      line.direction === "DEBIT"
        ? debitIncreases
          ? line.amountMinor
          : -line.amountMinor
        : debitIncreases
          ? -line.amountMinor
          : line.amountMinor;
    return acc + signed;
  }, 0n);
}

export function availableBalance(postedMinor: bigint, heldMinor: bigint): bigint {
  if (heldMinor < 0n) {
    throw new LedgerError("Held amount cannot be negative");
  }
  return postedMinor - heldMinor;
}

export function reversalLines(
  lines: Pick<JournalLine, "accountId" | "direction" | "amountMinor" | "currency">[],
): Array<{
  accountId: string;
  direction: "DEBIT" | "CREDIT";
  amountMinor: bigint;
  currency: string;
}> {
  return lines.map((line) => ({
    accountId: line.accountId,
    direction: line.direction === "DEBIT" ? "CREDIT" : "DEBIT",
    amountMinor: line.amountMinor,
    currency: line.currency,
  }));
}

export function assertSufficientAvailable(
  availableMinor: bigint,
  requiredMinor: bigint,
  currency: string,
): void {
  if (requiredMinor <= 0n) {
    throw new LedgerError("Required amount must be positive");
  }
  if (availableMinor < requiredMinor) {
    throw new LedgerError(
      `Insufficient available ${currency}: need ${requiredMinor}, have ${availableMinor}`,
    );
  }
}
