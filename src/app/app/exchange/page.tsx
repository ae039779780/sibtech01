import { exchangeAction } from "@/app/actions/customer";
import { Button, DemoNote, Field } from "@/components/ui";
import { actorCan } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayAmount } from "@/lib/format";
import { previewQuote } from "@/lib/services/fx";
import { redirect } from "next/navigation";

export default async function ExchangePage() {
  const session = await requireSession();
  if (!actorCan(session, "fx.trade")) {
    redirect("/app");
  }
  const quote = await previewQuote("CAD", "USD", 1_000_00n);
  const history = await prisma.fxQuote.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Exchange</h1>
      <p className="mt-2 text-sm text-muted">
        Live AFIX quote. You get mid minus half the spread — currently {quote.spreadBps} bps.
      </p>
      <DemoNote>In-app book and spread. Not a live FX venue.</DemoNote>
      <form action={exchangeAction} className="mt-8 space-y-5 rounded-[1.6rem] bg-white/[0.04] p-5">
        <Field label="You send" name="amount" defaultValue="25.00" required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="From" name="fromCurrency" defaultValue="CAD" />
          <Field label="To" name="toCurrency" defaultValue="USD" />
        </div>
        <div className="rounded-2xl bg-black/25 p-4 text-sm">
          <p className="text-muted">Indicative 1,000 CAD → USD</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{quote.clientRate.toFixed(4)}</p>
        </div>
        <Button type="submit" className="h-12 w-full text-base">
          Exchange
        </Button>
      </form>
      <ul className="mt-8 space-y-2">
        {history.map((q) => (
          <li key={q.id} className="flex justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm">
            <span>
              {q.baseCurrency} → {q.quoteCurrency}
            </span>
            <span className="tabular-nums text-muted">
              {displayAmount(q.amountMinor, q.baseCurrency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
