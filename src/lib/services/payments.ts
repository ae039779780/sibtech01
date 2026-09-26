import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { railsPartnerId } from "@/lib/config";
import { actorCan } from "@/lib/auth/permissions";
import { isCryptoCode } from "@/lib/currencies";
import { appLedger, customerWalletCode, partnerNostroCode } from "@/lib/ledger";
import { getConfiguredRailsPartner } from "@/lib/partners/rails";
import type { PayinMethod } from "@/lib/partners/rails/types";
import { ensureCustomerWallets } from "./wallets";

function assertCryptoAllowed(
  user: { role: string; cryptoFriendly: boolean },
  method: PayinMethod,
  currency: string,
) {
  const cryptoAsset = (() => {
    try {
      return isCryptoCode(currency);
    } catch {
      return false;
    }
  })();
  if ((method === "CRYPTO" || cryptoAsset) && !actorCan(user, "crypto.deposit")) {
    throw new Error("Crypto rails require the Crypto role or a crypto-friendly Retail flag");
  }
}

export async function createPayin(input: {
  userId: string;
  amountMinor: bigint;
  currency: string;
  method: PayinMethod;
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
  if (!actorCan(user, "payin.create")) {
    throw new Error("This role cannot create pay-ins");
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
