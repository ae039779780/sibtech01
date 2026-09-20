import { Badge, DemoNote } from "@/components/ui";
import { AccountRow, TxRow } from "@/components/money-ui";
import { requireSession } from "@/lib/auth/session";
import { isCryptoCode } from "@/lib/currencies";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/format";
import { getWalletOverview } from "@/lib/services/wallets";
import { redirect } from "next/navigation";

export default async function CryptoPage() {
  const session = await requireSession();
  if (!session.cryptoFriendly) {
    redirect("/app");
  }

  const [balances, payments] = await Promise.all([
    getWalletOverview(session.id),
    prisma.payment.findMany({
      where: { userId: session.id, method: "CRYPTO" },
      include: { beneficiary: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  const crypto = balances.filter((b) => isCryptoCode(b.account.currency));

  return (
    <div className="mx-auto max-w-lg lg:max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Crypto</h1>
      <DemoNote>
        Custody, chain broadcast, and liquidity are partner slots. These balances live on the Sibtech
        demo ledger only.
      </DemoNote>
      <div className="mt-6 divide-y divide-line rounded-[1.6rem] bg-white/[0.03] px-3 py-2">
        {crypto.map((b) => (
          <AccountRow
            key={b.account.id}
            code={b.account.currency}
            name={b.account.currency === "BTC" ? "Bitcoin" : "Tether"}
            minor={b.availableMinor}
          />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3">
        <a href="/app/pay-in" className="rounded-2xl bg-white/[0.05] px-4 py-3 text-center text-sm font-medium">
          Deposit
        </a>
        <a href="/app/send" className="rounded-2xl bg-white/[0.05] px-4 py-3 text-center text-sm font-medium">
          Withdraw
        </a>
      </div>
      <h2 className="mt-10 text-lg font-semibold">Crypto activity</h2>
      <div className="mt-2 divide-y divide-line">
        {payments.length === 0 ? (
          <p className="py-4 text-sm text-muted">No crypto pay-ins or payouts yet.</p>
        ) : (
          payments.map((p) => (
            <TxRow
              key={p.id}
              title={p.beneficiary?.name ?? p.description}
              subtitle={`${p.direction} · ${displayDate(p.createdAt)}`}
              amount={p.amountMinor}
              currency={p.currency}
              inbound={p.direction === "PAYIN"}
            />
          ))
        )}
      </div>
      <p className="mt-6 text-xs text-muted">
        Card spend-from-crypto is a DEMO UI on Cards. Convert-at-spend uses the same AFIX spread book.
      </p>
      <Badge tone="teal">crypto-friendly retail</Badge>
    </div>
  );
}
