import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ensureCustomerWallets } from "./wallets";

export async function submitKyc(input: {
  userId: string;
  legalName: string;
  dateOfBirth: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  occupation?: string;
  sourceOfFunds?: string;
}) {
  const profile = await prisma.kycProfile.upsert({
    where: { userId: input.userId },
    create: {
      ...input,
      submittedAt: new Date(),
    },
    update: {
      ...input,
      submittedAt: new Date(),
      decisionReason: null,
    },
  });

  await prisma.user.update({
    where: { id: input.userId },
    data: { kycStatus: "IN_REVIEW", country: input.country },
  });

  await writeAudit({
    actorId: input.userId,
    action: "kyc.submitted",
    entityType: "User",
    entityId: input.userId,
    payload: { country: input.country },
  });

  return profile;
}

export async function decideKyc(input: {
  userId: string;
  reviewerId: string;
  decision: "APPROVED" | "REJECTED";
  reason?: string;
}) {
  const user = await prisma.user.update({
    where: { id: input.userId },
    data: {
      kycStatus: input.decision,
      kycTier: input.decision === "APPROVED" ? 1 : 0,
    },
  });

  await prisma.kycProfile.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      legalName: user.name,
      dateOfBirth: "",
      addressLine1: "",
      city: "",
      region: "",
      postalCode: "",
      country: user.country,
      reviewedAt: new Date(),
      reviewedById: input.reviewerId,
      decisionReason: input.reason,
    },
    update: {
      reviewedAt: new Date(),
      reviewedById: input.reviewerId,
      decisionReason: input.reason,
    },
  });

  if (input.decision === "APPROVED") {
    await ensureCustomerWallets(user.id, user.name);
  }

  await writeAudit({
    actorId: input.reviewerId,
    action: `kyc.${input.decision.toLowerCase()}`,
    entityType: "User",
    entityId: user.id,
    payload: { reason: input.reason ?? null },
  });

  return user;
}
