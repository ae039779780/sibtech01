import { registerAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand";
import { Button, Field } from "@/components/ui";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <a href="/" className="mb-8">
        <Logo />
      </a>
      <h1 className="display text-4xl">Open a Sibtech account</h1>
      <p className="mt-2 text-sm text-muted">
        Canadian-eligible onboarding. You will complete KYC before pay-in or payout.
      </p>
      {params.error ? (
        <p className="mt-4 text-sm text-danger">
          {params.error === "exists" ? "That email is already registered." : "Check the form and try again."}
        </p>
      ) : null}
      <form action={registerAction} className="mt-8 space-y-4">
        <Field label="Legal name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <Button type="submit">Create account</Button>
      </form>
    </div>
  );
}
