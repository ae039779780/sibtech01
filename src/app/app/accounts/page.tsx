import { Badge } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function AccountsPage() {
  const session = await requireSession();
  const accounts = await prisma.globalAccount.findMany({
    where: { userId: session.id },
  });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Global account</h1>
      <p className="mt-2 text-sm text-muted">
        Local details for inbound pay-in. Issued by a partner EMI when contracted.
      </p>
      <div className="mt-8 space-y-4">
        {accounts.map((a) => (
          <article key={a.id} className="rounded-[1.5rem] bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">
                {a.currency} · {a.country}
              </h2>
              <Badge tone="warn">{a.status}</Badge>
            </div>
            <p className="mt-4 font-mono text-lg tracking-wide">{a.iban ?? a.accountNumber}</p>
            <p className="mt-2 text-sm text-muted">{a.bankName}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
