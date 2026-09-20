import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { midRate, quoteFx } from "@/lib/fx/engine";

const PAIRS = [
  ["CAD", "USD"],
  ["CAD", "EUR"],
  ["USD", "EUR"],
  ["CAD", "USDT"],
  ["BTC", "CAD"],
  ["ETH", "CAD"],
] as const;

export default async function FxPage() {
  const spreads = await prisma.fxSpread.findMany({ orderBy: { pair: "asc" } });
  const defaultBps = spreads.find((s) => s.pair === "*")?.spreadBps ?? 40;

  return (
    <div>
      <PageHeader
        eyebrow="FX & spread"
        title="AFIX engine"
        description="Configurable spread in basis points. Admin can change pairs without touching customer UX. Mid rates are a demo book versus CAD."
      />
      <div className="card hairline mb-6 p-5 text-sm">
        Default spread <span className="font-mono text-teal">{defaultBps} bps</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-lift/40 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Pair</th>
              <th>Mid</th>
              <th>Client (sell base)</th>
              <th>Spread</th>
            </tr>
          </thead>
          <tbody>
            {PAIRS.map(([from, to]) => {
              const pair = `${from}/${to}`;
              const bps = spreads.find((s) => s.pair === pair)?.spreadBps ?? defaultBps;
              const q = quoteFx({
                fromCurrency: from,
                toCurrency: to,
                amountMinor: 100n,
                spreadBps: bps,
              });
              return (
                <tr key={pair} className="border-t border-line">
                  <td className="px-4 py-3 font-mono">{pair}</td>
                  <td>{midRate(from, to).toFixed(6)}</td>
                  <td>{q.clientRate.toFixed(6)}</td>
                  <td>{bps} bps</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
