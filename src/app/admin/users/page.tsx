import { freezeUserAction } from "@/app/actions/admin";
import { Badge, Button, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { kycTone } from "@/lib/format";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <PageHeader eyebrow="Users" title="Accounts" />
      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th>Email</th>
              <th>Role</th>
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
                <td>{u.role}</td>
                <td>
                  <Badge tone={kycTone(u.kycStatus) as "ok"}>{u.kycStatus}</Badge>
                </td>
                <td>{u.frozen ? "yes" : "no"}</td>
                <td>
                  {u.role === "CUSTOMER" ? (
                    <form action={freezeUserAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="frozen" value={u.frozen ? "false" : "true"} />
                      <Button type="submit" variant="ghost">
                        {u.frozen ? "Unfreeze" : "Freeze"}
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
