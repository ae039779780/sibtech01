import { Badge, PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function CardsPage() {
  const session = await requireSession();
  const cards = await prisma.card.findMany({ where: { userId: session.id } });

  return (
    <div>
      <PageHeader
        eyebrow="Cards"
        title="Issue a card and spend crypto"
        description="Phase 3 stub. Sibtech is the program-manager UX and ledger. A BIN sponsor issues the card. Convert-at-spend can pull USDT or BTC through AFIX at the configured spread."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <article
            key={c.id}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-lift to-teal-deep p-6 text-white"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Sibtech {c.kind}</p>
            <p className="mt-10 font-mono text-2xl tracking-[0.2em]">•••• {c.last4}</p>
            <div className="mt-8 flex items-center justify-between text-sm">
              <span>{c.brand}</span>
              <Badge tone="warn">{c.status}</Badge>
            </div>
            <p className="mt-3 text-xs text-white/80">
              Spend from {c.spendFromCurrency}
              {c.cryptoSpendEnabled ? " · crypto spend enabled" : ""}
            </p>
          </article>
        ))}
        <article className="card hairline p-6 text-sm text-muted">
          Physical cards, 3DS, and spend controls land after a BIN sponsor is selected.
          This page is a real product surface — not a placeholder tile.
        </article>
      </div>
    </div>
  );
}
