import { AccountRow, SectionLabel } from "@/components/money-ui";
import { actorCan } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { displayAmount } from "@/lib/format";
import { isCryptoCode } from "@/lib/currencies";
import { getWalletOverview } from "@/lib/services/wallets";
import { prisma } from "@/lib/db";

export default async function WalletPage() {
  const session = await requireSession();
  const [balances, entries] = await Promise.all([
    getWalletOverview(session.id),
    prisma.journalEntry.findMany({
      where: {
        lines: { some: { account: { ownerUserId: session.id } } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);
  const visible = actorCan(session, "crypto.deposit")
    ? balances
    : balances.filter((b) => !isCryptoCode(b.account.currency));

  return (
    <div className="mx-auto max-w-lg lg:max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>
      <p className="mt-2 text-sm text-muted">Every currency sits on the Sibtech ledger. Holds come off what you can send.</p>
      <div className="mt-6 divide-y divide-line rounded-[1.6rem] bg-white/[0.03] px-3 py-2">
        {visible.map((b) => (
          <AccountRow
            key={b.account.id}
            code={b.account.currency}
            name={
              b.heldMinor > 0n
                ? `${displayAmount(b.heldMinor, b.account.currency)} on hold`
                : `${b.account.currency} account`
            }
            minor={b.availableMinor}
          />
        ))}
      </div>
      <div className="mt-10">
        <SectionLabel>Statement</SectionLabel>
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="rounded-2xl bg-white/[0.03] px-4 py-3">
              <p className="text-sm font-medium">{e.description}</p>
              <p className="text-xs text-muted">{e.type}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
