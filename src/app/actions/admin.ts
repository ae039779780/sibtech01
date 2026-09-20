"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { decideKyc } from "@/lib/services/kyc";
import { settlePayin } from "@/lib/services/payments";
import { appLedger } from "@/lib/ledger";
import { writeAudit } from "@/lib/audit";

export async function decideKycAction(formData: FormData) {
  const actor = await requireCapability("kyc.decide");
  await decideKyc({
    userId: String(formData.get("userId") ?? ""),
    reviewerId: actor.id,
    decision: String(formData.get("decision") ?? "APPROVED") as "APPROVED" | "REJECTED",
    reason: String(formData.get("reason") ?? ""),
  });
  revalidatePath("/admin");
  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
}

export async function settlePayinAction(formData: FormData) {
  const actor = await requireCapability("rails.settle");
  await settlePayin(String(formData.get("paymentId") ?? ""), actor.id);
  revalidatePath("/admin");
  revalidatePath("/admin/rails");
  revalidatePath("/admin/transactions");
}

export async function freezeUserAction(formData: FormData) {
  const actor = await requireCapability("user.freeze");
  const userId = String(formData.get("userId") ?? "");
  const frozen = String(formData.get("frozen") ?? "true") === "true";
  await prisma.user.update({ where: { id: userId }, data: { frozen } });
  await writeAudit({
    actorId: actor.id,
    action: frozen ? "user.frozen" : "user.unfrozen",
    entityType: "User",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}

export async function reverseEntryAction(formData: FormData) {
  const actor = await requireCapability("ledger.reverse");
  const id = String(formData.get("entryId") ?? "");
  const reason = String(formData.get("reason") ?? "Admin reversal");
  await appLedger().reverse(id, reason, actor.id);
  await writeAudit({
    actorId: actor.id,
    action: "ledger.reversed",
    entityType: "JournalEntry",
    entityId: id,
    payload: { reason },
  });
  revalidatePath("/admin/transactions");
}

export async function updateSpreadAction(formData: FormData) {
  const actor = await requireCapability("fx.spread");
  const pair = String(formData.get("pair") ?? "*");
  const spreadBps = Number(formData.get("spreadBps") ?? 40);
  await prisma.fxSpread.upsert({
    where: { pair },
    create: { pair, spreadBps, active: true },
    update: { spreadBps, active: true },
  });
  await writeAudit({
    actorId: actor.id,
    action: "fx.spread.updated",
    entityType: "FxSpread",
    entityId: pair,
    payload: { spreadBps },
  });
  revalidatePath("/admin/fx");
  revalidatePath("/app/fx");
}

export async function setRailsPartnerAction(formData: FormData) {
  const actor = await requireCapability("settings.rails");
  const value = String(formData.get("partner") ?? "thunes");
  await prisma.setting.upsert({
    where: { key: "rails.partner" },
    create: { key: "rails.partner", value },
    update: { value },
  });
  await writeAudit({
    actorId: actor.id,
    action: "settings.rails",
    entityType: "Setting",
    entityId: "rails.partner",
    payload: { value },
  });
  revalidatePath("/admin/settings");
}

export async function holdReleaseAction(formData: FormData) {
  const actor = await requireCapability("ledger.reverse");
  const holdId = String(formData.get("holdId") ?? "");
  const action = String(formData.get("action") ?? "release");
  if (action === "release") {
    await appLedger().releaseHold(holdId);
  }
  await writeAudit({
    actorId: actor.id,
    action: `hold.${action}`,
    entityType: "Hold",
    entityId: holdId,
  });
  revalidatePath("/admin/transactions");
}
