import { TxRow } from "@/components/money-ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/format";
import { payoutMethodLabel } from "@/lib/payments/payout";

export default async function ActivityPage() {
  const session = await requireSession();
  const payments = await prisma.payment.findMany({
    where: { userId: session.id },
    include: { beneficiary: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Activity</h1>
      <div className="mt-6 divide-y divide-line">
        {payments.map((p) => (
          <TxRow
            key={p.id}
            title={
              p.beneficiary?.name ??
              (p.direction === "PAYIN" ? "Added money" : p.description)
            }
            subtitle={`${payoutMethodLabel(p.method)} · ${displayDate(p.createdAt)} · ${p.status.toLowerCase()}`}
            amount={p.amountMinor}
            currency={p.currency}
            inbound={p.direction === "PAYIN"}
          />
        ))}
      </div>
    </div>
  );
}
