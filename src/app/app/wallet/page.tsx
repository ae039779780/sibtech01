import { PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { displayAmount } from "@/lib/format";
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
      include: { lines: { include: { account: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Wallet"
        title="Multi-asset ledger balances"
        description="Posted amounts come from immutable journal entries. Holds reduce what you can send."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {balances.map((b) => (
          <article key={b.account.id} className="card hairline p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{b.account.currency}</p>
            <p className="mt-2 font-mono text-2xl">{displayAmount(b.availableMinor, b.account.currency)}</p>
            <p className="mt-2 text-xs text-muted">
              Posted {displayAmount(b.postedMinor, b.account.currency)} · Held{" "}
              {displayAmount(b.heldMinor, b.account.currency)}
            </p>
          </article>
        ))}
      </div>
      <section className="card hairline mt-8 overflow-hidden">
        <div className="border-b border-line px-5 py-4 font-medium">Statement</div>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3">Type</th>
              <th>Description</th>
              <th>Correlation</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-line">
                <td className="px-5 py-3 font-mono text-xs">{e.type}</td>
                <td>{e.description}</td>
                <td className="font-mono text-xs text-muted">{e.correlationId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
