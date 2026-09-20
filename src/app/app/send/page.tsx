import { addBeneficiaryAction, createPayoutAction } from "@/app/actions/customer";
import { Badge, Button, Field, PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayAmount } from "@/lib/format";

export default async function SendPage() {
  const session = await requireSession();
  const [beneficiaries, payouts] = await Promise.all([
    prisma.beneficiary.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { userId: session.id, direction: "PAYOUT" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Send"
        title="Payout — local, SWIFT, crypto"
        description="Funds are held on the ledger, then captured when the RailsPartner stub accepts the transfer. SWIFT is the cross-border option."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={createPayoutAction} className="card hairline space-y-4 p-6">
          <Field label="Amount" name="amount" defaultValue="100.00" required />
          <Field label="Currency" name="currency">
            <select
              name="currency"
              defaultValue="CAD"
              className="w-full rounded-xl border border-line bg-navy-lift/40 px-3 py-2 text-sm"
            >
              {["CAD", "USD", "EUR", "GBP", "USDT", "BTC"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Rail" name="method">
            <select
              name="method"
              defaultValue="SWIFT"
              className="w-full rounded-xl border border-line bg-navy-lift/40 px-3 py-2 text-sm"
            >
              <option value="SWIFT">SWIFT / cross-border</option>
              <option value="LOCAL">Local rail</option>
              <option value="CRYPTO">Crypto withdraw</option>
            </select>
          </Field>
          <Field label="Beneficiary" name="beneficiaryId">
            <select
              name="beneficiaryId"
              required
              className="w-full rounded-xl border border-line bg-navy-lift/40 px-3 py-2 text-sm"
            >
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} · {b.type} · {b.currency}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit">Send via RailsPartner</Button>
        </form>
        <form action={addBeneficiaryAction} className="card hairline space-y-4 p-6">
          <h2 className="font-medium">Add beneficiary</h2>
          <Field label="Name" name="name" required />
          <Field label="Type" name="type">
            <select name="type" className="w-full rounded-xl border border-line bg-navy-lift/40 px-3 py-2 text-sm">
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
          <Field label="Network" name="cryptoNetwork" />
          <Button type="submit" variant="ghost">
            Save beneficiary
          </Button>
        </form>
      </div>
      <ul className="mt-8 space-y-3">
        {payouts.map((p) => (
          <li key={p.id} className="card hairline flex items-center justify-between p-4 text-sm">
            <span>
              {p.method} · {displayAmount(p.amountMinor, p.currency)} · {p.railsRef}
            </span>
            <Badge tone={p.status === "SETTLED" ? "ok" : "warn"}>{p.status}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
