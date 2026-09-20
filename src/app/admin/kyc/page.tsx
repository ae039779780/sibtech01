import { decideKycAction } from "@/app/actions/admin";
import { Badge, Button, Field, PageHeader } from "@/components/ui";
import { capabilitiesFor } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { kycTone } from "@/lib/format";

export default async function AdminKycPage() {
  const session = await requireStaff();
  const caps = capabilitiesFor(session.role);
  const cases = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { kycProfile: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="KYC / Cases"
        title="Review queue"
        description={
          caps.kyc
            ? "Approve to unlock pay-in, payout, and exchange. Decisions are written to the audit log. No live IDV vendor."
            : "View only. Compliance and Admin record decisions."
        }
      />
      <div className="space-y-4">
        {cases.map((u) => (
          <article key={u.id} className="card hairline p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-muted">
                  {u.email}
                  {u.cryptoFriendly ? " · crypto-friendly" : ""}
                  {u.accountKind === "BUSINESS" ? " · business" : ""}
                </p>
              </div>
              <Badge tone={kycTone(u.kycStatus) as "ok"}>{u.kycStatus}</Badge>
            </div>
            {u.kycProfile ? (
              <p className="mt-3 text-sm text-muted">
                {u.kycProfile.city}, {u.kycProfile.region} · {u.kycProfile.occupation} ·{" "}
                {u.kycProfile.sourceOfFunds}
                {u.kycProfile.notes ? ` · ${u.kycProfile.notes}` : ""}
              </p>
            ) : null}
            {caps.kyc ? (
              <form action={decideKycAction} className="mt-4 flex flex-wrap items-end gap-3">
                <input type="hidden" name="userId" value={u.id} />
                <Field label="Decision" name="decision">
                  <select
                    name="decision"
                    className="rounded-xl border border-line bg-navy-lift/40 px-3 py-2 text-sm"
                  >
                    <option>APPROVED</option>
                    <option>REJECTED</option>
                  </select>
                </Field>
                <Field label="Note" name="reason" placeholder="Optional" />
                <Button type="submit">Record decision</Button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
