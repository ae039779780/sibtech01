import { submitKycAction } from "@/app/actions/customer";
import { Badge, Button, Field, PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { kycTone } from "@/lib/format";

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.id },
    include: { kycProfile: true },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Profile"
        title="Identity & KYC"
        description="Onboarding follows Canadian MSB / money-services expectations: identity, address, occupation, and source of funds. IDV vendor is still a partner decision."
      />
      <div className="mb-6">
        <Badge tone={kycTone(user.kycStatus) as "ok"}>{user.kycStatus}</Badge>
        <span className="ml-3 text-sm text-muted">
          {user.country} · tier {user.kycTier}
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
