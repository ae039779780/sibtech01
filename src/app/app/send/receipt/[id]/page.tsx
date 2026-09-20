import { Badge, DemoNote } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayAmount, displayDate } from "@/lib/format";
import { destinationSummary, payoutMethodLabel } from "@/lib/payments/payout";
import { notFound } from "next/navigation";

export default async function PayoutReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const payment = await prisma.payment.findFirst({
    where: { id, userId: session.id, direction: "PAYOUT" },
    include: { beneficiary: true },
  });
  if (!payment) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">
        <a href="/app/send" className="text-teal">
          Send
        </a>{" "}
        / Receipt
      </p>
      <div className="mt-4 flex items-center gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Sent</h1>
        <Badge tone="warn">DEMO</Badge>
      </div>
      <DemoNote>Stub receipt from RailsPartner. Not a live bank confirmation.</DemoNote>
      <p className="mt-8 text-center text-6xl font-semibold tracking-tight tabular-nums">
        {displayAmount(payment.amountMinor, payment.currency)}
      </p>
      <div className="mt-8 space-y-3 rounded-[1.5rem] bg-white/[0.04] p-5 text-sm">
        <Row label="Method" value={payoutMethodLabel(payment.method)} />
        <Row
          label="To"
          value={destinationSummary({
            method: payment.method,
            name: payment.beneficiary?.name,
            accountNumber: payment.beneficiary?.accountNumber,
            iban: payment.beneficiary?.iban,
            cardLast4: payment.beneficiary?.cardLast4,
            upiVpa: payment.beneficiary?.upiVpa,
          })}
        />
        <Row label="Status" value={payment.status} />
        <Row label="Partner" value={`${payment.railsPartner} stub`} />
        <Row label="Reference" value={payment.railsRef ?? "—"} />
        <Row label="Corridor" value={payment.railsCorridor ?? "—"} />
        <Row label="When" value={displayDate(payment.createdAt)} />
      </div>
      <a href="/app/send" className="mt-8 block text-center text-sm text-teal">
        Send another
      </a>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right">{value}</span>
    </p>
  );
}
