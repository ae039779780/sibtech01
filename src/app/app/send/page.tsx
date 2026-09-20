import { DemoNote } from "@/components/ui";
import { listPayoutMethods } from "@/lib/payments/payout";
import { actorCan } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/format";
import { payoutMethodLabel, destinationSummary } from "@/lib/payments/payout";
import { Landmark, CreditCard, Smartphone } from "lucide-react";
import { TxRow } from "@/components/money-ui";
import { redirect } from "next/navigation";

const icons = {
  BANK: Landmark,
  PUSH2CARD: CreditCard,
  UPI: Smartphone,
};

export default async function SendPickerPage() {
  const session = await requireSession();
  if (!actorCan(session, "payout.create")) {
    redirect("/app");
  }
  const payouts = await prisma.payment.findMany({
    where: { userId: session.id, direction: "PAYOUT" },
    include: { beneficiary: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Send</h1>
      <p className="mt-2 text-sm text-muted">Three payout corridors. Pick one, confirm, get a DEMO receipt.</p>
      <DemoNote>RailsPartner Thunes / Terra stubs only. No live vendor calls. SWIFT sits under Bank.</DemoNote>

      <div className="mt-8 grid gap-3">
        {listPayoutMethods().map((method) => {
          const Icon = icons[method.id];
          return (
            <a
              key={method.id}
              href={`/app/send/${method.slug}`}
              className="flex items-start gap-4 rounded-[1.5rem] bg-white/[0.04] p-5 transition hover:bg-white/[0.07]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-navy">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-medium">{method.label}</span>
                <span className="mt-1 block text-sm text-muted">{method.hint}</span>
              </span>
            </a>
          );
        })}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Recent</h2>
      <div className="mt-2 divide-y divide-line">
        {payouts.map((p) => (
          <a key={p.id} href={`/app/send/receipt/${p.id}`} className="block">
            <TxRow
              title={p.beneficiary?.name ?? p.description}
              subtitle={`${payoutMethodLabel(p.method)} · ${destinationSummary({
                method: p.method,
                name: p.beneficiary?.name,
                accountNumber: p.beneficiary?.accountNumber,
                iban: p.beneficiary?.iban,
                cardLast4: p.beneficiary?.cardLast4,
                upiVpa: p.beneficiary?.upiVpa,
              })} · ${displayDate(p.createdAt)}`}
              amount={p.amountMinor}
              currency={p.currency}
              inbound={false}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
