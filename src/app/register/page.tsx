import { registerAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand";
import { Button, DemoNote, Field } from "@/components/ui";
import { parseAccountKind } from "@/lib/auth/permissions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; kind?: string }>;
}) {
  const params = await searchParams;
  const kind = parseAccountKind(params.kind);
  const business = kind === "BUSINESS";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <a href="/" className="mb-8">
        <Logo />
      </a>
      <h1 className="display text-4xl">
        {business ? "Open a business account" : "Open a personal account"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Canadian-eligible onboarding. You will complete KYC before pay-in or payout.
      </p>
      {business ? (
        <DemoNote>
          Business is a single-user demo label. No SMB invites, no extra staff seats.
        </DemoNote>
      ) : null}
      <div className="mt-4 flex gap-2 text-sm">
        <a
          href="/register?kind=PERSONAL"
          className={kind === "PERSONAL" ? "text-ink" : "text-muted"}
        >
          Personal
        </a>
        <span className="text-muted">·</span>
        <a
          href="/register?kind=BUSINESS"
          className={business ? "text-ink" : "text-muted"}
        >
          Business
        </a>
      </div>
      {params.error ? (
        <p className="mt-4 text-sm text-danger">
          {params.error === "exists" ? "That email is already registered." : "Check the form and try again."}
        </p>
      ) : null}
      <form action={registerAction} className="mt-8 space-y-4">
        <input type="hidden" name="accountKind" value={kind} />
        <Field label="Legal name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="cryptoFriendly" defaultChecked={!business} />
          Crypto-friendly (USDT / BTC screens)
        </label>
        <Button type="submit">Create account</Button>
      </form>
    </div>
  );
}
