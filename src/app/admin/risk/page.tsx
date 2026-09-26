import { holdReleaseAction, placeHoldAction, setVelocityAction } from "@/app/actions/admin";
import { Button, DemoNote, Field, PageHeader } from "@/components/ui";
import { capabilitiesFor, CUSTOMER_ROLES, isCustomerRole, roleLabel } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/format";

export default async function AdminRiskPage() {
  const session = await requireStaff();
  const caps = capabilitiesFor(session.role);
  const [customers, holds, velocity] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: [...CUSTOMER_ROLES, "CUSTOMER"] } },
      orderBy: { name: "asc" },
    }),
    prisma.hold.findMany({
      include: { account: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.setting.findUnique({ where: { key: "risk.velocity.cad.daily" } }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Risk"
        title="Holds & velocity"
        description="Risk (and Admin) can place wallet holds and set a daily CAD velocity cap. Freeze stays with Compliance/Admin. Support never freezes alone."
      />
      <DemoNote>Stub console for the Musk cut. Full Risk ops UI is post-demo.</DemoNote>

      {caps.risk ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form action={placeHoldAction} className="card hairline space-y-4 p-6">
            <p className="font-medium">Place hold</p>
            <Field label="Customer" name="userId">
              <select
                name="userId"
                className="w-full rounded-xl border border-line bg-navy-lift/40 px-3 py-2 text-sm"
              >
                {customers.filter((u) => isCustomerRole(u.role)).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {roleLabel(u.role)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Currency" name="currency" defaultValue="CAD" />
              <Field label="Amount (minor)" name="amountMinor" defaultValue="10000" />
            </div>
            <Field label="Reason" name="reason" defaultValue="Velocity review" />
            <Button type="submit">Hold funds</Button>
          </form>
          <form action={setVelocityAction} className="card hairline space-y-4 p-6">
            <p className="font-medium">CAD daily velocity</p>
            <p className="text-sm text-muted">
              Current cap: {velocity?.value ?? "2500000"} minor units.
            </p>
            <Field label="Daily CAD minor" name="value" defaultValue={velocity?.value ?? "2500000"} />
            <Button type="submit">Save velocity</Button>
          </form>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">View only. Risk and Admin place holds and set velocity.</p>
      )}

      <h2 className="mt-10 text-lg font-semibold">Holds</h2>
      <div className="mt-4 space-y-3">
        {holds.length === 0 ? (
          <p className="text-sm text-muted">No holds.</p>
        ) : (
          holds.map((hold) => (
            <article key={hold.id} className="card hairline flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-mono text-xs text-teal">{hold.status}</p>
                <p className="mt-1">
                  {hold.amountMinor} {hold.currency} · {hold.account.code}
                </p>
                <p className="text-xs text-muted">
                  {hold.reason} · {displayDate(hold.createdAt)}
                </p>
              </div>
              {caps.risk && hold.status === "OPEN" ? (
                <form action={holdReleaseAction}>
                  <input type="hidden" name="holdId" value={hold.id} />
                  <input type="hidden" name="action" value="release" />
                  <Button type="submit" variant="ghost">
                    Release
                  </Button>
                </form>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
