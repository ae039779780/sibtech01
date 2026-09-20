import { Badge, Button, PageHeader, Stat } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayAmount, displayDate, kycTone } from "@/lib/format";
import { getWalletOverview } from "@/lib/services/wallets";
import { t } from "@/lib/i18n";

export default async function CustomerHome() {
  const session = await requireSession();
  const copy = t();
  const [balances, payments, user] = await Promise.all([
    getWalletOverview(session.id),
    prisma.payment.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findUniqueOrThrow({ where: { id: session.id } }),
  ]);
  const cad = balances.find((b) => b.account.currency === "CAD");

  return (
    <div>
      <PageHeader
        eyebrow="Home"
        title={`Good day, ${session.name.split(" ")[0]}`}
        description="Canadian-licensed wallet with global rails. Phase 1 money movement is live; later modules have real stub surfaces."
        actions={<Button href="/app/pay-in">Add money</Button>}
      />

      <div className="mb-6 rounded-2xl border border-line bg-navy-lift/40 p-4 text-sm">
        <span className="mr-2 text-muted">KYC status</span>
        <Badge tone={kycTone(user.kycStatus) as "ok"}>
          {copy.kyc[user.kycStatus as keyof typeof copy.kyc] ?? user.kycStatus}
        </Badge>
        <span className="ml-3 text-muted">Tier {user.kycTier}</span>
        {user.kycStatus !== "APPROVED" ? (
          <a href="/app/profile" className="ml-4 text-teal">
            Continue verification
          </a>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Available CAD"
          value={cad ? displayAmount(cad.availableMinor, "CAD") : "0.00 CAD"}
          hint={cad && cad.heldMinor > 0n ? `${displayAmount(cad.heldMinor, "CAD")} on hold` : "No open holds"}
        />
        <Stat label="Open wallets" value={String(balances.length)} hint="Fiat + crypto books" />
        <Stat label="Recent transfers" value={String(payments.length)} hint="Pay-in and payout" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card hairline p-6">
          <h2 className="font-medium">Balances</h2>
          <ul className="mt-4 space-y-3">
            {balances.map((b) => (
              <li key={b.account.id} className="flex items-center justify-between text-sm">
                <span className="text-muted">{b.account.currency}</span>
                <span className="font-mono">{displayAmount(b.availableMinor, b.account.currency)}</span>
              </li>
            ))}
          </ul>
          <Button href="/app/wallet" variant="ghost" className="mt-5">
            Open wallet
          </Button>
        </section>
        <section className="card hairline p-6">
          <h2 className="font-medium">Activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <div>
                  <p>
                    {p.direction} · {p.method}
                  </p>
                  <p className="text-xs text-muted">{displayDate(p.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono">{displayAmount(p.amountMinor, p.currency)}</p>
                  <Badge tone={p.status === "SETTLED" ? "ok" : "warn"}>{p.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
