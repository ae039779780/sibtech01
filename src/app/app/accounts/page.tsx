import { Badge, PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function AccountsPage() {
  const session = await requireSession();
  const accounts = await prisma.globalAccount.findMany({
    where: { userId: session.id },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Global account"
        title="Issue local / global account details"
        description="Phase 4 stub. Sibtech will display partner-issued IBANs or account numbers and reconcile inbound pay-ins to your wallet. No live issuance until an EMI / bank is contracted."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((a) => (
          <article key={a.id} className="card hairline p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">
                {a.currency} · {a.country}
              </h2>
              <Badge tone="warn">{a.status}</Badge>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">IBAN / number</dt>
                <dd className="font-mono">{a.iban ?? a.accountNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Bank</dt>
                <dd>{a.bankName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Partner</dt>
                <dd>{a.partner}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
