import { Badge, PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayAmount, displayDate } from "@/lib/format";

export default async function ActivityPage() {
  const session = await requireSession();
  const payments = await prisma.payment.findMany({
    where: { userId: session.id },
    include: { beneficiary: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader eyebrow="Activity" title="Money in and out" />
      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">When</th>
              <th>Type</th>
              <th>Rail</th>
              <th>Amount</th>
              <th>Partner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-3 text-muted">{displayDate(p.createdAt)}</td>
                <td>{p.direction}</td>
                <td>{p.method}</td>
                <td className="font-mono">{displayAmount(p.amountMinor, p.currency)}</td>
                <td className="text-muted">{p.railsPartner}</td>
                <td>
                  <Badge tone={p.status === "SETTLED" ? "ok" : "warn"}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
