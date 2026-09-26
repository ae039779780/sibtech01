import { updateSpreadAction } from "@/app/actions/admin";
import { Button, Field, PageHeader } from "@/components/ui";
import { capabilitiesFor } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function AdminFxPage() {
  const session = await requireStaff();
  const caps = capabilitiesFor(session.role);
  const spreads = await prisma.fxSpread.findMany({ orderBy: { pair: "asc" } });
  return (
    <div>
      <PageHeader
        eyebrow="FX controls"
        title="Configurable spread"
        description="Pair format BASE/QUOTE. Use * for the default book spread."
      />
      {caps.spread ? (
        <form action={updateSpreadAction} className="card hairline mb-6 flex flex-wrap items-end gap-3 p-5">
          <Field label="Pair" name="pair" defaultValue="CAD/USD" />
          <Field label="Spread (bps)" name="spreadBps" defaultValue="40" />
          <Button type="submit">Save spread</Button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-muted">View only. Admin sets spread bps.</p>
      )}
      <ul className="space-y-2">
        {spreads.map((s) => (
          <li key={s.id} className="card hairline flex justify-between p-4 text-sm">
            <span className="font-mono">{s.pair}</span>
            <span>{s.spreadBps} bps {s.active ? "" : "(off)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
