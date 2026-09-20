import { submitKycAction } from "@/app/actions/customer";
import { Badge, Button, DemoNote, Field } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { roleLabel } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { kycTone } from "@/lib/format";

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.id },
    include: { kycProfile: true },
  });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-2 text-sm text-muted">Identity for the Canadian license. IDV is a partner in production.</p>
      <DemoNote>No live KYC vendor. Status is in-app only — submit, then Compliance or Admin decide.</DemoNote>
      <div className="mb-6 mt-5">
        <Badge tone={kycTone(user.kycStatus) as "ok"}>{user.kycStatus}</Badge>
        <span className="ml-3 text-sm text-muted">
          {user.accountKind === "BUSINESS" ? "Business" : "Personal"} · {roleLabel(user.role)} · {user.country} · tier {user.kycTier}
          {user.cryptoFriendly ? " · crypto-friendly" : ""}
          {user.frozen ? " · frozen" : ""}
        </span>
      </div>
      <form action={submitKycAction} className="card hairline grid gap-4 p-6 md:grid-cols-2">
        <Field label="Legal name" name="legalName" defaultValue={user.kycProfile?.legalName ?? user.name} required />
        <Field label="Date of birth" name="dateOfBirth" defaultValue={user.kycProfile?.dateOfBirth ?? ""} required />
        <Field label="Address" name="addressLine1" defaultValue={user.kycProfile?.addressLine1 ?? ""} required />
        <Field label="City" name="city" defaultValue={user.kycProfile?.city ?? ""} required />
        <Field label="Region" name="region" defaultValue={user.kycProfile?.region ?? ""} required />
        <Field label="Postal code" name="postalCode" defaultValue={user.kycProfile?.postalCode ?? ""} required />
        <Field label="Country" name="country" defaultValue={user.country} required />
        <Field label="Occupation" name="occupation" defaultValue={user.kycProfile?.occupation ?? ""} />
        <div className="md:col-span-2">
          <Field label="Source of funds" name="sourceOfFunds" defaultValue={user.kycProfile?.sourceOfFunds ?? ""} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit">Submit for review</Button>
        </div>
      </form>
    </div>
  );
}
