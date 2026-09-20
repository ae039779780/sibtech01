import { loginAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand";
import { Button, Field } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <a href="/" className="mb-8">
        <Logo />
      </a>
      <h1 className="display text-4xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        Demo customer <code>jordan@sibtech.demo</code> / <code>SibtechDemo!jordan</code>
        <br />
        Admin <code>admin@sibtech.demo</code> / <code>SibtechDemo!admin</code>
      </p>
      {params.error ? (
        <p className="mt-4 text-sm text-danger">Those credentials were not recognized.</p>
      ) : null}
      <form action={loginAction} className="mt-8 space-y-4">
        <Field label="Email" name="email" type="email" required defaultValue="jordan@sibtech.demo" />
        <Field label="Password" name="password" type="password" required defaultValue="SibtechDemo!jordan" />
        <Button type="submit">Log in</Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        New here? <a href="/register" className="text-teal">Open an account</a>
      </p>
    </div>
  );
}
