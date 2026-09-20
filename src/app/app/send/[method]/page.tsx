import { PayoutFlow } from "@/components/payout-flow";
import { DemoNote } from "@/components/ui";
import { actorCan } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { payoutMethodBySlug } from "@/lib/payments/payout";
import { notFound, redirect } from "next/navigation";

export default async function PayoutMethodPage({
  params,
  searchParams,
}: {
  params: Promise<{ method: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireSession();
  if (!actorCan(session, "payout.create")) {
    redirect("/app");
  }
  const { method: slug } = await params;
  const { error } = await searchParams;
  const method = payoutMethodBySlug(slug);
  if (!method) notFound();

  const prefill = await prisma.beneficiary.findFirst({
    where: { userId: session.id, type: method.id },
    orderBy: { createdAt: "desc" },
  });

  const currencies = ["CAD", "USD", "EUR", "GBP"];

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">
        <a href="/app/send" className="text-teal">
          Send
        </a>{" "}
        / {method.label}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{method.label}</h1>
      <p className="mt-2 text-sm text-muted">{method.hint}</p>
      <DemoNote>
        {method.id === "PUSH2CARD"
          ? "Token/iframe stub. PAN never enters Sibtech. Preferred adapter: Thunes DEMO stub."
          : "Confirm details, then a labeled DEMO receipt. No live rail."}
      </DemoNote>
      <PayoutFlow
        method={method.id}
        currencies={currencies}
        defaultCurrency={prefill?.currency ?? (method.id === "UPI" ? "CAD" : "CAD")}
        error={error}
        prefill={{
          name: prefill?.name,
          country: prefill?.country,
          accountNumber: prefill?.accountNumber ?? undefined,
          iban: prefill?.iban ?? undefined,
          swiftBic: prefill?.swiftBic ?? undefined,
          bankName: prefill?.bankName ?? undefined,
          upiVpa: prefill?.upiVpa ?? undefined,
        }}
      />
    </div>
  );
}
