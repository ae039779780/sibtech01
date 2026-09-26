import {
  assertSufficientAvailable,
  availableBalance,
  postedBalance,
  reversalLines,
  validateBalancedLines,
} from "./engine";
import { newId, type LedgerStore } from "./store";
import {
  LedgerError,
  type AccountBalance,
  type Hold,
  type JournalEntry,
  type LedgerAccount,
  type NewEntry,
} from "./types";

export class LedgerService {
  constructor(private readonly store: LedgerStore) {}

  async ensureAccount(input: {
    code: string;
    name: string;
    type: LedgerAccount["type"];
    currency: string;
    ownerUserId?: string | null;
  }): Promise<LedgerAccount> {
    const existing = await this.store.getAccountByCode(input.code);
    if (existing) return existing;
    return this.store.upsertAccount(input);
  }

  async post(input: NewEntry): Promise<JournalEntry> {
    validateBalancedLines(input.lines);
    const accountIds: string[] = [];
    for (const line of input.lines) {
      const account = await this.store.getAccountByCode(line.accountCode);
      if (!account) {
        throw new LedgerError(`Unknown ledger account ${line.accountCode}`);
      }
      if (account.currency !== line.currency) {
        throw new LedgerError(
          `Currency mismatch on ${account.code}: ${account.currency} vs ${line.currency}`,
        );
      }
      accountIds.push(account.id);
    }
    return this.store.saveEntry(
      {
        ...input,
        id: newId("je"),
        createdAt: new Date(),
        metadata: input.metadata ?? {},
      },
      accountIds,
    );
  }

  async reverse(entryId: string, reason: string, createdById?: string): Promise<JournalEntry> {
    const original = await this.store.getEntry(entryId);
    if (!original) {
      throw new LedgerError("Journal entry not found");
    }
    const flipped = reversalLines(original.lines);
    const lines = [];
    for (const line of flipped) {
      const account = await this.store.getAccountById(line.accountId);
      if (!account) throw new LedgerError("Missing account on reversal");
      lines.push({
        accountCode: account.code,
        direction: line.direction,
        amountMinor: line.amountMinor,
        currency: line.currency,
      });
    }
    return this.post({
      correlationId: original.correlationId,
      type: "REVERSAL",
      description: reason,
      createdById,
      reversesId: original.id,
      metadata: { originalEntryId: original.id },
      lines,
    });
  }

  async balance(accountCode: string): Promise<AccountBalance> {
    const account = await this.store.getAccountByCode(accountCode);
    if (!account) {
      throw new LedgerError(`Unknown ledger account ${accountCode}`);
    }
    const lines = await this.store.listLinesForAccount(account.id);
    const holds = await this.store.listOpenHolds(account.id);
    const postedMinor = postedBalance(account.type, lines);
    const heldMinor = holds.reduce((acc, h) => acc + h.amountMinor, 0n);
    return {
      account,
      postedMinor,
      heldMinor,
      availableMinor: availableBalance(postedMinor, heldMinor),
    };
  }

  async balancesForOwner(userId: string): Promise<AccountBalance[]> {
    const accounts = await this.store.listAccountsByOwner(userId);
    const out: AccountBalance[] = [];
    for (const account of accounts) {
      out.push(await this.balance(account.code));
    }
    return out.sort((a, b) => a.account.currency.localeCompare(b.account.currency));
  }

  async placeHold(input: {
    accountCode: string;
    amountMinor: bigint;
    reason: string;
    paymentId?: string;
  }): Promise<Hold> {
    const snapshot = await this.balance(input.accountCode);
    assertSufficientAvailable(snapshot.availableMinor, input.amountMinor, snapshot.account.currency);
    const hold: Hold = {
      id: newId("hold"),
      accountId: snapshot.account.id,
      amountMinor: input.amountMinor,
      currency: snapshot.account.currency,
      reason: input.reason,
      status: "OPEN",
      paymentId: input.paymentId ?? null,
      createdAt: new Date(),
    };
    return this.store.saveHold(hold);
  }

  async releaseHold(holdId: string): Promise<Hold> {
    const hold = await this.store.getHold(holdId);
    if (!hold) throw new LedgerError("Hold not found");
    if (hold.status !== "OPEN") {
      throw new LedgerError(`Hold ${holdId} is ${hold.status}`);
    }
    return this.store.saveHold({ ...hold, status: "RELEASED" });
  }

  async captureHold(holdId: string, entry: Omit<NewEntry, "type"> & { type?: NewEntry["type"] }) {
    const hold = await this.store.getHold(holdId);
    if (!hold) throw new LedgerError("Hold not found");
    if (hold.status !== "OPEN") {
      throw new LedgerError(`Hold ${holdId} is ${hold.status}`);
    }
    const posted = await this.post({
      ...entry,
      type: entry.type ?? "HOLD_CAPTURE",
    });
    await this.store.saveHold({
      ...hold,
      status: "CAPTURED",
      journalEntryId: posted.id,
    });
    return posted;
  }
}
