import { describe, expect, it } from "vitest";
import {
  availableBalance,
  postedBalance,
  reversalLines,
  validateBalancedLines,
} from "./engine";
import { MemoryLedgerStore } from "./memory-store";
import { LedgerService } from "./service";
import { LedgerError, type ProposedLine } from "./types";

function cadLines(debit: string, credit: string, amount = 10_00n): ProposedLine[] {
  return [
    { accountCode: debit, direction: "DEBIT", amountMinor: amount, currency: "CAD" },
    { accountCode: credit, direction: "CREDIT", amountMinor: amount, currency: "CAD" },
  ];
}

async function seededLedger() {
  const store = new MemoryLedgerStore();
  const ledger = new LedgerService(store);
  await ledger.ensureAccount({
    code: "asset:partner:thunes:CAD",
    name: "Thunes CAD",
    type: "ASSET",
    currency: "CAD",
  });
  await ledger.ensureAccount({
    code: "liability:customer:u1:CAD",
    name: "Customer CAD",
    type: "LIABILITY",
    currency: "CAD",
    ownerUserId: "u1",
  });
  await ledger.ensureAccount({
    code: "revenue:fx-spread:CAD",
    name: "Spread CAD",
    type: "REVENUE",
    currency: "CAD",
  });
  return ledger;
}

describe("double-entry engine", () => {
  it("rejects unbalanced journals", () => {
    expect(() =>
      validateBalancedLines([
        { accountCode: "a", direction: "DEBIT", amountMinor: 100n, currency: "CAD" },
        { accountCode: "b", direction: "CREDIT", amountMinor: 90n, currency: "CAD" },
      ]),
    ).toThrow(LedgerError);
  });

  it("allows multi-currency entries that balance per currency", () => {
    expect(() =>
      validateBalancedLines([
        { accountCode: "a", direction: "DEBIT", amountMinor: 100n, currency: "CAD" },
        { accountCode: "b", direction: "CREDIT", amountMinor: 100n, currency: "CAD" },
        { accountCode: "c", direction: "DEBIT", amountMinor: 70n, currency: "USD" },
        { accountCode: "d", direction: "CREDIT", amountMinor: 70n, currency: "USD" },
      ]),
    ).not.toThrow();
  });

  it("computes liability posted balances from credits", () => {
    const posted = postedBalance("LIABILITY", [
      { direction: "CREDIT", amountMinor: 500n },
      { direction: "DEBIT", amountMinor: 120n },
    ]);
    expect(posted).toBe(380n);
  });

  it("subtracts holds from available balance", () => {
    expect(availableBalance(1000n, 250n)).toBe(750n);
  });

  it("builds compensating reversal lines", () => {
    const reversed = reversalLines([
      { accountId: "1", direction: "DEBIT", amountMinor: 50n, currency: "CAD" },
    ]);
    expect(reversed[0]?.direction).toBe("CREDIT");
  });
});

describe("LedgerService", () => {
  it("posts a pay-in and credits the customer wallet", async () => {
    const ledger = await seededLedger();
    await ledger.post({
      correlationId: "payin-1",
      type: "PAYIN",
      description: "Inbound CAD",
      lines: cadLines("asset:partner:thunes:CAD", "liability:customer:u1:CAD", 12_450_00n),
    });
    const wallet = await ledger.balance("liability:customer:u1:CAD");
    expect(wallet.postedMinor).toBe(12_450_00n);
    expect(wallet.availableMinor).toBe(12_450_00n);
  });

  it("holds funds then captures a payout", async () => {
    const ledger = await seededLedger();
    await ledger.post({
      correlationId: "seed",
      type: "SEED",
      description: "seed",
      lines: cadLines("asset:partner:thunes:CAD", "liability:customer:u1:CAD", 5_000_00n),
    });
    const hold = await ledger.placeHold({
      accountCode: "liability:customer:u1:CAD",
      amountMinor: 1_200_00n,
      reason: "SWIFT payout",
    });
    const afterHold = await ledger.balance("liability:customer:u1:CAD");
    expect(afterHold.availableMinor).toBe(3_800_00n);
    expect(afterHold.heldMinor).toBe(1_200_00n);

    await ledger.captureHold(hold.id, {
      correlationId: "payout-1",
      type: "PAYOUT",
      description: "SWIFT",
      lines: cadLines("liability:customer:u1:CAD", "asset:partner:thunes:CAD", 1_200_00n),
    });
    const after = await ledger.balance("liability:customer:u1:CAD");
    expect(after.postedMinor).toBe(3_800_00n);
    expect(after.heldMinor).toBe(0n);
  });

  it("releases a hold without mutating history", async () => {
    const ledger = await seededLedger();
    await ledger.post({
      correlationId: "seed",
      type: "SEED",
      description: "seed",
      lines: cadLines("asset:partner:thunes:CAD", "liability:customer:u1:CAD", 800_00n),
    });
    const hold = await ledger.placeHold({
      accountCode: "liability:customer:u1:CAD",
      amountMinor: 200_00n,
      reason: "review",
    });
    await ledger.releaseHold(hold.id);
    const after = await ledger.balance("liability:customer:u1:CAD");
    expect(after.availableMinor).toBe(800_00n);
    expect(after.postedMinor).toBe(800_00n);
  });

  it("reverses with a compensating entry instead of editing the original", async () => {
    const ledger = await seededLedger();
    const original = await ledger.post({
      correlationId: "adj",
      type: "ADJUSTMENT",
      description: "ops",
      lines: cadLines("asset:partner:thunes:CAD", "liability:customer:u1:CAD", 50_00n),
    });
    const reversal = await ledger.reverse(original.id, "exam correction");
    expect(reversal.reversesId).toBe(original.id);
    expect(reversal.type).toBe("REVERSAL");
    const wallet = await ledger.balance("liability:customer:u1:CAD");
    expect(wallet.postedMinor).toBe(0n);
    const stillThere = await ledger.balance("asset:partner:thunes:CAD");
    expect(stillThere.account.code).toBe("asset:partner:thunes:CAD");
  });

  it("refuses a hold larger than available funds", async () => {
    const ledger = await seededLedger();
    await expect(
      ledger.placeHold({
        accountCode: "liability:customer:u1:CAD",
        amountMinor: 1n,
        reason: "none",
      }),
    ).rejects.toBeInstanceOf(LedgerError);
  });
});
