import { createPayinAction } from "@/app/actions/customer";
import { Badge, Button, Field, PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayAmount } from "@/lib/format";
import { getConfiguredRailsPartner } from "@/lib/partners/rails";

export default async function PayInPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const [payments, partner] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: session.id, direction: "PAYIN" },
      orderBy: { createdAt: "desc" },
    }),
    getConfiguredRailsPartner(),
  ]);
  const created = params.created
    ? payments.find((p) => p.id === params.created)
    : payments.find((p) => p.status === "PENDING");

  return (
    <div>
      <PageHeader
        eyebrow="Add money"
        title="Pay in globally"
        description={`Instructions are issued by the ${partner.displayName} stub. Funds credit your wallet after the partner webhook (admin can settle).`}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={createPayinAction} className="card hairline space-y-4 p-6">
          <Field label="Amount" name="amount" defaultValue="250.00" required />
          <Field label="Currency" name="currency">
            <select
              name="currency"
              className="w-full rounded-xl border border-line bg-navy-lift/40 px-3 py-2 text-sm"
              defaultValue="CAD"
            >
              {["CAD", "USD", "EUR", "GBP", "USDT", "BTC"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Method" name="method">
            <select
              name="method"
              className="w-full rounded-xl border border-line bg-navy-lift/40 px-3 py-2 text-sm"
              defaultValue="LOCAL"
            >
              <option value="LOCAL">Local rail</option>
              <option value="SWIFT">SWIFT / cross-border</option>
              <option value="CRYPTO">Crypto deposit</option>
            </select>
          </Field>
          <Button type="submit">Create deposit instructions</Button>
        </form>
        <div className="card hairline p-6">
          <h2 className="font-medium">Latest instructions</h2>
          {created ? (
            <div className="mt-4 space-y-2 text-sm">
              <p>
                {displayAmount(created.amountMinor, created.currency)} via {created.method}
              </p>
              <p className="text-muted">
                Partner {created.railsPartner} · {created.railsRef}
              </p>
              <p className="text-muted">Corridor {created.railsCorridor}</p>
              <p className="rounded-xl bg-navy-lift/50 p-3 font-mono text-xs">
                Reference SIB-{session.id.slice(-6).toUpperCase()} · quote this on the transfer
              </p>
              <Badge tone="warn">{created.status}</Badge>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Create a deposit to see partner instructions.</p>
          )}
        </div>
      </div>
      <ul className="mt-8 space-y-3">
        {payments.map((p) => (
          <li key={p.id} className="card hairline flex items-center justify-between p-4 text-sm">
            <span>
              {p.method} · {displayAmount(p.amountMinor, p.currency)}
            </span>
            <Badge tone={p.status === "SETTLED" ? "ok" : "warn"}>{p.status}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
