import { escalateFreezeAction, freezeUserAction } from "@/app/actions/admin";
import { Badge, Button, PageHeader } from "@/components/ui";
import { capabilitiesFor, isCustomerRole, roleLabel } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { kycTone } from "@/lib/format";

export default async function AdminUsersPage() {
  const session = await requireStaff();
  const caps = capabilitiesFor(session.role);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <PageHeader
        eyebrow="Users"
        title="Accounts"
        description={
          caps.freeze
            ? "Admin and Compliance can freeze customer accounts."
            : caps.escalate
              ? "Support cannot freeze alone — escalate to Compliance or Admin."
              : "View only. Freeze is Compliance/Admin. Risk owns holds, not freeze."
        }
      />
      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>KYC</th>
              <th>Frozen</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {roleLabel(u.role)}
                  {u.cryptoFriendly ? " · crypto" : ""}
                  {u.accountKind === "BUSINESS" ? " · business" : ""}
                </td>
                <td>
                  <Badge tone={kycTone(u.kycStatus) as "ok"}>{u.kycStatus}</Badge>
                </td>
                <td>{u.frozen ? "yes" : "no"}</td>
                <td>
                  {caps.freeze && isCustomerRole(u.role) ? (
                    <form action={freezeUserAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="frozen" value={u.frozen ? "false" : "true"} />
                      <Button type="submit" variant="ghost">
                        {u.frozen ? "Unfreeze" : "Freeze"}
                      </Button>
                    </form>
                  ) : null}
                  {caps.escalate && isCustomerRole(u.role) ? (
                    <form action={escalateFreezeAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <Button type="submit" variant="ghost">
                        Escalate freeze
                      </Button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
