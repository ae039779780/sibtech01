import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/format";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  return (
    <div>
      <PageHeader
        eyebrow="Audit"
        title="Action log"
        description="Admin and API actions for exams. History is append-only."
      />
      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="px-4 py-3 text-muted">{displayDate(l.createdAt)}</td>
                <td>{l.actor?.email ?? "system"}</td>
                <td className="font-mono text-xs">{l.action}</td>
                <td className="text-muted">
                  {l.entityType} {l.entityId.slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
