import { prisma } from "@/lib/db";
import { defaultSpreadBps, railsPartnerId } from "@/lib/config";
import { quoteFx } from "@/lib/fx/engine";
import { appLedger, customerWalletCode, partnerNostroCode } from "@/lib/ledger";
import { writeAudit } from "@/lib/audit";
import { ensureCustomerWallets } from "./wallets";

export async function spreadForPair(from: string, to: string): Promise<number> {
  const pair = `${from}/${to}`;
  const inverse = `${to}/${from}`;
  const row = await prisma.fxSpread.findFirst({
    where: {
      active: true,
      OR: [{ pair }, { pair: inverse }, { pair: "*" }],
    },
    orderBy: { pair: "desc" },
  });
  return row?.spreadBps ?? defaultSpreadBps();
}

export async function previewQuote(from: string, to: string, amountMinor: bigint) {
  const spreadBps = await spreadForPair(from, to);
  return quoteFx({ fromCurrency: from, toCurrency: to, amountMinor, spreadBps });
}

export async function executeExchange(input: {
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amountMinor: bigint;
}) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error("User not found");
  if (user.kycStatus !== "APPROVED") throw new Error("Exchange requires approved KYC");

  await ensureCustomerWallets(user.id, user.name, [input.fromCurrency, input.toCurrency]);
  const quote = await previewQuote(input.fromCurrency, input.toCurrency, input.amountMinor);
  const partner = railsPartnerId();
  const ledger = appLedger();

  const fromWallet = await ledger.balance(customerWalletCode(user.id, input.fromCurrency));
  if (fromWallet.availableMinor < input.amountMinor) {
    throw new Error(`Insufficient ${input.fromCurrency} for this exchange`);
  }

  const entry = await ledger.post({
    correlationId: `fx:${user.id}:${Date.now()}`,
    type: "FX",
    description: `AFIX convert ${quote.pair} @ ${quote.clientRate.toFixed(6)}`,
    createdById: user.id,
    metadata: { quote, spreadBps: quote.spreadBps },
    lines: [
      {
        accountCode: customerWalletCode(user.id, input.fromCurrency),
        direction: "DEBIT",
        amountMinor: input.amountMinor,
        currency: input.fromCurrency,
      },
      {
        accountCode: partnerNostroCode(partner, input.fromCurrency),
        direction: "CREDIT",
        amountMinor: input.amountMinor,
        currency: input.fromCurrency,
      },
      {
        accountCode: partnerNostroCode(partner, input.toCurrency),
        direction: "DEBIT",
        amountMinor: quote.resultMinor,
        currency: input.toCurrency,
      },
      {
        accountCode: customerWalletCode(user.id, input.toCurrency),
        direction: "CREDIT",
        amountMinor: quote.resultMinor,
        currency: input.toCurrency,
      },
    ],
  });

  await prisma.fxQuote.create({
    data: {
      userId: user.id,
      baseCurrency: quote.baseCurrency,
      quoteCurrency: quote.quoteCurrency,
      side: quote.side,
      midRate: String(quote.midRate),
      spreadBps: quote.spreadBps,
      clientRate: String(quote.clientRate),
      amountMinor: quote.amountMinor.toString(),
      resultMinor: quote.resultMinor.toString(),
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "fx.executed",
    entityType: "JournalEntry",
    entityId: entry.id,
    payload: { pair: quote.pair, spreadBps: quote.spreadBps },
  });

  return { entry, quote };
}
