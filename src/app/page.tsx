import { LicenseBadge, Logo } from "@/components/brand";
import { Button } from "@/components/ui";

const modules = [
  ["Onboarding / KYC", "Canadian-license workflow, tiers, and case review."],
  ["Pay Wallet", "Multi-asset balances on a double-entry ledger."],
  ["Issue Global Account", "Local account details via partner EMI / bank."],
  ["Pay-in globally", "Local rails, SWIFT-style credit, and crypto deposit."],
  ["Payout", "SWIFT, local, and crypto through a RailsPartner adapter."],
  ["Crypto-friendly", "Deposit, withdraw, and convert under travel-rule readiness."],
  ["Issue Card", "Virtual card on a partner BIN — spend from wallet."],
  ["Spend your crypto", "Convert-at-spend path from USDT/BTC into card rails."],
  ["FX + spread", "AFIX quotes with admin-configurable basis points."],
  ["~90 currencies", "Fiat + crypto catalog with a partner liquidity book."],
];

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#product">Product</a>
          <a href="#license">License</a>
          <a href="#rails">Rails</a>
          <a href="/login">Log in</a>
        </nav>
        <Button href="/register">Open account</Button>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <LicenseBadge />
        <h1 className="display mt-6 max-w-4xl text-5xl leading-[1.05] text-ink md:text-7xl">
          One website for wallets, rails, cards, and crypto FX.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Sibtech is a Canadian-licensed fintech. We own the customer experience,
          ledger, KYC, and risk controls. Global pay-in and payout run through an
          abstract <span className="text-ink">RailsPartner</span> — Thunes or
          TerraPay / Terra Rail — so the MVP can switch without rewriting the book.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/login">Customer walkthrough</Button>
          <Button href="/login?next=/admin" variant="ghost">
            Admin console
          </Button>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            ["Phase 1 live", "Auth, KYC, wallet, pay-in, payout, admin."],
            ["Ledger first", "Double-entry, holds, reversals, audit."],
            ["Partner-ready", "Thunes stub default · TerraPay stub included."],
          ].map(([title, copy]) => (
            <div key={title} className="card hairline p-5">
              <p className="text-sm font-medium text-teal">{title}</p>
              <p className="mt-2 text-sm text-muted">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <p className="text-xs uppercase tracking-[0.2em] text-teal">Product map</p>
        <h2 className="display mt-2 text-4xl">Every module on one surface</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {modules.map(([title, copy]) => (
            <article key={title} className="card hairline p-6">
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="rails" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="card hairline grid gap-8 p-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal">Rails partner</p>
            <h2 className="display mt-2 text-3xl">Thunes or TerraPay, same Sibtech ledger</h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              The software interface is <code className="text-ink">RailsPartner</code>.
              Both adapters are stubbed for local demo. Default config is Thunes.
              Switch the adapter in admin settings or <code>RAILS_PARTNER</code>.
              Sibtech stays the Canadian principal; the partner settles corridors.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl bg-navy-lift/60 p-4">
              <p className="font-medium text-teal">Thunes stub (default)</p>
              <p className="mt-1 text-muted">
                Local CAD/USD/EUR/GBP, SWIFT cross-border, crypto deposit addresses.
              </p>
            </div>
            <div className="rounded-2xl bg-navy-lift/60 p-4">
              <p className="font-medium text-teal">TerraPay / Terra Rail stub</p>
              <p className="mt-1 text-muted">
                Same methods, different partner references and correspondent banks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="license" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="card hairline p-6">
            <h3 className="font-medium">What Sibtech owns</h3>
            <p className="mt-2 text-sm text-muted">
              Website UX, onboarding, wallet, ledger, FX spread controls, admin, audit.
            </p>
          </article>
          <article className="card hairline p-6">
            <h3 className="font-medium">What partners own</h3>
            <p className="mt-2 text-sm text-muted">
              Global accounts, SWIFT/local rails, crypto custody/liquidity, card BIN, IDV.
            </p>
          </article>
          <article className="card hairline p-6">
            <h3 className="font-medium">Compliance posture</h3>
            <p className="mt-2 text-sm text-muted">
              FINTRAC-oriented KYC tiers, sanctions-ready payouts, record retention, exam export.
            </p>
          </article>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-sm text-muted">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Logo />
          <p>Sibtech Llc · Assaf Edry · English-first, i18n-ready · Demo environment</p>
        </div>
      </footer>
    </div>
  );
}
