import { addBeneficiaryAction, createPayoutAction } from "@/app/actions/customer";
import { Button, Field } from "@/components/ui";
import { TxRow } from "@/components/money-ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/format";

export default async function SendPage() {
  const session = await requireSession();
  const [beneficiaries, payouts] = await Promise.all([
    prisma.beneficiary.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { userId: session.id, direction: "PAYOUT" },
      include: { beneficiary: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  const preferred =
    beneficiaries.find((b) => b.type === "SWIFT") ?? beneficiaries[0];

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Send</h1>
      <p className="mt-2 text-sm text-muted">Local, SWIFT, or crypto — same wallet, partner rails underneath.</p>

      <form action={createPayoutAction} className="mt-8 space-y-5">
        <label className="block text-center">
          <span className="text-xs uppercase tracking-[0.18em] text-muted">Amount</span>
          <input
            name="amount"
            defaultValue="50.00"
            required
            className="mt-2 w-full bg-transparent text-center text-6xl font-semibold tracking-tight outline-none"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Currency" name="currency">
            <select
              name="currency"
              defaultValue="EUR"
              className="w-full rounded-2xl border-0 bg-white/[0.06] px-3 py-3 text-sm"
            >
              {["CAD", "USD", "EUR", "GBP", "USDT", "BTC"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="How" name="method">
            <select
              name="method"
              defaultValue="SWIFT"
              className="w-full rounded-2xl border-0 bg-white/[0.06] px-3 py-3 text-sm"
            >
              <option value="SWIFT">International</option>
              <option value="LOCAL">Local</option>
              <option value="CRYPTO">Crypto</option>
            </select>
          </Field>
        </div>
        <Field label="To" name="beneficiaryId">
          <select
            name="beneficiaryId"
            required
            defaultValue={preferred?.id}
            className="w-full rounded-2xl border-0 bg-white/[0.06] px-3 py-3 text-sm"
          >
            {beneficiaries.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" className="h-12 w-full text-base">
          Send
        </Button>
      </form>

      <details className="mt-8 rounded-[1.4rem] bg-white/[0.03] p-5">
        <summary className="cursor-pointer text-sm font-medium">Add a recipient</summary>
        <form action={addBeneficiaryAction} className="mt-4 space-y-3">
          <Field label="Name" name="name" required />
          <Field label="Type" name="type">
            <select name="type" className="w-full rounded-2xl border-0 bg-white/[0.06] px-3 py-3 text-sm">
              <option>LOCAL</option>
              <option>SWIFT</option>
              <option>CRYPTO</option>
            </select>
          </Field>
          <Field label="Currency" name="currency" defaultValue="EUR" />
          <Field label="Country" name="country" defaultValue="DE" />
          <Field label="IBAN" name="iban" />
          <Field label="SWIFT / BIC" name="swiftBic" />
          <Field label="Account number" name="accountNumber" />
          <Field label="Crypto address" name="cryptoAddress" />
          <Button type="submit" variant="ghost">
            Save
          </Button>
        </form>
      </details>

      <h2 className="mt-10 text-lg font-semibold">Recent</h2>
      <div className="mt-2 divide-y divide-line">
        {payouts.map((p) => (
          <TxRow
            key={p.id}
            title={p.beneficiary?.name ?? p.description}
            subtitle={`${p.method} · ${displayDate(p.createdAt)}`}
            amount={p.amountMinor}
            currency={p.currency}
            inbound={false}
          />
        ))}
      </div>
    </div>
  );
}
