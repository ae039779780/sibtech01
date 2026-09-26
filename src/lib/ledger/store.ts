import type { Hold, JournalEntry, JournalLine, LedgerAccount, NewEntry } from "./types";

export type PersistableAccount = Omit<LedgerAccount, "id"> & { id?: string };

export interface LedgerStore {
  getAccountByCode(code: string): Promise<LedgerAccount | null>;
  getAccountById(id: string): Promise<LedgerAccount | null>;
  upsertAccount(account: PersistableAccount): Promise<LedgerAccount>;
  listAccountsByOwner(userId: string): Promise<LedgerAccount[]>;
  listAllAccounts(): Promise<LedgerAccount[]>;
  saveEntry(entry: NewEntry & { id: string; createdAt: Date }, accountIds: string[]): Promise<JournalEntry>;
  getEntry(id: string): Promise<JournalEntry | null>;
  listEntries(limit?: number): Promise<JournalEntry[]>;
  listLinesForAccount(accountId: string): Promise<JournalLine[]>;
  saveHold(hold: Hold): Promise<Hold>;
  getHold(id: string): Promise<Hold | null>;
  listOpenHolds(accountId: string): Promise<Hold[]>;
}

export function newId(prefix = ""): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return prefix ? `${prefix}_${rnd}` : rnd;
}
