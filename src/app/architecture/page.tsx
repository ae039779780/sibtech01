import { LicenseBadge, Logo } from "@/components/brand";
import { DEMO_SCOPE } from "@/lib/auth/permissions";

const own = [
  ["Website UX", "Marketing, retail portal, staff console — logo C throughout."],
  ["Onboarding / KYC status", "Canadian-license questionnaire. IDV is a partner slot."],
  ["Wallet + ledger", "Double-entry journal, holds, reversals. Demo-grade, not exam recon."],
  ["FX spread", "AFIX mid vs CAD plus configurable bps. Admin owns the book."],
  ["Audit", "Append-only log of auth, KYC, freeze, settle, partner switch."],
];

const partners = [
  ["RailsPartner", "Thunes (default) or TerraPay / Terra Rail — DEMO stubs, never live calls."],
  ["Payout corridors", "Bank (SWIFT sits here), Push2card (Thunes token/iframe, no PAN), UPI VPA."],
  ["Global account / IBAN", "Partner EMI details, status PENDING until contracted."],
  ["Card BIN", "Virtual card UI. Issuance and crypto-spend convert are DEMO."],
  ["Crypto custody", "Screens for hold / send / spend. No live chain or exchange."],
  ["IDV / BaaS", "Not wired. KYC status is in-app only."],
];

export default function ArchitecturePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <a href="/">
          <Logo />
        </a>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a href="/login">Log in</a>
          <a href="/register">Get started</a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24">
        <LicenseBadge />
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Software we own. Rails we partner.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{DEMO_SCOPE.headline}</p>

        <pre className="mt-10 overflow-x-auto rounded-[1.6rem] bg-black/40 p-6 font-mono text-[11px] leading-6 text-teal md:text-sm">
{`Website (marketing + /app retail + /admin staff)
        │
        ▼
Auth · KYC status · audit
        │
        ├─ Ledger (journal, holds, reversals)     ← Sibtech software
        ├─ AFIX quotes + spread bps               ← Sibtech software
        ├─ RailsPartner ── Thunes stub (default)  ← DEMO, no live vendor
        │               └─ TerraPay / Terra stub  ← DEMO, no live vendor
        └─ Later slots: IDV, card BIN, IBAN EMI, crypto custody`}
        </pre>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section>
            <p className="text-xs uppercase tracking-[0.2em] text-teal">Sibtech owns</p>
            <h2 className="mt-2 text-2xl font-semibold">In this repo</h2>
            <div className="mt-4 space-y-3">
              {own.map(([title, copy]) => (
                <article key={title} className="rounded-[1.3rem] bg-white/[0.04] p-5">
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{copy}</p>
                </article>
              ))}
            </div>
          </section>
          <section>
            <p className="text-xs uppercase tracking-[0.2em] text-teal">Partners own</p>
            <h2 className="mt-2 text-2xl font-semibold">
              Labeled DEMO stubs
            </h2>
            <div className="mt-4 space-y-3">
              {partners.map(([title, copy]) => (
                <article key={title} className="rounded-[1.3rem] bg-white/[0.04] p-5">
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{copy}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-12">
          <p className="text-xs uppercase tracking-[0.2em] text-teal">Demo roles</p>
          <h2 className="mt-2 text-2xl font-semibold">Four types. Support cannot freeze.</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {DEMO_SCOPE.roles.map((line) => (
              <li key={line} className="rounded-[1.3rem] bg-white/[0.04] p-5 text-sm">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <p className="text-xs uppercase tracking-[0.2em] text-teal">Not in this demo</p>
          <ul className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-2">
            {DEMO_SCOPE.outOfScope.map((line) => (
              <li key={line}>— {line}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
