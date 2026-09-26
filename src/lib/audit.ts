import { prisma } from "./db";

export async function writeAudit(input: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, unknown>;
  ip?: string | null;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      payload: JSON.stringify(input.payload ?? {}),
      ip: input.ip ?? null,
    },
  });
}
