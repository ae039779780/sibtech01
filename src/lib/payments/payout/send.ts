import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { KYC_LIMITS } from "@/lib/config";
import { appLedger, customerWalletCode, partnerNostroCode } from "@/lib/ledger";
import { getConfiguredRailsPartner, getRailsPartner, parseRailsProvider } from "@/lib/partners/rails";
import type { PayoutMethod } from "@/lib/partners/rails/types";
import { LedgerError } from "@/lib/ledger/types";
import { ensureCustomerWallets } from "@/lib/services/wallets";
import { assertBankDestination, assertNotPan, assertUpiVpa, isPartnerCardToken } from "./guard";
import { parsePayoutMethod, type PayoutMethodId } from "./methods";

function dailyLimit(tier: number): bigint {
  if (tier >= 2) return KYC_LIMITS[2].dailyPayoutMinor;
  if (tier === 1) return KYC_LIMITS[1].dailyPayoutMinor;
  return KYC_LIMITS[0].dailyPayoutMinor;
}

export type PayoutDestination = {
  name: string;
  country?: string;
  accountNumber?: string;
  iban?: string;
  swiftBic?: string;
  bankName?: string;
  cardToken?: string;
  cardLast4?: string;
  upiVpa?: string;
};

export function validatePayoutDestination(method: PayoutMethodId, dest: PayoutDestination) {
  if (!dest.name.trim()) {
    throw new Error("Recipient name is required");
  }
  if (method === "BANK") {
    assertBankDestination(dest);
  }
  if (method === "PUSH2CARD") {
    if (!dest.cardToken) {
      throw new Error("Push2card requires a vault token from the DEMO iframe");
    }
    assertNotPan(dest.cardToken);
    if (!isPartnerCardToken(dest.cardToken)) {
      throw new Error("Push2card token must come from the partner iframe stub");
    }
  }
  if (method === "UPI") {
    assertUpiVpa(dest.upiVpa ?? "");
  }
}

async function railsForPayout(method: PayoutMethod) {
  if (method === "PUSH2CARD") {
    try {
      const hint = await prisma.setting.findUnique({ where: { key: "rails.push2card.partner" } });
      return getRailsPartner(parseRailsProvider(hint?.value ?? "thunes"));
    } catch {
      return getRailsPartner("thunes");
    }
  }
  return getConfiguredRailsPartner();
}

export async function sendPayout(input: {
  userId: string;
  amountMinor: bigint;
  currency: string;
  method: string;
  destination: PayoutDestination;
  idempotencyKey: string;
  actorId?: string;
}) {
  const method = parsePayoutMethod(input.method);
  validatePayoutDestination(method, input.destination);

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

  const limit = dailyLimit(user.kycTier);
  if (input.amountMinor > limit) {
    throw new Error("Amount exceeds KYC tier daily payout limit");
  }

  const dest = input.destination;
  const beneficiary = await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: dest.name.trim(),
      type: method,
      currency: input.currency,
      country: dest.country?.trim() || (method === "UPI" ? "IN" : user.country),
      accountNumber: dest.accountNumber?.trim() || null,
      iban: dest.iban?.trim() || null,
      swiftBic: dest.swiftBic?.trim() || null,
      bankName: dest.bankName?.trim() || null,
      cardToken: dest.cardToken?.trim() || null,
      cardLast4: dest.cardLast4?.trim() || null,
      upiVpa: dest.upiVpa?.trim() || null,
    },
  });

  await ensureCustomerWallets(user.id, user.name, [input.currency]);
  const ledger = appLedger();
  const hold = await ledger.placeHold({
    accountCode: customerWalletCode(user.id, input.currency),
    amountMinor: input.amountMinor,
    reason: `Payout hold ${method}`,
  });

  const partner = await railsForPayout(method);
  let submission;
  try {
    submission = await partner.createPayout({
      userId: user.id,
      amountMinor: input.amountMinor,
      currency: input.currency,
      method,
      country: beneficiary.country,
      beneficiaryName: beneficiary.name,
      accountNumber: beneficiary.accountNumber ?? undefined,
      iban: beneficiary.iban ?? undefined,
      swiftBic: beneficiary.swiftBic ?? undefined,
      bankName: beneficiary.bankName ?? undefined,
      cardToken: beneficiary.cardToken ?? undefined,
      cardLast4: beneficiary.cardLast4 ?? undefined,
      upiVpa: beneficiary.upiVpa ?? undefined,
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
    description: `${method} payout via ${partner.displayName}`,
    createdById: input.actorId ?? user.id,
    metadata: { railsRef: submission.partnerRef, method },
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
      method,
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
      description: `${method} to ${beneficiary.name}`,
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
      method,
      corridor: submission.corridor,
      cardLast4: dest.cardLast4,
      upiVpa: dest.upiVpa,
    },
  });

  return { payment, submission, idempotent: false };
}
