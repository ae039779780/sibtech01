"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { toMinor } from "@/lib/money";
import { currencyDecimals } from "@/lib/currencies";
import { createPayin } from "@/lib/services/payments";
import { sendPayout } from "@/lib/payments/payout";
import { submitKyc } from "@/lib/services/kyc";
import { executeExchange } from "@/lib/services/fx";
import type { PayinMethod } from "@/lib/partners/rails/types";

export async function submitKycAction(formData: FormData) {
  const session = await requireSession();
  await submitKyc({
    userId: session.id,
    legalName: String(formData.get("legalName") ?? session.name),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    addressLine1: String(formData.get("addressLine1") ?? ""),
    city: String(formData.get("city") ?? ""),
    region: String(formData.get("region") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? "CA"),
    occupation: String(formData.get("occupation") ?? ""),
    sourceOfFunds: String(formData.get("sourceOfFunds") ?? ""),
  });
  revalidatePath("/app");
  revalidatePath("/app/profile");
}

export async function createPayinAction(formData: FormData) {
  const session = await requireSession();
  const currency = String(formData.get("currency") ?? "CAD");
  const method = String(formData.get("method") ?? "LOCAL") as PayinMethod;
  const amount = String(formData.get("amount") ?? "0");
  const result = await createPayin({
    userId: session.id,
    amountMinor: toMinor(amount, currencyDecimals(currency)),
    currency,
    method,
    idempotencyKey: `payin:${session.id}:${Date.now()}`,
    actorId: session.id,
  });
  const paymentId = "payment" in result ? result.payment.id : result.id;
  revalidatePath("/app");
  revalidatePath("/app/pay-in");
  redirect(`/app/pay-in?created=${paymentId}`);
}

export async function createPayoutAction(formData: FormData) {
  const session = await requireSession();
  const currency = String(formData.get("currency") ?? "CAD");
  const method = String(formData.get("method") ?? "BANK");
  const amount = String(formData.get("amount") ?? "0");
  const slug = method === "PUSH2CARD" ? "push2card" : method === "UPI" ? "upi" : "bank";
  let result;
  try {
    result = await sendPayout({
      userId: session.id,
      amountMinor: toMinor(amount, currencyDecimals(currency)),
      currency,
      method,
      destination: {
        name: String(formData.get("name") ?? ""),
        country: String(formData.get("country") ?? "") || undefined,
        accountNumber: String(formData.get("accountNumber") ?? "") || undefined,
        iban: String(formData.get("iban") ?? "") || undefined,
        swiftBic: String(formData.get("swiftBic") ?? "") || undefined,
        bankName: String(formData.get("bankName") ?? "") || undefined,
        cardToken: String(formData.get("cardToken") ?? "") || undefined,
        cardLast4: String(formData.get("cardLast4") ?? "") || undefined,
        upiVpa: String(formData.get("upiVpa") ?? "") || undefined,
      },
      idempotencyKey: `payout:${session.id}:${Date.now()}`,
      actorId: session.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payout failed";
    redirect(`/app/send/${slug}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/app");
  revalidatePath("/app/send");
  revalidatePath("/app/wallet");
  redirect(`/app/send/receipt/${result.payment.id}`);
}

export async function addBeneficiaryAction(formData: FormData) {
  const session = await requireSession();
  await prisma.beneficiary.create({
    data: {
      userId: session.id,
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "LOCAL"),
      currency: String(formData.get("currency") ?? "CAD"),
      country: String(formData.get("country") ?? "CA"),
      accountNumber: String(formData.get("accountNumber") ?? "") || null,
      iban: String(formData.get("iban") ?? "") || null,
      swiftBic: String(formData.get("swiftBic") ?? "") || null,
      bankName: String(formData.get("bankName") ?? "") || null,
      cryptoNetwork: String(formData.get("cryptoNetwork") ?? "") || null,
      cryptoAddress: String(formData.get("cryptoAddress") ?? "") || null,
    },
  });
  revalidatePath("/app/send");
}

export async function exchangeAction(formData: FormData) {
  const session = await requireSession();
  const fromCurrency = String(formData.get("fromCurrency") ?? "CAD");
  const toCurrency = String(formData.get("toCurrency") ?? "USD");
  const amount = String(formData.get("amount") ?? "0");
  await executeExchange({
    userId: session.id,
    fromCurrency,
    toCurrency,
    amountMinor: toMinor(amount, currencyDecimals(fromCurrency)),
  });
  revalidatePath("/app");
  revalidatePath("/app/exchange");
  revalidatePath("/app/wallet");
}
