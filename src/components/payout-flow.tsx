"use client";

import { createPayoutAction } from "@/app/actions/customer";
import { Button, Field } from "@/components/ui";
import type { PayoutMethodId } from "@/lib/payments/payout/methods";
import { useMemo, useState } from "react";

export type PayoutPrefill = {
  name?: string;
  country?: string;
  accountNumber?: string;
  iban?: string;
  swiftBic?: string;
  bankName?: string;
  upiVpa?: string;
};

const DEMO_CARD_TOKEN = "tok_thunes_demo_4418";
const DEMO_CARD_LAST4 = "4418";

export function PayoutFlow({
  method,
  currencies,
  defaultCurrency,
  prefill,
  error,
}: {
  method: PayoutMethodId;
  currencies: string[];
  defaultCurrency: string;
  prefill?: PayoutPrefill;
  error?: string;
}) {
  const [step, setStep] = useState<"details" | "confirm">("details");
  const [cardToken, setCardToken] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [draft, setDraft] = useState({
    amount: "50.00",
    currency: defaultCurrency,
    name: prefill?.name ?? "",
    country: prefill?.country ?? (method === "UPI" ? "IN" : "CA"),
    accountNumber: prefill?.accountNumber ?? "",
    iban: prefill?.iban ?? "",
    swiftBic: prefill?.swiftBic ?? "",
    bankName: prefill?.bankName ?? "",
    upiVpa: prefill?.upiVpa ?? "",
  });

  const destination = useMemo(() => {
    if (method === "PUSH2CARD") return `${draft.name || "Debit card"} · •••• ${cardLast4 || "••••"}`;
    if (method === "UPI") return `${draft.name} · ${draft.upiVpa}`;
    return `${draft.name} · ${draft.iban || draft.accountNumber}`;
  }, [method, draft, cardLast4]);

  if (step === "confirm") {
    return (
      <form action={createPayoutAction} className="mt-8 space-y-5">
        <input type="hidden" name="method" value={method} />
        <input type="hidden" name="amount" value={draft.amount} />
        <input type="hidden" name="currency" value={draft.currency} />
        <input type="hidden" name="name" value={draft.name} />
        <input type="hidden" name="country" value={draft.country} />
        <input type="hidden" name="accountNumber" value={draft.accountNumber} />
        <input type="hidden" name="iban" value={draft.iban} />
        <input type="hidden" name="swiftBic" value={draft.swiftBic} />
        <input type="hidden" name="bankName" value={draft.bankName} />
        <input type="hidden" name="upiVpa" value={draft.upiVpa} />
        <input type="hidden" name="cardToken" value={cardToken} />
        <input type="hidden" name="cardLast4" value={cardLast4} />
        <p className="text-center text-xs uppercase tracking-[0.18em] text-muted">Confirm</p>
        <p className="text-center text-6xl font-semibold tracking-tight tabular-nums">
          {draft.amount}
        </p>
        <p className="text-center text-sm text-muted">{draft.currency}</p>
        <div className="rounded-[1.4rem] bg-white/[0.04] p-5 text-sm">
          <p className="text-muted">To</p>
          <p className="mt-1 font-medium">{destination}</p>
          {method === "PUSH2CARD" ? (
            <p className="mt-3 text-xs text-muted">Token {cardToken} · PAN never stored</p>
          ) : null}
        </div>
        <Button type="submit" className="h-12 w-full text-base">
          Confirm send
        </Button>
        <button
          type="button"
          className="w-full text-sm text-muted"
          onClick={() => setStep("details")}
        >
          Back
        </button>
      </form>
    );
  }

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setDraft({
          amount: String(form.get("amount") ?? draft.amount),
          currency: String(form.get("currency") ?? draft.currency),
          name: String(form.get("name") ?? draft.name),
          country: String(form.get("country") ?? draft.country),
          accountNumber: String(form.get("accountNumber") ?? ""),
          iban: String(form.get("iban") ?? ""),
          swiftBic: String(form.get("swiftBic") ?? ""),
          bankName: String(form.get("bankName") ?? ""),
          upiVpa: String(form.get("upiVpa") ?? ""),
        });
        setStep("confirm");
      }}
    >
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <label className="block text-center">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">Amount</span>
        <input
          name="amount"
          defaultValue={draft.amount}
          required
          className="mt-2 w-full bg-transparent text-center text-6xl font-semibold tracking-tight outline-none"
        />
      </label>
      <Field label="Currency" name="currency">
        <select
          name="currency"
          defaultValue={draft.currency}
          className="w-full rounded-2xl border-0 bg-white/[0.06] px-3 py-3 text-sm"
        >
          {currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Recipient name" name="name" required defaultValue={draft.name} />
      {method === "BANK" ? (
        <>
          <Field label="Country" name="country" defaultValue={draft.country} />
          <Field label="Bank name" name="bankName" defaultValue={draft.bankName} />
          <Field label="Account number" name="accountNumber" defaultValue={draft.accountNumber} />
          <Field label="IBAN (optional · SWIFT under Bank)" name="iban" defaultValue={draft.iban} />
          <Field label="BIC (optional)" name="swiftBic" defaultValue={draft.swiftBic} />
        </>
      ) : null}
      {method === "UPI" ? (
        <Field
          label="VPA / UPI ID"
          name="upiVpa"
          required
          defaultValue={draft.upiVpa}
          placeholder="name@oksbi"
        />
      ) : null}
      {method === "PUSH2CARD" ? (
        <div className="rounded-[1.4rem] border border-dashed border-white/15 bg-black/25 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-teal">Partner vault iframe · DEMO</p>
          <p className="mt-2 text-sm text-muted">
            Debit card PAN is collected by the partner iframe. Sibtech only stores a token.
          </p>
          {cardToken ? (
            <p className="mt-4 font-mono text-sm">
              {cardToken} · •••• {cardLast4}
            </p>
          ) : (
            <button
              type="button"
              className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy"
              onClick={() => {
                setCardToken(DEMO_CARD_TOKEN);
                setCardLast4(DEMO_CARD_LAST4);
              }}
            >
              Tokenize demo debit card
            </button>
          )}
        </div>
      ) : null}
      <Button
        type="submit"
        className="h-12 w-full text-base"
        disabled={method === "PUSH2CARD" && !cardToken}
      >
        Continue
      </Button>
    </form>
  );
}
