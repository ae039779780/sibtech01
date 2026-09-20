import { createPayinAction } from "@/app/actions/customer";
import { Badge, Button, Field } from "@/components/ui";
import { TxRow } from "@/components/money-ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/format";
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
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Add money</h1>
      <p className="mt-2 text-sm text-muted">
        Get local or international details from {partner.displayName}. Admin settles the inbound credit.
      </p>

      <form action={createPayinAction} className="mt-8 space-y-5">
        <label className="block text-center">
          <span className="text-xs uppercase tracking-[0.18em] text-muted">Amount</span>
          <input
            name="amount"
            defaultValue="250.00"
            required
            className="mt-2 w-full bg-transparent text-center text-6xl font-semibold tracking-tight outline-none"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Currency" name="currency">
            <select
              name="currency"
              className="w-full rounded-2xl border-0 bg-white/[0.06] px-3 py-3 text-sm"
              defaultValue="CAD"
            >
              {["CAD", "USD", "EUR", "GBP", "USDT", "BTC"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="From" name="method">
            <select
              name="method"
              className="w-full rounded-2xl border-0 bg-white/[0.06] px-3 py-3 text-sm"
              defaultValue="LOCAL"
            >
              <option value="LOCAL">Bank transfer</option>
              <option value="SWIFT">International</option>
              <option value="CRYPTO">Crypto</option>
            </select>
          </Field>
        </div>
        <Button type="submit" className="h-12 w-full text-base">
          Continue
        </Button>
      </form>

      {created ? (
        <div className="mt-8 rounded-[1.4rem] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <p className="font-medium">Deposit details</p>
            <Badge tone="warn">{created.status}</Badge>
          </div>
          <p className="mt-3 text-sm text-muted">
            {created.railsPartner} · {created.railsRef}
          </p>
          <p className="mt-4 rounded-2xl bg-black/30 p-4 font-mono text-sm">
            SIB-{session.id.slice(-6).toUpperCase()}
          </p>
          <p className="mt-2 text-xs text-muted">Quote this reference on the transfer.</p>
        </div>
      ) : null}

      <h2 className="mt-10 text-lg font-semibold">Incoming</h2>
      <div className="mt-2 divide-y divide-line">
        {payments.map((p) => (
          <TxRow
            key={p.id}
            title="Added money"
            subtitle={`${p.method} · ${displayDate(p.createdAt)}`}
            amount={p.amountMinor}
            currency={p.currency}
            inbound
          />
        ))}
      </div>
    </div>
  );
}
