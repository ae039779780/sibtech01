import { parseRailsProvider } from "@/lib/partners/rails";
import { prisma } from "@/lib/db";

export function railsPartnerId() {
  return parseRailsProvider(process.env.RAILS_PARTNER);
}

export async function activeRailsPartnerId() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "rails.partner" } });
    return parseRailsProvider(row?.value ?? process.env.RAILS_PARTNER);
  } catch {
    return railsPartnerId();
  }
}

export const KYC_LIMITS = {
  0: { dailyPayoutMinor: 0n, label: "Unverified" },
  1: { dailyPayoutMinor: 1_000_00n, label: "Standard" },
  2: { dailyPayoutMinor: 50_000_00n, label: "Enhanced" },
} as const;

export function defaultSpreadBps() {
  return 40;
}
