import { Badge } from "@/components/ui";
import {
  AccountRow,
  MetalCard,
  QuickAction,
  SectionLabel,
  TxRow,
} from "@/components/money-ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { currencyPrefix, displayDate, displayFigure, kycTone } from "@/lib/format";
import { t } from "@/lib/i18n";
import { isCryptoCode } from "@/lib/currencies";
import { payoutMethodLabel } from "@/lib/payments/payout";
import { getWalletOverview } from "@/lib/services/wallets";
import { ArrowUpRight, CreditCard, Plus, Repeat } from "lucide-react";

export default async function CustomerHome() {
  const session = await requireSession();
  const copy = t();
  const [balances, payments, user, card] = await Promise.all([
    getWalletOverview(session.id),
    prisma.payment.findMany({
      where: { userId: session.id },
      include: { beneficiary: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.user.findUniqueOrThrow({ where: { id: session.id } }),
    prisma.card.findFirst({ where: { userId: session.id } }),
  ]);
  const visible = session.cryptoFriendly
    ? balances
    : balances.filter((b) => !isCryptoCode(b.account.currency));
  const cad = visible.find((b) => b.account.currency === "CAD");
  const first = session.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-lg lg:max-w-none">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">Good afternoon</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{first}</h1>
        </div>
        <Badge tone={kycTone(user.kycStatus) as "ok"}>
          {copy.kyc[user.kycStatus as keyof typeof copy.kyc] ?? user.kycStatus}
        </Badge>
      </div>

      <div className="mt-8 text-center lg:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Accounts</p>
        <p className="mt-3 text-[3.35rem] font-semibold leading-none tracking-tight tabular-nums md:text-7xl">
          {currencyPrefix("CAD")}
          {cad ? displayFigure(cad.availableMinor, "CAD") : "0.00"}
        </p>
        <p className="mt-3 text-sm text-muted">Canadian dollars · available to spend</p>
      </div>

      <div className="mt-8 flex justify-center gap-5 lg:justify-start">
        <QuickAction href="/app/pay-in" label="Add money" icon={<Plus className="h-6 w-6" />} />
        <QuickAction href="/app/send" label="Send" icon={<ArrowUpRight className="h-6 w-6" />} />
        <QuickAction href="/app/exchange" label="Exchange" icon={<Repeat className="h-6 w-6" />} />
        <QuickAction href="/app/cards" label="Cards" icon={<CreditCard className="h-6 w-6" />} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div>
          {card ? (
            <a href="/app/cards" className="block">
              <MetalCard
                last4={card.last4}
                brand={card.brand}
                kind={card.kind}
                spendFrom={card.spendFromCurrency}
              />
            </a>
          ) : null}
        </div>
        <div>
          <SectionLabel href="/app/wallet">Accounts</SectionLabel>
          <div className="divide-y divide-line">
            {visible.map((b) => (
              <AccountRow
                key={b.account.id}
                code={b.account.currency}
                name={b.account.currency === "BTC" ? "Bitcoin" : `${b.account.currency} account`}
                minor={b.availableMinor}
                href="/app/wallet"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <SectionLabel href="/app/activity">Transactions</SectionLabel>
        <div className="divide-y divide-line">
          {payments.map((p) => (
            <TxRow
              key={p.id}
              title={
                p.beneficiary?.name ??
                (p.direction === "PAYIN" ? "Added money" : p.description)
              }
              subtitle={`${p.direction === "PAYOUT" ? payoutMethodLabel(p.method) : p.method} · ${displayDate(p.createdAt)}`}
              amount={p.amountMinor}
              currency={p.currency}
              inbound={p.direction === "PAYIN"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
