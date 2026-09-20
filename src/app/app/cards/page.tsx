import { Badge } from "@/components/ui";
import { MetalCard } from "@/components/money-ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function CardsPage() {
  const session = await requireSession();
  const cards = await prisma.card.findMany({ where: { userId: session.id } });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Cards</h1>
      <p className="mt-2 text-sm text-muted">
        Spend from wallet or crypto. Convert-at-spend uses AFIX at your spread.
      </p>
      <div className="mt-8 space-y-6">
        {cards.map((c) => (
          <div key={c.id}>
            <MetalCard last4={c.last4} brand={c.brand} kind={c.kind} spendFrom={c.spendFromCurrency} />
            <div className="mt-4 flex items-center justify-between px-1 text-sm">
              <span className="text-muted">
                {c.cryptoSpendEnabled ? "Crypto spend on" : "Fiat only"}
              </span>
              <Badge tone={c.status === "ACTIVE" ? "ok" : "warn"}>{c.status}</Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {["Freeze", "PIN", "Limits", "Replace"].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-2xl bg-white/[0.05] py-3 text-sm font-medium"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
