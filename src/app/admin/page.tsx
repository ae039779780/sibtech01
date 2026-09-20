import { PageHeader, Stat } from "@/components/ui";
import { capabilitiesFor, roleLabel } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getConfiguredRailsPartner } from "@/lib/partners/rails";

export default async function AdminHome() {
  const session = await requireStaff();
  const caps = capabilitiesFor(session.role);
  const [users, pendingKyc, payments, partner] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { kycStatus: { in: ["IN_REVIEW", "PENDING"] } } }),
    prisma.payment.findMany(),
    getConfiguredRailsPartner(),
  ]);
  const pendingPayins = payments.filter((p) => p.direction === "PAYIN" && p.status === "PENDING").length;
  const settled = payments.filter((p) => p.status === "SETTLED").length;

  return (
    <div>
      <PageHeader
        eyebrow={roleLabel(session.role)}
        title="Operations dashboard"
        description={`Active rail adapter: ${partner.displayName}. Sibtech remains the Canadian-licensed principal.`}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Users" value={String(users)} />
        <Stat label="KYC backlog" value={String(pendingKyc)} />
        <Stat label="Pending pay-ins" value={String(pendingPayins)} />
        <Stat label="Settled transfers" value={String(settled)} />
      </div>
      <p className="mt-8 max-w-2xl text-sm text-muted">{partner.settlementModel}</p>
      <ul className="mt-6 space-y-1 text-sm text-muted">
        <li>KYC decisions: {caps.kyc ? "yes (Compliance + Admin)" : "view only"}</li>
        <li>
          Freeze accounts:{" "}
          {caps.freeze
            ? "yes (Compliance + Admin)"
            : caps.escalate
              ? "no — Support escalates freeze and never freezes alone"
              : "no"}
        </li>
        <li>Settle / partner switch / feature flags: {caps.settle ? "yes (Admin)" : "no"}</li>
        <li>Risk holds / velocity: {caps.risk ? "yes" : "no"}</li>
      </ul>
    </div>
  );
}
