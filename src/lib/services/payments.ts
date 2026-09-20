import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { KYC_LIMITS, railsPartnerId } from "@/lib/config";
import { isCryptoCode } from "@/lib/currencies";
import { appLedger, customerWalletCode, partnerNostroCode } from "@/lib/ledger";
import { getConfiguredRailsPartner } from "@/lib/partners/rails";
import type { RailKind } from "@/lib/partners/rails/types";
import { LedgerError } from "@/lib/ledger/types";
import { ensureCustomerWallets } from "./wallets";

function dailyLimit(tier: number): bigint {
  if (tier >= 2) return KYC_LIMITS[2].dailyPayoutMinor;
  if (tier === 1) return KYC_LIMITS[1].dailyPayoutMinor;
  return KYC_LIMITS[0].dailyPayoutMinor;
}

function assertCryptoAllowed(
  user: { cryptoFriendly: boolean },
  method: RailKind,
  currency: string,
) {
  const cryptoAsset = (() => {
    try {
      return isCryptoCode(currency);
    } catch {
      return false;
    }
  })();
  if ((method === "CRYPTO" || cryptoAsset) && !user.cryptoFriendly) {
    throw new Error("Crypto rails require a crypto-friendly retail account");
  }
}

export async function createPayin(input: {
  userId: string;
  amountMinor: bigint;
  currency: string;
  method: RailKind;
  country?: string;
  idempotencyKey: string;
  actorId?: string;
}) {
  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) return existing;

  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error("User not found");
  if (user.frozen) throw new Error("Account is frozen");
  if (user.kycStatus !== "APPROVED") {
    throw new Error("Pay-in requires an approved KYC profile");
  }
  assertCryptoAllowed(user, input.method, input.currency);

  await ensureCustomerWallets(user.id, user.name, [input.currency]);
  const partner = await getConfiguredRailsPartner();
  const instruction = await partner.createPayin({
    userId: user.id,
    amountMinor: input.amountMinor,
    currency: input.currency,
    method: input.method,
    country: input.country ?? user.country,
    idempotencyKey: input.idempotencyKey,
  });

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      direction: "PAYIN",
      method: input.method,
      amountMinor: input.amountMinor.toString(),
      currency: input.currency,
      status: "PENDING",
      railsPartner: partner.id,
      railsRef: instruction.partnerRef,
      railsCorridor: instruction.corridor,
      idempotencyKey: input.idempotencyKey,
      description: `${input.method} pay-in ${input.currency} via ${partner.displayName}`,
    },
  });

  await writeAudit({
    actorId: input.actorId ?? user.id,
    action: "payin.created",
    entityType: "Payment",
    entityId: payment.id,
    payload: { partner: partner.id, ref: instruction.partnerRef, method: input.method },
  });

  return { payment, instruction };
}

export async function settlePayin(paymentId: string, actorId?: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.direction !== "PAYIN") {
    throw new Error("Pay-in not found");
  }
  if (payment.status === "SETTLED") return payment;

  const user = await prisma.user.findUnique({ where: { id: payment.userId } });
  if (!user) throw new Error("User not found");

  const amount = BigInt(payment.amountMinor);
  const partner = payment.railsPartner || railsPartnerId();
  const ledger = appLedger();
  const entry = await ledger.post({
    correlationId: payment.id,
    type: "PAYIN",
    description: `Settle pay-in ${payment.railsRef}`,
    createdById: actorId,
    metadata: { paymentId: payment.id, railsRef: payment.railsRef },
    lines: [
      {
        accountCode: partnerNostroCode(partner, payment.currency),
        direction: "DEBIT",
        amountMinor: amount,
        currency: payment.currency,
      },
      {
        accountCode: customerWalletCode(user.id, payment.currency),
        direction: "CREDIT",
        amountMinor: amount,
        currency: payment.currency,
      },
    ],
  });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "SETTLED", journalEntryId: entry.id },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "payin.settled",
    entityType: "Payment",
    entityId: payment.id,
    payload: { journalEntryId: entry.id },
  });

  return updated;
}

export async function createPayout(input: {
  userId: string;
  amountMinor: bigint;
  currency: string;
  method: RailKind;
  beneficiaryId: string;
  idempotencyKey: string;
  actorId?: string;
}) {
  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) return { payment: existing, submission: null, idempotent: true };

  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error("User not found");
  if (user.frozen) throw new Error("Account is frozen");
  if (user.kycStatus !== "APPROVED") {
    throw new Error("Payout requires an approved KYC profile");
  }
  assertCryptoAllowed(user, input.method, input.currency);

  const limit = dailyLimit(user.kycTier);
  if (input.amountMinor > limit) {
    throw new Error("Amount exceeds KYC tier daily payout limit");
  }

  const beneficiary = await prisma.beneficiary.findFirst({
    where: { id: input.beneficiaryId, userId: user.id },
  });
  if (!beneficiary) throw new Error("Beneficiary not found");

  await ensureCustomerWallets(user.id, user.name, [input.currency]);
  const ledger = appLedger();
  const hold = await ledger.placeHold({
    accountCode: customerWalletCode(user.id, input.currency),
    amountMinor: input.amountMinor,
    reason: `Payout hold ${input.method}`,
  });

  const partner = await getConfiguredRailsPartner();
  let submission;
  try {
    submission = await partner.createPayout({
      userId: user.id,
      amountMinor: input.amountMinor,
      currency: input.currency,
      method: input.method,
      country: beneficiary.country,
      beneficiaryName: beneficiary.name,
      accountNumber: beneficiary.accountNumber ?? undefined,
      iban: beneficiary.iban ?? undefined,
      swiftBic: beneficiary.swiftBic ?? undefined,
      cryptoAddress: beneficiary.cryptoAddress ?? undefined,
      cryptoNetwork: beneficiary.cryptoNetwork ?? undefined,
      idempotencyKey: input.idempotencyKey,
    });
  } catch (error) {
    await ledger.releaseHold(hold.id);
    throw error;
  }

  if (submission.status !== "ACCEPTED") {
    await ledger.releaseHold(hold.id);
    throw new LedgerError("Rails partner rejected payout");
  }

  const entry = await ledger.captureHold(hold.id, {
    correlationId: input.idempotencyKey,
    type: "PAYOUT",
    description: `${input.method} payout via ${partner.displayName}`,
    createdById: input.actorId ?? user.id,
    metadata: { railsRef: submission.partnerRef, method: input.method },
    lines: [
      {
        accountCode: customerWalletCode(user.id, input.currency),
        direction: "DEBIT",
        amountMinor: input.amountMinor,
        currency: input.currency,
      },
      {
        accountCode: partnerNostroCode(partner.id, input.currency),
        direction: "CREDIT",
        amountMinor: input.amountMinor,
        currency: input.currency,
      },
    ],
  });

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      direction: "PAYOUT",
      method: input.method,
      amountMinor: input.amountMinor.toString(),
      currency: input.currency,
      status: "SETTLED",
      railsPartner: partner.id,
      railsRef: submission.partnerRef,
      railsCorridor: submission.corridor,
      idempotencyKey: input.idempotencyKey,
      beneficiaryId: beneficiary.id,
      journalEntryId: entry.id,
      holdId: hold.id,
      description: `${input.method} to ${beneficiary.name}`,
    },
  });

  await writeAudit({
    actorId: input.actorId ?? user.id,
    action: "payout.sent",
    entityType: "Payment",
    entityId: payment.id,
    payload: {
      partner: partner.id,
      ref: submission.partnerRef,
      method: input.method,
      corridor: submission.corridor,
    },
  });

  return { payment, submission, idempotent: false };
}
