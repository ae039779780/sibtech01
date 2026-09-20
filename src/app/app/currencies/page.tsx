import { Badge, DemoNote, PageHeader } from "@/components/ui";
import { CURRENCIES } from "@/lib/currencies";

export default function CurrenciesPage() {
  const fiat = CURRENCIES.filter((c) => c.class === "fiat");
  const crypto = CURRENCIES.filter((c) => c.class === "crypto");

  return (
    <div>
      <PageHeader
        eyebrow="Currencies"
        title={`${CURRENCIES.length}-asset catalog`}
        description="Catalog UI only. Do not treat this as ninety live rails or partner liquidity."
      />
      <DemoNote>Wallet defaults are CAD/USD/EUR/GBP plus USDT/BTC for crypto-friendly retail. Everything else is a catalog row.</DemoNote>
      <p className="mb-4 text-sm text-muted">
        {fiat.length} fiat · {crypto.length} crypto
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CURRENCIES.map((c) => (
          <article key={c.code} className="card hairline flex items-center justify-between p-4">
            <div>
              <p className="font-mono text-sm">{c.code}</p>
              <p className="text-xs text-muted">{c.name}</p>
            </div>
            <Badge tone={c.class === "crypto" ? "teal" : "muted"}>{c.class}</Badge>
          </article>
        ))}
      </div>
    </div>
  );
}
