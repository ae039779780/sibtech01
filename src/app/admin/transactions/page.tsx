import { reverseEntryAction } from "@/app/actions/admin";
import { Button, Field, PageHeader } from "@/components/ui";
import { capabilitiesFor } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/format";

export default async function AdminTransactionsPage() {
  const session = await requireStaff();
  const caps = capabilitiesFor(session.role);
  const entries = await prisma.journalEntry.findMany({
    include: { lines: { include: { account: true } } },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Transactions"
        title="Immutable journal"
        description="Never edit history. Reverse with a compensating entry. Demo-grade ledger — not production recon."
      />
      <div className="space-y-4">
        {entries.map((e) => (
          <article key={e.id} className="card hairline p-5">
            <div className="flex flex-wrap justify-between gap-3 text-sm">
              <div>
                <p className="font-mono text-xs text-teal">{e.type}</p>
                <p className="mt-1">{e.description}</p>
                <p className="text-xs text-muted">
                  {displayDate(e.createdAt)} · {e.correlationId}
                </p>
              </div>
              {caps.reverse && e.type !== "REVERSAL" ? (
                <form action={reverseEntryAction} className="flex items-end gap-2">
                  <input type="hidden" name="entryId" value={e.id} />
                  <Field label="Reason" name="reason" defaultValue="Admin reversal" />
                  <Button type="submit" variant="ghost">
                    Reverse
                  </Button>
                </form>
              ) : null}
            </div>
            <ul className="mt-3 space-y-1 font-mono text-xs text-muted">
              {e.lines.map((l) => (
                <li key={l.id}>
                  {l.direction} {l.amountMinor} {l.currency} · {l.account.code}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
