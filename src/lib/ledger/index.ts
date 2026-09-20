import { LedgerService } from "./service";
import { PrismaLedgerStore } from "./prisma-store";

export { LedgerService } from "./service";
export { MemoryLedgerStore } from "./memory-store";
export { PrismaLedgerStore } from "./prisma-store";
export * from "./types";
export * from "./engine";

export function appLedger() {
  return new LedgerService(new PrismaLedgerStore());
}
