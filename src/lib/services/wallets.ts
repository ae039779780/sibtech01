import { WALLET_DEFAULTS } from "@/lib/currencies";
import { appLedger } from "@/lib/ledger";
import {
  customerWalletCode,
  fxSpreadRevenueCode,
  partnerNostroCode,
  safeguardingCode,
} from "@/lib/ledger/types";
import { railsPartnerId } from "@/lib/config";

export async function ensureHouseBooks(currencies: string[] = [...WALLET_DEFAULTS]) {
  const ledger = appLedger();
  const partner = railsPartnerId();
  for (const currency of currencies) {
    await ledger.ensureAccount({
      code: partnerNostroCode(partner, currency),
      name: `${partner} nostro ${currency}`,
      type: "ASSET",
      currency,
    });
    await ledger.ensureAccount({
      code: safeguardingCode(currency),
      name: `Client money safeguarding ${currency}`,
      type: "ASSET",
      currency,
    });
    await ledger.ensureAccount({
      code: fxSpreadRevenueCode(currency),
      name: `FX spread ${currency}`,
      type: "REVENUE",
      currency,
    });
  }
}

export async function ensureCustomerWallets(userId: string, name: string, currencies = [...WALLET_DEFAULTS]) {
  const ledger = appLedger();
  await ensureHouseBooks(currencies);
  for (const currency of currencies) {
    await ledger.ensureAccount({
      code: customerWalletCode(userId, currency),
      name: `${name} ${currency} wallet`,
      type: "LIABILITY",
      currency,
      ownerUserId: userId,
    });
  }
}

export async function getWalletOverview(userId: string) {
  return appLedger().balancesForOwner(userId);
}
