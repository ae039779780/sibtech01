import { exchangeAction } from "@/app/actions/customer";
import { Button, Field, PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayAmount } from "@/lib/format";
import { previewQuote } from "@/lib/services/fx";

export default async function ExchangePage() {
  const session = await requireSession();
  const quote = await previewQuote("CAD", "USD", 1_000_00n);
  const history = await prisma.fxQuote.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Exchange"
        title="Convert at an AFIX quote"
        description="Phase 2 surface, wired to the same ledger. Customer rate is mid minus half the configured spread."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={exchangeAction} className="card hairline space-y-4 p-6">
          <Field label="Sell amount" name="amount" defaultValue="200.00" required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="From" name="fromCurrency" defaultValue="CAD" />
            <Field label="To" name="toCurrency" defaultValue="USD" />
          </div>
          <p className="text-sm text-muted">
            Sample 1,000 CAD → USD mid {quote.midRate.toFixed(4)} · client{" "}
            {quote.clientRate.toFixed(4)} · spread {quote.spreadBps} bps
          </p>
          <Button type="submit">Confirm conversion</Button>
        </form>
        <div className="card hairline p-6 text-sm text-muted">
          Liquidity is a demo book versus CAD. Production will quote through the
          chosen rails/crypto partner. Travel-rule fields attach when the
          destination is a VASP.
        </div>
      </div>
      <ul className="mt-8 space-y-3">
        {history.map((q) => (
          <li key={q.id} className="card hairline p-4 text-sm">
            {q.baseCurrency}→{q.quoteCurrency} · {displayAmount(q.amountMinor, q.baseCurrency)} at{" "}
            {Number(q.clientRate).toFixed(6)} ({q.spreadBps} bps)
          </li>
        ))}
      </ul>
    </div>
  );
}
