import { settlePayinAction } from "@/app/actions/admin";
import { Badge, Button, DemoNote, PageHeader } from "@/components/ui";
import { capabilitiesFor } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayAmount, displayDate } from "@/lib/format";

export default async function AdminRailsPage() {
  const session = await requireStaff();
  const caps = capabilitiesFor(session.role);
  const payments = await prisma.payment.findMany({
    include: { user: true, beneficiary: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Pay-ins / Payouts"
        title="Partner rail queue"
        description="Settle a pending pay-in to simulate the partner webhook and credit the customer ledger."
      />
      <DemoNote>Thunes and Terra adapters are labeled stubs. No live vendor webhook.</DemoNote>
      <div className="mt-6 space-y-3">
        {payments.map((p) => (
          <article key={p.id} className="card hairline flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div>
              <p>
                {p.direction} {p.method} · {displayAmount(p.amountMinor, p.currency)} · {p.user.email}
              </p>
              <p className="text-xs text-muted">
                {p.railsPartner} {p.railsRef} · {displayDate(p.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={p.status === "SETTLED" ? "ok" : "warn"}>{p.status}</Badge>
              {caps.settle && p.direction === "PAYIN" && p.status === "PENDING" ? (
                <form action={settlePayinAction}>
                  <input type="hidden" name="paymentId" value={p.id} />
                  <Button type="submit">Settle webhook</Button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
