import { loginAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand";
import { Button, Field } from "@/components/ui";

const accounts = [
  ["Retail · crypto on", "jordan@sibtech.demo", "SibtechDemo!jordan"],
  ["Retail · KYC review", "amira@sibtech.demo", "SibtechDemo!amira"],
  ["Admin", "admin@sibtech.demo", "SibtechDemo!admin"],
  ["Compliance", "compliance@sibtech.demo", "SibtechDemo!compliance"],
  ["Support · no freeze", "support@sibtech.demo", "SibtechDemo!support"],
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#071018] p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div>
          <p className="text-5xl font-semibold leading-tight tracking-tight">
            Your money,
            <br />
            worldwide.
          </p>
          <p className="mt-4 max-w-sm text-muted">
            Canadian license. Global rails. Cards and crypto in one account.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-teal">
            Demo-complete · not a live bank
          </p>
        </div>
        <div className="h-40 w-64 rounded-[1.4rem] bg-gradient-to-br from-[#12324f] via-teal-deep to-coral p-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Sibtech</p>
          <p className="mt-10 font-mono tracking-[0.28em]">•••• 4418</p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 py-16 lg:px-16">
        <a href="/" className="mb-10 lg:hidden">
          <Logo />
        </a>
        <h1 className="text-4xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-3 text-sm text-muted">
          Seeded walkthrough accounts — published demo passwords, not secrets.
        </p>
        <ul className="mt-4 space-y-1 text-xs text-muted">
          {accounts.map(([label, email, password]) => (
            <li key={email}>
              <span className="text-ink">{label}</span> · {email} / {password}
            </li>
          ))}
        </ul>
        {params.error ? (
          <p className="mt-4 text-sm text-danger">Those credentials were not recognized.</p>
        ) : null}
        <form action={loginAction} className="mt-8 max-w-sm space-y-4">
          <Field label="Email" name="email" type="email" required defaultValue="jordan@sibtech.demo" />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            defaultValue="SibtechDemo!jordan"
          />
          <Button type="submit" className="h-12 w-full text-base">
            Log in
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          New here?{" "}
          <a href="/register" className="text-teal">
            Get started
          </a>
          {" · "}
          <a href="/architecture" className="text-teal">
            Architecture
          </a>
        </p>
      </div>
    </div>
  );
}
