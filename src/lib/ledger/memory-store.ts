import type { Hold, JournalEntry, JournalLine, LedgerAccount, NewEntry } from "./types";
import { LedgerError } from "./types";
import { newId, type LedgerStore, type PersistableAccount } from "./store";

export class MemoryLedgerStore implements LedgerStore {
  accounts = new Map<string, LedgerAccount>();
  accountsByCode = new Map<string, string>();
  entries = new Map<string, JournalEntry>();
  holds = new Map<string, Hold>();

  async getAccountByCode(code: string) {
    const id = this.accountsByCode.get(code);
    return id ? (this.accounts.get(id) ?? null) : null;
  }

  async getAccountById(id: string) {
    return this.accounts.get(id) ?? null;
  }

  async upsertAccount(account: PersistableAccount) {
    const existingId = this.accountsByCode.get(account.code);
    const id = existingId ?? account.id ?? newId("acct");
    const saved: LedgerAccount = {
      id,
      code: account.code,
      name: account.name,
      type: account.type,
      currency: account.currency,
      ownerUserId: account.ownerUserId ?? null,
    };
    this.accounts.set(id, saved);
    this.accountsByCode.set(account.code, id);
    return saved;
  }

  async listAccountsByOwner(userId: string) {
    return [...this.accounts.values()].filter((a) => a.ownerUserId === userId);
  }

  async listAllAccounts() {
    return [...this.accounts.values()];
  }

  async saveEntry(
    entry: NewEntry & { id: string; createdAt: Date },
    accountIds: string[],
  ): Promise<JournalEntry> {
    if (this.entries.has(entry.id)) {
      throw new LedgerError("Journal entries are immutable");
    }
    const lines: JournalLine[] = entry.lines.map((line, i) => ({
      id: newId("line"),
      entryId: entry.id,
      accountId: accountIds[i]!,
      direction: line.direction,
      amountMinor: line.amountMinor,
      currency: line.currency,
    }));
    const saved: JournalEntry = {
      id: entry.id,
      correlationId: entry.correlationId,
      type: entry.type,
      description: entry.description,
      metadata: entry.metadata ?? {},
      createdById: entry.createdById ?? null,
      reversesId: entry.reversesId ?? null,
      createdAt: entry.createdAt,
      lines,
    };
    this.entries.set(saved.id, saved);
    return saved;
  }

  async getEntry(id: string) {
    return this.entries.get(id) ?? null;
  }

  async listEntries(limit = 100) {
    return [...this.entries.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async listLinesForAccount(accountId: string) {
    return [...this.entries.values()].flatMap((e) =>
      e.lines.filter((l) => l.accountId === accountId),
    );
  }

  async saveHold(hold: Hold) {
    this.holds.set(hold.id, { ...hold });
    return hold;
  }

  async getHold(id: string) {
    return this.holds.get(id) ?? null;
  }

  async listOpenHolds(accountId: string) {
    return [...this.holds.values()].filter(
      (h) => h.accountId === accountId && h.status === "OPEN",
    );
  }
}
