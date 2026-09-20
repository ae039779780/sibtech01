import { prisma } from "../db";
import type { Hold, JournalEntry, JournalLine, LedgerAccount, NewEntry } from "./types";
import { LedgerError } from "./types";
import type { LedgerStore, PersistableAccount } from "./store";

function mapAccount(row: {
  id: string;
  code: string;
  name: string;
  type: string;
  currency: string;
  ownerUserId: string | null;
}): LedgerAccount {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type as LedgerAccount["type"],
    currency: row.currency,
    ownerUserId: row.ownerUserId,
  };
}

function mapLine(row: {
  id: string;
  entryId: string;
  accountId: string;
  direction: string;
  amountMinor: string;
  currency: string;
}): JournalLine {
  return {
    id: row.id,
    entryId: row.entryId,
    accountId: row.accountId,
    direction: row.direction as JournalLine["direction"],
    amountMinor: BigInt(row.amountMinor),
    currency: row.currency,
  };
}

export class PrismaLedgerStore implements LedgerStore {
  async getAccountByCode(code: string) {
    const row = await prisma.ledgerAccount.findUnique({ where: { code } });
    return row ? mapAccount(row) : null;
  }

  async getAccountById(id: string) {
    const row = await prisma.ledgerAccount.findUnique({ where: { id } });
    return row ? mapAccount(row) : null;
  }

  async upsertAccount(account: PersistableAccount) {
    const row = await prisma.ledgerAccount.upsert({
      where: { code: account.code },
      create: {
        ...(account.id ? { id: account.id } : {}),
        code: account.code,
        name: account.name,
        type: account.type,
        currency: account.currency,
        ownerUserId: account.ownerUserId ?? null,
      },
      update: {
        name: account.name,
      },
    });
    return mapAccount(row);
  }

  async listAccountsByOwner(userId: string) {
    const rows = await prisma.ledgerAccount.findMany({ where: { ownerUserId: userId } });
    return rows.map(mapAccount);
  }

  async listAllAccounts() {
    const rows = await prisma.ledgerAccount.findMany();
    return rows.map(mapAccount);
  }

  async saveEntry(entry: NewEntry & { id: string; createdAt: Date }, accountIds: string[]) {
    const created = await prisma.$transaction(async (tx) => {
      const existing = await tx.journalEntry.findUnique({ where: { id: entry.id } });
      if (existing) {
        throw new LedgerError("Journal entries are immutable");
      }
      return tx.journalEntry.create({
        data: {
          id: entry.id,
          correlationId: entry.correlationId,
          type: entry.type,
          description: entry.description,
          metadata: JSON.stringify(entry.metadata ?? {}, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          ),
          createdById: entry.createdById ?? null,
          reversesId: entry.reversesId ?? null,
          createdAt: entry.createdAt,
          lines: {
            create: entry.lines.map((line, i) => ({
              accountId: accountIds[i]!,
              direction: line.direction,
              amountMinor: line.amountMinor.toString(),
              currency: line.currency,
            })),
          },
        },
        include: { lines: true },
      });
    });
    return {
      id: created.id,
      correlationId: created.correlationId,
      type: created.type as JournalEntry["type"],
      description: created.description,
      metadata: JSON.parse(created.metadata) as Record<string, unknown>,
      createdById: created.createdById,
      reversesId: created.reversesId,
      createdAt: created.createdAt,
      lines: created.lines.map(mapLine),
    };
  }

  async getEntry(id: string) {
    const row = await prisma.journalEntry.findUnique({
      where: { id },
      include: { lines: true },
    });
    if (!row) return null;
    return {
      id: row.id,
      correlationId: row.correlationId,
      type: row.type as JournalEntry["type"],
      description: row.description,
      metadata: JSON.parse(row.metadata) as Record<string, unknown>,
      createdById: row.createdById,
      reversesId: row.reversesId,
      createdAt: row.createdAt,
      lines: row.lines.map(mapLine),
    };
  }

  async listEntries(limit = 100) {
    const rows = await prisma.journalEntry.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { lines: true },
    });
    return rows.map((row) => ({
      id: row.id,
      correlationId: row.correlationId,
      type: row.type as JournalEntry["type"],
      description: row.description,
      metadata: JSON.parse(row.metadata) as Record<string, unknown>,
      createdById: row.createdById,
      reversesId: row.reversesId,
      createdAt: row.createdAt,
      lines: row.lines.map(mapLine),
    }));
  }

  async listLinesForAccount(accountId: string) {
    const rows = await prisma.journalLine.findMany({ where: { accountId } });
    return rows.map(mapLine);
  }

  async saveHold(hold: Hold) {
    const row = await prisma.hold.upsert({
      where: { id: hold.id },
      create: {
        id: hold.id,
        accountId: hold.accountId,
        amountMinor: hold.amountMinor.toString(),
        currency: hold.currency,
        reason: hold.reason,
        status: hold.status,
        paymentId: hold.paymentId ?? null,
        journalEntryId: hold.journalEntryId ?? null,
        createdAt: hold.createdAt,
      },
      update: {
        status: hold.status,
        journalEntryId: hold.journalEntryId ?? null,
      },
    });
    return {
      ...hold,
      status: row.status as Hold["status"],
      journalEntryId: row.journalEntryId,
    };
  }

  async getHold(id: string) {
    const row = await prisma.hold.findUnique({ where: { id } });
    if (!row) return null;
    return {
      id: row.id,
      accountId: row.accountId,
      amountMinor: BigInt(row.amountMinor),
      currency: row.currency,
      reason: row.reason,
      status: row.status as Hold["status"],
      paymentId: row.paymentId,
      journalEntryId: row.journalEntryId,
      createdAt: row.createdAt,
    };
  }

  async listOpenHolds(accountId: string) {
    const rows = await prisma.hold.findMany({ where: { accountId, status: "OPEN" } });
    return rows.map((row) => ({
      id: row.id,
      accountId: row.accountId,
      amountMinor: BigInt(row.amountMinor),
      currency: row.currency,
      reason: row.reason,
      status: row.status as Hold["status"],
      paymentId: row.paymentId,
      journalEntryId: row.journalEntryId,
      createdAt: row.createdAt,
    }));
  }
}

